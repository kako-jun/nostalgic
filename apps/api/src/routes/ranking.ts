/**
 * Ranking API Routes
 *
 * GET  /?action=get     - Public read (by id)
 * POST /?action=get     - Owner read (body: url, token) - token never in URL
 * POST /?action=create  - Create a new ranking (body: url, token, ...)
 * POST /?action=submit  - Submit a score (body: id, score, name?, displayScore?)
 * POST /?action=update  - Update settings (body: url, token, ...)
 * POST /?action=remove  - Remove a score entry (body: url, token, name)
 * POST /?action=clear   - Clear all scores (body: url, token)
 * POST /?action=delete  - Delete ranking (body: url, token)
 */

import { Hono } from "hono";
import { hashToken, verifyToken, validateOwnerToken } from "../lib/core/auth";
import { generatePublicId } from "../lib/core/id";
import { generateUserHash } from "../lib/core/crypto";
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

// 匿名プレイヤー名を生成（IP + User-Agent + Accept-Languageからハッシュ）
async function generatePlayerName(
  ip: string,
  userAgent: string,
  acceptLanguage: string
): Promise<string> {
  const adjectives = [
    "Swift",
    "Clever",
    "Brave",
    "Quick",
    "Smart",
    "Fast",
    "Sharp",
    "Wise",
    "Cool",
    "Super",
  ];
  const animals = ["Fox", "Eagle", "Tiger", "Wolf", "Lion", "Hawk", "Bear", "Cat", "Dog", "Owl"];

  const userString = `${ip}-${userAgent}-${acceptLanguage}`;
  let hash = 0;
  for (let i = 0; i < userString.length; i++) {
    const char = userString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  const adjIndex = Math.abs(hash) % adjectives.length;
  const animalIndex = Math.abs(hash >> 8) % animals.length;
  const number = (Math.abs(hash >> 16) % 999) + 1;

  return `${adjectives[adjIndex]}${animals[animalIndex]}${String(number).padStart(3, "0")}`;
}

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

/** Verify owner token against DB */
async function verifyOwnerToken(
  db: D1Database,
  serviceId: string,
  token: string
): Promise<boolean> {
  const row = await db
    .prepare("SELECT token_hash FROM owner_tokens WHERE service_id = ?")
    .bind(serviceId)
    .first<{ token_hash: string }>();
  if (!row) return false;
  return await verifyToken(token, row.token_hash);
}

// === GET Routes ===

app.get("/", async (c) => {
  const action = c.req.query("action");
  const db = c.env.DB;

  // GET (public mode only - owner mode uses POST)
  if (action === "get") {
    const id = c.req.query("id");
    const limit = Math.min(
      Number(c.req.query("limit")) || RANKING.LIMIT.DEFAULT,
      RANKING.LIMIT.MAX
    );

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

  return c.json({ error: "Invalid action for GET. Use: get" }, 400);
});

// === POST Routes ===

app.post("/", async (c) => {
  const action = c.req.query("action");
  const db = c.env.DB;

  let body: Record<string, unknown>;
  try {
    body = await c.req.json();
  } catch {
    body = {};
  }

  const getParam = (name: string): string | undefined => {
    const val = body[name];
    if (typeof val === "string") return val;
    if (typeof val === "number") return String(val);
    return c.req.query(name);
  };

  // Get sensitive param from body only (never from query string to avoid URL exposure)
  const getSecureParam = (name: string): string | undefined => {
    const val = body[name];
    if (typeof val === "string") return val;
    return undefined;
  };

  // GET (owner mode - token in body, not URL)
  if (action === "get") {
    const url = getParam("url");
    const token = getSecureParam("token");
    const limit = Math.min(Number(getParam("limit")) || RANKING.LIMIT.DEFAULT, RANKING.LIMIT.MAX);

    if (!url || !token) {
      return c.json({ error: "url and token are required for owner-mode get via POST" }, 400);
    }

    const ranking = await getRankingByUrl(db, url);
    if (!ranking) {
      return c.json({ error: "Ranking not found" }, 404);
    }

    const rankingId = (ranking as RankingRecord).id.replace("ranking:", "");
    const isOwner = await verifyOwnerToken(db, `ranking:${rankingId}`, token);

    if (!isOwner) {
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

  // CREATE
  if (action === "create") {
    const url = getParam("url");
    const token = getSecureParam("token");
    const title = getParam("title") || "RANKING";
    const sortOrder = getParam("sortOrder") || RANKING.SORT_ORDER.DEFAULT;
    const maxEntries = Number(getParam("maxEntries")) || 100;
    const webhookUrl = getParam("webhookUrl");

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
    const id = getParam("id");
    let name = getParam("name");
    const scoreStr = getParam("score");
    const displayScore = getParam("displayScore");

    if (!id || !scoreStr) {
      return c.json({ error: "id and score are required" }, 400);
    }

    const score = Number(scoreStr);
    if (isNaN(score)) {
      return c.json({ error: "score must be a number" }, 400);
    }

    const ranking = await getRankingById(db, id);
    if (!ranking) {
      return c.json({ error: "Ranking not found" }, 404);
    }

    // 投票間隔制限（5秒）- 同じユーザーからの連続投票を防止
    const VOTE_INTERVAL_SECONDS = 5;
    const ip = c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For") || "0.0.0.0";
    const userAgent = c.req.header("User-Agent") || "";
    const acceptLanguage = c.req.header("Accept-Language") || "";

    // 名前が未指定の場合は自動生成
    if (!name) {
      name = await generatePlayerName(ip, userAgent, acceptLanguage);
    }
    const userHash = await generateUserHash(ip, userAgent);

    // 同じユーザーかどうかをチェックするため、daily_actionsテーブルを使用
    const lastUserVote = await db
      .prepare(
        "SELECT value FROM daily_actions WHERE service_id = ? AND user_hash = ? AND action_type = ? ORDER BY date DESC LIMIT 1"
      )
      .bind(`ranking:${id}`, userHash, "vote")
      .first<{ value: string }>();

    if (lastUserVote) {
      const lastVoteTime = new Date(lastUserVote.value).getTime();
      const now = Date.now();
      const elapsed = (now - lastVoteTime) / 1000;
      if (elapsed < VOTE_INTERVAL_SECONDS) {
        const remaining = Math.ceil(VOTE_INTERVAL_SECONDS - elapsed);
        return c.json({ error: `Please wait ${remaining} seconds before voting again` }, 429);
      }
    }

    // 投票履歴を記録
    const today = new Date().toISOString().split("T")[0];
    await db
      .prepare(
        "INSERT INTO daily_actions (service_id, user_hash, date, action_type, value) VALUES (?, ?, ?, ?, ?) ON CONFLICT(service_id, user_hash, date, action_type) DO UPDATE SET value = ?"
      )
      .bind(
        `ranking:${id}`,
        userHash,
        today,
        "vote",
        new Date().toISOString(),
        new Date().toISOString()
      )
      .run();

    const metadata = JSON.parse((ranking as RankingRecord).metadata || "{}");
    const sortOrder = metadata.sortOrder || "desc";
    const maxEntries = metadata.maxEntries || 100;

    // Check existing score for this name
    const existingEntry = await db
      .prepare(
        "SELECT score FROM ranking_scores WHERE service_id = ? AND name = ? AND unique_id = ''"
      )
      .bind(`ranking:${id}:scores`, name)
      .first<{ score: number }>();

    // Only update if new score is better (or if no existing entry)
    const shouldUpdate =
      !existingEntry ||
      (sortOrder === "asc" ? score < existingEntry.score : score > existingEntry.score);

    if (shouldUpdate) {
      // Insert or update score
      await db
        .prepare(
          `
        INSERT INTO ranking_scores (service_id, name, score, display_score, unique_id, created_at)
        VALUES (?, ?, ?, ?, '', datetime('now'))
        ON CONFLICT(service_id, name, unique_id) DO UPDATE SET score = ?, display_score = ?
      `
        )
        .bind(
          `ranking:${id}:scores`,
          name,
          score,
          displayScore || null,
          score,
          displayScore || null
        )
        .run();
    }

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
    const url = getParam("url");
    const token = getSecureParam("token");
    const newTitle = getParam("title");
    const newMaxEntries = getParam("maxEntries");
    const newSortOrder = getParam("sortOrder");
    const webhookUrl = getParam("webhookUrl");

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
    const isOwner = await verifyOwnerToken(db, `ranking:${id}`, token);

    if (!isOwner) {
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

  // REMOVE
  if (action === "remove") {
    const url = getParam("url");
    const token = getSecureParam("token");
    const name = getParam("name");

    if (!url || !token || !name) {
      return c.json({ error: "url, token, and name are required" }, 400);
    }

    const ranking = await getRankingByUrl(db, url);
    if (!ranking) {
      return c.json({ error: "Ranking not found" }, 404);
    }

    const id = (ranking as RankingRecord).id.replace("ranking:", "");
    const isOwner = await verifyOwnerToken(db, `ranking:${id}`, token);

    if (!isOwner) {
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
    const url = getParam("url");
    const token = getSecureParam("token");

    if (!url || !token) {
      return c.json({ error: "url and token are required" }, 400);
    }

    const ranking = await getRankingByUrl(db, url);
    if (!ranking) {
      return c.json({ error: "Ranking not found" }, 404);
    }

    const id = (ranking as RankingRecord).id.replace("ranking:", "");
    const isOwner = await verifyOwnerToken(db, `ranking:${id}`, token);

    if (!isOwner) {
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
    const url = getParam("url");
    const token = getSecureParam("token");

    if (!url || !token) {
      return c.json({ error: "url and token are required" }, 400);
    }

    const ranking = await getRankingByUrl(db, url);
    if (!ranking) {
      return c.json({ error: "Ranking not found" }, 404);
    }

    const id = (ranking as RankingRecord).id.replace("ranking:", "");
    const isOwner = await verifyOwnerToken(db, `ranking:${id}`, token);

    if (!isOwner) {
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
    {
      error:
        "Invalid action for POST. Use: get (owner), create, submit, update, remove, clear, delete",
    },
    400
  );
});

export default app;
