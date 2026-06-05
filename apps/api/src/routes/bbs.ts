/**
 * BBS API Routes
 *
 * 全アクション GET / POST 両対応。GET は query パラメータ、POST は JSON body
 * （query フォールバックあり、body 優先）。batch 系のみ配列を body で受けるため POST 専用。
 *
 * GET/POST /?action=get     - Read (public: id / owner: url + token)
 * GET/POST /?action=lookup  - Owner URL lookup (url, token) - lightweight id check
 * GET/POST /?action=create  - Create a new BBS (url, token, ...)
 * GET/POST /?action=post    - Post a message (id, message, author?, ...)
 * GET/POST /?action=update  - Update settings or message (url+token or id+messageId)
 * GET/POST /?action=remove  - Remove a message (url+token+messageId or id+messageId)
 * GET/POST /?action=clear   - Clear all messages (url, token)
 * GET/POST /?action=delete  - Delete BBS (url, token)
 * POST     /?action=batchLookup - Owner URL lookup (body: urls, token) - ordered lightweight id checks
 */

import { Hono } from "hono";
import type { Context } from "hono";
import { hashToken, verifyToken, validateOwnerToken } from "../lib/core/auth.ts";
import { generatePublicId } from "../lib/core/id.ts";
import { generateUserHash } from "../lib/core/crypto.ts";
import { BBS } from "../lib/core/constants.ts";
import { sendWebHook, WebHookMessages } from "../lib/core/webhook.ts";
import { runCreateBatch, AlreadyExistsError } from "../lib/core/storage.ts";
import { batchLookupServices, lookupService, MAX_LOOKUP_BATCH_SIZE } from "../lib/core/lookup.ts";

type Bindings = { DB: D1Database };

type BBSRecord = {
  id: string;
  metadata?: string;
};

