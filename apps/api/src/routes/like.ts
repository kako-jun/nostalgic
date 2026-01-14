/**
 * Like API Routes
 */

import { Hono } from "hono";
import { hashToken, validateOwnerToken } from "../lib/core/auth";
import { generatePublicId } from "../lib/core/id";
import { generateUserHash } from "../lib/core/crypto";
import { getTodayDateString } from "../lib/core/db";
import { sendWebHook, WebHookMessages } from "../lib/core/webhook";

type Bindings = { DB: D1Database };

type LikeRecord = {
  id: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// === Helper Functions ===

async function getLikeByUrl(db: D1Database, url: string) {
  const mapping = await db
    .prepare("SELECT service_id FROM url_mappings WHERE type = ? AND url = ?")
    .bind("like", url)
    .first<{ service_id: string }>();
  if (!mapping) return null;
  return db
    .prepare("SELECT * FROM services WHERE id = ?")
    .bind(`like:${mapping.service_id}`)
    .first();
}

async function getLikeById(db: D1Database, id: string) {
  return db.prepare("SELECT * FROM services WHERE id = ?").bind(`like:${id}`).first();
}

async function getTotalLikes(db: D1Database, id: string): Promise<number> {
  const row = await db
    .prepare("SELECT total FROM likes WHERE service_id = ?")
    .bind(`like:${id}:total`)
    .first<{ total: number }>();
  return row?.total ?? 0;
}

async function getUserLikeState(
  db: D1Database,
  id: string,
  userHash: string,
  today: string
): Promise<boolean> {
  const row = await db
    .prepare(
      "SELECT value FROM daily_actions WHERE service_id = ? AND user_hash = ? AND date = ? AND action_type = ?"
    )
    .bind(`like:${id}`, userHash, today, "like")
    .first<{ value: string }>();
  return row?.value === "liked";
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
    const icon = c.req.query("icon");

    if (!url || !token) {
      return c.json({ error: "url and token are required" }, 400);
    }

    if (!validateOwnerToken(token)) {
      return c.json({ error: "Token must be 8-16 characters" }, 400);
    }

    // Validate icon if provided
    const validIcons = ["heart", "star", "thumb", "peta"];
    if (icon && !validIcons.includes(icon)) {
      return c.json({ error: "Invalid icon. Use: heart, star, thumb, peta" }, 400);
    }

    const existing = await getLikeByUrl(db, url);
    if (existing) {
      return c.json({ error: "Like service already exists for this URL" }, 400);
    }

    const publicId = await generatePublicId(url);
    const hashedToken = await hashToken(token);
    const metadata = JSON.stringify({
      webhookUrl: webhookUrl || null,
      icon: icon || "heart",
    });

    await db.batch([
      db
        .prepare(
          'INSERT INTO services (id, type, url, metadata, created_at) VALUES (?, ?, ?, ?, datetime("now"))'
        )
        .bind(`like:${publicId}`, "like", url, metadata),
      db
        .prepare("INSERT INTO url_mappings (type, url, service_id) VALUES (?, ?, ?)")
        .bind("like", url, publicId),
      db
        .prepare("INSERT INTO owner_tokens (service_id, token_hash) VALUES (?, ?)")
        .bind(`like:${publicId}`, hashedToken),
      db
        .prepare("INSERT INTO likes (service_id, total) VALUES (?, 0)")
        .bind(`like:${publicId}:total`),
    ]);

    return c.json({ success: true, id: publicId, url });
  }

  // TOGGLE
  if (action === "toggle") {
    const id = c.req.query("id");

    if (!id) {
      return c.json({ error: "id is required" }, 400);
    }

    const like = await getLikeById(db, id);
    if (!like) {
      return c.json({ error: "Like service not found" }, 404);
    }

    const ip = c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For") || "0.0.0.0";
    const userAgent = c.req.header("User-Agent") || "";
    const userHash = await generateUserHash(ip, userAgent);
    const today = getTodayDateString();

    const isLiked = await getUserLikeState(db, id, userHash, today);
    const newState = !isLiked;

    if (newState) {
      // Like
      await db.batch([
        db
          .prepare(
            "INSERT INTO daily_actions (service_id, user_hash, date, action_type, value) VALUES (?, ?, ?, ?, ?) ON CONFLICT(service_id, user_hash, date, action_type) DO UPDATE SET value = ?"
          )
          .bind(`like:${id}`, userHash, today, "like", "liked", "liked"),
        db
          .prepare(
            "INSERT INTO likes (service_id, total) VALUES (?, 1) ON CONFLICT(service_id) DO UPDATE SET total = total + 1"
          )
          .bind(`like:${id}:total`),
      ]);
    } else {
      // Unlike
      await db.batch([
        db
          .prepare(
            "INSERT INTO daily_actions (service_id, user_hash, date, action_type, value) VALUES (?, ?, ?, ?, ?) ON CONFLICT(service_id, user_hash, date, action_type) DO UPDATE SET value = ?"
          )
          .bind(`like:${id}`, userHash, today, "like", "unliked", "unliked"),
        db
          .prepare("UPDATE likes SET total = MAX(0, total - 1) WHERE service_id = ?")
          .bind(`like:${id}:total`),
      ]);
    }

    const total = await getTotalLikes(db, id);

    // WebHook送信（非同期、エラーは無視）
    const metadata = JSON.parse((like as { metadata: string }).metadata || "{}");
    if (metadata.webhookUrl) {
      const message = newState
        ? WebHookMessages.like.liked(total)
        : WebHookMessages.like.unliked(total);
      sendWebHook(metadata.webhookUrl, "like.toggle", message, { id, total, liked: newState });
    }

    return c.json({ success: true, data: { id, total, liked: newState } });
  }

  // GET
  if (action === "get") {
    const id = c.req.query("id");
    const url = c.req.query("url");
    const token = c.req.query("token");

    // Owner mode (url + token) - returns settings including webhookUrl
    if (url && token) {
      const like = await getLikeByUrl(db, url);
      if (!like) {
        return c.json({ error: "Like service not found" }, 404);
      }

      const likeId = (like as LikeRecord).id.replace("like:", "");
      const hashedToken = await hashToken(token);
      const owner = await db
        .prepare("SELECT 1 FROM owner_tokens WHERE service_id = ? AND token_hash = ?")
        .bind(`like:${likeId}`, hashedToken)
        .first();

      if (!owner) {
        return c.json({ error: "Invalid token" }, 403);
      }

      const ip = c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For") || "0.0.0.0";
      const userAgent = c.req.header("User-Agent") || "";
      const userHash = await generateUserHash(ip, userAgent);
      const today = getTodayDateString();

      const [total, isLiked] = await Promise.all([
        getTotalLikes(db, likeId),
        getUserLikeState(db, likeId, userHash, today),
      ]);

      const metadata = JSON.parse((like as { metadata: string }).metadata || "{}");
      return c.json({
        success: true,
        data: {
          id: likeId,
          url,
          total,
          liked: isLiked,
          settings: {
            webhookUrl: metadata.webhookUrl || null,
            icon: metadata.icon || "heart",
          },
        },
      });
    }

    // Public mode (by id)
    if (!id) {
      return c.json({ error: "id is required" }, 400);
    }

    const like = await getLikeById(db, id);
    if (!like) {
      return c.json({ error: "Like service not found" }, 404);
    }

    const ip = c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For") || "0.0.0.0";
    const userAgent = c.req.header("User-Agent") || "";
    const userHash = await generateUserHash(ip, userAgent);
    const today = getTodayDateString();

    const [total, isLiked] = await Promise.all([
      getTotalLikes(db, id),
      getUserLikeState(db, id, userHash, today),
    ]);

    const format = c.req.query("format") || "json";

    if (format === "text") {
      return c.text(String(total));
    }

    if (format === "image") {
      const svg = generateLikeSVG(String(total));
      return c.body(svg, 200, {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "no-cache",
      });
    }

    const metadata = JSON.parse((like as { metadata: string }).metadata || "{}");
    return c.json({
      success: true,
      data: { id, total, liked: isLiked, icon: metadata.icon || "heart" },
    });
  }

  // UPDATE (owner only) - update settings
  if (action === "update") {
    const url = c.req.query("url");
    const token = c.req.query("token");
    const webhookUrl = c.req.query("webhookUrl");
    const icon = c.req.query("icon");

    if (!url || !token) {
      return c.json({ error: "url and token are required" }, 400);
    }

    if (webhookUrl === undefined && icon === undefined) {
      return c.json({ error: "At least one of webhookUrl or icon is required" }, 400);
    }

    // Validate icon if provided
    const validIcons = ["heart", "star", "thumb", "peta"];
    if (icon !== undefined && icon !== "" && !validIcons.includes(icon)) {
      return c.json({ error: "Invalid icon. Use: heart, star, thumb, peta" }, 400);
    }

    const like = await getLikeByUrl(db, url);
    if (!like) {
      return c.json({ error: "Like service not found" }, 404);
    }

    const id = (like as LikeRecord).id.replace("like:", "");
    const hashedToken = await hashToken(token);
    const owner = await db
      .prepare("SELECT 1 FROM owner_tokens WHERE service_id = ? AND token_hash = ?")
      .bind(`like:${id}`, hashedToken)
      .first();

    if (!owner) {
      return c.json({ error: "Invalid token" }, 403);
    }

    const currentMetadata = JSON.parse((like as { metadata: string }).metadata || "{}");
    const newMetadata = { ...currentMetadata };

    if (webhookUrl !== undefined) {
      newMetadata.webhookUrl = webhookUrl === "" ? null : webhookUrl;
    }
    if (icon !== undefined) {
      newMetadata.icon = icon === "" ? "heart" : icon;
    }

    await db
      .prepare("UPDATE services SET metadata = ? WHERE id = ?")
      .bind(JSON.stringify(newMetadata), `like:${id}`)
      .run();

    const total = await getTotalLikes(db, id);
    return c.json({ success: true, data: { id, url, total } });
  }

  // DELETE
  if (action === "delete") {
    const url = c.req.query("url");
    const token = c.req.query("token");

    if (!url || !token) {
      return c.json({ error: "url and token are required" }, 400);
    }

    const like = await getLikeByUrl(db, url);
    if (!like) {
      return c.json({ error: "Like service not found" }, 404);
    }

    const id = (like as LikeRecord).id.replace("like:", "");
    const hashedToken = await hashToken(token);
    const owner = await db
      .prepare("SELECT 1 FROM owner_tokens WHERE service_id = ? AND token_hash = ?")
      .bind(`like:${id}`, hashedToken)
      .first();

    if (!owner) {
      return c.json({ error: "Invalid token" }, 403);
    }

    await db.batch([
      db.prepare("DELETE FROM services WHERE id = ?").bind(`like:${id}`),
      db.prepare("DELETE FROM url_mappings WHERE type = ? AND url = ?").bind("like", url),
      db.prepare("DELETE FROM owner_tokens WHERE service_id = ?").bind(`like:${id}`),
      db.prepare("DELETE FROM likes WHERE service_id LIKE ?").bind(`like:${id}%`),
      db.prepare("DELETE FROM daily_actions WHERE service_id = ?").bind(`like:${id}`),
    ]);

    return c.json({ success: true, message: "Like service deleted" });
  }

  return c.json({ error: "Invalid action. Use: create, toggle, get, update, delete" }, 400);
});

