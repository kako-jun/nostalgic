# Like Service API

## Overview

Toggle-based like/unlike button service with user state tracking. Users can like/unlike with instant feedback.

## Actions

### create

Create a new like button or get existing button ID.

```
GET /api/like?action=create&url={URL}&token={TOKEN}
```

**Parameters:**

- `url` (required): Target URL for like button
- `token` (required): Owner token (8-16 characters)

**Response:**

```json
{
  "id": "yoursite-a7b9c3d4",
  "url": "https://yoursite.com",
  "total": 0,
  "userLiked": false,
  "message": "Like button created successfully"
}
```

### toggle

Toggle like/unlike state for current user.

```
GET /api/like?action=toggle&id={ID}
```

**Parameters:**

- `id` (required): Public like button ID

**Response:**

```json
{
  "id": "yoursite-a7b9c3d4",
  "url": "https://yoursite.com",
  "total": 1,
  "userLiked": true,
  "action": "liked"
}
```

### get

Get current like data (public access).

```
GET /api/like?action=get&id={ID}
```

**Parameters:**

- `id` (required): Public like button ID

**Response:**

```json
{
  "id": "yoursite-a7b9c3d4",
  "url": "https://yoursite.com",
  "total": 5,
  "userLiked": false
}
```

### updateSettings

Update like button settings (owner only).

```
GET /api/like?action=updateSettings&url={URL}&token={TOKEN}&webhookUrl={WEBHOOK_URL}
```

**Parameters:**

- `url` (required): Target URL
- `token` (required): Owner token
- `webhookUrl` (optional): Webhook URL for notifications

**Response:**

```json
{
  "id": "yoursite-a7b9c3d4",
  "url": "https://yoursite.com",
  "total": 5,
  "userLiked": false
}
```

## Web Component Integration

```html
<script src="https://nostalgic.llll-ll.com/components/like.js"></script>

<!-- Interactive button (default) -->
<nostalgic-like id="yoursite-a7b9c3d4" theme="dark" icon="heart"></nostalgic-like>

<!-- Text format -->
<nostalgic-like id="yoursite-a7b9c3d4" format="text" theme="dark"></nostalgic-like>

<!-- SVG image format -->
<nostalgic-like id="yoursite-a7b9c3d4" format="image" theme="kawaii"></nostalgic-like>
```

**Attributes:**

- `id`: Like button public ID
- `theme`: Visual style (light, dark, retro, kawaii, mom, final)
- `icon`: Icon type (heart, star, thumb, peta) - interactive format only
- `format`: Display format (interactive, text, image) - default: interactive
- `api-base`: Custom API base URL (optional)

## TypeScript Support

For TypeScript projects using Web Components, create a `types.d.ts` file in your project root:

```typescript
// types.d.ts
import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "nostalgic-like": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        id?: string;
        theme?: "light" | "dark" | "retro" | "kawaii" | "mom" | "final";
        icon?: "heart" | "star" | "thumb" | "peta";
      };
    }
  }
}
```

This prevents TypeScript build errors when using Web Components in React/Next.js projects.

## Usage Examples

### Basic Like Button Setup

```javascript
// 1. Create like button
const response = await fetch("/api/like?action=create&url=https://myblog.com&token=my-secret");
const data = await response.json();
console.log("Like Button ID:", data.id);

// 2. Embed in HTML
document.body.innerHTML += `
  <script src="/components/like.js"></script>
  <nostalgic-like id="${data.id}"></nostalgic-like>
`;
```

### Text Format Integration

```html
<!-- Inline text likes for modern layouts -->
<div class="post-stats">
  <span>Likes: <nostalgic-like id="post-123" format="text" theme="dark"></nostalgic-like></span>
  <span>Views: 1,234</span>
</div>

<!-- Custom styled text likes -->
<style>
  nostalgic-like {
    --like-text-color-unliked: #666;
    --like-text-color-liked: #final4757;
    --like-text-hover-color-unliked: #333;
    --like-text-hover-color-liked: #final3838;
  }
</style>
<nostalgic-like id="post-123" format="text"></nostalgic-like>
```

### Manual Like Control

```javascript
// Toggle like manually
const response = await fetch("/api/like?action=toggle&id=myblog-a7b9c3d4");
const data = await response.json();
console.log("User liked:", data.userLiked, "Total:", data.total);

// Get current state
const current = await fetch("/api/like?action=get&id=myblog-a7b9c3d4");
const state = await current.json();
console.log("Current likes:", state.total);
```

## Features

- **Toggle Functionality**: Users can like and unlike
- **User State Tracking**: Remembers if current user has liked
- **Daily Limit**: One like per day per user (resets at midnight)
- **Instant Feedback**: Immediate response with new state
- **Public Access**: Anyone can view like count with public ID

## Security Notes

- User identification via IP+UserAgent hash
- No persistent user tracking or cookies
- Owner token required for like button creation
- Public ID safe for embedding (view-only access)
