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

type Bindings = {
  DB: D1Database;
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
      return c.json({ ...data, duplicate: true });
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
    return c.json(data);
  }

  // DISPLAY (GET)
  if (action === "display" || action === "get") {
    const id = c.req.query("id");
    const type = (c.req.query("type") || "total") as keyof ReturnType<
      typeof getCounterData
    > extends Promise<infer T>
      ? keyof T
      : never;
    const format = c.req.query("format") || "json";
    const theme = c.req.query("theme") || DEFAULT_THEME;
    const digits = c.req.query("digits");

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

    if (format === "svg" || format === "image") {
      const displayValue = digits ? String(value).padStart(Number(digits), "0") : String(value);
      const svg = generateCounterSVG(displayValue, theme as string);
      return c.body(svg, 200, {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "no-cache",
      });
    }

    return c.json(data);
  }

  // SET (owner only)
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
    const id = (counter as any).id.replace("counter:", "");
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
    return c.json(data);
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

    const id = (counter as any).id.replace("counter:", "");
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

  return c.json({ error: "Invalid action. Use: create, increment, display, set, delete" }, 400);
});

// === SVG Generator ===
function generateCounterSVG(value: string, theme: string): string {
  const themes: Record<string, { bg: string; text: string; border: string }> = {
    light: { bg: "#ffffff", text: "#333333", border: "#cccccc" },
    dark: { bg: "#1a1a2e", text: "#eaeaea", border: "#4a4a6a" },
    retro: { bg: "#000000", text: "#00ff00", border: "#00ff00" },
    kawaii: { bg: "#ffb6c1", text: "#ff1493", border: "#ff69b4" },
    mom: { bg: "#f5f5dc", text: "#8b4513", border: "#d2691e" },
    final: { bg: "#0d0d0d", text: "#ffd700", border: "#ffd700" },
  };

  const t = themes[theme] || themes.dark;
  const width = Math.max(60, value.length * 12 + 20);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="28">
  <rect width="100%" height="100%" fill="${t.bg}" stroke="${t.border}" stroke-width="1" rx="4"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        fill="${t.text}" font-family="monospace" font-size="14" font-weight="bold">${value}</text>
</svg>`;
}

export default app;
