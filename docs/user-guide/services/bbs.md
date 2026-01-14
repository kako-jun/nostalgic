# BBS Service API

## Overview

Message board service with customizable dropdown selections and author-based message editing capabilities.

## Actions

### create

Create a new BBS message board.

```
GET /api/bbs?action=create&url={URL}&token={TOKEN}&title={TITLE}&maxMessages={MAX_MESSAGES}&messagesPerPage={MESSAGES_PER_PAGE}&webhookUrl={WEBHOOK_URL}&standardSelectLabel={LABEL}&standardSelectOptions={OPTIONS}&incrementalSelectLabel={LABEL}&incrementalSelectOptions={OPTIONS}&emoteSelectLabel={LABEL}&emoteSelectOptions={OPTIONS}
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
- `message` (required): Message content (max 200 characters)
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
GET /api/bbs?action=update&url={URL}&token={TOKEN}&messageId={MESSAGE_ID}&message={NEW_MESSAGE}
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
GET /api/bbs?action=update&url={URL}&token={TOKEN}&title={TITLE}&maxMessages={MAX_MESSAGES}&messagesPerPage={MESSAGES_PER_PAGE}&webhookUrl={WEBHOOK_URL}&standardSelectLabel={LABEL}&standardSelectOptions={OPTIONS}&incrementalSelectLabel={LABEL}&incrementalSelectOptions={OPTIONS}&emoteSelectLabel={LABEL}&emoteSelectOptions={OPTIONS}
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
GET /api/bbs?action=remove&url={URL}&token={TOKEN}&messageId={MESSAGE_ID}
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
GET /api/bbs?action=clear&url={URL}&token={TOKEN}
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
GET /api/bbs?action=get&id={ID}&limit={LIMIT}&format={FORMAT}
```

**Parameters:**

- `id` (required): Public BBS ID
- `limit` (optional): Number of messages to return (default: 100, max: 1000; for image format: default 3, max 10)
- `format` (optional): Response format (`json` default, `image`)

**Response:**

- `format=json` (default): JSON with messages data
- `format=image`: SVG image showing recent messages (Shields.io style, for GitHub README)

**GitHub README Example:**

```markdown
[![BBS](https://api.nostalgic.llll-ll.com/bbs?action=get&id=YOUR_ID&format=image&limit=3)](https://nostalgic.llll-ll.com/bbs?id=YOUR_ID)
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

Get full settings including webhookUrl.

```
GET /api/bbs?action=get&url={URL}&token={TOKEN}&limit={LIMIT}
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

### delete

Delete a BBS (owner only).

```
GET /api/bbs?action=delete&url={URL}&token={TOKEN}
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
const response = await fetch(
  `/api/bbs?action=create&url=https://mysite.com&token=my-secret&title=My BBS&maxMessages=500`
);

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
await fetch("/api/bbs?action=clear&url=https://mysite.com&token=my-secret");
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

<!-- Text format BBS -->
<nostalgic-bbs id="yoursite-a7b9c3d4" format="text" theme="dark"></nostalgic-bbs>
```

**Attributes:**

- `id`: BBS public ID
- `theme`: Visual style (light, dark, retro, kawaii, mom, final)
- `format`: Display format (interactive, text) - default: interactive
- `lang`: UI language (ja, en) - default: auto-detect from browser (non-Japanese browsers use English)
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
- Message content length limited to 200 characters
