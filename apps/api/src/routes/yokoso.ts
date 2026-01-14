/**
 * Yokoso API Routes
 * 招き猫が喋るウェルカムメッセージ
 */

import { Hono } from "hono";
import { hashToken, validateOwnerToken } from "../lib/core/auth";
import { generatePublicId } from "../lib/core/id";
import { sendWebHook, WebHookMessages } from "../lib/core/webhook";

type Bindings = { DB: D1Database };

type YokosoRecord = {
  id: string;
  metadata: string;
  created_at: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// === Constants ===
const MAX_MESSAGE_BADGE = 20;
const MAX_MESSAGE_CARD = 140;
const MAX_NAME_LENGTH = 30;

// === Helper Functions ===

async function getYokosoByUrl(db: D1Database, url: string) {
  const mapping = await db
    .prepare("SELECT service_id FROM url_mappings WHERE type = ? AND url = ?")
    .bind("yokoso", url)
    .first<{ service_id: string }>();
  if (!mapping) return null;
  return db
    .prepare("SELECT * FROM services WHERE id = ?")
    .bind(`yokoso:${mapping.service_id}`)
    .first();
}

async function getYokosoById(db: D1Database, id: string) {
  return db.prepare("SELECT * FROM services WHERE id = ?").bind(`yokoso:${id}`).first();
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + "…";
}

// === Maneki-neko SVG Icon (inline) ===
// 招き猫アイコン（16x16）
function getManekiNekoIcon(x: number, y: number): string {
  return `<g transform="translate(${x}, ${y})">
    <!-- 体 -->
    <ellipse cx="8" cy="11" rx="6" ry="5" fill="#fff5e6" stroke="#d4a574" stroke-width="0.5"/>
    <!-- 顔 -->
    <circle cx="8" cy="6" r="5" fill="#fff5e6" stroke="#d4a574" stroke-width="0.5"/>
    <!-- 耳 -->
    <path d="M4 3 L3 0 L5.5 2 Z" fill="#fff5e6" stroke="#d4a574" stroke-width="0.3"/>
    <path d="M12 3 L13 0 L10.5 2 Z" fill="#fff5e6" stroke="#d4a574" stroke-width="0.3"/>
    <path d="M4 2.5 L3.5 1 L5 2 Z" fill="#ffb6c1"/>
    <path d="M12 2.5 L12.5 1 L11 2 Z" fill="#ffb6c1"/>
    <!-- 目 -->
    <ellipse cx="6" cy="5.5" rx="1" ry="1.2" fill="#333"/>
    <ellipse cx="10" cy="5.5" rx="1" ry="1.2" fill="#333"/>
    <circle cx="6.3" cy="5.2" r="0.3" fill="#fff"/>
    <circle cx="10.3" cy="5.2" r="0.3" fill="#fff"/>
    <!-- 鼻 -->
    <ellipse cx="8" cy="7" rx="0.6" ry="0.4" fill="#ffb6c1"/>
    <!-- 口 -->
    <path d="M7 8 Q8 9 9 8" fill="none" stroke="#d4a574" stroke-width="0.4"/>
    <!-- 挙げた手（右手） -->
    <ellipse cx="13" cy="5" rx="2" ry="2.5" fill="#fff5e6" stroke="#d4a574" stroke-width="0.5"/>
    <!-- 小判 -->
    <ellipse cx="8" cy="12" rx="2.5" ry="1.5" fill="#ffd700" stroke="#daa520" stroke-width="0.3"/>
    <text x="8" y="12.8" font-size="2" fill="#8b4513" text-anchor="middle">福</text>
  </g>`;
}

// === SVG Generators ===

function generateBadgeSVG(message: string): string {
  const label = "Yokoso";
  const labelWidth = 50;
  const iconWidth = 20; // 招き猫アイコン用スペース
  const textWidth = Math.max(message.length * 8, 50);
  const messageWidth = iconWidth + textWidth;
  const totalWidth = labelWidth + messageWidth;
  const height = 20;
  const labelBg = "#555";
  const valueBg = "#e91e63"; // ピンク（縁起の良い色）
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
    <rect x="${labelWidth}" width="${messageWidth}" height="${height}" fill="${valueBg}"/>
    <rect width="${totalWidth}" height="${height}" fill="url(#smooth)"/>
  </g>
  <g fill="${textColor}" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="${labelWidth / 2}" y="14">${label}</text>
  </g>
  ${getManekiNekoIcon(labelWidth + 2, 2)}
  <text x="${labelWidth + iconWidth + textWidth / 2}" y="14" fill="${textColor}" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">${escapeXml(message)}</text>
</svg>`;
}

// デフォルト招き猫アバター（カードモード用、32x32）
function getDefaultAvatarSVG(): string {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16">
    <rect width="16" height="16" fill="#fff5e6"/>
    <ellipse cx="8" cy="11" rx="6" ry="5" fill="#fff5e6" stroke="#d4a574" stroke-width="0.5"/>
    <circle cx="8" cy="6" r="5" fill="#fff5e6" stroke="#d4a574" stroke-width="0.5"/>
    <path d="M4 3 L3 0 L5.5 2 Z" fill="#fff5e6" stroke="#d4a574" stroke-width="0.3"/>
    <path d="M12 3 L13 0 L10.5 2 Z" fill="#fff5e6" stroke="#d4a574" stroke-width="0.3"/>
    <path d="M4 2.5 L3.5 1 L5 2 Z" fill="#ffb6c1"/>
    <path d="M12 2.5 L12.5 1 L11 2 Z" fill="#ffb6c1"/>
    <ellipse cx="6" cy="5.5" rx="1" ry="1.2" fill="#333"/>
    <ellipse cx="10" cy="5.5" rx="1" ry="1.2" fill="#333"/>
    <circle cx="6.3" cy="5.2" r="0.3" fill="#fff"/>
    <circle cx="10.3" cy="5.2" r="0.3" fill="#fff"/>
    <ellipse cx="8" cy="7" rx="0.6" ry="0.4" fill="#ffb6c1"/>
    <path d="M7 8 Q8 9 9 8" fill="none" stroke="#d4a574" stroke-width="0.4"/>
    <ellipse cx="13" cy="5" rx="2" ry="2.5" fill="#fff5e6" stroke="#d4a574" stroke-width="0.5"/>
    <ellipse cx="8" cy="12" rx="2.5" ry="1.5" fill="#ffd700" stroke="#daa520" stroke-width="0.3"/>
    <text x="8" y="12.8" font-size="2" fill="#8b4513" text-anchor="middle">福</text>
  </svg>`)}`;
}

function generateCardSVG(
  message: string,
  name: string | null,
  avatar: string | null,
  updatedAt: string,
  lang: string = "ja"
): string {
  const labelWidth = 50;
  const contentWidth = 280;
  const totalWidth = labelWidth + contentWidth;
  const lineHeight = 16;
  const padding = 8;
  const avatarSize = 28; // アバターサイズを大きく

  // Split message into lines (approximately 28 chars per line for Japanese)
  const maxCharsPerLine = 28;
  const lines: string[] = [];
  let remaining = message;
  while (remaining.length > 0) {
    lines.push(remaining.slice(0, maxCharsPerLine));
    remaining = remaining.slice(maxCharsPerLine);
  }

  const headerHeight = avatarSize + 4; // アバターに合わせたヘッダー高さ
  const messageHeight = lines.length * lineHeight;
  const contentHeight = padding + headerHeight + messageHeight + padding;
  const totalHeight = Math.max(contentHeight, 50);

  const labelBg = "#555";
  const contentBg = "#fff";
  const textColor = "#333";
  const dateColor = "#999";

  // Format date based on language
  const date = new Date(updatedAt);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const dateStr = lang === "en" ? `${month}-${day}-${year}` : `${year}-${month}-${day}`;

  // アバターとネームはデフォルト値を持つ
  const displayAvatar = avatar || getDefaultAvatarSVG();
  const displayName = name || "Lucky Cat";

  // アバター: 左上に配置
  const avatarX = labelWidth + padding;
  const avatarY = padding;
  const avatarSection = `<image href="${escapeXml(displayAvatar)}" x="${avatarX}" y="${avatarY}" width="${avatarSize}" height="${avatarSize}" clip-path="url(#avatarClip)"/>`;

  // 名前: アバターの右側（縦中央揃え）
  const nameX = avatarX + avatarSize + 6;
  const nameY = avatarY + avatarSize / 2 + 4;
  const nameSection = `<text x="${nameX}" y="${nameY}" fill="${textColor}" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="12" font-weight="bold">${escapeXml(displayName)}</text>`;

  // 日付: 名前と同じ行、右寄せ
  const dateSection = `<text x="${totalWidth - padding}" y="${nameY}" fill="${dateColor}" text-anchor="end" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="10">${dateStr}</text>`;

  const messageLines = lines
    .map(
      (line, i) =>
        `<text x="${labelWidth + padding}" y="${padding + headerHeight + (i + 1) * lineHeight}" fill="${textColor}" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="12">${escapeXml(line)}</text>`
    )
    .join("\n    ");

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${totalWidth}" height="${totalHeight}">
  <defs>
    <clipPath id="avatarClip">
      <circle cx="${avatarX + avatarSize / 2}" cy="${avatarY + avatarSize / 2}" r="${avatarSize / 2}"/>
    </clipPath>
  </defs>
  <rect width="${labelWidth}" height="${totalHeight}" fill="${labelBg}"/>
  <rect x="${labelWidth}" width="${contentWidth}" height="${totalHeight}" fill="${contentBg}" stroke="#ddd" stroke-width="1"/>
  <text x="${labelWidth / 2}" y="${totalHeight / 2 + 4}" fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">Yokoso</text>
  ${avatarSection}
  ${nameSection}
  ${dateSection}
  ${messageLines}
</svg>`;
}

