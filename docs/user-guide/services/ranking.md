# Ranking Service API

## Overview

Score leaderboard system with automatic sorting, score management, and configurable entry limits.

## Actions

All actions accept GET with query parameters — you can run any of them straight from the browser address bar, like the old web. POST with a JSON body is also supported (body values take precedence over query parameters). The only exception is `batchLookup`, which requires POST because it takes an array payload.

### create

Create a new ranking leaderboard.

```
GET /api/ranking?action=create&url={URL}&token={TOKEN}&title={TITLE}&maxEntries=100&sortOrder=desc
```

**Parameters:**

- `url` (required): Target URL for ranking
- `token` (required): Owner token (8-16 characters)
- `title` (optional): Ranking title (default: "RANKING")
- `maxEntries` (optional): Maximum entries (default: 100)
- `sortOrder` (optional): Sort order - "desc" for high scores first, "asc" for low times first (default: "desc")
- `webhookUrl` (optional): Webhook URL for event notifications

**Response:**

```json
{
  "success": true,
  "id": "yoursite-a7b9c3d4",
  "url": "https://yoursite.com",
  "sortOrder": "desc",
  "maxEntries": 100
}
```

### submit

Submit a new score to the ranking (public access).

```
GET /api/ranking?action=submit&id={ID}&name={PLAYER_NAME}&score={SCORE}
```

**Parameters:**

- `id` (required): Public ranking ID
- `name` (required): Player name (max 20 characters)
- `score` (required): Score value (integer)

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "yoursite-a7b9c3d4",
    "entries": [
      {
        "rank": 1,
        "name": "Player1",
        "score": 1000,
        "displayScore": "1000",
        "createdAt": "2025-08-13T10:00:00Z"
      }
    ]
  }
}
```

### update

Update ranking settings (owner only).

```
GET /api/ranking?action=update&url={URL}&token={TOKEN}&title={TITLE}&maxEntries=50&sortOrder=desc
```

**Parameters:**

- `url` (required): Target URL
- `token` (required): Owner token
- `title` (optional): Ranking title (default: "RANKING")
- `maxEntries` (optional): Maximum entries
- `sortOrder` (optional): Sort order ("desc" for high scores, "asc" for low times)
- `webhookUrl` (optional): Webhook URL (empty string to remove)

At least one of title, maxEntries, sortOrder, or webhookUrl is required.

**Note:** To update player scores, use the `submit` action which handles UPSERT (insert or update).

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "yoursite-a7b9c3d4",
    "entries": [...],
    "maxEntries": 50,
    "sortOrder": "desc"
  }
}
```

### remove

Remove a specific player's score.

```
GET /api/ranking?action=remove&url={URL}&token={TOKEN}&name={PLAYER_NAME}
```

**Parameters:**

- `url` (required): Target URL
- `token` (required): Owner token
- `name` (required): Player name to remove

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "yoursite-a7b9c3d4",
    "entries": [...],
    "removed": "Cheater"
  }
}
```

### clear

Clear all scores from the ranking.

```
GET /api/ranking?action=clear&url={URL}&token={TOKEN}
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
    "entries": [],
    "cleared": true
  }
}
```

### get

Get ranking data.

#### Public Mode (by ID)

```
GET /api/ranking?action=get&id={ID}&limit={LIMIT}
```

**Parameters:**

- `id` (required): Public ranking ID
- `limit` (optional): Number of entries to return (1-100, default: 10)

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "yoursite-a7b9c3d4",
    "entries": [
      {
        "rank": 1,
        "name": "Player1",
        "score": 1500,
        "displayScore": "1500",
        "createdAt": "2025-08-13T10:00:00Z"
      },
      {
        "rank": 2,
        "name": "Player2",
        "score": 1200,
        "displayScore": "1200",
        "createdAt": "2025-08-13T09:30:00Z"
      }
    ],
    "title": "HIGH SCORE",
    "sortOrder": "desc",
    "maxEntries": 100
  }
}
```

#### Owner Mode (by URL + Token)

Get leaderboard entries and full settings including webhookUrl. Use `lookup` if you only need to know whether a ranking exists for a URL and what its public ID is.

```
GET /api/ranking?action=get&url={URL}&token={TOKEN}&limit=10
```

**Parameters:**

