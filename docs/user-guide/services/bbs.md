# BBS Service API

## Overview

Message board service with customizable dropdown selections, icon support, and author-based message editing capabilities.

## Actions

### create

Create a new BBS message board.

```
GET /api/bbs?action=create&url={URL}&token={TOKEN}&max={MAX_MESSAGES}&perPage={PER_PAGE}&icons={ICONS}&select1Label={LABEL}&select1Values={VALUES}&webhookUrl={WEBHOOK_URL}
```

**Parameters:**

- `url` (required): Target URL for BBS
- `token` (required): Owner token (8-16 characters)
- `max` (optional): Maximum messages (1-10000, default: 1000)
- `perPage` (optional): Messages per page (1-100, default: 10)
- `icons` (optional): Available icons (comma-separated, max 20)
- `select1Label`, `select1Values`, `select1Required`: First dropdown configuration
- `select2Label`, `select2Values`, `select2Required`: Second dropdown configuration
- `select3Label`, `select3Values`, `select3Required`: Third dropdown configuration
- `webhookUrl` (optional): Webhook URL for event notifications

**Response:**

```json
{
  "id": "yoursite-a7b9c3d4",
  "url": "https://yoursite.com",
  "messages": [],
  "totalMessages": 0,
  "currentPage": 1,
  "messagesPerPage": 10,
  "options": {
    "availableIcons": ["😀", "😎", "😍"],
    "select1": {
      "label": "Country",
      "values": ["Japan", "USA", "UK"],
      "required": false
    }
  },
  "message": "BBS created successfully"
}
```

### post

Post a new message to the BBS.

```
GET /api/bbs?action=post&id={ID}&author={AUTHOR}&message={MESSAGE}&icon={ICON}&select1={VALUE1}
```

**Parameters:**

- `id` (required): Public BBS ID
- `author` (optional): Author name (default: "名無しさん", max 50 characters)
- `message` (required): Message content (max 1000 characters)
- `icon` (optional): Selected icon
- `select1`, `select2`, `select3` (optional): Dropdown selections

**Response:**

```json
{
  "message": "Message posted successfully",
  "data": {
    "id": "abc123def456",
    "author": "User",
    "message": "Hello world!",
    "timestamp": "2025-08-13T10:00:00Z",
    "icon": "😀",
    "select1": "Japan",
    "userAgent": "Mozilla/5.0...",
    "ipHash": "a1b2c3d4"
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
  "id": "yoursite-a7b9c3d4",
  "url": "https://yoursite.com",
  "messages": [...],
  "page": 1,
  "hasMore": false,
  "totalMessages": 1
}
```

#### Settings Update (owner only)

Update BBS settings without messageId parameter.

```
GET /api/bbs?action=update&url={URL}&token={TOKEN}&perPage={PER_PAGE}&max={MAX}&webhookUrl={WEBHOOK_URL}
```

**Parameters:**

- `url` (required): Target URL
- `token` (required): Owner token
- `perPage` (optional): Messages per page (1-100)
- `max` (optional): Maximum total messages (1-10000)
- `webhookUrl` (optional): Webhook URL (empty string to remove)

Only specify the parameters you want to change.

**Response:**

```json
{
  "id": "yoursite-a7b9c3d4",
  "url": "https://yoursite.com",
  "messages": [...],
  "totalMessages": 5,
  "currentPage": 1,
  "messagesPerPage": 20
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
  "id": "yoursite-a7b9c3d4",
  "url": "https://yoursite.com",
  "messages": [],
  "page": 1,
  "hasMore": false,
  "totalMessages": 0
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
  "id": "yoursite-a7b9c3d4",
  "url": "https://yoursite.com",
  "messages": [],
  "page": 1,
  "hasMore": false,
  "totalMessages": 0
}
```

### get

Get BBS messages.

#### Public Mode (by ID)

```
GET /api/bbs?action=get&id={ID}&page={PAGE}
```

**Parameters:**

- `id` (required): Public BBS ID
- `page` (optional): Page number (default: 1)