type BBSMessageRow = {
  id: string;
  author: string;
  message: string;
  selects?: string;
  user_hash: string;
  created_at: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// === Helper Functions ===

async function getBBSByUrl(db: D1Database, url: string) {
  const mapping = await db
    .prepare("SELECT service_id FROM url_mappings WHERE type = ? AND url = ?")
    .bind("bbs", url)
    .first<{ service_id: string }>();
  if (!mapping) return null;
  return db
    .prepare("SELECT * FROM services WHERE id = ?")
    .bind(`bbs:${mapping.service_id}`)
    .first();
}

async function getMessages(db: D1Database, id: string, limit: number = 100) {
  const { results } = await db
    .prepare(
      `
    SELECT id, author, message, selects, user_hash, created_at
    FROM bbs_messages
    WHERE service_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `
    )
    .bind(`bbs:${id}:messages`, limit)
    .all();

  return (results as BBSMessageRow[]).map((row) => {
    const selects = row.selects ? JSON.parse(row.selects) : {};
    return {
      id: row.id,
      author: row.author,
      message: row.message,
      standardValue: selects.standardValue,
      incrementalValue: selects.incrementalValue,
      emoteValue: selects.emoteValue,
      userHash: row.user_hash,
      timestamp: row.created_at + "Z",
    };
  });
}

async function getMessageCount(db: D1Database, id: string): Promise<number> {
  const result = await db
    .prepare("SELECT COUNT(*) as count FROM bbs_messages WHERE service_id = ?")
    .bind(`bbs:${id}:messages`)
    .first<{ count: number }>();
  return result?.count || 0;
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

async function handleBBSAction(c: AppContext) {
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
    const limit = Math.min(Number(getParam("limit")) || 100, 1000);

    // Owner mode (url + token) - returns settings including webhookUrl
    if (url && token) {
      const bbs = await getBBSByUrl(db, url);
      if (!bbs) {
        return c.json({ error: "BBS not found" }, 404);
      }

      const bbsId = (bbs as BBSRecord).id.replace("bbs:", "");
      const isOwner = await verifyOwnerToken(db, `bbs:${bbsId}`, token);

      if (!isOwner) {
        return c.json({ error: "Invalid token" }, 403);
      }

      const metadata = JSON.parse((bbs as BBSRecord).metadata || "{}");
      const messages = await getMessages(db, bbsId, limit);
      const totalMessages = await getMessageCount(db, bbsId);

      const ip = c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For") || "0.0.0.0";
      const userAgent = c.req.header("User-Agent") || "";
      const currentUserHash = await generateUserHash(ip, userAgent);

      return c.json({
        success: true,
        data: {
          id: bbsId,
          url,
          title: metadata.title,
          maxMessages: metadata.maxMessages,
          messagesPerPage: metadata.messagesPerPage || 20,
          totalMessages,
          messages,
          currentUserHash,
          settings: {
            webhookUrl: metadata.webhookUrl || null,
            standardSelect: metadata.standardSelect || null,
            incrementalSelect: metadata.incrementalSelect || null,
            emoteSelect: metadata.emoteSelect || null,
          },
        },
      });
    }

    const id = getParam("id");

    // Public mode (by id)
    if (!id) {
      return c.json({ error: "id is required" }, 400);
    }

    const bbs = await db.prepare("SELECT * FROM services WHERE id = ?").bind(`bbs:${id}`).first();
    if (!bbs) {
      return c.json({ error: "BBS not found" }, 404);
    }

    const metadata = JSON.parse((bbs as BBSRecord).metadata || "{}");
    const format = getParam("format") || "json";

    // 画像形式で返す場合（GitHub README用）
    if (format === "image") {
      const imageLimit = Math.min(Number(getParam("limit")) || 3, 10);
      const imageWidth = clampImageWidth(getParam("width"));
      const messages = await getMessages(db, id, imageLimit);
      const totalMessages = await getMessageCount(db, id);
      const svg = generateBBSSVG(messages, totalMessages, imageWidth);
      return c.body(svg, 200, {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "no-cache",
      });
    }

    const messages = await getMessages(db, id, limit);
    const totalMessages = await getMessageCount(db, id);

    // Add user hash for edit permission check
    const ip = c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For") || "0.0.0.0";
    const userAgent = c.req.header("User-Agent") || "";
    const currentUserHash = await generateUserHash(ip, userAgent);

    return c.json({
      success: true,
      data: {
        id,
        title: metadata.title,
        maxMessages: metadata.maxMessages,
        messagesPerPage: metadata.messagesPerPage || 20,
        totalMessages,
        messages,
        currentUserHash,
        settings: {
          standardSelect: metadata.standardSelect || null,
          incrementalSelect: metadata.incrementalSelect || null,
          emoteSelect: metadata.emoteSelect || null,
        },
      },
    });
  }

  // LOOKUP (owner URL lookup - lightweight id check, no messages/settings payload)
  if (action === "lookup") {
    const url = getParam("url");
    const token = getParam("token");

    if (!url || !token) {
      return c.json({ error: "url and token are required for lookup" }, 400);
    }

    const data = await lookupService(db, "bbs", url, token);
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

    const data = await batchLookupServices(db, "bbs", urls, token);
    return c.json({ success: true, data });
  }

  // CREATE
  if (action === "create") {
    const url = getParam("url");
    const token = getParam("token");
    const title = getParam("title") || "BBS";
    const maxMessages = Number(getParam("maxMessages")) || 100;
    const messagesPerPage = Number(getParam("messagesPerPage")) || 20;
    const webhookUrl = getParam("webhookUrl");

    // Select configuration
    const standardSelectLabel = getParam("standardSelectLabel");
    const standardSelectOptions = getParam("standardSelectOptions");
    const incrementalSelectLabel = getParam("incrementalSelectLabel");
    const incrementalSelectOptions = getParam("incrementalSelectOptions");
    const emoteSelectLabel = getParam("emoteSelectLabel");
    const emoteSelectOptions = getParam("emoteSelectOptions");

    if (!url || !token) {
      return c.json({ error: "url and token are required" }, 400);
    }

    if (!validateOwnerToken(token)) {
      return c.json({ error: "Token must be 8-16 characters" }, 400);
    }

    const existing = await getBBSByUrl(db, url);
    if (existing) {
      return c.json({ error: "BBS already exists for this URL" }, 400);
    }

    const publicId = await generatePublicId(url);
    const hashedToken = await hashToken(token);

    const parseOptions = (opts: string | undefined) =>
      opts
        ? opts
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

    const metadata = JSON.stringify({
      title,
      maxMessages,
      messagesPerPage,
      webhookUrl: webhookUrl || null,
      standardSelect: standardSelectLabel
        ? { label: standardSelectLabel, options: parseOptions(standardSelectOptions) }
        : null,
      incrementalSelect: incrementalSelectLabel
        ? { label: incrementalSelectLabel, options: parseOptions(incrementalSelectOptions) }
        : null,
      emoteSelect: emoteSelectLabel
        ? { label: emoteSelectLabel, options: parseOptions(emoteSelectOptions) }
        : null,
    });

    try {
      await runCreateBatch(
        db,
        [
          db
            .prepare(
              'INSERT INTO services (id, type, url, metadata, created_at) VALUES (?, ?, ?, ?, datetime("now"))'
            )
            .bind(`bbs:${publicId}`, "bbs", url, metadata),
          db
            .prepare("INSERT INTO url_mappings (type, url, service_id) VALUES (?, ?, ?)")
            .bind("bbs", url, publicId),
          db
            .prepare("INSERT INTO owner_tokens (service_id, token_hash) VALUES (?, ?)")
            .bind(`bbs:${publicId}`, hashedToken),
        ],
        "BBS already exists for this URL"
      );
    } catch (err) {
      if (err instanceof AlreadyExistsError) {
        return c.json({ error: err.message }, 400);
      }
      throw err;
    }

    return c.json({ success: true, id: publicId, url, title, maxMessages, messagesPerPage });
  }

  // POST (message)
  if (action === "post") {
    const id = getParam("id");
    const author = getParam("author") || BBS.AUTHOR.DEFAULT_VALUE;
    const message = getParam("message");
    const standardValue = getParam("standardValue");
    const incrementalValue = getParam("incrementalValue");
    const emoteValue = getParam("emoteValue");

    if (!id || !message) {
      return c.json({ error: "id and message are required" }, 400);
    }

    if (message.length > BBS.MESSAGE.MAX_LENGTH) {
      return c.json({ error: `Message must be ${BBS.MESSAGE.MAX_LENGTH} characters or less` }, 400);
    }

    const bbs = await db.prepare("SELECT * FROM services WHERE id = ?").bind(`bbs:${id}`).first();
    if (!bbs) {
      return c.json({ error: "BBS not found" }, 404);
    }

    const ip = c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For") || "0.0.0.0";
    const userAgent = c.req.header("User-Agent") || "";
    const userHash = await generateUserHash(ip, userAgent);

    // 投稿間隔制限（10秒）
    const POST_INTERVAL_SECONDS = 10;
    const lastPost = await db
      .prepare(
        "SELECT created_at FROM bbs_messages WHERE service_id = ? AND user_hash = ? ORDER BY created_at DESC LIMIT 1"
      )
      .bind(`bbs:${id}:messages`, userHash)
      .first<{ created_at: string }>();

    if (lastPost) {
      const lastPostTime = new Date(lastPost.created_at + "Z").getTime();
      const now = Date.now();
      const elapsed = (now - lastPostTime) / 1000;
      if (elapsed < POST_INTERVAL_SECONDS) {
        const remaining = Math.ceil(POST_INTERVAL_SECONDS - elapsed);
        return c.json({ error: `Please wait ${remaining} seconds before posting again` }, 429);
      }
    }

    const messageId = crypto.randomUUID();
    const selects =
      standardValue || incrementalValue || emoteValue
        ? { standardValue, incrementalValue, emoteValue }
        : null;

    await db
      .prepare(
        `
      INSERT INTO bbs_messages (id, service_id, author, message, selects, user_hash, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `
      )
      .bind(
        messageId,
        `bbs:${id}:messages`,
        author.slice(0, BBS.AUTHOR.MAX_LENGTH),
        message,
        selects ? JSON.stringify(selects) : null,
        userHash
      )
      .run();

    // Trim excess messages
    const metadata = JSON.parse((bbs as BBSRecord).metadata || "{}");
    const maxMessages = metadata.maxMessages || 100;

    const count = await db
      .prepare("SELECT COUNT(*) as count FROM bbs_messages WHERE service_id = ?")
      .bind(`bbs:${id}:messages`)
      .first<{ count: number }>();

    if (count && count.count > maxMessages) {
      await db
        .prepare(
          `
        DELETE FROM bbs_messages
        WHERE service_id = ? AND id IN (
          SELECT id FROM bbs_messages
          WHERE service_id = ?
          ORDER BY created_at ASC
          LIMIT ?
        )
      `
        )
        .bind(`bbs:${id}:messages`, `bbs:${id}:messages`, count.count - maxMessages)
        .run();
    }

    const messages = await getMessages(db, id);

    // WebHook送信（非同期、エラーは無視）
    if (metadata.webhookUrl) {
      sendWebHook(metadata.webhookUrl, "bbs.post", WebHookMessages.bbs.post(author, message), {
        id,
        author,
        message,
      });
    }

    return c.json({ success: true, data: { id, messages } });
  }

  // UPDATE
  // - Message update: user mode (id + messageId) or owner mode (url + token + messageId)
  // - Settings update: owner mode (url + token) without messageId
  if (action === "update") {
    const url = getParam("url");
    const token = getParam("token");
    const idParam = getParam("id");
    const messageId = getParam("messageId");
    const newMessage = getParam("message");
    const newTitle = getParam("title");
    const newMaxMessages = getParam("maxMessages");
    const newMessagesPerPage = getParam("messagesPerPage");
    const webhookUrl = getParam("webhookUrl");

    // Select configuration
    const standardSelectLabel = getParam("standardSelectLabel");
    const standardSelectOptions = getParam("standardSelectOptions");
    const incrementalSelectLabel = getParam("incrementalSelectLabel");
    const incrementalSelectOptions = getParam("incrementalSelectOptions");
    const emoteSelectLabel = getParam("emoteSelectLabel");
    const emoteSelectOptions = getParam("emoteSelectOptions");

    // Settings update mode (url + token, no messageId)
    if (url && token && !messageId) {
      const bbs = await getBBSByUrl(db, url);
      if (!bbs) {
        return c.json({ error: "BBS not found" }, 404);
      }

      const id = (bbs as BBSRecord).id.replace("bbs:", "");
      const isOwner = await verifyOwnerToken(db, `bbs:${id}`, token);

      if (!isOwner) {
        return c.json({ error: "Invalid token" }, 403);
      }

      const hasSettingsUpdate =
        newTitle !== undefined ||
        newMaxMessages !== undefined ||
        newMessagesPerPage !== undefined ||
        webhookUrl !== undefined ||
        standardSelectLabel !== undefined ||
        incrementalSelectLabel !== undefined ||
        emoteSelectLabel !== undefined;

      if (!hasSettingsUpdate) {
        return c.json({ error: "At least one setting parameter is required" }, 400);
      }

      const parseOptions = (opts: string | undefined) =>
        opts
          ? opts
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [];

      const currentMetadata = JSON.parse((bbs as BBSRecord).metadata || "{}");
      const newMetadata = {
        ...currentMetadata,
        ...(newTitle !== undefined && { title: newTitle }),
        ...(newMaxMessages !== undefined && { maxMessages: Number(newMaxMessages) }),
        ...(newMessagesPerPage !== undefined && { messagesPerPage: Number(newMessagesPerPage) }),
        ...(webhookUrl !== undefined && { webhookUrl: webhookUrl === "" ? null : webhookUrl }),
        ...(standardSelectLabel !== undefined && {
          standardSelect: standardSelectLabel
            ? { label: standardSelectLabel, options: parseOptions(standardSelectOptions) }
            : null,
        }),
        ...(incrementalSelectLabel !== undefined && {
          incrementalSelect: incrementalSelectLabel
            ? { label: incrementalSelectLabel, options: parseOptions(incrementalSelectOptions) }
            : null,
        }),
        ...(emoteSelectLabel !== undefined && {
          emoteSelect: emoteSelectLabel
            ? { label: emoteSelectLabel, options: parseOptions(emoteSelectOptions) }
            : null,
        }),
      };

      await db
        .prepare("UPDATE services SET metadata = ? WHERE id = ?")
        .bind(JSON.stringify(newMetadata), `bbs:${id}`)
        .run();

      const messages = await getMessages(db, id);
      return c.json({
        success: true,
        data: {
          id,
          messages,
          title: newMetadata.title,
          maxMessages: newMetadata.maxMessages,
          messagesPerPage: newMetadata.messagesPerPage,
        },
      });
    }

    // Message update mode
    if (!messageId || !newMessage) {
      return c.json({ error: "messageId and message are required" }, 400);
    }

    let id: string;
    let isOwner = false;

    // Owner mode: url + token
    if (url && token) {
      const bbs = await getBBSByUrl(db, url);
      if (!bbs) {
        return c.json({ error: "BBS not found" }, 404);
      }
      id = (bbs as BBSRecord).id.replace("bbs:", "");
      const ownerVerified = await verifyOwnerToken(db, `bbs:${id}`, token);
      if (!ownerVerified) {
        return c.json({ error: "Invalid token" }, 403);
      }
      isOwner = true;
    }
    // User mode: id
    else if (idParam) {
      id = idParam;
      const bbs = await db.prepare("SELECT * FROM services WHERE id = ?").bind(`bbs:${id}`).first();
      if (!bbs) {
        return c.json({ error: "BBS not found" }, 404);
      }
    } else {
      return c.json({ error: "id or (url + token) is required" }, 400);
    }

    const msg = await db
      .prepare("SELECT user_hash FROM bbs_messages WHERE id = ? AND service_id = ?")
      .bind(messageId, `bbs:${id}:messages`)
      .first<{ user_hash: string }>();

    if (!msg) {
      return c.json({ error: "Message not found" }, 404);
    }

    // User mode: check ownership
    if (!isOwner) {
      const ip = c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For") || "0.0.0.0";
      const userAgent = c.req.header("User-Agent") || "";
      const userHash = await generateUserHash(ip, userAgent);
      if (msg.user_hash !== userHash) {
        return c.json({ error: "You can only edit your own messages" }, 403);
      }
    }

    await db
      .prepare("UPDATE bbs_messages SET message = ? WHERE id = ?")
      .bind(newMessage.slice(0, BBS.MESSAGE.MAX_LENGTH), messageId)
      .run();

    const messages = await getMessages(db, id);
    return c.json({ success: true, data: { id, messages, updated: messageId } });
  }

  // REMOVE (user mode: id + messageId, owner mode: url + token + messageId)
  if (action === "remove") {
    const url = getParam("url");
    const token = getParam("token");
    const idParam = getParam("id");
    const messageId = getParam("messageId");

    if (!messageId) {
      return c.json({ error: "messageId is required" }, 400);
    }

    let id: string;
    let isOwner = false;

    // Owner mode: url + token
    if (url && token) {
      const bbs = await getBBSByUrl(db, url);
      if (!bbs) {
        return c.json({ error: "BBS not found" }, 404);
      }
      id = (bbs as BBSRecord).id.replace("bbs:", "");
      const ownerVerified = await verifyOwnerToken(db, `bbs:${id}`, token);
      if (!ownerVerified) {
        return c.json({ error: "Invalid token" }, 403);
      }
      isOwner = true;
    }
    // User mode: id
    else if (idParam) {
      id = idParam;
      const bbs = await db.prepare("SELECT * FROM services WHERE id = ?").bind(`bbs:${id}`).first();
      if (!bbs) {
        return c.json({ error: "BBS not found" }, 404);
      }
    } else {
      return c.json({ error: "id or (url + token) is required" }, 400);
    }

    const msg = await db
      .prepare("SELECT user_hash FROM bbs_messages WHERE id = ? AND service_id = ?")
      .bind(messageId, `bbs:${id}:messages`)
      .first<{ user_hash: string }>();

    if (!msg) {
      return c.json({ error: "Message not found" }, 404);
    }

    // User mode: check ownership
    if (!isOwner) {
      const ip = c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For") || "0.0.0.0";
      const userAgent = c.req.header("User-Agent") || "";
      const userHash = await generateUserHash(ip, userAgent);
      if (msg.user_hash !== userHash) {
        return c.json({ error: "You can only delete your own messages" }, 403);
      }
    }

    await db.prepare("DELETE FROM bbs_messages WHERE id = ?").bind(messageId).run();

    const messages = await getMessages(db, id);
    return c.json({ success: true, data: { id, messages, removed: messageId } });
  }

  // CLEAR
  if (action === "clear") {
    const url = getParam("url");
    const token = getParam("token");

    if (!url || !token) {
      return c.json({ error: "url and token are required" }, 400);
    }

    const bbs = await getBBSByUrl(db, url);
    if (!bbs) {
      return c.json({ error: "BBS not found" }, 404);
    }

    const id = (bbs as BBSRecord).id.replace("bbs:", "");
    const isOwner = await verifyOwnerToken(db, `bbs:${id}`, token);

    if (!isOwner) {
      return c.json({ error: "Invalid token" }, 403);
    }

    await db
      .prepare("DELETE FROM bbs_messages WHERE service_id = ?")
      .bind(`bbs:${id}:messages`)
      .run();

    return c.json({ success: true, data: { id, messages: [], cleared: true } });
  }

  // DELETE
  if (action === "delete") {
    const url = getParam("url");
    const token = getParam("token");

    if (!url || !token) {
      return c.json({ error: "url and token are required" }, 400);
    }

    const bbs = await getBBSByUrl(db, url);
    if (!bbs) {
      return c.json({ error: "BBS not found" }, 404);
    }

    const id = (bbs as BBSRecord).id.replace("bbs:", "");
    const isOwner = await verifyOwnerToken(db, `bbs:${id}`, token);

    if (!isOwner) {
      return c.json({ error: "Invalid token" }, 403);
    }

    await db.batch([
      db.prepare("DELETE FROM services WHERE id = ?").bind(`bbs:${id}`),
      db.prepare("DELETE FROM url_mappings WHERE type = ? AND url = ?").bind("bbs", url),
      db.prepare("DELETE FROM owner_tokens WHERE service_id = ?").bind(`bbs:${id}`),
      db.prepare("DELETE FROM bbs_messages WHERE service_id = ?").bind(`bbs:${id}:messages`),
    ]);

    return c.json({ success: true, message: "BBS deleted" });
  }

  return c.json(
    {
      error:
        "Invalid action. Use: get, lookup, create, post, update, remove, clear, delete (GET or POST), batchLookup (POST only)",
    },
    400
  );
}

app.get("/", handleBBSAction);
app.post("/", handleBBSAction);

// === SVG Generator (Shields.io風) ===
type BBSMessage = {
  id: string;
  author: string;
  message: string;
  standardValue?: string;
  incrementalValue?: string;
  emoteValue?: string;
  userHash: string;
  timestamp: string;
};

const BBS_IMAGE = {
  WIDTH: { DEFAULT: 400, MIN: 240, MAX: 1200 },
  LABEL_WIDTH: 50,
  LINE_HEIGHT: 20,
  PADDING: 12,
  TEXT_X_PADDING: 8,
  AUTHOR_WIDTH: 10,
  MESSAGE_WIDTH_PADDING: 52,
  AVG_CHAR_WIDTH: 9,
};

function clampImageWidth(value: string | undefined): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return BBS_IMAGE.WIDTH.DEFAULT;
  return Math.min(Math.max(Math.round(parsed), BBS_IMAGE.WIDTH.MIN), BBS_IMAGE.WIDTH.MAX);
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// 表示幅で切り詰め（maxWidth は半角基準、全角=2, 半角=1）
function truncateByWidth(text: string, maxWidth: number): string {
  let width = 0;
  let result = "";
  for (const char of text) {
    const code = char.charCodeAt(0);
    const charWidth = code > 0x7f ? 2 : 1;
    if (width + charWidth > maxWidth - 1) {
      return result + "...";
    }
    width += charWidth;
    result += char;
  }
  return result;
}

function generateBBSSVG(messages: BBSMessage[], totalMessages: number, totalWidth: number): string {
  const labelWidth = BBS_IMAGE.LABEL_WIDTH;
  const contentWidth = totalWidth - labelWidth;
  const lineHeight = BBS_IMAGE.LINE_HEIGHT;
  const padding = BBS_IMAGE.PADDING;
  const textX = labelWidth + BBS_IMAGE.TEXT_X_PADDING;
  const messageWidth = Math.max(
    8,
    Math.floor((contentWidth - BBS_IMAGE.MESSAGE_WIDTH_PADDING) / BBS_IMAGE.AVG_CHAR_WIDTH)
  );
  const contentHeight =
    messages.length > 0 ? messages.length * lineHeight + padding * 2 : lineHeight + padding * 2;
  const totalHeight = contentHeight;

  const labelBg = "#555";
  const contentBg = "#fff";
  const textColor = "#333";
  const headerTextColor = "#fff";

  if (messages.length === 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}">
  <defs>
    <clipPath id="round">
      <rect width="${totalWidth}" height="${totalHeight}" rx="3"/>
    </clipPath>
  </defs>
  <g clip-path="url(#round)">
    <rect width="${labelWidth}" height="${totalHeight}" fill="${labelBg}"/>
    <rect x="${labelWidth}" width="${contentWidth}" height="${totalHeight}" fill="${contentBg}" stroke="#ddd" stroke-width="1"/>
  </g>
  <g text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="${labelWidth / 2}" y="${totalHeight / 2 + 5}" fill="#010101" fill-opacity=".3">BBS</text>
    <text x="${labelWidth / 2}" y="${totalHeight / 2 + 4}" fill="${headerTextColor}">BBS</text>
  </g>
  <g fill="#999" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="12">
    <text x="${textX}" y="${padding + lineHeight - 4}">No messages yet</text>
  </g>
</svg>`;
  }

  const messageLines = messages
    .map((msg, index) => {
      const msgNum = totalMessages - index;
      const author = truncateByWidth(msg.author || "Anonymous", BBS_IMAGE.AUTHOR_WIDTH);
      const content = truncateByWidth(msg.message.replace(/\n/g, " "), messageWidth);
      const y = padding + (index + 1) * lineHeight - 4;
      return `<text x="${textX}" y="${y}" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="12"><tspan fill="#999">#${msgNum}</tspan> <tspan font-weight="bold" fill="${textColor}">${escapeXml(author)}</tspan><tspan fill="${textColor}">: ${escapeXml(content)}</tspan></text>`;
    })
    .join("\n    ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}">
  <defs>
    <clipPath id="round">
      <rect width="${totalWidth}" height="${totalHeight}" rx="3"/>
    </clipPath>
  </defs>
  <g clip-path="url(#round)">
    <rect width="${labelWidth}" height="${totalHeight}" fill="${labelBg}"/>
    <rect x="${labelWidth}" width="${contentWidth}" height="${totalHeight}" fill="${contentBg}" stroke="#ddd" stroke-width="1"/>
  </g>
  <g text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="${labelWidth / 2}" y="${totalHeight / 2 + 5}" fill="#010101" fill-opacity=".3">BBS</text>
    <text x="${labelWidth / 2}" y="${totalHeight / 2 + 4}" fill="${headerTextColor}">BBS</text>
  </g>
  <g fill="${textColor}" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="12">
    ${messageLines}
  </g>
</svg>`;
}

export default app;
