# Ranking Service API

## Overview

Score leaderboard system with automatic sorting, score management, and configurable entry limits.

## Actions

### create
Create a new ranking leaderboard.

```
GET /api/ranking?action=create&url={URL}&token={TOKEN}&max={MAX_ENTRIES}&sortOrder={SORT_ORDER}
```

**Parameters:**
- `url` (required): Target URL for ranking
- `token` (required): Owner token (8-16 characters)
- `max` (optional): Maximum entries (1-1000, default: 100)
- `sortOrder` (optional): Sort order - "desc" for high scores first, "asc" for low times first (default: "desc")

**Response:**
```json
{
  "id": "yoursite-a7b9c3d4",
  "url": "https://yoursite.com",
  "entries": [],
  "totalEntries": 0,
  "maxEntries": 100,
  "sortOrder": "desc",
  "message": "Ranking created successfully"
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
  "id": "yoursite-a7b9c3d4",
  "url": "https://yoursite.com",
  "entries": [
    {
      "name": "Player1",
      "score": 1000,
      "displayScore": "1,000",
      "rank": 1,
      "timestamp": "2025-08-13T10:00:00Z"
    }
  ],
  "totalEntries": 1,
  "maxEntries": 100,
  "sortOrder": "desc",
  "message": "Score submitted successfully"
}
```

### update
Update an existing player's score.

```
GET /api/ranking?action=update&url={URL}&token={TOKEN}&name={PLAYER_NAME}&score={NEW_SCORE}
```

**Parameters:**
- `url` (required): Target URL
- `token` (required): Owner token
- `name` (required): Player name to update
- `score` (required): New score value

**Note:** For settings changes (webhookUrl, etc.), use the `updateSettings` action.

**Response:**
```json
{
  "id": "yoursite-a7b9c3d4",
  "url": "https://yoursite.com",
  "rankings": [
    { "name": "Player1", "score": 1500 },
    { "name": "Player2", "score": 900 },
    { "name": "Player3", "score": 500 }
  ],
  "maxEntries": 100
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
  "id": "yoursite-a7b9c3d4",
  "url": "https://yoursite.com",
  "rankings": [
    { "name": "Player2", "score": 900 },
    { "name": "Player3", "score": 500 }
  ],
  "maxEntries": 100
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
  "id": "yoursite-a7b9c3d4",
  "url": "https://yoursite.com",
  "rankings": [],
  "maxEntries": 100
}
```

### get
Get ranking data (public access).

```
GET /api/ranking?action=get&id={ID}&limit={LIMIT}
```

**Parameters:**
- `id` (required): Public ranking ID
- `limit` (optional): Number of entries to return (1-100, default: 10)

**Response:**
```json
{
  "id": "yoursite-a7b9c3d4",
  "url": "https://yoursite.com",
  "entries": [
    {
      "name": "Player1",
      "score": 1500,
      "displayScore": "1,500",
      "rank": 1,
      "timestamp": "2025-08-13T10:00:00Z"
    },
    {
      "name": "Player2", 
      "score": 1200,
      "displayScore": "1,200",
      "rank": 2,
      "timestamp": "2025-08-13T09:30:00Z"
    }
  ],
  "totalEntries": 2
}
```

### updateSettings
Update ranking settings (owner only).

```
GET /api/ranking?action=updateSettings&url={URL}&token={TOKEN}&title={TITLE}&max={MAX_ENTRIES}&sortOrder={SORT_ORDER}&webhookUrl={WEBHOOK_URL}
```

**Parameters:**
- `url` (required): Target URL
- `token` (required): Owner token
- `title` (optional): Ranking title
- `max` (optional): Maximum entries (1-1000)
- `sortOrder` (optional): Sort order ("desc" for high scores, "asc" for low times)
- `webhookUrl` (optional): Webhook URL for notifications

**Response:**
```json
{
  "id": "yoursite-a7b9c3d4",
  "url": "https://yoursite.com",
  "title": "High Score Leaderboard",
  "entries": [
    {
      "name": "Player1",
      "score": 1500,
      "displayScore": "1,500",
      "rank": 1
    }
  ],
  "maxEntries": 50,
  "sortOrder": "desc"
}
```

## Usage Examples

### Basic Ranking Setup
```javascript
// 1. Create ranking for score-based game (high scores win)
const response = await fetch('/api/ranking?action=create&url=https://mygame.com&token=game-secret&max=50&sortOrder=desc')
const data = await response.json()
console.log('Ranking ID:', data.id)

// 2. Submit scores (using public ID)
await fetch('/api/ranking?action=submit&id=' + data.id + '&name=Alice&score=1000')
await fetch('/api/ranking?action=submit&id=' + data.id + '&name=Bob&score=1200')

// 3. Get leaderboard
const ranking = await fetch('/api/ranking?action=get&id=mygame-a7b9c3d4&limit=10')
const leaderboard = await ranking.json()
console.log('Top players:', leaderboard.entries)
```

### Time-based Ranking Setup
```javascript
// 1. Create ranking for time-based game (lower times win)
const response = await fetch('/api/ranking?action=create&url=https://racegame.com&token=race-secret&max=100&sortOrder=asc')
const data = await response.json()
console.log('Race Ranking ID:', data.id)

// 2. Submit times (lower is better)
await fetch('/api/ranking?action=submit&id=' + data.id + '&name=Speedster&score=1750&displayScore=17.50s')
await fetch('/api/ranking?action=submit&id=' + data.id + '&name=Racer&score=1820&displayScore=18.20s')

// Better time (17.50s) will rank higher than worse time (18.20s)
```

### Score Management
```javascript
// Update player score
await fetch('/api/ranking?action=update&url=https://mygame.com&token=game-secret&name=Alice&score=1500')

// Remove cheating player
await fetch('/api/ranking?action=remove&url=https://mygame.com&token=game-secret&name=Cheater')

// Clear all scores (reset season)
await fetch('/api/ranking?action=clear&url=https://mygame.com&token=game-secret')
```

## Features

- **Automatic Sorting**: Scores sorted in descending order
- **Entry Limits**: Configurable maximum number of entries
- **Score Management**: Submit, update, remove individual scores
- **Bulk Operations**: Clear all scores at once
- **Real-time Updates**: Instant leaderboard updates
- **Public Access**: View rankings with public ID

## Data Structure

Rankings use Redis Sorted Sets for efficient sorting:
- Scores are automatically sorted in descending order
- When max entries exceeded, lowest scores are removed
- O(log N) performance for score operations

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
- `theme`: Visual style (light, dark, retro, kawaii, mother, ff)
- `limit`: Number of entries to display (1-100, default: 10)
- `format`: Display format (interactive, text) - default: interactive
- `api-base`: Custom API base URL (optional)

## TypeScript Support

For TypeScript projects using Web Components, create a `types.d.ts` file in your project root:

```typescript
// types.d.ts
import 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'nostalgic-ranking': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        id?: string;
        theme?: 'light' | 'dark' | 'retro' | 'kawaii' | 'mother' | 'ff';
        limit?: string;
      };
    }
  }
}
```

This prevents TypeScript build errors when using Web Components in React/Next.js projects.

## Security Notes

- Only ranking owners can submit/modify scores
- Public ID allows read-only access to leaderboard
- Player names limited to 20 characters
- Score values are integers only