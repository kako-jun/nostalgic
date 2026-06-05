# BBS Service API

## Overview

Message board service with customizable dropdown selections and author-based message editing capabilities.

## Actions

### create

Create a new BBS message board.

```
POST /api/bbs?action=create
Body: { "url": "{URL}", "token": "{TOKEN}", "title": "{TITLE}", "maxMessages": 100, "messagesPerPage": 20 }
```

**Parameters:**

- `url` (required): Target URL for BBS
- `token` (required): Owner token (8-16 characters)
- `title` (optional): BBS title (default: "BBS")
- `maxMessages` (optional): Maximum messages (default: 100)
- `messagesPerPage` (optional): Messages per page for pagination (default: 20)
- `webhookUrl` (optional): Webhook URL for event notifications
- `standardSelectLabel` (optional): Label for standard select dropdown
- `standardSelectOptions` (optional): Comma-separated options for standard select
- `incrementalSelectLabel` (optional): Label for incremental select dropdown
- `incrementalSelectOptions` (optional): Comma-separated options for incremental select
- `emoteSelectLabel` (optional): Label for emote picker
- `emoteSelectOptions` (optional): Comma-separated image URLs for emote picker (max 9, displayed as 3x3 grid)

**Response:**

```json
{
  "success": true,
  "id": "yoursite-a7b9c3d4",
  "url": "https://yoursite.com",
  "title": "BBS",
  "maxMessages": 100,
  "messagesPerPage": 20
}
```

### post

Post a new message to the BBS.

```
GET /api/bbs?action=post&id={ID}&author={AUTHOR}&message={MESSAGE}&standardValue={VALUE}&incrementalValue={VALUE}&emoteValue={VALUE}
```

**Parameters:**

- `id` (required): Public BBS ID
- `author` (optional): Author name (default: "Anonymous", max 20 characters)
- `message` (required): Message content (max 420 characters)
- `standardValue` (optional): Value from standard select dropdown
- `incrementalValue` (optional): Value from incremental select dropdown
- `emoteValue` (optional): Image URL from emote picker

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "yoursite-a7b9c3d4",
    "messages": [
      {
        "id": "abc123def456",
        "author": "User",
        "message": "Hello world!",
        "standardValue": "Japan",
        "incrementalValue": "General",
        "emoteValue": "https://example.com/emote.png",
        "userHash": "a1b2c3d4",
        "timestamp": "2025-08-13T10:00:00Z"
      }
    ]
  }
}
```

### update

Update a message or BBS settings.

#### Message Update - User mode (author)

```
GET /api/bbs?action=update&id={ID}&messageId={MESSAGE_ID}&message={NEW_MESSAGE}
```

#### Message Update - Owner mode (admin)

```
POST /api/bbs?action=update
Body: { "url": "{URL}", "token": "{TOKEN}", "messageId": "{MESSAGE_ID}", "message": "{NEW_MESSAGE}" }
```

**Parameters:**

- `id` (user mode): Public BBS ID
- `url` + `token` (owner mode): Target URL and owner token
- `messageId` (required): Message ID to update
- `message` (required): New message content

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "yoursite-a7b9c3d4",
    "messages": [...],
    "updated": "abc123def456"
  }
}
```

#### Settings Update (owner only)

Update BBS settings without messageId parameter.

```
POST /api/bbs?action=update
Body: { "url": "{URL}", "token": "{TOKEN}", "title": "{TITLE}", "maxMessages": 200, "messagesPerPage": 20 }
```

**Parameters:**

- `url` (required): Target URL
- `token` (required): Owner token
- `title` (optional): BBS title
- `maxMessages` (optional): Maximum total messages
- `messagesPerPage` (optional): Messages per page for pagination
- `webhookUrl` (optional): Webhook URL (empty string to remove)
- `standardSelectLabel` (optional): Label for standard select dropdown
- `standardSelectOptions` (optional): Comma-separated options for standard select
- `incrementalSelectLabel` (optional): Label for incremental select dropdown
- `incrementalSelectOptions` (optional): Comma-separated options for incremental select
- `emoteSelectLabel` (optional): Label for emote picker
- `emoteSelectOptions` (optional): Comma-separated image URLs for emote picker (max 9, displayed as 3x3 grid)

