# WebHook Integration

Nostalgicの全サービスはWebHook通知に対応しています。Discord、Slack、その他のWebHook対応サービスにイベント通知を送信できます。

## 概要

- **対応サービス**: Counter, Like, Ranking, BBS
- **対応先**: Discord, Slack, その他JSON POSTを受け付けるエンドポイント
- **特徴**: 非同期送信、5秒タイムアウト、失敗時もメイン処理に影響なし

## 設定方法

### サービス作成時

```
https://api.nostalgic.llll-ll.com/visit?action=create&url=https://your-site.com&token=yourtoken&webhookUrl=https://discord.com/api/webhooks/xxx
```

### 後から設定/変更

```
https://api.nostalgic.llll-ll.com/visit?action=update&url=https://your-site.com&token=yourtoken&webhookUrl=https://hooks.slack.com/xxx
```

### 解除

```
https://api.nostalgic.llll-ll.com/visit?action=update&url=https://your-site.com&token=yourtoken&webhookUrl=
```

## イベント一覧

| サービス | イベント            | トリガー          |
| -------- | ------------------- | ----------------- |
| Counter  | `counter.increment` | カウント増加時    |
| Like     | `like.toggle`       | いいね/取り消し時 |
| Ranking  | `ranking.submit`    | スコア送信時      |
| BBS      | `bbs.post`          | 新規投稿時        |

## ペイロード形式

すべてのWebHookは以下のJSON形式で送信されます:

```json
{
  "content": "メッセージ（Discord用）",
  "text": "メッセージ（Slack用）",
  "event": "イベント名",
  "timestamp": "2026-01-09T12:34:56.789Z",
  "data": {
    // イベント固有のデータ
  }
}
```

### Counter (counter.increment)

```json
{
  "content": "📊 カウンター更新: 12345",
  "text": "📊 カウンター更新: 12345",
  "event": "counter.increment",
  "timestamp": "2026-01-09T12:34:56.789Z",
  "data": {
    "id": "example-com-a1b2c3d4",
    "total": 12345,
    "today": 42,
    "yesterday": 38,
    "week": 256,
    "month": 1024
  }
}
```

### Like (like.toggle)

いいね時:

```json
{
  "content": "❤️ いいねされました！ 合計: 100",
  "text": "❤️ いいねされました！ 合計: 100",
  "event": "like.toggle",
  "timestamp": "2026-01-09T12:34:56.789Z",
  "data": {
    "id": "example-com-a1b2c3d4",
    "total": 100,
    "liked": true
  }
}
```

取り消し時:

```json
{
  "content": "💔 いいねが解除されました 合計: 99",
  "text": "💔 いいねが解除されました 合計: 99",
  "event": "like.toggle",
  "timestamp": "2026-01-09T12:34:56.789Z",
  "data": {
    "id": "example-com-a1b2c3d4",
    "total": 99,
    "liked": false
  }
}
```

### Ranking (ranking.submit)

```json
{
  "content": "🏆 ランキング更新: Player1 - 99999",
  "text": "🏆 ランキング更新: Player1 - 99999",
  "event": "ranking.submit",
  "timestamp": "2026-01-09T12:34:56.789Z",
  "data": {
    "id": "example-com-a1b2c3d4",
    "name": "Player1",
    "score": 99999,
    "displayScore": "99,999 pts",
    "entries": [
      {
        "rank": 1,
        "name": "Player1",
        "score": 99999,
        "displayScore": "99,999 pts",
        "createdAt": "..."
      },
      {
        "rank": 2,
        "name": "Player2",
        "score": 88888,
        "displayScore": "88,888 pts",
        "createdAt": "..."
      }
    ]
  }
}
```

### BBS (bbs.post)

```json
{
  "content": "📝 新しい投稿 by John: Hello, this is a test message...",
  "text": "📝 新しい投稿 by John: Hello, this is a test message...",
  "event": "bbs.post",
  "timestamp": "2026-01-09T12:34:56.789Z",
  "data": {
    "id": "example-com-a1b2c3d4",
    "author": "John",
    "message": "Hello, this is a test message for the BBS!"
  }
}
```

## Discord設定例

1. サーバー設定 → 連携サービス → ウェブフック → 新しいウェブフック
2. WebHook URLをコピー
3. Nostalgicサービス作成/更新時に `webhookUrl` パラメータで指定

## Slack設定例

1. アプリ管理 → Incoming Webhooks → Add New Webhook to Workspace
2. チャンネル選択 → Webhook URLをコピー
3. Nostalgicサービス作成/更新時に `webhookUrl` パラメータで指定

## 注意事項

- **リトライなし**: 送信失敗時の再送は行いません
- **タイムアウト**: 5秒でタイムアウトします
- **非同期**: WebHook送信の成否はAPIレスポンスに影響しません
- **プライバシー**: IPアドレスやUser-Agentは送信されません
- **署名なし**: リクエストにデジタル署名は含まれません
