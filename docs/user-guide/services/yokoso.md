# Yokoso Service API

## Overview

Dynamic welcome message service featuring a Maneki-neko (Lucky Cat) avatar. "Yokoso" (ようこそ) means "Welcome" in Japanese. The lucky cat greets your visitors with customizable messages. Update messages via API without editing HTML/markdown.

**Display Options:**

- **SVG Image** (`format=image`): Badge mode (20 chars) or Card mode (140 chars) with "Yokoso" label
- **Web Component**: Card layout only (avatar + name + date + message, no label)

## Default Avatar

When no avatar is specified, a pixel-art Maneki-neko (招き猫 / Lucky Cat) appears:

- Badge mode: 36x36 cat icon next to the message
- Card mode: 36x36 cat avatar with default name "Lucky Cat"

The default avatar image is served from `https://nostalgic.llll-ll.com/lucky-cat.webp` and rendered with `image-rendering: pixelated` to preserve its pixel-art look. You can override with your own avatar URL if desired.

## Display Modes

### Badge Mode (Default)

Short message up to 20 characters, displayed as a 40px-tall Shields.io-style badge with a 36x36 Maneki-neko icon. The lucky cat is embedded as a base64 data URI inside the SVG so it renders correctly even when proxied by GitHub Camo.

```
┌──────────┬──────────────────────────────┐
│  Yokoso  │ 🐱 ようこそ！                │
└──────────┴──────────────────────────────┘
```

### Card Mode

Longer message up to 140 characters with avatar, name, and date.

```
┌──────────┬─────────────────────────────────┐
│          │ 🐱 Lucky Cat                     │
│  Yokoso  │ v2.0開発中です！新機能として    │
│          │ Yokoso機能を追加予定。          │
│          │                   2025/01/14    │
└──────────┴─────────────────────────────────┘
```

## Actions

All actions accept GET with query parameters — you can run any of them straight from the browser address bar, like the old web. POST with a JSON body is also supported (body values take precedence over query parameters). The only exception is `batchLookup`, which requires POST because it takes an array payload.

### create

Create a new yokoso.

```
GET /api/yokoso?action=create&url={URL}&token={TOKEN}&message={MESSAGE}&mode=badge
```

**Parameters:**

- `url` (required): Target URL for yokoso
- `token` (required): Owner token (8-16 characters)
- `message` (required): Welcome message (badge: max 20 chars, card: max 140 chars). Length is counted by Unicode code points, so emoji and surrogate pairs count as 1. In card mode, `\n` is treated as a forced line break (max 10 lines).
- `mode` (optional): Display mode (`badge` default, `card`)
- `name` (optional): Display name for card mode (default: "Lucky Cat")
- `avatar` (optional): Avatar image URL for card mode (default: Maneki-neko icon). Must be an `http(s)://` URL or a `data:image/{webp,png,jpeg,gif,svg+xml}` URI; other schemes (e.g. `javascript:`) are rejected.
- `webhookUrl` (optional): Webhook URL for event notifications

**Response:**

```json
{
  "success": true,
  "id": "yoursite-a7b9c3d4",
  "url": "https://yoursite.com"
}
```

### get

Get current yokoso data.

#### Public Mode (by ID)

```
GET /api/yokoso?action=get&id={ID}&format={FORMAT}
```

**Parameters:**

- `id` (required): Public yokoso ID
- `format` (optional): Response format (`json` default, `image`, `text`)

**Response:**

- `format=json` (default): JSON with yokoso data
- `format=image`: SVG image (badge or card style based on mode)
- `format=text`: Plain text message

```json
{
  "success": true,
  "data": {
    "id": "yoursite-a7b9c3d4",
    "message": "ようこそ！",
    "mode": "badge",
    "name": null,
    "avatar": null,
    "updatedAt": "2025-01-14T12:00:00Z"
  }
}
```

**GitHub README Example:**

```markdown
![Yokoso](https://api.nostalgic.llll-ll.com/yokoso?action=get&id=YOUR_ID&format=image)
```

#### Owner Mode (by URL + Token)

Get message data and full settings including webhookUrl. Use `lookup` if you only need to know whether a yokoso exists for a URL and what its public ID is.

```
GET /api/yokoso?action=get&url={URL}&token={TOKEN}
```

**Parameters:**

- `url` (required): Target URL
- `token` (required): Owner token

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "yoursite-a7b9c3d4",
    "url": "https://yoursite.com",
    "message": "ようこそ！",
    "mode": "badge",
    "name": "Lucky Cat",
    "avatar": null,
    "updatedAt": "2025-01-14T12:00:00Z",
    "settings": {
      "webhookUrl": "https://hooks.example.com/notify"
    }
  }
}
```

### lookup

Look up the public yokoso ID for a URL without loading message data or settings. This is intended for static site build scripts and integrations that only need to know whether the service exists.

```
GET /api/yokoso?action=lookup&url={URL}&token={TOKEN}
```

**Response (found and authorized):**

```json
{
  "success": true,
  "data": {
    "url": "https://myproject.com",
    "exists": true,
    "authorized": true,
    "id": "myproject-a7b9c3d4",
    "title": "Yokoso"
  }
}
```

**Response (not found):**

```json
{
  "success": true,
  "data": {
    "url": "https://missing.example",
    "exists": false
  }
}
```

**Response (found but token does not match):**

```json
{
  "success": true,
  "data": {
    "url": "https://myproject.com",
    "exists": true,
    "authorized": false
  }
}
```

Invalid tokens are reported per item instead of returning request-level `403`, so batch clients can keep ordered results for every requested URL.

### batchLookup

Look up multiple yokoso URLs in request order. Missing URLs are included as `{ "exists": false }`; found URLs with a wrong token are included as `{ "exists": true, "authorized": false }`. A single request accepts up to 1000 URLs and internally chunks D1 queries to stay under SQLite bind limits.

```
POST /api/yokoso?action=batchLookup
Body: { "urls": ["https://a.example", "https://b.example"], "token": "your-token" }
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "url": "https://a.example",
      "exists": true,
      "authorized": true,
      "id": "a-a7b9c3d4",
      "title": "Yokoso"
    },
    {
      "url": "https://b.example",
      "exists": false
    }
  ]
}
```

### update

Update yokoso message and settings (owner only).

```
GET /api/yokoso?action=update&url={URL}&token={TOKEN}&message={MESSAGE}&mode=badge
```

**Parameters:**

- `url` (required): Target URL
- `token` (required): Owner token
- `message` (optional): New message
- `mode` (optional): Display mode (`badge`, `card`)
- `name` (optional): Display name (empty string to remove)
- `avatar` (optional): Avatar URL (empty string to remove)
- `webhookUrl` (optional): Webhook URL (empty string to remove)

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "yoursite-a7b9c3d4",
    "url": "https://yoursite.com",
    "message": "新メッセージ",
    "mode": "badge"
  }
}
```