At least one setting parameter is required.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "yoursite-a7b9c3d4",
    "messages": [...],
    "maxMessages": 200
  }
}
```

### remove

Remove a message.

**User mode (author):**

```
GET /api/bbs?action=remove&id={ID}&messageId={MESSAGE_ID}
```

**Owner mode (admin):**

```
POST /api/bbs?action=remove
Body: { "url": "{URL}", "token": "{TOKEN}", "messageId": "{MESSAGE_ID}" }
```

**Parameters:**

- `id` (user mode): Public BBS ID
- `url` + `token` (owner mode): Target URL and owner token
- `messageId` (required): Message ID to remove

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "yoursite-a7b9c3d4",
    "messages": [...],
    "removed": "abc123def456"
  }
}
```

### clear

Clear all messages (owner only).

```
POST /api/bbs?action=clear
Body: { "url": "{URL}", "token": "{TOKEN}" }
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
    "messages": [],
    "cleared": true
  }
}
```

### get

Get BBS messages.

#### Public Mode (by ID)

```
GET /api/bbs?action=get&id={ID}&limit={LIMIT}&format={FORMAT}&width={WIDTH}
```

**Parameters:**

- `id` (required): Public BBS ID
- `limit` (optional): Number of messages to return (default: 100, max: 1000; for image format: default 3, max 10)
- `format` (optional): Response format (`json` default, `image`)
- `width` (optional): SVG width for `format=image` (default: 400, min: 240, max: 1200)

**Response:**

- `format=json` (default): JSON with messages data
- `format=image`: SVG image showing recent messages (Shields.io style, for GitHub README)

**GitHub README Example:**

```markdown
[![BBS](https://api.nostalgic.llll-ll.com/bbs?action=get&id=YOUR_ID&format=image&limit=3&width=760)](https://nostalgic.llll-ll.com/bbs?id=YOUR_ID)
```

Note: In GitHub README, the image links to a page where users can post messages.

**JSON Response:**

```json
{
  "success": true,
  "data": {
    "id": "yoursite-a7b9c3d4",
    "title": "BBS",
    "maxMessages": 100,
    "messagesPerPage": 20,
    "totalMessages": 1,
    "messages": [
      {
        "id": "abc123def456",
        "author": "User",
        "message": "Hello world!",
        "standardValue": "Japan",
        "incrementalValue": "General",
        "emoteValue": "https://example.com/emote.png",
        "userHash": "a1b2c3d4",
        "timestamp": "2025-08-13T10:00:00Z"
      }
    ],
    "currentUserHash": "b2c3d4e5",
    "settings": {
      "standardSelect": { "label": "カテゴリ", "options": ["質問", "雑談", "報告"] },
      "incrementalSelect": null,
      "emoteSelect": {
        "label": "アバター",
        "options": ["https://example.com/emote1.png", "https://example.com/emote2.png"]
      }
    }
  }
}
```

#### Owner Mode (by URL + Token)

Get messages and full settings including webhookUrl. Use `lookup` if you only need to know whether a BBS exists for a URL and what its public ID is.

```
POST /api/bbs?action=get
Body: { "url": "https://yoursite.com", "token": "your-token", "limit": 100 }
```

**Parameters:**

- `url` (required): Target URL
- `token` (required): Owner token
- `limit` (optional): Number of messages to return (default: 100, max: 1000)

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "yoursite-a7b9c3d4",
    "url": "https://yoursite.com",
    "title": "BBS",
    "maxMessages": 100,
    "messagesPerPage": 20,
    "totalMessages": 1,
    "messages": [...],
    "currentUserHash": "b2c3d4e5",
    "settings": {
      "webhookUrl": "https://hooks.example.com/notify",
      "standardSelect": { "label": "カテゴリ", "options": ["質問", "雑談", "報告"] },
      "incrementalSelect": null,
      "emoteSelect": { "label": "アバター", "options": ["https://example.com/emote1.png", "https://example.com/emote2.png"] }
    }
  }
}
```

### lookup

Look up the public BBS ID for a URL without loading messages or settings. This is intended for static site build scripts and integrations that only need to know whether the service exists.

`token` must be sent in the POST body, never in the query string.

```
POST /api/bbs?action=lookup
Body: { "url": "https://yoursite.com", "token": "your-token" }
```

**Response (found and authorized):**

```json
{
  "success": true,
  "data": {
    "url": "https://yoursite.com",
    "exists": true,
    "authorized": true,
    "id": "yoursite-a7b9c3d4",
    "title": "BBS"
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
    "url": "https://yoursite.com",
    "exists": true,
    "authorized": false
  }
}
```

Invalid tokens are reported per item instead of returning request-level `403`, so batch clients can keep ordered results for every requested URL.

### batchLookup

Look up multiple BBS URLs in request order. Missing URLs are included as `{ "exists": false }`; found URLs with a wrong token are included as `{ "exists": true, "authorized": false }`. A single request accepts up to 1000 URLs and internally chunks D1 queries to stay under SQLite bind limits.

```
POST /api/bbs?action=batchLookup
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
      "title": "BBS"
    },
    {
      "url": "https://b.example",
      "exists": false
    }
  ]
}
```

### delete

Delete a BBS (owner only).

```
POST /api/bbs?action=delete
Body: { "url": "{URL}", "token": "{TOKEN}" }
```

**Parameters:**

- `url` (required): Target URL
- `token` (required): Owner token

**Response:**

```json
{
  "success": true,
  "message": "BBS deleted"
}
```

## Usage Examples

### Basic BBS Setup

```javascript
// 1. Create BBS
const response = await fetch("/api/bbs?action=create", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    url: "https://mysite.com",
    token: "my-secret",
    title: "My BBS",
    maxMessages: 500,
  }),
});

