/**
 * Yokoso API Routes
 * 招き猫が喋るウェルカムメッセージ
 *
 * 全アクション GET / POST 両対応。GET は query パラメータ、POST は JSON body
 * （query フォールバックあり、body 優先）。batch 系のみ配列を body で受けるため POST 専用。
 *
 * GET/POST /?action=get     - Read (public: id / owner: url + token)
 * GET/POST /?action=lookup  - Owner URL lookup (url, token) - lightweight id check
 * GET/POST /?action=create  - Create a new yokoso (url, token, message, ...)
 * GET/POST /?action=update  - Update message/settings (url, token, ...)
 * GET/POST /?action=delete  - Delete yokoso (url, token)
 * POST     /?action=batchLookup - Owner URL lookup (body: urls, token) - ordered lightweight id checks
 */

import { Hono } from "hono";
import type { Context } from "hono";
import { hashToken, verifyToken, validateOwnerToken } from "../lib/core/auth.ts";
import { generatePublicId } from "../lib/core/id.ts";
import { sendWebHook, WebHookMessages } from "../lib/core/webhook.ts";
import { LUCKY_CAT_DATA_URL } from "../assets/lucky-cat.ts";
import { batchLookupServices, lookupService, MAX_LOOKUP_BATCH_SIZE } from "../lib/core/lookup.ts";

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

// コードポイント単位で文字数を数える（絵文字のサロゲートペアを 1 文字扱い）。
function codePointLength(text: string): number {
  let count = 0;
  for (const _ of text) count++;
  return count;
}

function truncateText(text: string, maxLength: number): string {
  const chars = [...text];
  if (chars.length <= maxLength) return text;
  return chars.slice(0, maxLength - 1).join("") + "...";
}