// === Routes ===

app.get("/", async (c) => {
  const action = c.req.query("action");
  const db = c.env.DB;

  // CREATE
  if (action === "create") {
    const url = c.req.query("url");
    const token = c.req.query("token");
    const message = c.req.query("message");
    const mode = c.req.query("mode") || "badge";
    const name = c.req.query("name");
    const avatar = c.req.query("avatar");
    const webhookUrl = c.req.query("webhookUrl");

    if (!url || !token || !message) {
      return c.json({ error: "url, token, and message are required" }, 400);
    }

    if (!validateOwnerToken(token)) {
      return c.json({ error: "Token must be 8-16 characters" }, 400);
    }

    if (mode !== "badge" && mode !== "card") {
      return c.json({ error: "mode must be 'badge' or 'card'" }, 400);
    }

    const maxLength = mode === "badge" ? MAX_MESSAGE_BADGE : MAX_MESSAGE_CARD;
    if (message.length > maxLength) {
      return c.json(
        { error: `Message too long. Max ${maxLength} characters for ${mode} mode` },
        400
      );
    }

    if (name && name.length > MAX_NAME_LENGTH) {
      return c.json({ error: `Name too long. Max ${MAX_NAME_LENGTH} characters` }, 400);
    }

    const existing = await getYokosoByUrl(db, url);
    if (existing) {
      return c.json({ error: "Yokoso already exists for this URL" }, 400);
    }

    const publicId = await generatePublicId(url);
    const hashedToken = await hashToken(token);
    const now = new Date().toISOString();
    const metadata = JSON.stringify({
      message,
      mode,
      name: name || null,
      avatar: avatar || null,
      webhookUrl: webhookUrl || null,
      updatedAt: now,
    });

    await db.batch([
      db
        .prepare(
          'INSERT INTO services (id, type, url, metadata, created_at) VALUES (?, ?, ?, ?, datetime("now"))'
        )
        .bind(`yokoso:${publicId}`, "yokoso", url, metadata),
      db
        .prepare("INSERT INTO url_mappings (type, url, service_id) VALUES (?, ?, ?)")
        .bind("yokoso", url, publicId),
      db
        .prepare("INSERT INTO owner_tokens (service_id, token_hash) VALUES (?, ?)")
        .bind(`yokoso:${publicId}`, hashedToken),
    ]);

    return c.json({
      success: true,
      id: publicId,
      url,
      message: "Yokoso created successfully",
    });
  }

  // GET
  if (action === "get") {
    const id = c.req.query("id");
    const url = c.req.query("url");
    const token = c.req.query("token");
    const format = c.req.query("format") || "json";

    // Owner mode (url + token)
    if (url && token) {
      const yokoso = await getYokosoByUrl(db, url);
      if (!yokoso) {
        return c.json({ error: "Yokoso not found" }, 404);
      }

      const yokosoId = (yokoso as YokosoRecord).id.replace("yokoso:", "");
      const hashedToken = await hashToken(token);
      const owner = await db
        .prepare("SELECT 1 FROM owner_tokens WHERE service_id = ? AND token_hash = ?")
        .bind(`yokoso:${yokosoId}`, hashedToken)
        .first();

      if (!owner) {
        return c.json({ error: "Invalid token" }, 403);
      }

      const metadata = JSON.parse((yokoso as YokosoRecord).metadata || "{}");
      return c.json({
        success: true,
        data: {
          id: yokosoId,
          url,
          message: metadata.message,
          mode: metadata.mode,
          name: metadata.name,
          avatar: metadata.avatar,
          updatedAt: metadata.updatedAt,
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

    const yokoso = await getYokosoById(db, id);
    if (!yokoso) {
      return c.json({ error: "Yokoso not found" }, 404);
    }

    const metadata = JSON.parse((yokoso as YokosoRecord).metadata || "{}");

    // Image format
    if (format === "image") {
      const lang = c.req.query("lang") || "ja";
      const svg =
        metadata.mode === "card"
          ? generateCardSVG(
              metadata.message,
              metadata.name,
              metadata.avatar,
              metadata.updatedAt,
              lang
            )
          : generateBadgeSVG(truncateText(metadata.message, MAX_MESSAGE_BADGE));
      return c.body(svg, 200, {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "no-cache",
      });
    }

    // Text format
    if (format === "text") {
      return c.text(metadata.message);
    }

    // JSON format (default)
    return c.json({
      success: true,
      data: {
        id,
        message: metadata.message,
        mode: metadata.mode,
        name: metadata.name,
        avatar: metadata.avatar,
        updatedAt: metadata.updatedAt,
      },
    });
  }

  // UPDATE
  if (action === "update") {
    const url = c.req.query("url");
    const token = c.req.query("token");
    const message = c.req.query("message");
    const mode = c.req.query("mode");
    const name = c.req.query("name");
    const avatar = c.req.query("avatar");
    const webhookUrl = c.req.query("webhookUrl");

    if (!url || !token) {
      return c.json({ error: "url and token are required" }, 400);
    }

    const yokoso = await getYokosoByUrl(db, url);
    if (!yokoso) {
      return c.json({ error: "Yokoso not found" }, 404);
    }

    const yokosoId = (yokoso as YokosoRecord).id.replace("yokoso:", "");
    const hashedToken = await hashToken(token);
    const owner = await db
      .prepare("SELECT 1 FROM owner_tokens WHERE service_id = ? AND token_hash = ?")
      .bind(`yokoso:${yokosoId}`, hashedToken)
      .first();

    if (!owner) {
      return c.json({ error: "Invalid token" }, 403);
    }

    const currentMetadata = JSON.parse((yokoso as YokosoRecord).metadata || "{}");
    const newMode = mode || currentMetadata.mode || "badge";

    // Validate message length if provided
    if (message !== undefined) {
      const maxLength = newMode === "badge" ? MAX_MESSAGE_BADGE : MAX_MESSAGE_CARD;
      if (message.length > maxLength) {
        return c.json(
          { error: `Message too long. Max ${maxLength} characters for ${newMode} mode` },
          400
        );
      }
    }

    if (name !== undefined && name.length > MAX_NAME_LENGTH) {
      return c.json({ error: `Name too long. Max ${MAX_NAME_LENGTH} characters` }, 400);
    }

    const now = new Date().toISOString();
    const newMetadata = {
      ...currentMetadata,
      message: message !== undefined ? message : currentMetadata.message,
      mode: newMode,
      name: name !== undefined ? (name === "" ? null : name) : currentMetadata.name,
      avatar: avatar !== undefined ? (avatar === "" ? null : avatar) : currentMetadata.avatar,
      webhookUrl:
        webhookUrl !== undefined
          ? webhookUrl === ""
            ? null
            : webhookUrl
          : currentMetadata.webhookUrl,
      updatedAt: now,
    };

    await db
      .prepare("UPDATE services SET metadata = ? WHERE id = ?")
      .bind(JSON.stringify(newMetadata), `yokoso:${yokosoId}`)
      .run();

    // WebHook
    if (newMetadata.webhookUrl && message !== undefined) {
      sendWebHook(
        newMetadata.webhookUrl,
        "yokoso.update",
        WebHookMessages.yokoso?.update?.(newMetadata.message) ||
          `Yokoso updated: ${newMetadata.message}`,
        { id: yokosoId, message: newMetadata.message }
      );
    }

    return c.json({
      success: true,
      data: {
        id: yokosoId,
        url,
        message: newMetadata.message,
        mode: newMetadata.mode,
      },
    });
  }

  // DELETE
  if (action === "delete") {
    const url = c.req.query("url");
    const token = c.req.query("token");

    if (!url || !token) {
      return c.json({ error: "url and token are required" }, 400);
    }

    const yokoso = await getYokosoByUrl(db, url);
    if (!yokoso) {
      return c.json({ error: "Yokoso not found" }, 404);
    }

    const yokosoId = (yokoso as YokosoRecord).id.replace("yokoso:", "");
    const hashedToken = await hashToken(token);
    const owner = await db
      .prepare("SELECT 1 FROM owner_tokens WHERE service_id = ? AND token_hash = ?")
      .bind(`yokoso:${yokosoId}`, hashedToken)
      .first();

    if (!owner) {
      return c.json({ error: "Invalid token" }, 403);
    }

    await db.batch([
      db.prepare("DELETE FROM services WHERE id = ?").bind(`yokoso:${yokosoId}`),
      db.prepare("DELETE FROM url_mappings WHERE type = ? AND url = ?").bind("yokoso", url),
      db.prepare("DELETE FROM owner_tokens WHERE service_id = ?").bind(`yokoso:${yokosoId}`),
    ]);

    return c.json({ success: true, message: "Yokoso deleted" });
  }

  return c.json({ error: "Invalid action. Use: create, get, update, delete" }, 400);
});

export default app;