// === POST Routes (for batch operations) ===

app.post("/", async (c) => {
  const action = c.req.query("action");
  const db = c.env.DB;

  // BATCH GET - 複数IDのlike数を一括取得
  if (action === "batchGet") {
    let ids: string[];
    try {
      const body = await c.req.json<{ ids: string[] }>();
      ids = body.ids;
    } catch {
      return c.json({ error: "Invalid JSON body. Expected: { ids: string[] }" }, 400);
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      return c.json({ error: "ids array is required and must not be empty" }, 400);
    }

    // 上限チェック（パフォーマンス保護）
    const MAX_BATCH_SIZE = 1000;
    if (ids.length > MAX_BATCH_SIZE) {
      return c.json({ error: `Maximum ${MAX_BATCH_SIZE} ids per request` }, 400);
    }

    // IDバリデーション（英数字とハイフンのみ許可）
    const validIdPattern = /^[a-zA-Z0-9-]+$/;
    for (const id of ids) {
      if (!validIdPattern.test(id)) {
        return c.json({ error: `Invalid id format: ${id}` }, 400);
      }
    }

    // service_idのリストを構築
    const serviceIds = ids.map((id) => `like:${id}:total`);

    // D1はIN句のプレースホルダを動的に構築する必要がある
    const placeholders = serviceIds.map(() => "?").join(",");
    const query = `SELECT service_id, total FROM likes WHERE service_id IN (${placeholders})`;

    const result = await db
      .prepare(query)
      .bind(...serviceIds)
      .all<{ service_id: string; total: number }>();

    // 結果をIDでマップ
    const data: Record<string, { total: number }> = {};
    for (const row of result.results || []) {
      // "like:xxx:total" から "xxx" を抽出
      const id = row.service_id.replace(/^like:/, "").replace(/:total$/, "");
      data[id] = { total: row.total };
    }

    // リクエストされたが存在しないIDは0として含める
    for (const id of ids) {
      if (!data[id]) {
        data[id] = { total: 0 };
      }
    }

    return c.json({ success: true, data });
  }

  return c.json({ error: "Invalid action for POST. Use: batchGet" }, 400);
});

// === SVG Generator ===
// Shields.io風のバッジSVG生成（format=image用）
function generateLikeSVG(count: string): string {
  const label = "♥ likes";
  const labelWidth = 50;
  const valueWidth = Math.max(count.length * 7 + 10, 30);
  const totalWidth = labelWidth + valueWidth;
  const height = 20;
  const labelBg = "#555";
  const valueBg = "#e91e63"; // pink
  const textColor = "#fff";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${height}">
  <linearGradient id="smooth" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="round">
    <rect width="${totalWidth}" height="${height}" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#round)">
    <rect width="${labelWidth}" height="${height}" fill="${labelBg}"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="${height}" fill="${valueBg}"/>
    <rect width="${totalWidth}" height="${height}" fill="url(#smooth)"/>
  </g>
  <g fill="${textColor}" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="${labelWidth / 2}" y="14">${label}</text>
    <text x="${labelWidth + valueWidth / 2}" y="14">${count}</text>
  </g>
</svg>`;
}

export default app;