- `url` (required): Target URL
- `token` (required): Owner token
- `limit` (optional): Number of entries to return (1-100, default: 10)

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "yoursite-a7b9c3d4",
    "url": "https://yoursite.com",
    "entries": [...],
    "title": "HIGH SCORE",
    "sortOrder": "desc",
    "maxEntries": 100,
    "settings": {
      "webhookUrl": "https://hooks.example.com/notify"
    }
  }
}
```

### lookup

Look up the public ranking ID for a URL without loading leaderboard entries or settings. This is intended for static site build scripts and integrations that only need to know whether the service exists.

```
GET /api/ranking?action=lookup&url={URL}&token={TOKEN}
```

**Response (found and authorized):**

```json
{
  "success": true,
  "data": {
    "url": "https://mygame.com",
    "exists": true,
    "authorized": true,
    "id": "mygame-a7b9c3d4",
    "title": "HIGH SCORE"
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
    "url": "https://mygame.com",
    "exists": true,
    "authorized": false
  }
}
```

Invalid tokens are reported per item instead of returning request-level `403`, so batch clients can keep ordered results for every requested URL.

### batchLookup

Look up multiple ranking URLs in request order. Missing URLs are included as `{ "exists": false }`; found URLs with a wrong token are included as `{ "exists": true, "authorized": false }`. A single request accepts up to 1000 URLs and internally chunks D1 queries to stay under SQLite bind limits.

```
POST /api/ranking?action=batchLookup
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
      "title": "HIGH SCORE"
    },
    {
      "url": "https://b.example",
      "exists": false
    }
  ]
}
```

### delete

Delete a ranking (owner only).

```
GET /api/ranking?action=delete&url={URL}&token={TOKEN}
```

**Parameters:**

- `url` (required): Target URL
- `token` (required): Owner token

**Response:**

```json
{
  "success": true,
  "message": "Ranking deleted"
}
```

## Usage Examples

### Basic Ranking Setup

```javascript
// 1. Create ranking for score-based game (high scores win) — plain GET, old-web style
const params = new URLSearchParams({
  url: "https://mygame.com",
  token: "game-secret",
  maxEntries: "50",
  sortOrder: "desc",
});
const response = await fetch(`/api/ranking?action=create&${params}`);
const data = await response.json();
console.log("Ranking ID:", data.id);

// 2. Submit scores (using public ID)
await fetch("/api/ranking?action=submit&id=" + data.id + "&name=Alice&score=1000");
await fetch("/api/ranking?action=submit&id=" + data.id + "&name=Bob&score=1200");

// 3. Get leaderboard
const ranking = await fetch("/api/ranking?action=get&id=mygame-a7b9c3d4&limit=10");
const leaderboard = await ranking.json();
console.log("Top players:", leaderboard.entries);
```

### Time-based Ranking Setup

```javascript
// 1. Create ranking for time-based game (lower times win)
const params = new URLSearchParams({
  url: "https://racegame.com",
  token: "race-secret",
  maxEntries: "100",
  sortOrder: "asc",
});
const response = await fetch(`/api/ranking?action=create&${params}`);
const data = await response.json();
console.log("Race Ranking ID:", data.id);

// 2. Submit times (lower is better)
await fetch(
  "/api/ranking?action=submit&id=" + data.id + "&name=Speedster&score=1750&displayScore=17.50s"
);
await fetch(
  "/api/ranking?action=submit&id=" + data.id + "&name=Racer&score=1820&displayScore=18.20s"
);

// Better time (17.50s) will rank higher than worse time (18.20s)
```

### Score Management

```javascript
// Update player score (submit handles UPSERT - inserts new or updates existing)
await fetch("/api/ranking?action=submit&id=mygame-a7b9c3d4&name=Alice&score=1500");

// Remove cheating player
const removeParams = new URLSearchParams({
  url: "https://mygame.com",
  token: "game-secret",
  name: "Cheater",
});
await fetch(`/api/ranking?action=remove&${removeParams}`);

// Clear all scores (reset season)
const clearParams = new URLSearchParams({ url: "https://mygame.com", token: "game-secret" });
await fetch(`/api/ranking?action=clear&${clearParams}`);

// Update settings
const updateParams = new URLSearchParams({
  url: "https://mygame.com",
  token: "game-secret",
  maxEntries: "50",
  sortOrder: "asc",
});
await fetch(`/api/ranking?action=update&${updateParams}`);
```

## Features

- **Automatic Sorting**: Scores sorted in descending order
- **Entry Limits**: Configurable maximum number of entries
- **Score Management**: Submit, update, remove individual scores
- **Bulk Operations**: Clear all scores at once
- **Real-time Updates**: Instant leaderboard updates
- **Public Access**: View rankings with public ID

## Data Structure

Rankings use D1 (SQLite) with indexed ORDER BY for efficient sorting:

- Scores are automatically sorted by sortOrder setting
- When max entries exceeded, lowest scores are removed
- Indexed queries for fast retrieval

## Web Component Integration

```html
<script src="https://nostalgic.llll-ll.com/components/ranking.js"></script>

<!-- Interactive ranking display -->
<nostalgic-ranking id="yoursite-a7b9c3d4" theme="light" limit="10"></nostalgic-ranking>

<!-- Text format ranking -->
<nostalgic-ranking id="yoursite-a7b9c3d4" format="text" theme="dark" limit="5"></nostalgic-ranking>
```

**Attributes:**

- `id`: Ranking public ID
- `theme`: Visual style (light, dark, retro, kawaii, mom, final)
- `limit`: Number of entries to display (1-100, default: 10)
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
      "nostalgic-ranking": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        id?: string;
        theme?: "light" | "dark" | "retro" | "kawaii" | "mom" | "final";
        limit?: string;
        format?: "interactive" | "text";
        lang?: "ja" | "en";
      };
    }
  }
}
```

This prevents TypeScript build errors when using Web Components in React/Next.js projects.

## Rate Limiting

- **Submit interval**: 5 seconds between score submissions from the same user
- Returns HTTP 429 with remaining wait time when rate limited

## Security Notes

- Anyone can submit scores using the public ID
- Owner token required for remove, clear, update, and delete actions
- Public ID allows read-only access to leaderboard
- Player names limited to 20 characters
- Score values are integers only
