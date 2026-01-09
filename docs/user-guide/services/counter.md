# Counter Service API

## Overview

Traditional visitor counter that tracks visits across multiple time periods with nostalgic display styles.

## Actions

### create

Create a new counter.

```
GET /api/visit?action=create&url={URL}&token={TOKEN}&webhookUrl={WEBHOOK_URL}
```

**Parameters:**

- `url` (required): Target URL for counting
- `token` (required): Owner token (8-16 characters)
- `webhookUrl` (optional): Webhook URL for event notifications

**Response:**

```json
{
  "success": true,
  "id": "yoursite-a7b9c3d4",
  "url": "https://yoursite.com",
  "message": "Counter created successfully"
}
```

### increment

Count up the counter (automatic duplicate prevention).

```
GET /api/visit?action=increment&id={ID}
```

**Parameters:**

- `id` (required): Public counter ID

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "yoursite-a7b9c3d4",
    "total": 2,
    "today": 2,
    "yesterday": 0,
    "week": 2,
    "month": 2
  }
}
```

### get

Get counter data or image.

#### Public Mode (by ID)

```
GET /api/visit?action=get&id={ID}&type={TYPE}&theme={THEME}&format={FORMAT}
```

**Parameters:**

- `id` (required): Public counter ID
- `type` (optional): Display type
  - `total` (default): Total count
  - `today`: Today's count
  - `yesterday`: Yesterday's count
  - `week`: Last 7 days
  - `month`: Last 30 days
- `theme` (optional): Visual style (for image format)
  - **Color themes (text-based):**
    - `light`: White background, dark text
    - `dark` (default): Dark background, light text
    - `retro`: Black background, green text (terminal style)
    - `kawaii`: Pink background, magenta text
    - `mom`: Beige background, brown text (MOTHER2 style)
    - `final`: Black background, gold text (Final Fantasy style)
  - **Image themes (digit graphics):**
    - `mahjong`: Mahjong tile style (Chinese numerals)
    - `segment`: 7-segment LED display
    - `nixie`: Nixie tube style (orange glow)
    - `dot_f`: Pixel art style (FF5-like)
- `format` (optional): Response format
  - `image` (default): SVG image
  - `text`: Plain text number (no styling)
  - `json`: JSON data
- `digits` (optional): Zero-padding digits (only when specified, for both image and text formats)

**Response:**

- `format=image`: SVG image
- `format=text`: Plain text number
- `format=json`: JSON with counter data

#### Owner Mode (by URL + Token)

Get full settings including webhookUrl.

```
GET /api/visit?action=get&url={URL}&token={TOKEN}
```

**Parameters:**

- `url` (required): Target URL
- `token` (required): Owner token

**Response:**

```json
{
  "id": "yoursite-a7b9c3d4",
  "url": "https://yoursite.com",
  "total": 100,
  "today": 5,
  "yesterday": 10,
  "week": 42,
  "month": 100,
  "settings": {
    "webhookUrl": "https://hooks.example.com/notify"
  }
}
```

### update

Update counter value and/or settings (owner only).

```
GET /api/visit?action=update&url={URL}&token={TOKEN}&value={VALUE}&webhookUrl={WEBHOOK_URL}
```

**Parameters:**

- `url` (required): Target URL
- `token` (required): Owner token
- `value` (optional): New total value (0 or positive number)
- `webhookUrl` (optional): Webhook URL (empty string to remove)

Only specify the parameters you want to change.

**Response:**

```json
{
  "id": "yoursite-a7b9c3d4",
  "url": "https://yoursite.com",
  "total": 12345,
  "today": 0,
  "yesterday": 0,
  "week": 0,
  "month": 0
}
```

### delete

Delete a counter (owner only).

```
GET /api/visit?action=delete&url={URL}&token={TOKEN}
```

**Parameters:**

- `url` (required): Target URL
- `token` (required): Owner token

**Response:**

```json
{
  "success": true,
  "message": "Counter deleted"
}
```

## Web Component Integration

```html
<script src="https://nostalgic.llll-ll.com/components/visit.js"></script>

<!-- Image format (default) -->
<nostalgic-counter id="yoursite-a7b9c3d4" type="total" theme="light" digits="6">
</nostalgic-counter>

<!-- Text format -->
<nostalgic-counter id="yoursite-a7b9c3d4" type="total" format="text"> </nostalgic-counter>

<!-- Text format with zero-padding -->
<nostalgic-counter id="yoursite-a7b9c3d4" type="total" format="text" digits="6">
</nostalgic-counter>
```

**Attributes:**

- `id`: Counter public ID
- `type`: Display type (total, today, yesterday, week, month)
- `theme`: Visual style - only for image format
  - Color themes: light, dark, retro, kawaii, mom, final
  - Image themes: mahjong, segment, nixie, dot_f
- `format`: Output format (image, text) - default: image
- `digits`: Zero-padding digits (only when specified)
- `api-base`: Custom API base URL (optional)

## TypeScript Support

For TypeScript projects using Web Components, create a `types.d.ts` file in your project root:

```typescript
// types.d.ts
import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "nostalgic-counter": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        id?: string;
        type?: "total" | "today" | "yesterday" | "week" | "month";
        theme?:
          | "light"
          | "dark"
          | "retro"
          | "kawaii"
          | "mom"
          | "final"
          | "mahjong"
          | "segment"
          | "nixie"
          | "dot_f";
        digits?: string;
        format?: "image" | "text";
      };
    }
  }
}
```

This prevents TypeScript build errors when using Web Components in React/Next.js projects.

## Usage Examples

### Basic Counter Setup

```javascript
// 1. Create counter
const response = await fetch("/api/visit?action=create&url=https://myblog.com&token=my-secret");
const data = await response.json();
console.log("Counter ID:", data.id);

// 2. Embed in HTML
document.body.innerHTML += `
  <script src="/components/display.js"></script>
  <nostalgic-counter id="${data.id}" type="total" theme="light"></nostalgic-counter>
`;
```

### Multiple Period Display

```html
<!-- Difinalerent time periods, same counter -->
<nostalgic-counter id="blog-a7b9c3d4" type="total" theme="light"></nostalgic-counter>
<nostalgic-counter id="blog-a7b9c3d4" type="today" theme="dark"></nostalgic-counter>
<nostalgic-counter id="blog-a7b9c3d4" type="week" theme="kawaii"></nostalgic-counter>
```

### Text Format Integration

```html
<!-- Inline text counters for modern layouts -->
<div class="stats">
  <span
    >Total visitors:
    <nostalgic-counter id="blog-a7b9c3d4" type="total" format="text"></nostalgic-counter
  ></span>
  <span
    >Today: <nostalgic-counter id="blog-a7b9c3d4" type="today" format="text"></nostalgic-counter
  ></span>
</div>

<!-- Zero-padded display -->
<div class="retro-style">
  Visitor Count:
  <nostalgic-counter id="blog-a7b9c3d4" type="total" format="text" digits="8"></nostalgic-counter>
</div>
```

### Manual Count Control

```javascript
// Count manually (no automatic counting)
const count = await fetch("/api/visit?action=increment&id=blog-a7b9c3d4");
const data = await count.json();

// Get as image
document.querySelector("#counter").src =
  `/api/visit?action=get&id=blog-a7b9c3d4&type=total&theme=light`;
```

## Security Notes

- Owner tokens are stored as SHA256 hashes
- Public IDs are safe to expose (get/increment only)
- Daily duplicate prevention per IP+UserAgent (resets at midnight)
- Tokens should not be reused across sites