### delete

Delete a yokoso (owner only).

```
GET /api/yokoso?action=delete&url={URL}&token={TOKEN}
```

**Parameters:**

- `url` (required): Target URL
- `token` (required): Owner token

**Response:**

```json
{
  "success": true,
  "message": "Yokoso deleted"
}
```

## Web Component Integration

Web Component displays card layout only (no "Yokoso" label). For badge/card SVG images with label, use `format=image`.

```html
<script src="https://nostalgic.llll-ll.com/components/yokoso.js"></script>

<!-- Card layout (avatar + name + date + message) -->
<nostalgic-yokoso id="yoursite-a7b9c3d4" theme="dark"></nostalgic-yokoso>

<!-- For SVG badge/card image with "Yokoso" label, use img tag -->
<img src="https://api.nostalgic.llll-ll.com/yokoso?action=get&id=yoursite-a7b9c3d4&format=image" />
```

**Attributes:**

- `id`: Yokoso public ID
- `theme`: Visual style (light, dark, retro, kawaii, mom, final)
- `lang`: UI language (ja, en) - default: auto-detect from browser
- `api-base`: Custom API base URL (optional)

## TypeScript Support

For TypeScript projects using Web Components, add to your `types.d.ts`:

```typescript
// types.d.ts
import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "nostalgic-yokoso": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        id?: string;
        theme?: "light" | "dark" | "retro" | "kawaii" | "mom" | "final";
        lang?: "ja" | "en";
      };
    }
  }
}
```

## Usage Examples

### Basic Yokoso Setup

```javascript
// 1. Create yokoso (badge mode) — plain GET, old-web style
const params = new URLSearchParams({
  url: "https://myproject.com",
  token: "my-secret",
  message: "ようこそ！",
});
const response = await fetch(`/api/yokoso?action=create&${params}`);
const data = await response.json();
console.log("Yokoso ID:", data.id);

// 2. Embed in HTML
document.body.innerHTML += `
  <script src="/components/yokoso.js"></script>
  <nostalgic-yokoso id="${data.id}"></nostalgic-yokoso>
`;
```

### Card Mode with Custom Avatar

```javascript
// Create card mode yokoso with your own avatar
const params = new URLSearchParams({
  url: "https://myproject.com",
  token: "my-secret",
  message: "v2.0開発中です！新機能としてYokoso機能を追加予定。お楽しみに！",
  mode: "card",
  name: "kako-jun",
  avatar: "https://github.com/kako-jun.png",
});
const response = await fetch(`/api/yokoso?action=create&${params}`);
```

### Update Yokoso Message

```javascript
// Update message without editing README
const params = new URLSearchParams({
  url: "https://myproject.com",
  token: "my-secret",
  message: "v2.0リリースしました！",
});
await fetch(`/api/yokoso?action=update&${params}`);
// The badge/card in README automatically shows new message
```

### GitHub README Integration

```markdown
<!-- Badge mode with Maneki-neko -->

![Yokoso](https://api.nostalgic.llll-ll.com/yokoso?action=get&id=YOUR_ID&format=image)

<!-- Card mode -->

![Yokoso](https://api.nostalgic.llll-ll.com/yokoso?action=get&id=YOUR_ID&format=image)
```

Unlike static badges, you can update the message anytime via API without editing the README file.

## Features

- **Maneki-neko Default**: Cute lucky cat greets your visitors
- **Dynamic Updates**: Change message via API, no HTML/markdown editing needed
- **Two Display Modes**: Badge (20 chars) for quick status, Card (140 chars) for detailed updates
- **Custom Avatar**: Use your own avatar or keep the lucky cat
- **GitHub Ready**: Works in README as SVG image
- **Multiple Themes**: Match your site's design

## Use Cases

- Welcome messages for visitors ("ようこそ！", "Welcome!")
- Project status updates ("開発中", "メンテナンス中", "v2.0公開！")
- Developer announcements
- Lucky charm / mascot for your project
- Changelog highlights
- Event notifications

## Why "Yokoso"?

- **ようこそ (Yokoso)** is a well-known Japanese word meaning "Welcome"
- **招き猫 (Maneki-neko)** is the famous "Lucky Cat" or "Beckoning Cat"
- Together they create a charming welcome experience for your visitors
- The lucky cat is a symbol of good fortune in Japanese culture

## Security Notes

- Owner token required for creating and updating yokoso
- Public ID safe for embedding (read-only access)
- No user tracking - purely display-only service
