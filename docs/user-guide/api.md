# Nostalgic API Reference

## Overview

Nostalgic is a comprehensive platform that recreates nostalgic web tools (Counter, Like, Ranking, BBS) from the 90s internet culture with modern technology. All services follow a unified action-based API pattern.

## API Architecture

All services use the same URL pattern with action parameters using **GET requests only**:

```
/api/{service}?action={action}&url={your-site}&token={your-token}&...params
```

### 🌐 Why GET-only? 1990s Web Culture Revival

Just like the original 1990s web tools, everything can be operated directly from the browser URL bar:

1. **Click-to-create**: Share a link and instantly create services
2. **URL-based operations**: All actions are simple GET links
3. **Nostalgic simplicity**: No complex forms or POST requests needed
4. **Easy sharing**: Every operation is a shareable URL
5. **BBS culture**: Even message posting uses GET parameters, just like the old days

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

### Service Lifecycle

1. **Create**: URL + token → returns public ID
2. **Use**: Public ID for display/interaction
3. **Manage**: URL + token for owner operations

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
