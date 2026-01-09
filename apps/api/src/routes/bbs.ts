/**
 * BBS API Routes
 */

import { Hono } from "hono";
import { hashToken, validateOwnerToken } from "../lib/core/auth";
import { generatePublicId } from "../lib/core/id";
import { generateUserHash } from "../lib/core/crypto";
import { BBS } from "../lib/core/constants";

type Bindings = { DB: D1Database };

type BBSRecord = {
  id: string;
  metadata?: string;
};

type BBSMessageRow = {
  id: string;
  author: string;
  message: string;
  icon?: string;
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
    SELECT id, author, message, icon, selects, user_hash, created_at
    FROM bbs_messages
    WHERE service_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `
    )
    .bind(`bbs:${id}:messages`, limit)
    .all();

  return (results as BBSMessageRow[]).map((row) => ({
    id: row.id,
    author: row.author,
    message: row.message,
    icon: row.icon,
    selects: row.selects ? JSON.parse(row.selects) : undefined,
    userHash: row.user_hash,
    timestamp: row.created_at,
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
    const title = c.req.query("title") || "BBS";
    const maxMessages = Number(c.req.query("maxMessages")) || 100;
    const webhookUrl = c.req.query("webhookUrl");

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
    const metadata = JSON.stringify({ title, maxMessages, webhookUrl: webhookUrl || null });

    await db.batch([
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
    ]);

    return c.json({ success: true, id: publicId, url, title, maxMessages });
  }

  // POST
  if (action === "post") {
    const id = c.req.query("id");
    const author = c.req.query("author") || BBS.AUTHOR.DEFAULT_VALUE;
    const message = c.req.query("message");
    const icon = c.req.query("icon");
    const select1 = c.req.query("select1");
    const select2 = c.req.query("select2");
    const select3 = c.req.query("select3");

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
    const messageId = crypto.randomUUID();
    const selects = select1 || select2 || select3 ? { select1, select2, select3 } : null;

    await db
      .prepare(
        `
      INSERT INTO bbs_messages (id, service_id, author, message, icon, selects, user_hash, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `
      )
      .bind(
        messageId,
        `bbs:${id}:messages`,
        author.slice(0, BBS.AUTHOR.MAX_LENGTH),
        message,
        icon || null,
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
    return c.json({ success: true, data: { id, messages } });
  }

  // GET
  if (action === "get") {
    const id = c.req.query("id");
    const url = c.req.query("url");
    const token = c.req.query("token");
    const limit = Math.min(Number(c.req.query("limit")) || 100, 1000);

    // Owner mode (url + token) - returns settings including webhookUrl
    if (url && token) {
      const bbs = await getBBSByUrl(db, url);
      if (!bbs) {
        return c.json({ error: "BBS not found" }, 404);
      }

      const bbsId = (bbs as BBSRecord).id.replace("bbs:", "");
      const hashedToken = await hashToken(token);
      const owner = await db
        .prepare("SELECT 1 FROM owner_tokens WHERE service_id = ? AND token_hash = ?")
        .bind(`bbs:${bbsId}`, hashedToken)
        .first();

      if (!owner) {
        return c.json({ error: "Invalid token" }, 403);
      }

      const metadata = JSON.parse((bbs as BBSRecord).metadata || "{}");
      const messages = await getMessages(db, bbsId, limit);

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
          messages,
          currentUserHash,
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

    const bbs = await db.prepare("SELECT * FROM services WHERE id = ?").bind(`bbs:${id}`).first();
    if (!bbs) {
      return c.json({ error: "BBS not found" }, 404);
    }

    const metadata = JSON.parse((bbs as BBSRecord).metadata || "{}");
    const messages = await getMessages(db, id, limit);

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
        messages,
        currentUserHash,
      },
    });
  }

  // UPDATE
  // - Message update: user mode (id + messageId) or owner mode (url + token + messageId)
  // - Settings update: owner mode (url + token) without messageId
  if (action === "update") {
    const url = c.req.query("url");
    const token = c.req.query("token");
    const idParam = c.req.query("id");
    const messageId = c.req.query("messageId");
    const newMessage = c.req.query("message");
    const newTitle = c.req.query("title");
    const newMaxMessages = c.req.query("maxMessages");
    const webhookUrl = c.req.query("webhookUrl");

    // Settings update mode (url + token, no messageId)
    if (url && token && !messageId) {
      const bbs = await getBBSByUrl(db, url);
      if (!bbs) {
        return c.json({ error: "BBS not found" }, 404);
      }

      const id = (bbs as BBSRecord).id.replace("bbs:", "");
      const hashedToken = await hashToken(token);
      const owner = await db
        .prepare("SELECT 1 FROM owner_tokens WHERE service_id = ? AND token_hash = ?")
        .bind(`bbs:${id}`, hashedToken)
        .first();

      if (!owner) {
        return c.json({ error: "Invalid token" }, 403);
      }

      if (newTitle === undefined && newMaxMessages === undefined && webhookUrl === undefined) {
        return c.json(
          { error: "At least one of title, maxMessages or webhookUrl is required" },
          400
        );
      }

      const currentMetadata = JSON.parse((bbs as BBSRecord).metadata || "{}");
      const newMetadata = {
        ...currentMetadata,
        ...(newTitle !== undefined && { title: newTitle }),
        ...(newMaxMessages !== undefined && { maxMessages: Number(newMaxMessages) }),
        ...(webhookUrl !== undefined && { webhookUrl: webhookUrl === "" ? null : webhookUrl }),
      };

      await db
        .prepare("UPDATE services SET metadata = ? WHERE id = ?")
        .bind(JSON.stringify(newMetadata), `bbs:${id}`)
        .run();

      const messages = await getMessages(db, id);
      return c.json({
        success: true,
        data: { id, messages, title: newMetadata.title, maxMessages: newMetadata.maxMessages },
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
      const hashedToken = await hashToken(token);
      const owner = await db
        .prepare("SELECT 1 FROM owner_tokens WHERE service_id = ? AND token_hash = ?")
        .bind(`bbs:${id}`, hashedToken)
        .first();
      if (!owner) {
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
    const url = c.req.query("url");
    const token = c.req.query("token");
    const idParam = c.req.query("id");
    const messageId = c.req.query("messageId");

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
      const hashedToken = await hashToken(token);
      const owner = await db
        .prepare("SELECT 1 FROM owner_tokens WHERE service_id = ? AND token_hash = ?")
        .bind(`bbs:${id}`, hashedToken)
        .first();
      if (!owner) {
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
    const url = c.req.query("url");
    const token = c.req.query("token");

    if (!url || !token) {
      return c.json({ error: "url and token are required" }, 400);
    }

    const bbs = await getBBSByUrl(db, url);
    if (!bbs) {
      return c.json({ error: "BBS not found" }, 404);
    }

    const id = (bbs as BBSRecord).id.replace("bbs:", "");
    const hashedToken = await hashToken(token);
    const owner = await db
      .prepare("SELECT 1 FROM owner_tokens WHERE service_id = ? AND token_hash = ?")
      .bind(`bbs:${id}`, hashedToken)
      .first();

    if (!owner) {
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
    const url = c.req.query("url");
    const token = c.req.query("token");

    if (!url || !token) {
      return c.json({ error: "url and token are required" }, 400);
    }

    const bbs = await getBBSByUrl(db, url);
    if (!bbs) {
      return c.json({ error: "BBS not found" }, 404);
    }

    const id = (bbs as BBSRecord).id.replace("bbs:", "");
    const hashedToken = await hashToken(token);
    const owner = await db
      .prepare("SELECT 1 FROM owner_tokens WHERE service_id = ? AND token_hash = ?")
      .bind(`bbs:${id}`, hashedToken)
      .first();

    if (!owner) {
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
    { error: "Invalid action. Use: create, post, get, update, remove, clear, delete" },
    400
  );
});

export default app;
