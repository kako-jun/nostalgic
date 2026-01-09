/**
 * Ranking API Routes
 */

import { Hono } from "hono";
import { hashToken, validateOwnerToken } from "../lib/core/auth";
import { generatePublicId } from "../lib/core/id";
import { RANKING } from "../lib/core/constants";
import { sendWebHook, WebHookMessages } from "../lib/core/webhook";

type Bindings = { DB: D1Database };

type RankingRecord = {
  id: string;
  metadata?: string;
};

type RankingRow = {
  name: string;
  score: number;
  display_score?: string;
  created_at: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// === Helper Functions ===

async function getRankingByUrl(db: D1Database, url: string) {
  const mapping = await db
    .prepare("SELECT service_id FROM url_mappings WHERE type = ? AND url = ?")
    .bind("ranking", url)
    .first<{ service_id: string }>();
  if (!mapping) return null;
  return db
    .prepare("SELECT * FROM services WHERE id = ?")
    .bind(`ranking:${mapping.service_id}`)
    .first();
}

async function getRankingById(db: D1Database, id: string) {
  return db.prepare("SELECT * FROM services WHERE id = ?").bind(`ranking:${id}`).first();
}

async function getTopEntries(
  db: D1Database,
  id: string,
  limit: number,
  sortOrder: "asc" | "desc" = "desc"
) {
  const order = sortOrder === "asc" ? "ASC" : "DESC";
  const { results } = await db
    .prepare(
      `
    SELECT name, score, display_score, created_at
    FROM ranking_scores
    WHERE service_id = ?
    ORDER BY score ${order}
    LIMIT ?
  `
    )
    .bind(`ranking:${id}:scores`, limit)
    .all();

  return (results as RankingRow[]).map((row, index) => ({
    rank: index + 1,
    name: row.name,
    score: row.score,
    displayScore: row.display_score || String(row.score),
    createdAt: row.created_at,
  }));
}

// === Routes ===

app.get("/", async (c) => {
  const action = c.req.query("action");
  const db = c.env.DB;

  // CREATE
  if (action === "create") {
    const url = c.req.query("url");
    const token = c.req.query("token");
    const title = c.req.query("title") || "RANKING";
    const sortOrder = c.req.query("sortOrder") || RANKING.SORT_ORDER.DEFAULT;
    const maxEntries = Number(c.req.query("maxEntries")) || 100;
    const webhookUrl = c.req.query("webhookUrl");

    if (!url || !token) {
      return c.json({ error: "url and token are required" }, 400);
    }

    if (!validateOwnerToken(token)) {
      return c.json({ error: "Token must be 8-16 characters" }, 400);
    }

    const existing = await getRankingByUrl(db, url);
    if (existing) {
      return c.json({ error: "Ranking already exists for this URL" }, 400);
    }

    const publicId = await generatePublicId(url);
    const hashedToken = await hashToken(token);
    const metadata = JSON.stringify({
      title,
      sortOrder,
      maxEntries,
      webhookUrl: webhookUrl || null,
    });

    await db.batch([
      db
        .prepare(
          'INSERT INTO services (id, type, url, metadata, created_at) VALUES (?, ?, ?, ?, datetime("now"))'
        )
        .bind(`ranking:${publicId}`, "ranking", url, metadata),
      db
        .prepare("INSERT INTO url_mappings (type, url, service_id) VALUES (?, ?, ?)")
        .bind("ranking", url, publicId),
      db
        .prepare("INSERT INTO owner_tokens (service_id, token_hash) VALUES (?, ?)")
        .bind(`ranking:${publicId}`, hashedToken),
    ]);

    return c.json({ success: true, id: publicId, url, title, sortOrder, maxEntries });
  }

  // SUBMIT
  if (action === "submit") {
    const id = c.req.query("id");
    const name = c.req.query("name");
    const scoreStr = c.req.query("score");
    const displayScore = c.req.query("displayScore");

    if (!id || !name || !scoreStr) {
      return c.json({ error: "id, name, and score are required" }, 400);
    }

    const score = Number(scoreStr);
    if (isNaN(score)) {
      return c.json({ error: "score must be a number" }, 400);
    }

    const ranking = await getRankingById(db, id);
    if (!ranking) {
      return c.json({ error: "Ranking not found" }, 404);
    }

    const metadata = JSON.parse((ranking as RankingRecord).metadata || "{}");
    const sortOrder = metadata.sortOrder || "desc";
    const maxEntries = metadata.maxEntries || 100;

    // Insert or update score
    await db
      .prepare(
        `
      INSERT INTO ranking_scores (service_id, name, score, display_score, unique_id, created_at)
      VALUES (?, ?, ?, ?, '', datetime('now'))
      ON CONFLICT(service_id, name, unique_id) DO UPDATE SET score = ?, display_score = ?
    `
      )
      .bind(`ranking:${id}:scores`, name, score, displayScore || null, score, displayScore || null)
      .run();

    // Trim excess entries
    const count = await db
      .prepare("SELECT COUNT(*) as count FROM ranking_scores WHERE service_id = ?")
      .bind(`ranking:${id}:scores`)
      .first<{ count: number }>();

    if (count && count.count > maxEntries) {
      const order = sortOrder === "asc" ? "DESC" : "ASC";
      await db
        .prepare(
          `
        DELETE FROM ranking_scores
        WHERE service_id = ? AND rowid IN (
          SELECT rowid FROM ranking_scores
          WHERE service_id = ?
          ORDER BY score ${order}
          LIMIT ?
        )
      `
        )
        .bind(`ranking:${id}:scores`, `ranking:${id}:scores`, count.count - maxEntries)
        .run();
    }

    const entries = await getTopEntries(db, id, RANKING.LIMIT.DEFAULT, sortOrder);

    // WebHook送信（非同期、エラーは無視）
    if (metadata.webhookUrl) {
      sendWebHook(
        metadata.webhookUrl,
        "ranking.submit",
        WebHookMessages.ranking.submit(name, displayScore || score),
        { id, name, score, displayScore, entries }
      );
    }

    return c.json({ success: true, data: { id, entries } });
  }

  // UPDATE (settings only - owner)
  if (action === "update") {
    const url = c.req.query("url");
    const token = c.req.query("token");
    const newTitle = c.req.query("title");
    const newMaxEntries = c.req.query("maxEntries");
    const newSortOrder = c.req.query("sortOrder");
    const webhookUrl = c.req.query("webhookUrl");

    if (!url || !token) {
      return c.json({ error: "url and token are required" }, 400);
    }

    if (
      newTitle === undefined &&
      newMaxEntries === undefined &&
      newSortOrder === undefined &&
      webhookUrl === undefined
    ) {
      return c.json(
        { error: "At least one of title, maxEntries, sortOrder, or webhookUrl is required" },
        400
      );
    }

    const ranking = await getRankingByUrl(db, url);
    if (!ranking) {
      return c.json({ error: "Ranking not found" }, 404);
    }

    const id = (ranking as RankingRecord).id.replace("ranking:", "");
    const hashedToken = await hashToken(token);
    const owner = await db
      .prepare("SELECT 1 FROM owner_tokens WHERE service_id = ? AND token_hash = ?")
      .bind(`ranking:${id}`, hashedToken)
      .first();

    if (!owner) {
      return c.json({ error: "Invalid token" }, 403);
    }

    const currentMetadata = JSON.parse((ranking as RankingRecord).metadata || "{}");
    const newMetadata = {
      ...currentMetadata,
      ...(newTitle !== undefined && { title: newTitle }),
      ...(newMaxEntries !== undefined && { maxEntries: Number(newMaxEntries) }),
      ...(newSortOrder !== undefined && { sortOrder: newSortOrder }),
      ...(webhookUrl !== undefined && { webhookUrl: webhookUrl === "" ? null : webhookUrl }),
    };

    await db
      .prepare("UPDATE services SET metadata = ? WHERE id = ?")
      .bind(JSON.stringify(newMetadata), `ranking:${id}`)
      .run();

    const entries = await getTopEntries(
      db,
      id,
      RANKING.LIMIT.DEFAULT,
      newMetadata.sortOrder || "desc"
    );
    return c.json({
      success: true,
      data: {
        id,
        entries,
        title: newMetadata.title,
        maxEntries: newMetadata.maxEntries,
        sortOrder: newMetadata.sortOrder,
      },
    });
  }

  // GET
  if (action === "get") {
    const id = c.req.query("id");
    const url = c.req.query("url");
    const token = c.req.query("token");
    const limit = Math.min(
      Number(c.req.query("limit")) || RANKING.LIMIT.DEFAULT,
      RANKING.LIMIT.MAX
    );

    // Owner mode (url + token) - returns settings including webhookUrl
    if (url && token) {
      const ranking = await getRankingByUrl(db, url);
      if (!ranking) {
        return c.json({ error: "Ranking not found" }, 404);
      }

      const rankingId = (ranking as RankingRecord).id.replace("ranking:", "");
      const hashedToken = await hashToken(token);
      const owner = await db
        .prepare("SELECT 1 FROM owner_tokens WHERE service_id = ? AND token_hash = ?")
        .bind(`ranking:${rankingId}`, hashedToken)
        .first();

      if (!owner) {
        return c.json({ error: "Invalid token" }, 403);
      }

      const metadata = JSON.parse((ranking as RankingRecord).metadata || "{}");
      const sortOrder = metadata.sortOrder || "desc";
      const entries = await getTopEntries(db, rankingId, limit, sortOrder);

      return c.json({
        success: true,
        data: {
          id: rankingId,
          url,
          entries,
          title: metadata.title,
          sortOrder,
          maxEntries: metadata.maxEntries,
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

    const ranking = await getRankingById(db, id);
    if (!ranking) {
      return c.json({ error: "Ranking not found" }, 404);
    }

    const metadata = JSON.parse((ranking as RankingRecord).metadata || "{}");
    const sortOrder = metadata.sortOrder || "desc";

    const entries = await getTopEntries(db, id, limit, sortOrder);
    return c.json({
      success: true,
      data: { id, entries, title: metadata.title, sortOrder, maxEntries: metadata.maxEntries },
    });
  }

  // REMOVE
  if (action === "remove") {
    const url = c.req.query("url");
    const token = c.req.query("token");
    const name = c.req.query("name");

    if (!url || !token || !name) {
      return c.json({ error: "url, token, and name are required" }, 400);
    }

    const ranking = await getRankingByUrl(db, url);
    if (!ranking) {
      return c.json({ error: "Ranking not found" }, 404);
    }

    const id = (ranking as RankingRecord).id.replace("ranking:", "");
    const hashedToken = await hashToken(token);
    const owner = await db
      .prepare("SELECT 1 FROM owner_tokens WHERE service_id = ? AND token_hash = ?")
      .bind(`ranking:${id}`, hashedToken)
      .first();

    if (!owner) {
      return c.json({ error: "Invalid token" }, 403);
    }

    await db
      .prepare("DELETE FROM ranking_scores WHERE service_id = ? AND name = ?")
      .bind(`ranking:${id}:scores`, name)
      .run();

    const entries = await getTopEntries(db, id, RANKING.LIMIT.DEFAULT);
    return c.json({ success: true, data: { id, entries, removed: name } });
  }

  // CLEAR
  if (action === "clear") {
    const url = c.req.query("url");
    const token = c.req.query("token");

    if (!url || !token) {
      return c.json({ error: "url and token are required" }, 400);
    }

    const ranking = await getRankingByUrl(db, url);
    if (!ranking) {
      return c.json({ error: "Ranking not found" }, 404);
    }

    const id = (ranking as RankingRecord).id.replace("ranking:", "");
    const hashedToken = await hashToken(token);
    const owner = await db
      .prepare("SELECT 1 FROM owner_tokens WHERE service_id = ? AND token_hash = ?")
      .bind(`ranking:${id}`, hashedToken)
      .first();

    if (!owner) {
      return c.json({ error: "Invalid token" }, 403);
    }

    await db
      .prepare("DELETE FROM ranking_scores WHERE service_id = ?")
      .bind(`ranking:${id}:scores`)
      .run();

    return c.json({ success: true, data: { id, entries: [], cleared: true } });
  }

  // DELETE
  if (action === "delete") {
    const url = c.req.query("url");
    const token = c.req.query("token");

    if (!url || !token) {
      return c.json({ error: "url and token are required" }, 400);
    }

    const ranking = await getRankingByUrl(db, url);
    if (!ranking) {
      return c.json({ error: "Ranking not found" }, 404);
    }

    const id = (ranking as RankingRecord).id.replace("ranking:", "");
    const hashedToken = await hashToken(token);
    const owner = await db
      .prepare("SELECT 1 FROM owner_tokens WHERE service_id = ? AND token_hash = ?")
      .bind(`ranking:${id}`, hashedToken)
      .first();

    if (!owner) {
      return c.json({ error: "Invalid token" }, 403);
    }

    await db.batch([
      db.prepare("DELETE FROM services WHERE id = ?").bind(`ranking:${id}`),
      db.prepare("DELETE FROM url_mappings WHERE type = ? AND url = ?").bind("ranking", url),
      db.prepare("DELETE FROM owner_tokens WHERE service_id = ?").bind(`ranking:${id}`),
      db.prepare("DELETE FROM ranking_scores WHERE service_id = ?").bind(`ranking:${id}:scores`),
    ]);

    return c.json({ success: true, message: "Ranking deleted" });
  }

  return c.json(
    { error: "Invalid action. Use: create, submit, update, get, remove, clear, delete" },
    400
  );
});

export default app;