const data = await response.json();
console.log("BBS ID:", data.id);

// 2. Post message with selections
await fetch(
  "/api/bbs?action=post&id=" +
    data.id +
    "&author=Alice&message=Hello everyone!&standardValue=Japan&incrementalValue=General&emoteValue=https://example.com/emote.png"
);
```

### Message Management

```javascript
// Update own message (requires same IP+UserAgent)
await fetch(
  "/api/bbs?action=update&id=mysite-a7b9c3d4&messageId=abc123def456&message=Updated message!"
);

// Remove own message (requires same IP+UserAgent)
await fetch("/api/bbs?action=remove&id=mysite-a7b9c3d4&messageId=abc123def456");

// Clear all messages (owner only)
await fetch("/api/bbs?action=clear", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ url: "https://mysite.com", token: "my-secret" }),
});
```

## Features

- **Author Verification**: Users can edit/remove their own posts (via IP+UserAgent hash)
- **Owner Management**: BBS owners can manage any message
- **Optional Fields**: Selections (standardValue, incrementalValue dropdowns; emoteValue image picker) on posts
- **Message History**: Tracks post creation and update times
- **Privacy Protection**: IP addresses are hashed

## Data Structure

Messages are stored in D1 (SQLite) database:

- Newest messages first (ORDER BY created_at DESC)
- Automatic trimming when max messages exceeded
- Author verification via IP+UserAgent hash

## Web Component Integration

```html
<script src="https://nostalgic.llll-ll.com/components/bbs.js"></script>

<!-- Interactive BBS display -->
<nostalgic-bbs id="yoursite-a7b9c3d4" theme="light"></nostalgic-bbs>

<!-- Wider component that still shrinks to its parent width -->
<nostalgic-bbs id="yoursite-a7b9c3d4" theme="light" width="760"></nostalgic-bbs>

<!-- Text format BBS -->
<nostalgic-bbs id="yoursite-a7b9c3d4" format="text" theme="dark"></nostalgic-bbs>
```

**Attributes:**

- `id`: BBS public ID
- `theme`: Visual style (light, dark, retro, kawaii, mom, final)
- `format`: Display format (interactive, text) - default: interactive
- `lang`: UI language (ja, en) - default: auto-detect from browser (non-Japanese browsers use English)
- `width`: Component width as a CSS length (for example `760`, `760px`, `100%`). Defaults to `100%` and never exceeds the parent width.
- `api-base`: Custom API base URL (optional)

## TypeScript Support

For TypeScript projects using Web Components, create a `types.d.ts` file in your project root:

```typescript
// types.d.ts
import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "nostalgic-bbs": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        id?: string;
        theme?: "light" | "dark" | "retro" | "kawaii" | "mom" | "final";
        format?: "interactive" | "text";
        lang?: "ja" | "en";
        width?: string;
      };
    }
  }
}
```

This prevents TypeScript build errors when using Web Components in React/Next.js projects.

## Rate Limiting

- **Post interval**: 10 seconds between posts from the same user
- Returns HTTP 429 with remaining wait time when rate limited

## Security Notes

- Message authorship verified by IP+UserAgent hash
- Owner token required for BBS creation and management
- Authors can only edit their own messages
- IP addresses are hashed for privacy
- Message content length limited to 420 characters