**Response:**

```json
{
  "id": "yoursite-a7b9c3d4",
  "url": "https://yoursite.com",
  "messages": [
    {
      "id": "abc123def456",
      "author": "User",
      "message": "Hello world!",
      "timestamp": "2025-08-13T10:00:00Z",
      "updated": "2025-08-13T10:05:00Z",
      "icon": "😀",
      "select1": "Japan",
      "userAgent": "Mozilla/5.0...",
      "ipHash": "a1b2c3d4"
    }
  ],
  "totalMessages": 1,
  "currentPage": 1,
  "messagesPerPage": 10,
  "options": {
    "availableIcons": ["😀", "😎", "😍"],
    "select1": {
      "label": "Country",
      "values": ["Japan", "USA", "UK"],
      "required": false
    }
  }
}
```

#### Owner Mode (by URL + Token)

Get full settings including webhookUrl.

```
GET /api/bbs?action=get&url={URL}&token={TOKEN}&page={PAGE}
```

**Parameters:**

- `url` (required): Target URL
- `token` (required): Owner token
- `page` (optional): Page number (default: 1)

**Response:**

```json
{
  "id": "yoursite-a7b9c3d4",
  "url": "https://yoursite.com",
  "messages": [...],
  "totalMessages": 1,
  "currentPage": 1,
  "messagesPerPage": 10,
  "options": {
    "availableIcons": ["😀", "😎", "😍"],
    "select1": { ... }
  },
  "settings": {
    "webhookUrl": "https://hooks.example.com/notify"
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
// 1. Create BBS with custom options
const response = await fetch(
  `/api/bbs?action=create&url=https://mysite.com&token=my-secret&max=500&perPage=20&icons=😀,😎,😍,🤔,😢&select1Label=Country&select1Values=Japan,USA,UK&select2Label=Topic&select2Values=General,Tech,Gaming`
);

const data = await response.json();
console.log("BBS ID:", data.id);

// 2. Post message
await fetch(
  "/api/bbs?action=post&id=" +
    data.id +
    "&author=Alice&message=Hello everyone!&icon=😀&select1=Japan&select2=General"
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

## Customization Options

### Icon Selection

```
&icons=😀,😎,😍,🤔,😢,😊,😭,😡,😱,🤗
```

- Up to 20 icons
- Users can select when posting

### Dropdown Selections

```
&select1Label=Country&select1Values=Japan,USA,UK,France,Germany&select1Required=true
&select2Label=Category&select2Values=General,Tech,Gaming,Music
&select3Label=Priority&select3Values=High,Medium,Low
```

- Up to 3 configurable dropdowns
- Each can have up to 50 options
- Can be marked as required

## Features

- **Author Verification**: Users can edit/remove their own posts
- **Owner Management**: BBS owners can remove any message
- **Customizable Options**: Icons and dropdown selections
- **Pagination**: Fixed height display (400px), starts at latest page
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
<nostalgic-bbs id="yoursite-a7b9c3d4" theme="light" page="1"></nostalgic-bbs>

<!-- Text format BBS -->
<nostalgic-bbs id="yoursite-a7b9c3d4" format="text" theme="dark" page="1"></nostalgic-bbs>
```

**Attributes:**

- `id`: BBS public ID
- `theme`: Visual style (light, dark, retro, kawaii, mom, final)
- `page`: Page number to display (default: last page for latest messages)
- `format`: Display format (interactive, text) - default: interactive
- `api-base`: Custom API base URL (optional)

**Display Features:**

- Fixed height of 400px regardless of message count
- Pagination format: "2/3" (current/total pages)
- Automatically shows latest messages on initial load

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
        page?: string;
      };
    }
  }
}
```

This prevents TypeScript build errors when using Web Components in React/Next.js projects.

## Security Notes

- Message authorship verified by IP+UserAgent hash
- Owner token required for BBS creation and management
- Authors can only edit their own messages
- IP addresses are hashed for privacy
- Message content length limited to 1000 characters
