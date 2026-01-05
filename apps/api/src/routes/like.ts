/**
 * Like API Routes
 */

import { Hono } from "hono";
import { hashToken, validateOwnerToken } from "../lib/core/auth";
import { generatePublicId } from "../lib/core/id";
import { generateUserHash } from "../lib/core/crypto";
import { getTodayDateString } from "../lib/core/db";

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

    if (!url || !token) {
      return c.json({ error: "url and token are required" }, 400);
    }

    if (!validateOwnerToken(token)) {
      return c.json({ error: "Token must be 8-16 characters" }, 400);
    }

    const existing = await getLikeByUrl(db, url);
    if (existing) {
      return c.json({ error: "Like service already exists for this URL" }, 400);
    }

    const publicId = await generatePublicId(url);
    const hashedToken = await hashToken(token);

    await db.batch([
      db
        .prepare(
          'INSERT INTO services (id, type, url, metadata, created_at) VALUES (?, ?, ?, ?, datetime("now"))'
        )
        .bind(`like:${publicId}`, "like", url, "{}"),
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
    return c.json({ success: true, data: { id, total, liked: newState } });
  }

  // GET
  if (action === "get") {
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

    const [total, isLiked] = await Promise.all([
      getTotalLikes(db, id),
      getUserLikeState(db, id, userHash, today),
    ]);

    return c.json({ success: true, data: { id, total, liked: isLiked } });
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

  return c.json({ error: "Invalid action. Use: create, toggle, get, delete" }, 400);
});

export default app;
