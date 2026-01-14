# Nostalgic

_[日本語版はこちら](README.ja.md)_

A comprehensive nostalgic web tools platform that brings back the 90s internet culture with modern technology. Five essential services that used to be on every personal homepage: Counter, Like, Ranking, BBS, and Yokoso.

## ✨ Services

### 📊 Counter Service

- Multiple time periods: Total, today, yesterday, weekly, monthly statistics
- Daily duplicate prevention (resets at midnight)
- 3 nostalgic display styles: Light, Dark, Kawaii
- Web Components for easy embedding

### 💖 Like Service

- Toggle-based like/unlike functionality
- User state tracking (IP + UserAgent)
- Daily limit: One like per day per user (resets at midnight)
- Instant feedback with current state

### 🏆 Ranking Service

- Score leaderboards with automatic sorting
- Score management (submit, update, remove)
- Configurable entry limits
- Real-time ranking updates with formatted display scores

### 💬 BBS Service

- Message board with fixed height display (400px)
- Pagination that starts at latest messages
- Customizable dropdown selections
- Author-based message editing
- Icon selection for posts

### 🐱 Yokoso (Lucky Cat) Service

- Lucky cat widget that speaks your message
- Update just one part of your page independently
- Perfect for announcements on static pages
- A modern alternative to X (Twitter) embeds
- SVG images for GitHub README embedding

## ✨ Common Features

- 🚫 **No registration required**: Just provide a URL and secret token
- 🔒 **Secure ownership**: SHA256 hashed tokens, public ID system
- 🌐 **Easy integration**: RESTful APIs with action parameters
- ⚡ **Fast & reliable**: Built on Cloudflare Workers + D1
- 🔗 **Pure GET APIs**: All operations via browser URL bar (1990s web culture revival)

## 🚀 Quick Start

### Counter Service

1. **Create your counter**:

```
https://api.nostalgic.llll-ll.com/visit?action=create&url=https://yoursite.com&token=your-secret-token
```

2. **Embed in your site**:

```html
<script src="https://nostalgic.llll-ll.com/components/visit.js"></script>
<nostalgic-counter id="yoursite-a7b9c3d4" type="total" theme="dark"></nostalgic-counter>
```

### Like Service

1. **Create like button**:

```
https://api.nostalgic.llll-ll.com/like?action=create&url=https://yoursite.com&token=your-secret-token
```

2. **Toggle like**:

```
https://api.nostalgic.llll-ll.com/like?action=toggle&url=https://yoursite.com&token=your-secret-token
```

### Ranking Service

1. **Create ranking**:

```
https://api.nostalgic.llll-ll.com/ranking?action=create&url=https://yoursite.com&token=your-secret-token&maxEntries=100
```

2. **Submit scores**:

```
https://api.nostalgic.llll-ll.com/ranking?action=submit&url=https://yoursite.com&token=your-secret-token&name=Player1&score=1000
```

### BBS Service

1. **Create BBS**:

```
https://api.nostalgic.llll-ll.com/bbs?action=create&url=https://yoursite.com&token=your-secret-token&maxMessages=1000
```

2. **Post messages** (pure GET, 1990s style):

```
https://api.nostalgic.llll-ll.com/bbs?action=post&url=https://yoursite.com&token=your-secret-token&author=User&message=Hello!
```

### Yokoso Service

1. **Create Yokoso**:

```
https://api.nostalgic.llll-ll.com/yokoso?action=create&url=https://yoursite.com&token=your-secret-token
```

2. **Embed in your site**:

```html
<script src="https://nostalgic.llll-ll.com/components/yokoso.js"></script>
<nostalgic-yokoso id="yoursite-a7b9c3d4"></nostalgic-yokoso>
```

## 🎮 Try the Demos

Visit our interactive demo pages:

- **[Counter Demo](https://nostalgic.llll-ll.com/counter)** - Test counter creation and management
- **[Like Demo](https://nostalgic.llll-ll.com/like)** - Try the like/unlike functionality
- **[Ranking Demo](https://nostalgic.llll-ll.com/ranking)** - Submit and manage scores
- **[BBS Demo](https://nostalgic.llll-ll.com/bbs)** - Post and edit messages
- **[Yokoso Demo](https://nostalgic.llll-ll.com/yokoso)** - Try the lucky cat widget

## 🔧 API Architecture

All services follow a unified action-based API pattern using **GET requests only**:

```
/api/{service}?action={action}&url={your-site}&token={your-token}&...params
```

### 🌐 Why GET-only? 1990s Web Culture Revival

Just like the original 1990s web tools, everything can be operated directly from the browser URL bar:

1. **Click-to-create**: Share a link and instantly create a counter
2. **URL-based operations**: All actions are simple GET links
3. **Nostalgic simplicity**: No complex forms or POST requests needed
4. **Easy sharing**: Every operation is a shareable URL
5. **BBS culture**: Even message posting uses GET parameters, just like the old days

### Available Actions by Service:

| Service     | Actions                                                | Description                 |
| ----------- | ------------------------------------------------------ | --------------------------- |
| **Counter** | `create`, `increment`, `display`, `set`                | Traditional visitor counter |
| **Like**    | `create`, `toggle`, `get`                              | Like/unlike button          |
| **Ranking** | `create`, `submit`, `update`, `remove`, `clear`, `get` | Score leaderboard           |
| **BBS**     | `create`, `post`, `update`, `remove`, `clear`, `get`   | Message board               |
| **Yokoso**  | `create`, `update`, `get`                              | Lucky cat widget            |

## 📖 Documentation

### API Documentation

- **[Complete API Reference](docs/api.md)** - Full API documentation for all services
- **[Japanese API Documentation](docs/api_ja.md)** - APIドキュメント（日本語）

### Service-Specific Guides

- **[Counter Service](docs/services/counter.md)** - Visitor counter implementation
- **[Like Service](docs/services/like.md)** - Like/unlike button functionality
- **[Ranking Service](docs/services/ranking.md)** - Leaderboard and scoring
- **[BBS Service](docs/services/bbs.md)** - Message board system

### Customization

- **[Customization Guide](docs/customization.md)** - Themes, styling, and configuration

### Live Demo

- **[Interactive Demo](https://nostalgic.llll-ll.com)** - Try it on our nostalgic homepage

## 🛡️ Security & Privacy

### What data we collect and store:

- **Service URLs** (identifier only, not used for tracking)
- **Secret tokens** (hashed with SHA256)
- **User identification** (IP + UserAgent hash, for duplicate prevention and authorship)
- **Service data** (counts, likes, scores, messages - no personal data)

### What we DON'T collect:

- No cookies, no tracking pixels
- No personal information (name, email, etc.)
- No browsing history or referrer data
- IP addresses are hashed for privacy

### Security measures:

- Your secret tokens are hashed and stored securely
- Public IDs can only display/interact, not modify
- User identification via temporary IP+UserAgent hash
- Author verification for message editing/removal

## 📜 License

MIT License - feel free to use, modify, and distribute.

## 🌟 Contributing

Issues and pull requests are welcome! Let's bring back the nostalgic web together.

---

_Made with ❤️ for the nostalgic web_
