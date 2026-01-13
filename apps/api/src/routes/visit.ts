/**
 * Visit (Counter) API Routes
 */

import { Hono } from "hono";
import { z } from "zod";
import { hashToken, validateOwnerToken } from "../lib/core/auth";
import { generatePublicId } from "../lib/core/id";
import { generateUserHash } from "../lib/core/crypto";
import { getTodayDateString, getYesterdayDateString, getDateRange } from "../lib/core/db";
import { DEFAULT_THEME, URL_CONST } from "../lib/core/constants";
import { sendWebHook, WebHookMessages } from "../lib/core/webhook";

type Bindings = {
  DB: D1Database;
};

type CounterRecord = {
  id: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// === Schemas ===
const _CreateSchema = z.object({
  url: z.string().url().startsWith(URL_CONST.REQUIRED_PROTOCOL),
  token: z.string().min(8).max(16),
  webhookUrl: z.string().url().optional(),
});

// === Helper Functions ===

async function getCounterByUrl(db: D1Database, url: string) {
  const mapping = await db
    .prepare("SELECT service_id FROM url_mappings WHERE type = ? AND url = ?")
    .bind("counter", url)
    .first<{ service_id: string }>();

  if (!mapping) return null;

  return db
    .prepare("SELECT * FROM services WHERE id = ?")
    .bind(`counter:${mapping.service_id}`)
    .first();
}

async function getCounterById(db: D1Database, id: string) {
  return db.prepare("SELECT * FROM services WHERE id = ?").bind(`counter:${id}`).first();
}

async function getTotalCount(db: D1Database, id: string): Promise<number> {
  const row = await db
    .prepare("SELECT total FROM counters WHERE service_id = ?")
    .bind(`counter:${id}:total`)
    .first<{ total: number }>();
  return row?.total ?? 0;
}

async function getDailyCount(db: D1Database, id: string, date: string): Promise<number> {
  const row = await db
    .prepare("SELECT count FROM counter_daily WHERE service_id = ? AND date = ?")
    .bind(`counter:${id}`, date)
    .first<{ count: number }>();
  return row?.count ?? 0;
}

async function getPeriodCount(db: D1Database, id: string, days: number): Promise<number> {
  const dates = getDateRange(days);
  const startDate = dates[dates.length - 1];
  const row = await db
    .prepare(
      "SELECT COALESCE(SUM(count), 0) as total FROM counter_daily WHERE service_id = ? AND date >= ?"
    )
    .bind(`counter:${id}`, startDate)
    .first<{ total: number }>();
  return row?.total ?? 0;
}

async function getCounterData(db: D1Database, id: string) {
  const [total, today, yesterday, week, month] = await Promise.all([
    getTotalCount(db, id),
    getDailyCount(db, id, getTodayDateString()),
    getDailyCount(db, id, getYesterdayDateString()),
    getPeriodCount(db, id, 7),
    getPeriodCount(db, id, 30),
  ]);
  return { id, total, today, yesterday, week, month };
}

// === Routes ===

app.get("/", async (c) => {
  const action = c.req.query("action");
  const db = c.env.DB;

  // CREATE
  if (action === "create") {
    const url = c.req.query("url");
    const token = c.req.query("token");
    const webhookUrl = c.req.query("webhookUrl");

    if (!url || !token) {
      return c.json({ error: "url and token are required" }, 400);
    }

    if (!validateOwnerToken(token)) {
      return c.json({ error: "Token must be 8-16 characters" }, 400);
    }

    // Check if already exists
    const existing = await getCounterByUrl(db, url);
    if (existing) {
      return c.json({ error: "Counter already exists for this URL" }, 400);
    }

    // Generate IDs
    const publicId = await generatePublicId(url);
    const hashedToken = await hashToken(token);

    // Create counter
    await db.batch([
      db
        .prepare(
          'INSERT INTO services (id, type, url, metadata, created_at) VALUES (?, ?, ?, ?, datetime("now"))'
        )
        .bind(`counter:${publicId}`, "counter", url, JSON.stringify({ webhookUrl })),
      db
        .prepare("INSERT INTO url_mappings (type, url, service_id) VALUES (?, ?, ?)")
        .bind("counter", url, publicId),
      db
        .prepare("INSERT INTO owner_tokens (service_id, token_hash) VALUES (?, ?)")
        .bind(`counter:${publicId}`, hashedToken),
      db
        .prepare("INSERT INTO counters (service_id, total) VALUES (?, 0)")
        .bind(`counter:${publicId}:total`),
    ]);

    return c.json({
      success: true,
      id: publicId,
      url,
      message: "Counter created successfully",
    });
  }

  // INCREMENT
  if (action === "increment") {
    const id = c.req.query("id");
    if (!id) {
      return c.json({ error: "id is required" }, 400);
    }

    const counter = await getCounterById(db, id);
    if (!counter) {
      return c.json({ error: "Counter not found" }, 404);
    }

    // Generate user hash for duplicate prevention
    const ip = c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For") || "0.0.0.0";
    const userAgent = c.req.header("User-Agent") || "";
    const userHash = await generateUserHash(ip, userAgent);
    const today = getTodayDateString();

    // Check if already visited today
    const visited = await db
      .prepare(
        "SELECT 1 FROM daily_actions WHERE service_id = ? AND user_hash = ? AND date = ? AND action_type = ?"
      )
      .bind(`counter:${id}`, userHash, today, "visit")
      .first();

    if (visited) {
      // Already visited, return current counts
      const data = await getCounterData(db, id);
      return c.json({ success: true, data: { ...data, duplicate: true } });
    }

    // Mark visit and increment
    await db.batch([
      db
        .prepare(
          "INSERT INTO daily_actions (service_id, user_hash, date, action_type, value) VALUES (?, ?, ?, ?, ?)"
        )
        .bind(`counter:${id}`, userHash, today, "visit", "1"),
      db
        .prepare(
          "INSERT INTO counters (service_id, total) VALUES (?, 1) ON CONFLICT(service_id) DO UPDATE SET total = total + 1"
        )
        .bind(`counter:${id}:total`),
      db
        .prepare(
          "INSERT INTO counter_daily (service_id, date, count) VALUES (?, ?, 1) ON CONFLICT(service_id, date) DO UPDATE SET count = count + 1"
        )
        .bind(`counter:${id}`, today),
    ]);

    const data = await getCounterData(db, id);

    // WebHook送信（非同期、エラーは無視）
    const metadata = JSON.parse((counter as { metadata: string }).metadata || "{}");
    if (metadata.webhookUrl) {
      sendWebHook(
        metadata.webhookUrl,
        "counter.increment",
        WebHookMessages.counter.increment(data.total),
        { id, ...data }
      );
    }

    return c.json({ success: true, data });
  }

  // GET
  if (action === "get") {
    const id = c.req.query("id");
    const url = c.req.query("url");
    const token = c.req.query("token");
    const type = (c.req.query("type") || "total") as keyof ReturnType<
      typeof getCounterData
    > extends Promise<infer T>
      ? keyof T
      : never;
    const format = c.req.query("format") || "json";
    const theme = c.req.query("theme") || DEFAULT_THEME;
    const digits = c.req.query("digits");

    // Owner mode (url + token) - returns settings including webhookUrl
    if (url && token) {
      const counter = await getCounterByUrl(db, url);
      if (!counter) {
        return c.json({ error: "Counter not found" }, 404);
      }

      const counterId = (counter as CounterRecord).id.replace("counter:", "");
      const hashedToken = await hashToken(token);
      const owner = await db
        .prepare("SELECT 1 FROM owner_tokens WHERE service_id = ? AND token_hash = ?")
        .bind(`counter:${counterId}`, hashedToken)
        .first();

      if (!owner) {
        return c.json({ error: "Invalid token" }, 403);
      }

      const data = await getCounterData(db, counterId);
      const metadata = JSON.parse((counter as { metadata: string }).metadata || "{}");
      return c.json({
        success: true,
        data: {
          ...data,
          url,
          settings: {
            webhookUrl: metadata.webhookUrl || null,
          },
        },
      });
    }

    // Public mode (by id)
    if (!id) {
      return c.json({ error: "id is required" }, 400);
    }

    const counter = await getCounterById(db, id);
    if (!counter) {
      return c.json({ error: "Counter not found" }, 404);
    }

    const data = await getCounterData(db, id);
    const value = data[type as keyof typeof data] ?? data.total;

    if (format === "text") {
      const displayValue = digits ? String(value).padStart(Number(digits), "0") : String(value);
      return c.text(displayValue);
    }

    if (format === "image") {
      const displayValue = digits ? String(value).padStart(Number(digits), "0") : String(value);
      const svg = isImageTheme(theme as string)
        ? generateImageCounterSVG(displayValue, theme as string)
        : generateCounterSVG(displayValue, theme as string);
      return c.body(svg, 200, {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "no-cache",
      });
    }

    return c.json({ success: true, data });
  }

  // UPDATE (owner only) - update value and/or settings
  if (action === "update") {
    const url = c.req.query("url");
    const token = c.req.query("token");
    const value = c.req.query("value");
    const webhookUrl = c.req.query("webhookUrl");

    if (!url || !token) {
      return c.json({ error: "url and token are required" }, 400);
    }

    if (value === undefined && webhookUrl === undefined) {
      return c.json({ error: "At least one of value or webhookUrl is required" }, 400);
    }

    const counter = await getCounterByUrl(db, url);
    if (!counter) {
      return c.json({ error: "Counter not found" }, 404);
    }

    const id = (counter as CounterRecord).id.replace("counter:", "");
    const hashedToken = await hashToken(token);
    const owner = await db
      .prepare("SELECT 1 FROM owner_tokens WHERE service_id = ? AND token_hash = ?")
      .bind(`counter:${id}`, hashedToken)
      .first();

    if (!owner) {
      return c.json({ error: "Invalid token" }, 403);
    }

    const statements: D1PreparedStatement[] = [];

    // Update value if provided
    if (value !== undefined) {
      const numValue = Number(value);
      if (isNaN(numValue) || numValue < 0) {
        return c.json({ error: "Value must be a non-negative number" }, 400);
      }
      statements.push(
        db
          .prepare(
            "INSERT INTO counters (service_id, total) VALUES (?, ?) ON CONFLICT(service_id) DO UPDATE SET total = ?"
          )
          .bind(`counter:${id}:total`, numValue, numValue)
      );
    }

    // Update webhookUrl if provided
    if (webhookUrl !== undefined) {
      const currentMetadata = JSON.parse((counter as { metadata: string }).metadata || "{}");
      const newMetadata = {
        ...currentMetadata,
        webhookUrl: webhookUrl === "" ? null : webhookUrl,
      };
      statements.push(
        db
          .prepare("UPDATE services SET metadata = ? WHERE id = ?")
          .bind(JSON.stringify(newMetadata), `counter:${id}`)
      );
    }

    if (statements.length > 0) {
      await db.batch(statements);
    }

    const data = await getCounterData(db, id);
    return c.json({ success: true, data });
  }

  // SET (owner only) - deprecated, use update instead
  if (action === "set") {
    const url = c.req.query("url");
    const token = c.req.query("token");
    const value = c.req.query("value");

    if (!url || !token || value === undefined) {
      return c.json({ error: "url, token, and value are required" }, 400);
    }

    const counter = await getCounterByUrl(db, url);
    if (!counter) {
      return c.json({ error: "Counter not found" }, 404);
    }

    // Verify ownership
    const id = (counter as CounterRecord).id.replace("counter:", "");
    const hashedToken = await hashToken(token);
    const owner = await db
      .prepare("SELECT 1 FROM owner_tokens WHERE service_id = ? AND token_hash = ?")
      .bind(`counter:${id}`, hashedToken)
      .first();

    if (!owner) {
      return c.json({ error: "Invalid token" }, 403);
    }

    const numValue = Number(value);
    if (isNaN(numValue) || numValue < 0) {
      return c.json({ error: "Value must be a non-negative number" }, 400);
    }

    await db
      .prepare(
        "INSERT INTO counters (service_id, total) VALUES (?, ?) ON CONFLICT(service_id) DO UPDATE SET total = ?"
      )
      .bind(`counter:${id}:total`, numValue, numValue)
      .run();

    const data = await getCounterData(db, id);
    return c.json({ success: true, data });
  }

  // DELETE (owner only)
  if (action === "delete") {
    const url = c.req.query("url");
    const token = c.req.query("token");

    if (!url || !token) {
      return c.json({ error: "url and token are required" }, 400);
    }

    const counter = await getCounterByUrl(db, url);
    if (!counter) {
      return c.json({ error: "Counter not found" }, 404);
    }

    const id = (counter as CounterRecord).id.replace("counter:", "");
    const hashedToken = await hashToken(token);
    const owner = await db
      .prepare("SELECT 1 FROM owner_tokens WHERE service_id = ? AND token_hash = ?")
      .bind(`counter:${id}`, hashedToken)
      .first();

    if (!owner) {
      return c.json({ error: "Invalid token" }, 403);
    }

    await db.batch([
      db.prepare("DELETE FROM services WHERE id = ?").bind(`counter:${id}`),
      db.prepare("DELETE FROM url_mappings WHERE type = ? AND url = ?").bind("counter", url),
      db.prepare("DELETE FROM owner_tokens WHERE service_id = ?").bind(`counter:${id}`),
      db.prepare("DELETE FROM counters WHERE service_id LIKE ?").bind(`counter:${id}%`),
      db.prepare("DELETE FROM counter_daily WHERE service_id = ?").bind(`counter:${id}`),
      db.prepare("DELETE FROM daily_actions WHERE service_id = ?").bind(`counter:${id}`),
    ]);

    return c.json({ success: true, message: "Counter deleted" });
  }

  return c.json({ error: "Invalid action. Use: create, increment, get, update, delete" }, 400);
});

// === SVG Generator ===
function generateCounterSVG(value: string, theme: string): string {
  const themes: Record<string, { bg: string; text: string; border: string }> = {
    light: { bg: "#ffffff", text: "#333333", border: "#cccccc" },
    dark: { bg: "#1a1a2e", text: "#eaeaea", border: "#4a4a6a" },
    retro: { bg: "#000000", text: "#00ff00", border: "#00ff00" },
    kawaii: { bg: "#e0f7fa", text: "#ff69b4", border: "#9c27b0" },
    mom: { bg: "#98fb98", text: "#2d4a2b", border: "#ff8c00" },
    final: { bg: "#0000ff", text: "#ffffff", border: "#ffffff" },
  };

  const t = themes[theme] || themes.dark;
  const width = Math.max(60, value.length * 12 + 20);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="28">
  <rect width="100%" height="100%" fill="${t.bg}" stroke="${t.border}" stroke-width="1" rx="4"/>
  <text x="50%" y="50%" dy="0.35em" text-anchor="middle"
        fill="${t.text}" font-family="monospace" font-size="14" font-weight="bold">${value}</text>
</svg>`;
}

// === Image Theme Definitions ===
// Each theme contains SVG content for digits 0-9
// Placeholder: replace with actual SVG paths/content
type ImageThemeConfig = {
  width: number;
  height: number;
  digits: Record<string, string>;
};

const IMAGE_THEMES: Record<string, ImageThemeConfig> = {
  mahjong: {
    width: 32,
    height: 40,
    digits: {
      "0": `<image href="data:image/webp;base64,"/>`,
      "1": `<image href="data:image/webp;base64,"/>`,
      "2": `<image href="data:image/webp;base64,"/>`,
      "3": `<image href="data:image/webp;base64,"/>`,
      "4": `<image href="data:image/webp;base64,"/>`,
      "5": `<image href="data:image/webp;base64,"/>`,
      "6": `<image href="data:image/webp;base64,"/>`,
      "7": `<image href="data:image/webp;base64,"/>`,
      "8": `<image href="data:image/webp;base64,"/>`,
      "9": `<image href="data:image/webp;base64,"/>`,
    },
  },
  segment: {
    width: 24,
    height: 40,
    digits: {
      "0": `<image href="data:image/webp;base64,"/>`,
      "1": `<image href="data:image/webp;base64,"/>`,
      "2": `<image href="data:image/webp;base64,"/>`,
      "3": `<image href="data:image/webp;base64,"/>`,
      "4": `<image href="data:image/webp;base64,"/>`,
      "5": `<image href="data:image/webp;base64,"/>`,
      "6": `<image href="data:image/webp;base64,"/>`,
      "7": `<image href="data:image/webp;base64,"/>`,
      "8": `<image href="data:image/webp;base64,"/>`,
      "9": `<image href="data:image/webp;base64,"/>`,
    },
  },
  nixie: {
    width: 28,
    height: 40,
    digits: {
      "0": `<image href="data:image/webp;base64,"/>`,
      "1": `<image href="data:image/webp;base64,"/>`,
      "2": `<image href="data:image/webp;base64,"/>`,
      "3": `<image href="data:image/webp;base64,"/>`,
      "4": `<image href="data:image/webp;base64,"/>`,
      "5": `<image href="data:image/webp;base64,"/>`,
      "6": `<image href="data:image/webp;base64,"/>`,
      "7": `<image href="data:image/webp;base64,"/>`,
      "8": `<image href="data:image/webp;base64,"/>`,
      "9": `<image href="data:image/webp;base64,"/>`,
    },
  },
  dots_f: {
    width: 16,
    height: 24,
    digits: {
      "0": `<image href="data:image/webp;base64,"/>`,
      "1": `<image href="data:image/webp;base64,"/>`,
      "2": `<image href="data:image/webp;base64,"/>`,
      "3": `<image href="data:image/webp;base64,"/>`,
      "4": `<image href="data:image/webp;base64,"/>`,
      "5": `<image href="data:image/webp;base64,"/>`,
      "6": `<image href="data:image/webp;base64,"/>`,
      "7": `<image href="data:image/webp;base64,"/>`,
      "8": `<image href="data:image/webp;base64,"/>`,
      "9": `<image href="data:image/webp;base64,"/>`,
    },
  },
};

const IMAGE_THEME_NAMES = Object.keys(IMAGE_THEMES);

function isImageTheme(theme: string): boolean {
  return IMAGE_THEME_NAMES.includes(theme);
}

function generateImageCounterSVG(value: string, theme: string): string {
  const config = IMAGE_THEMES[theme];
  if (!config) {
    return generateCounterSVG(value, "dark");
  }

  const { width: digitWidth, height, digits } = config;
  const totalWidth = value.length * digitWidth;

  const digitSvgs = value
    .split("")
    .map((char, index) => {
      const digitContent = digits[char] || "";
      const x = index * digitWidth;
      return `<g transform="translate(${x}, 0)">${digitContent}</g>`;
    })
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${height}">
${digitSvgs}
</svg>`;
}

export default app;
