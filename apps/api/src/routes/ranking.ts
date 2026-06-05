/**
 * Ranking API Routes
 *
 * 全アクション GET / POST 両対応。GET は query パラメータ、POST は JSON body
 * （query フォールバックあり、body 優先）。batch 系のみ配列を body で受けるため POST 専用。
 *
 * GET/POST /?action=get     - Read (public: id / owner: url + token)
 * GET/POST /?action=lookup  - Owner URL lookup (url, token) - lightweight id check
 * GET/POST /?action=create  - Create a new ranking (url, token, ...)
 * GET/POST /?action=submit  - Submit a score (id, score, name?, displayScore?)
 * GET/POST /?action=update  - Update settings (url, token, ...)
 * GET/POST /?action=remove  - Remove a score entry (url, token, name)
 * GET/POST /?action=clear   - Clear all scores (url, token)
 * GET/POST /?action=delete  - Delete ranking (url, token)
 * POST     /?action=batchLookup - Owner URL lookup (body: urls, token) - ordered lightweight id checks
 */

import { Hono } from "hono";
import type { Context } from "hono";
import { hashToken, verifyToken, validateOwnerToken } from "../lib/core/auth.ts";
import { generatePublicId } from "../lib/core/id.ts";
import { generateUserHash } from "../lib/core/crypto.ts";
import { RANKING } from "../lib/core/constants.ts";
import { sendWebHook, WebHookMessages } from "../lib/core/webhook.ts";
import { batchLookupServices, lookupService, MAX_LOOKUP_BATCH_SIZE } from "../lib/core/lookup.ts";

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

// === Routes ===
//
// 「URL を組み立てるだけで全操作できる」昔の Web の再現がプロダクト思想のため、
// 書き込み系アクションも GET（query パラメータ）で動く。POST では JSON body の
// パラメータが query より優先される（管理 Web UI が使用）。
// batch 系（batchLookup）だけは配列を JSON body で受ける設計のため POST 専用。

type AppContext = Context<{ Bindings: Bindings }>;

async function handleRankingAction(c: AppContext) {
  const action = c.req.query("action");
  const db = c.env.DB;

  let body: Record<string, unknown> = {};
  if (c.req.method === "POST") {
    try {
      body = await c.req.json();
    } catch {
      body = {};
    }
  }

  // body 優先・query フォールバック（GET では常に query から取る）
  const getParam = (name: string): string | undefined => {
    const val = body[name];
    if (typeof val === "string") return val;
    if (typeof val === "number") return String(val);
    return c.req.query(name);
  };

  // GET (owner mode: url + token / public mode: id)
  if (action === "get") {
    const url = getParam("url");
    const token = getParam("token");
    const limit = Math.min(Number(getParam("limit")) || RANKING.LIMIT.DEFAULT, RANKING.LIMIT.MAX);

    // Owner mode (url + token) - returns settings including webhookUrl
    if (url && token) {
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

    const id = getParam("id");

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

  // LOOKUP (owner URL lookup - lightweight id check, no entries/settings payload)
  if (action === "lookup") {
    const url = getParam("url");
    const token = getParam("token");

    if (!url || !token) {
      return c.json({ error: "url and token are required for lookup" }, 400);
    }

    const data = await lookupService(db, "ranking", url, token);
    return c.json({ success: true, data });
  }

  // BATCH LOOKUP (POST 専用: urls 配列を JSON body で受ける)
  if (action === "batchLookup") {
    if (c.req.method !== "POST") {
      return c.json({ error: "batchLookup requires POST with a JSON body" }, 400);
    }

    const urls = body.urls;
    const token = getParam("token");

    if (!Array.isArray(urls) || urls.some((url) => typeof url !== "string")) {
      return c.json({ error: "urls must be an array of strings" }, 400);
    }
    if (urls.length > MAX_LOOKUP_BATCH_SIZE) {
      return c.json({ error: `Maximum ${MAX_LOOKUP_BATCH_SIZE} urls per request` }, 400);
    }
    if (!token) {
      return c.json({ error: "token is required for batchLookup" }, 400);
    }

    const data = await batchLookupServices(db, "ranking", urls, token);
    return c.json({ success: true, data });
  }

  // CREATE
  if (action === "create") {
    const url = getParam("url");
    const token = getParam("token");
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
    const token = getParam("token");
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
    const token = getParam("token");
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
    const token = getParam("token");

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
    const token = getParam("token");

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
        "Invalid action. Use: get, lookup, create, submit, update, remove, clear, delete (GET or POST), batchLookup (POST only)",
    },
    400
  );
}

app.get("/", handleRankingAction);
app.post("/", handleRankingAction);

export default app;
