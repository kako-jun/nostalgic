# Yokoso Service API

## Overview

Dynamic welcome message service featuring a Maneki-neko (Lucky Cat) avatar. "Yokoso" (ようこそ) means "Welcome" in Japanese. The lucky cat greets your visitors with customizable messages. Update messages via API without editing HTML/markdown.

**Display Options:**

- **SVG Image** (`format=image`): Badge mode (20 chars) or Card mode (140 chars) with "Yokoso" label
- **Web Component**: Card layout only (avatar + name + date + message, no label)

## Default Avatar

When no avatar is specified, a cute Maneki-neko (招き猫 / Lucky Cat) icon appears:

- Badge mode: Small cat icon next to the message
- Card mode: Cat avatar with default name "Lucky Cat"

You can override with your own avatar URL if desired.

## Display Modes

### Badge Mode (Default)

Short message up to 20 characters, displayed as Shields.io-style badge with Maneki-neko icon.

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

### create

Create a new yokoso.

```
GET /api/yokoso?action=create&url={URL}&token={TOKEN}&message={MESSAGE}&mode={MODE}&name={NAME}&avatar={AVATAR_URL}&webhookUrl={WEBHOOK_URL}
```

**Parameters:**

- `url` (required): Target URL for yokoso
- `token` (required): Owner token (8-16 characters)
- `message` (required): Welcome message (badge: max 20 chars, card: max 140 chars)
- `mode` (optional): Display mode (`badge` default, `card`)
- `name` (optional): Display name for card mode (default: "Lucky Cat")
- `avatar` (optional): Avatar image URL for card mode (default: Maneki-neko icon)
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

Get full settings including webhookUrl.

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

### update

Update yokoso message and settings (owner only).

```
GET /api/yokoso?action=update&url={URL}&token={TOKEN}&message={MESSAGE}&mode={MODE}&name={NAME}&avatar={AVATAR_URL}&webhookUrl={WEBHOOK_URL}
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
// 1. Create yokoso (badge mode)
const response = await fetch(
  "/api/yokoso?action=create&url=https://myproject.com&token=my-secret&message=ようこそ！"
);
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
const response = await fetch(
  "/api/yokoso?action=create" +
    "&url=https://myproject.com" +
    "&token=my-secret" +
    "&message=v2.0開発中です！新機能としてYokoso機能を追加予定。お楽しみに！" +
    "&mode=card" +
    "&name=kako-jun" +
    "&avatar=https://github.com/kako-jun.png"
);
```

### Update Yokoso Message

```javascript
// Update message without editing README
await fetch(
  "/api/yokoso?action=update" +
    "&url=https://myproject.com" +
    "&token=my-secret" +
    "&message=v2.0リリースしました！"
);
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
