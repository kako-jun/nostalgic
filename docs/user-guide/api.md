# Nostalgic API Reference

## Overview

Nostalgic is a comprehensive platform that recreates nostalgic web tools (Counter, Like, Ranking, BBS, Yokoso) from the 90s internet culture with modern technology. All services follow a unified action-based API pattern.

## API Architecture

All services use the same URL pattern with action parameters. Public reads use **GET**.
Owner actions use **POST** with parameters in the JSON body so owner tokens are not exposed in URLs:

```
GET  /api/{service}?action=get&id={public-id}
POST /api/{service}?action={owner-action}
Body: { "url": "https://your-site.example", "token": "your-token", "...": "..." }
```

### 🌐 Why GET-based? 1990s Web Culture Revival

Just like the original 1990s web tools, public display and interaction URLs stay simple enough to paste into a browser, an image tag, or a README:

1. **URL-based public reads**: Public display URLs stay simple GET links
2. **Embeddable images**: Counter, Like, BBS, and Yokoso images can be used directly in HTML and Markdown
3. **Nostalgic simplicity**: No complex forms needed
4. **Easy sharing**: Public actions remain shareable URLs
5. **BBS culture**: Even message posting uses GET parameters, just like the old days

> **Note**: Owner actions use POST so owner tokens are not left in URLs. `batchGet`, `batchCreate`, and `batchLookup` also use POST because they carry arrays that do not fit Nostalgic's URL-first shape cleanly. BBS, Ranking, and Yokoso intentionally use lightweight `lookup` / `batchLookup` instead of heavy `batchGet`: `get` reads service content/settings, while `lookup` only checks URL ownership and returns the generated public ID.

`batchLookup` accepts up to 1000 URLs per request. Internally, Nostalgic may split SQL statements into smaller chunks to stay under D1/SQLite bind-variable limits; this is not a client-visible 100 item API limit, and it is separate from response-size concerns.

## Services

### 📊 [Counter Service](services/counter.md)

Traditional visitor counter with multiple time periods and nostalgic display styles.

### 💖 [Like Service](services/like.md)

Toggle-based like/unlike button with user state tracking.

### 🏆 [Ranking Service](services/ranking.md)

Score leaderboard system with automatic sorting and management features.

### 💬 [BBS Service](services/bbs.md)

Message board with customizable options and author-based editing.

## Common Concepts

### Authentication & Ownership

- **Owner Token**: 8-16 character secret for service management
- **Public ID**: Safe identifier for display/interaction (format: `domain-hash8`)
- **User Hash**: IP+UserAgent for duplicate prevention and authorship

### Security Features

- SHA256 hashed token storage
- Daily duplicate prevention (resets at midnight)
- Public ID system prevents unauthorized access
- Author verification for post editing/removal

### Webhook Features

All services support webhook functionality for real-time event notifications:

- **Real-time notifications**: Instant alerts for service events (counter increments, likes, ranking changes, BBS posts, etc.)
- **Chat integration**: Easy integration with Slack/Discord/Teams and other webhook-compatible services
- **Simple design**: Lightweight implementation without retries or digital signatures
- **Optional configuration**: Set via webhookUrl parameter during service creation or updates

**[→ WebHook詳細ドキュメント](./webhook.md)** - ペイロード形式、設定方法、サンプル

### Service Lifecycle

1. **Create**: URL + token → returns public ID
2. **Use**: Public ID for display/interaction
3. **Manage**: URL + token for owner operations
4. **Lookup**: URL + token → exists/id without loading service content

## Try the Demos

Visit our interactive demo pages to test all services:

- **[Counter Demo](https://nostalgic.llll-ll.com/counter)**
- **[Like Demo](https://nostalgic.llll-ll.com/like)**
- **[Ranking Demo](https://nostalgic.llll-ll.com/ranking)**
- **[BBS Demo](https://nostalgic.llll-ll.com/bbs)**

## Deployment

### Hosted Service (Recommended)

Use `https://nostalgic.llll-ll.com` - no setup required!

### Self-Hosting

1. Fork this repository
2. Deploy to Cloudflare Workers
3. Create and configure D1 database
4. Update Web Component URLs to your domain

---

_For detailed API specifications of each service, see the individual service documentation in the `/docs/services/` directory._