// avatar URL は SVG <image href="..."> に入る。javascript: 等の危険スキームを弾く。
// 許可: https://, http://, data:image/{webp,png,jpeg,gif,svg+xml}
function isSafeAvatarUrl(url: string): boolean {
  if (/^https?:\/\//i.test(url)) return true;
  if (/^data:image\/(webp|png|jpeg|jpg|gif|svg\+xml);/i.test(url)) return true;
  return false;
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

// === Lucky Cat Icon ===
// 22x22px の webp を base64 で inline する。GitHub Camo 経由でも消えないようにするため
// 外部URL参照ではなく data URI で埋め込む。元 36x36 だったが透明 padding を削った。
const LUCKY_CAT_SIZE = 22;
// card モードのユーザーアバタースロット (招き猫以外のアバター URL を渡された時の枠サイズ)。
// 招き猫を表示する場合は LUCKY_CAT_SIZE でこのスロット内にセンタリング描画する。
const AVATAR_SLOT_SIZE = 32;

function getManekiNekoIcon(x: number, y: number, size: number = LUCKY_CAT_SIZE): string {
  return `<image href="${LUCKY_CAT_DATA_URL}" x="${x}" y="${y}" width="${size}" height="${size}" image-rendering="pixelated"/>`;
}

// === Helper Functions ===

// 全角半角を考慮した幅計算（全角=2, 半角=1）
function getDisplayWidth(text: string): number {
  let width = 0;
  for (const char of text) {
    const code = char.charCodeAt(0);
    width += code > 0x7f ? 2 : 1;
  }
  return width;
}

// 表示幅で行分割（maxWidth は半角基準）
function splitByWidth(text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let currentLine = "";
  let currentWidth = 0;

  for (const char of text) {
    // 明示的な改行は強制改行として扱う（SVG <text> は \n を無視するため）
    if (char === "\n") {
      lines.push(currentLine);
      currentLine = "";
      currentWidth = 0;
      continue;
    }

    const code = char.charCodeAt(0);
    const charWidth = code > 0x7f ? 2 : 1;

    if (currentWidth + charWidth > maxWidth) {
      lines.push(currentLine);
      currentLine = char;
      currentWidth = charWidth;
    } else {
      currentLine += char;
      currentWidth += charWidth;
    }
  }

  lines.push(currentLine);

  return lines;
}

// === SVG Generators ===

function generateBadgeSVG(message: string): string {
  const label = "Yokoso";
  const labelWidth = 50;
  // 22x22 招き猫 (内訳: 透明 left=1px + 中身 19px + 透明 right=2px)
  const iconSize = LUCKY_CAT_SIZE;
  const catTransparentLeft = 1;
  const catTransparentRight = 2;
  // 可視 cat の左右に確保する余白 (赤枠 / Yokoso ラベルの縁から、テキスト開始まで)
  const catSideGap = 12;
  // 招き猫 y: バッジ高さ 27 - 招き猫 22 = 余白 5px。上 3px / 下 2px に振り分け。
  const iconX = labelWidth + catSideGap - catTransparentLeft;
  const iconY = 3;
  const catVisibleRight = iconX + iconSize - catTransparentRight;
  const displayWidth = getDisplayWidth(message);
  const textRightPadding = 7;
  const textPixelWidth = Math.max(displayWidth * 6, 30);
  const textStartX = catVisibleRight + catSideGap;
  const totalWidth = textStartX + textPixelWidth + textRightPadding;
  const messageWidth = totalWidth - labelWidth;
  // バッジ高さ: 27 (招き猫は 22 なので余白あり、viewport 内完結)
  // height=28 では Yokoso 文字 (descender 無し) の視覚的中心が badge 中心より 1px 上に見えたため、
  // baseline は据え置きで下を 1px だけ削って視覚的中心を一致させた
  const height = 27;
  const textBaselineY = 17;
  const shadowBaselineY = 18;
  const labelBg = "#555";
  const valueBg = "#d32f2f";
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
  <g text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="${labelWidth / 2}" y="${shadowBaselineY}" fill="#010101" fill-opacity=".3">${label}</text>
    <text x="${labelWidth / 2}" y="${textBaselineY}" fill="${textColor}">${label}</text>
  </g>
  ${getManekiNekoIcon(iconX, iconY, iconSize)}
  <text x="${textStartX}" y="${shadowBaselineY}" fill="#010101" fill-opacity=".3" text-anchor="start" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">${escapeXml(message)}</text>
  <text x="${textStartX}" y="${textBaselineY}" fill="${textColor}" text-anchor="start" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">${escapeXml(message)}</text>
</svg>`;
}

function generateCardSVG(
  message: string,
  name: string | null,
  avatar: string | null,
  updatedAt: string,
  lang: string = "ja"
): string {
  const labelWidth = 50;
  const contentWidth = 350;
  const totalWidth = labelWidth + contentWidth;
  const lineHeight = 16;
  const padding = 12;
  // card のアバタースロットは AVATAR_SLOT_SIZE (32) で固定。ユーザー avatar はこのサイズで描画する。
  // 既定の招き猫 (LUCKY_CAT_SIZE=22) はこのスロット内にセンタリングして native pixel のまま描画する。
  const avatarSlotSize = AVATAR_SLOT_SIZE;

  const maxLineWidth = 50;
  // 改行を強制改行として扱うため、ユーザーが \n を大量に入れると縦が伸びる。
  // MAX_MESSAGE_CARD (140) と幅 50 から最大 8 行強で十分なので 10 行で頭打ち。
  const MAX_LINES = 10;
  const allLines = splitByWidth(message, maxLineWidth);
  const lines = allLines.slice(0, MAX_LINES);

  const headerHeight = avatarSlotSize + 8;
  const messageHeight = lines.length * lineHeight;
  const contentHeight = padding + headerHeight + messageHeight + padding;
  const totalHeight = Math.max(contentHeight, 50);

  const labelBg = "#555";
  const contentBg = "#fff";
  const textColor = "#333";
  const dateColor = "#999";

  const date = new Date(updatedAt);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const dateStr = lang === "en" ? `${month}-${day}-${year}` : `${year}-${month}-${day}`;

  const isDefaultCat = !avatar;
  const displayName = name || "Lucky Cat";

  const avatarX = labelWidth + padding;
  const avatarY = padding;
  // 既定の招き猫は LUCKY_CAT_SIZE で slot にセンタリング (clip-path 不要、pixel art を丸く切らない)。
  // ユーザー avatar は AVATAR_SLOT_SIZE で slot を埋めて circle clip-path で丸抜きする。
  const avatarSection = isDefaultCat
    ? (() => {
        const catX = avatarX + (avatarSlotSize - LUCKY_CAT_SIZE) / 2;
        const catY = avatarY + (avatarSlotSize - LUCKY_CAT_SIZE) / 2;
        return `<image href="${LUCKY_CAT_DATA_URL}" x="${catX}" y="${catY}" width="${LUCKY_CAT_SIZE}" height="${LUCKY_CAT_SIZE}" image-rendering="pixelated"/>`;
      })()
    : `<image href="${escapeXml(avatar)}" x="${avatarX}" y="${avatarY}" width="${avatarSlotSize}" height="${avatarSlotSize}" clip-path="url(#avatarClip)" image-rendering="pixelated"/>`;

  const nameX = avatarX + avatarSlotSize + 8;
  const nameY = avatarY + 12;
  const nameSection = `<text x="${nameX}" y="${nameY}" fill="${textColor}" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="12" font-weight="bold">${escapeXml(displayName)}</text>`;

  const dateY = avatarY + avatarSlotSize - 2;
  const dateSection = `<text x="${nameX}" y="${dateY}" fill="${dateColor}" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="10">${dateStr}</text>`;

  const messageLines = lines
    .map(
      (line, i) =>
        `<text x="${labelWidth + padding}" y="${padding + headerHeight + (i + 1) * lineHeight - 4}" fill="${textColor}" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="12">${escapeXml(line)}</text>`
    )
    .join("\n    ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}">
  <defs>
    <clipPath id="avatarClip">
      <circle cx="${avatarX + avatarSlotSize / 2}" cy="${avatarY + avatarSlotSize / 2}" r="${avatarSlotSize / 2}"/>
    </clipPath>
    <clipPath id="round">
      <rect width="${totalWidth}" height="${totalHeight}" rx="3"/>
    </clipPath>
  </defs>
  <g clip-path="url(#round)">
    <rect width="${labelWidth}" height="${totalHeight}" fill="${labelBg}"/>
    <rect x="${labelWidth}" width="${contentWidth}" height="${totalHeight}" fill="${contentBg}" stroke="#ddd" stroke-width="1"/>
  </g>
  <g text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="${labelWidth / 2}" y="${totalHeight / 2 + 1}" fill="#010101" fill-opacity=".3">Yokoso</text>
    <text x="${labelWidth / 2}" y="${totalHeight / 2}" fill="#fff">Yokoso</text>
  </g>
  ${avatarSection}
  ${nameSection}
  ${dateSection}
  ${messageLines}
</svg>`;
}

// === Routes ===
//
// 「URL を組み立てるだけで全操作できる」昔の Web の再現がプロダクト思想のため、
// 書き込み系アクションも GET（query パラメータ）で動く。POST では JSON body の
// パラメータが query より優先される（管理 Web UI が使用）。
// batch 系（batchLookup）だけは配列を JSON body で受ける設計のため POST 専用。

type AppContext = Context<{ Bindings: Bindings }>;

async function handleYokosoAction(c: AppContext) {
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

    // Owner mode (url + token) - returns settings including webhookUrl
    if (url && token) {
      const yokoso = await getYokosoByUrl(db, url);
      if (!yokoso) {
        return c.json({ error: "Yokoso not found" }, 404);
      }

      const yokosoId = (yokoso as YokosoRecord).id.replace("yokoso:", "");
      const isOwner = await verifyOwnerToken(db, `yokoso:${yokosoId}`, token);

      if (!isOwner) {
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

    const id = getParam("id");
    const format = getParam("format") || "json";

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
      const lang = getParam("lang") || "ja";
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

  // LOOKUP (owner URL lookup - lightweight id check, no message/settings payload)
  if (action === "lookup") {
    const url = getParam("url");
    const token = getParam("token");

    if (!url || !token) {
      return c.json({ error: "url and token are required for lookup" }, 400);
    }

    const data = await lookupService(db, "yokoso", url, token);
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

    const data = await batchLookupServices(db, "yokoso", urls, token);
    return c.json({ success: true, data });
  }

  // CREATE
  if (action === "create") {
    const url = getParam("url");
    const token = getParam("token");
    const message = getParam("message");
    const mode = getParam("mode") || "badge";
    const name = getParam("name");
    const avatar = getParam("avatar");
    const webhookUrl = getParam("webhookUrl");

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
    if (codePointLength(message) > maxLength) {
      return c.json(
        { error: `Message too long. Max ${maxLength} characters for ${mode} mode` },
        400
      );
    }

    if (name && codePointLength(name) > MAX_NAME_LENGTH) {
      return c.json({ error: `Name too long. Max ${MAX_NAME_LENGTH} characters` }, 400);
    }

    if (avatar && !isSafeAvatarUrl(avatar)) {
      return c.json(
        { error: "avatar must be an http(s) URL or a data:image/{webp,png,jpeg,gif,svg+xml} URI" },
        400
      );
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

  // UPDATE
  if (action === "update") {
    const url = getParam("url");
    const token = getParam("token");
    const message = getParam("message");
    const mode = getParam("mode");
    const name = getParam("name");
    const avatar = getParam("avatar");
    const webhookUrl = getParam("webhookUrl");

    if (!url || !token) {
      return c.json({ error: "url and token are required" }, 400);
    }

    const yokoso = await getYokosoByUrl(db, url);
    if (!yokoso) {
      return c.json({ error: "Yokoso not found" }, 404);
    }

    const yokosoId = (yokoso as YokosoRecord).id.replace("yokoso:", "");
    const isOwner = await verifyOwnerToken(db, `yokoso:${yokosoId}`, token);

    if (!isOwner) {
      return c.json({ error: "Invalid token" }, 403);
    }

    const currentMetadata = JSON.parse((yokoso as YokosoRecord).metadata || "{}");
    const newMode = mode || currentMetadata.mode || "badge";

    // Validate message length if provided
    if (message !== undefined) {
      const maxLength = newMode === "badge" ? MAX_MESSAGE_BADGE : MAX_MESSAGE_CARD;
      if (codePointLength(message) > maxLength) {
        return c.json(
          { error: `Message too long. Max ${maxLength} characters for ${newMode} mode` },
          400
        );
      }
    }

    if (name !== undefined && name !== null && codePointLength(name) > MAX_NAME_LENGTH) {
      return c.json({ error: `Name too long. Max ${MAX_NAME_LENGTH} characters` }, 400);
    }

    if (avatar !== undefined && avatar !== "" && avatar !== null && !isSafeAvatarUrl(avatar)) {
      return c.json(
        { error: "avatar must be an http(s) URL or a data:image/{webp,png,jpeg,gif,svg+xml} URI" },
        400
      );
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
    const url = getParam("url");
    const token = getParam("token");

    if (!url || !token) {
      return c.json({ error: "url and token are required" }, 400);
    }

    const yokoso = await getYokosoByUrl(db, url);
    if (!yokoso) {
      return c.json({ error: "Yokoso not found" }, 404);
    }

    const yokosoId = (yokoso as YokosoRecord).id.replace("yokoso:", "");
    const isOwner = await verifyOwnerToken(db, `yokoso:${yokosoId}`, token);

    if (!isOwner) {
      return c.json({ error: "Invalid token" }, 403);
    }

    await db.batch([
      db.prepare("DELETE FROM services WHERE id = ?").bind(`yokoso:${yokosoId}`),
      db.prepare("DELETE FROM url_mappings WHERE type = ? AND url = ?").bind("yokoso", url),
      db.prepare("DELETE FROM owner_tokens WHERE service_id = ?").bind(`yokoso:${yokosoId}`),
    ]);

    return c.json({ success: true, message: "Yokoso deleted" });
  }

  return c.json(
    {
      error:
        "Invalid action. Use: get, lookup, create, update, delete (GET or POST), batchLookup (POST only)",
    },
    400
  );
}

app.get("/", handleYokosoAction);
app.post("/", handleYokosoAction);

export default app;
