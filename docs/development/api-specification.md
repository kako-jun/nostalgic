# Nostalgic Platform - API Specification

## Base URL

```
https://api.nostalgic.llll-ll.com
```

## 共通仕様

### リクエスト形式

- **Method**: GET のみ（すべてブラウザのURL欄で操作可能）
- **Content-Type**: URLパラメータ

### レスポンス形式

#### 成功レスポンス

```typescript
{
  "success": true,
  "data": T,
  "message"?: string
}
```

#### エラーレスポンス

```typescript
{
  "success": false,
  "error": string,
  "code": string,
  "statusCode": number
}
```

### エラーコード

| Code                   | Status | Description                |
| ---------------------- | ------ | -------------------------- |
| `VALIDATION_ERROR`     | 400    | パラメータ検証エラー       |
| `UNAUTHORIZED`         | 403    | 認証エラー（トークン不正） |
| `NOT_FOUND`            | 404    | リソースが見つからない     |
| `BUSINESS_LOGIC_ERROR` | 422    | ビジネスロジックエラー     |
| `STORAGE_ERROR`        | 500    | ストレージエラー           |

### パラメータの仕様

#### 必須・任意パラメータ

- **必須パラメータ**: 省略時はバリデーションエラー
- **任意パラメータ**: 省略時はスキーマで定義されたデフォルト値が適用

#### デフォルト値の適用

任意パラメータが未指定の場合、以下のデフォルト値が自動適用される：

| パラメータ | デフォルト値  | 対象サービス                |
| ---------- | ------------- | --------------------------- |
| `type`     | `total`       | Counter                     |
| `theme`    | `dark`        | Counter, Like, Ranking, BBS |
| `format`   | `image`       | Counter                     |
| `format`   | `interactive` | Like                        |
| `page`     | `1`           | BBS                         |
| `limit`    | `10`          | Ranking, BBS                |

**重要**: WebComponentsからパラメータを送信しない場合、上記デフォルト値が自動的に適用される。
クライアント側でのデフォルト値設定は不要。

---

## Counter Service API

### 1. カウンター作成

サイトのカウンターを新規作成します。

**Endpoint**: `GET /visit?action=create`

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `action` | string | Yes | `"create"` |
| `url` | string | Yes | サイトのURL |
| `token` | string | Yes | オーナートークン（8-16文字） |
| `webhookUrl` | string | No | Webhook URL（イベント通知用） |

**Example Request**:

```bash
curl "https://api.nostalgic.llll-ll.com/visit?action=create&url=https://example.com&token=mysecret123"
```

**Example Response**:

```json
{
  "success": true,
  "data": {
    "id": "example-a7b9c3d4",
    "url": "https://example.com"
  }
}
```

### 2. カウントアップ

カウンターを1増やします（1日1回、毎日0時リセット）。

**Endpoint**: `GET /visit?action=increment`

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `action` | string | Yes | `"increment"` |
| `id` | string | Yes | カウンターID |

**Example Request**:

```bash
curl "https://api.nostalgic.llll-ll.com/visit?action=increment&id=example-a7b9c3d4"
```

**Example Response**:

```json
{
  "success": true,
  "data": {
    "id": "example-a7b9c3d4",
    "url": "https://example.com",
    "total": 123,
    "today": 45,
    "yesterday": 38,
    "week": 234,
    "month": 987,
    "created": "2025-08-01T10:00:00.000Z",
    "lastUpdated": "2025-08-18T15:30:00.000Z"
  }
}
```

### 3. カウンター取得

カウンターの値を取得します（SVG画像、JSON、テキスト形式）。

**Endpoint**: `GET /visit?action=get`

#### 公開モード（idで取得）

**Parameters**:
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `action` | string | Yes | - | `"get"` |
| `id` | string | Yes | - | カウンターID |
| `type` | string | No | `"total"` | 表示タイプ: `total`, `today`, `yesterday`, `week`, `month` |
| `format` | string | No | `"image"` | 出力形式: `image`, `json`, `text` |
| `theme` | string | No | `"dark"` | テーマ: `light`, `dark`, `kawaii` (image形式のみ) |
| `digits` | number | No | `6` | 表示桁数: 1-10 (image形式のみ) |

#### オーナーモード（url+tokenで取得）

全設定情報（webhookUrl等）を含むレスポンスを返します。

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `action` | string | Yes | `"get"` |
| `url` | string | Yes | サイトのURL |
| `token` | string | Yes | オーナートークン |

**Example Requests**:

SVG画像取得:

```bash
curl "https://api.nostalgic.llll-ll.com/visit?action=get&id=example-a7b9c3d4&format=image&theme=kawaii"
```

JSON取得（公開モード）:

```bash
curl "https://api.nostalgic.llll-ll.com/visit?action=get&id=example-a7b9c3d4&format=json"
```

JSON取得（オーナーモード - 全設定含む）:

```bash
curl "https://api.nostalgic.llll-ll.com/visit?action=get&url=https://example.com&token=mysecret123"
```

### 4. カウンター更新

カウンターの値や設定を更新します（オーナー権限必要）。

**Endpoint**: `GET /visit?action=update`

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `action` | string | Yes | `"update"` |
| `url` | string | Yes | サイトのURL |
| `token` | string | Yes | オーナートークン |
| `value` | number | No | 設定する値（0以上） |
| `webhookUrl` | string | No | Webhook URL（空文字で削除） |

※ 変更したいパラメータのみ指定。何も指定しない場合は何も変更されません。

**Example Request**:

値を変更:

```bash
curl "https://api.nostalgic.llll-ll.com/visit?action=update&url=https://example.com&token=mysecret123&value=1000"
```

設定を変更:

```bash
curl "https://api.nostalgic.llll-ll.com/visit?action=update&url=https://example.com&token=mysecret123&webhookUrl=https://hooks.example.com/notify"
```

---

## Like Service API

### 1. いいねボタン作成

サイトのいいねボタンを新規作成します。

**Endpoint**: `GET /like?action=create`

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `action` | string | Yes | `"create"` |
| `url` | string | Yes | サイトのURL |
| `token` | string | Yes | オーナートークン（8-16文字） |
| `webhookUrl` | string | No | Webhook URL（イベント通知用） |

**Example Response**:

```json
{
  "success": true,
  "data": {
    "id": "example-b8c2d5e9",
    "url": "https://example.com"
  }
}
```

### 2. いいね切り替え

いいねの状態を切り替えます（いいね/取り消し）。

**Endpoint**: `GET /like?action=toggle`

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `action` | string | Yes | `"toggle"` |
| `id` | string | Yes | いいねボタンID |

**Example Response**:

```json
{
  "success": true,
  "data": {
    "id": "example-b8c2d5e9",
    "url": "https://example.com",
    "total": 42,
    "userLiked": true,
    "created": "2025-08-01T10:00:00.000Z",
    "lastLike": "2025-08-18T15:30:00.000Z"
  }
}
```

### 3. いいね状態取得

現在のいいね数とユーザーの状態を取得します。

**Endpoint**: `GET /like?action=get`

#### 公開モード（idで取得）

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `action` | string | Yes | `"get"` |
| `id` | string | Yes | いいねボタンID |

#### オーナーモード（url+tokenで取得）

全設定情報（webhookUrl等）を含むレスポンスを返します。

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `action` | string | Yes | `"get"` |
| `url` | string | Yes | サイトのURL |
| `token` | string | Yes | オーナートークン |

### 4. いいね設定更新

設定を更新します（オーナー権限必要）。

**Endpoint**: `GET /like?action=update`

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `action` | string | Yes | `"update"` |
| `url` | string | Yes | サイトのURL |
| `token` | string | Yes | オーナートークン |
| `webhookUrl` | string | No | Webhook URL（空文字で削除） |

※ 変更したいパラメータのみ指定。何も指定しない場合は何も変更されません。

---

## Ranking Service API

### 1. ランキング作成

新しいランキングを作成します。

**Endpoint**: `GET /ranking?action=create`

**Parameters**:
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `action` | string | Yes | - | `"create"` |
| `url` | string | Yes | - | サイトのURL |
| `token` | string | Yes | - | オーナートークン |
| `maxEntries` | number | No | `100` | 最大エントリー数（1-100） |
| `sortOrder` | string | No | `"desc"` | 並び順: `desc`, `asc` |
| `webhookUrl` | string | No | - | Webhook URL（イベント通知用） |

### 2. スコア送信

ランキングにスコアを送信します。同名のエントリーが存在する場合は上書き（UPSERT）。

**Endpoint**: `GET /ranking?action=submit`

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `action` | string | Yes | `"submit"` |
| `id` | string | Yes | ランキングID |
| `name` | string | Yes | プレイヤー名（1-50文字） |
| `score` | number | Yes | スコア |

**Example Response**:

```json
{
  "success": true,
  "data": {
    "id": "example-c9d3e6f0",
    "url": "https://example.com",
    "entries": [
      { "rank": 1, "name": "Alice", "score": 9999 },
      { "rank": 2, "name": "Bob", "score": 8500 },
      { "rank": 3, "name": "Charlie", "score": 7200 }
    ],
    "totalEntries": 3,
    "maxEntries": 100,
    "created": "2025-08-01T10:00:00.000Z"
  }
}
```

### 3. ランキング取得

ランキングデータを取得します。

**Endpoint**: `GET /ranking?action=get`

#### 公開モード（idで取得）

**Parameters**:
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `action` | string | Yes | - | `"get"` |
| `id` | string | Yes | - | ランキングID |
| `limit` | number | No | `10` | 取得件数（1-100） |

#### オーナーモード（url+tokenで取得）

全設定情報（webhookUrl等）を含むレスポンスを返します。

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `action` | string | Yes | `"get"` |
| `url` | string | Yes | サイトのURL |
| `token` | string | Yes | オーナートークン |

### 4. ランキング設定更新

設定を更新します（オーナー権限必要）。

**Endpoint**: `GET /ranking?action=update`

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `action` | string | Yes | `"update"` |
| `url` | string | Yes | サイトのURL |
| `token` | string | Yes | オーナートークン |
| `maxEntries` | number | No | 最大エントリー数（1-100） |
| `sortOrder` | string | No | 並び順: `desc`, `asc` |
| `webhookUrl` | string | No | Webhook URL（空文字で削除） |

※ 変更したいパラメータのみ指定。何も指定しない場合は何も変更されません。

### 5. エントリー削除

ランキングからエントリーを削除します（オーナー権限必要）。

**Endpoint**: `GET /ranking?action=remove`

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `action` | string | Yes | `"remove"` |
| `url` | string | Yes | サイトのURL |
| `token` | string | Yes | オーナートークン |
| `name` | string | Yes | 削除するプレイヤー名 |

### 6. ランキングクリア

全エントリーを削除します（オーナー権限必要）。

**Endpoint**: `GET /ranking?action=clear`

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `action` | string | Yes | `"clear"` |
| `url` | string | Yes | サイトのURL |
| `token` | string | Yes | オーナートークン |

---

## BBS Service API

### 1. 掲示板作成

新しい掲示板を作成します。

**Endpoint**: `GET /bbs?action=create`

**Parameters**:
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `action` | string | Yes | - | `"create"` |
| `url` | string | Yes | - | サイトのURL |
| `token` | string | Yes | - | オーナートークン |
| `title` | string | No | `"BBS"` | 掲示板タイトル |
| `messagesPerPage` | number | No | `10` | 1ページの表示件数（1-50） |
| `max` | number | No | `100` | 最大メッセージ数（1-1000） |
| `standardSelectLabel` | string | No | - | 純正セレクトのラベル |
| `standardSelectOptions` | string | No | - | 純正セレクトの選択肢（カンマ区切り） |
| `incrementalSelectLabel` | string | No | - | インクリメンタル検索セレクトのラベル |
| `incrementalSelectOptions` | string | No | - | インクリメンタル検索セレクトの選択肢（カンマ区切り） |
| `emoteSelectLabel` | string | No | - | エモートセレクトのラベル |
| `emoteSelectOptions` | string | No | - | エモートセレクトの選択肢（カンマ区切り） |
| `webhookUrl` | string | No | - | Webhook URL |

### 2. メッセージ投稿

掲示板にメッセージを投稿します。IPアドレス制限により1分間に5投稿まで。

**Endpoint**: `GET /bbs?action=post`

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `action` | string | Yes | `"post"` |
| `id` | string | Yes | 掲示板ID |
| `author` | string | No | 投稿者名（最大20文字、未指定時は"匿名"） |
| `message` | string | Yes | メッセージ（1-200文字） |
| `standardValue` | string | No | 標準セレクト値 |
| `incrementalValue` | string | No | インクリメンタル検索セレクト値 |
| `emoteValue` | string | No | エモートセレクト値 |

**Example Response**:

```json
{
  "success": true,
  "data": {
    "id": "msg_1234567890",
    "author": "田中太郎",
    "message": "こんにちは！",
    "standardValue": "東京",
    "incrementalValue": "晴れ",
    "emoteValue": "😊",
    "timestamp": "2025-08-18T15:30:00.000Z",
    "isOwner": false
  }
}
```

### 3. メッセージ編集

メッセージを編集します（投稿者またはオーナー権限必要）。

#### 投稿者による編集

**Endpoint**: `GET /bbs?action=update`

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `action` | string | Yes | `"update"` |
| `id` | string | Yes | 掲示板ID |
| `messageId` | string | Yes | メッセージID |
| `message` | string | Yes | 新しいメッセージ（1-200文字） |

#### オーナーによる編集

**Endpoint**: `GET /bbs?action=update`

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `action` | string | Yes | `"update"` |
| `url` | string | Yes | サイトのURL |
| `token` | string | Yes | オーナートークン（8-16文字） |
| `messageId` | string | Yes | メッセージID |
| `message` | string | Yes | 新しいメッセージ（1-200文字） |

#### 設定更新（messageIdなし）

**Endpoint**: `GET /bbs?action=update`

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `action` | string | Yes | `"update"` |
| `url` | string | Yes | サイトのURL |
| `token` | string | Yes | オーナートークン |
| `messagesPerPage` | number | No | 1ページの表示件数（1-50） |
| `max` | number | No | 最大メッセージ数（1-1000） |
| `webhookUrl` | string | No | Webhook URL（空文字で削除） |

※ `messageId`パラメータがない場合、設定更新として処理されます。
※ 変更したいパラメータのみ指定。何も指定しない場合は何も変更されません。

### 4. メッセージ削除

メッセージを削除します（投稿者またはオーナー権限必要）。

#### 投稿者による削除

**Endpoint**: `GET /bbs?action=remove`

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `action` | string | Yes | `"remove"` |
| `id` | string | Yes | 掲示板ID |
| `messageId` | string | Yes | メッセージID |

#### オーナーによる削除

**Endpoint**: `GET /bbs?action=remove`

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `action` | string | Yes | `"remove"` |
| `url` | string | Yes | サイトのURL |
| `token` | string | Yes | オーナートークン |
| `messageId` | string | Yes | メッセージID |

### 5. メッセージ一覧取得

掲示板のメッセージ一覧を取得します。

**Endpoint**: `GET /bbs?action=get`

#### 公開モード（idで取得）

**Parameters**:
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `action` | string | Yes | - | `"get"` |
| `id` | string | Yes | - | 掲示板ID |
| `page` | number | No | `1` | ページ番号 |

#### オーナーモード（url+tokenで取得）

全設定情報（webhookUrl等）を含むレスポンスを返します。

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `action` | string | Yes | `"get"` |
| `url` | string | Yes | サイトのURL |
| `token` | string | Yes | オーナートークン |
| `page` | number | No | ページ番号 |

**Example Response**:

```json
{
  "success": true,
  "data": {
    "id": "example-d0e4f7g1",
    "url": "https://example.com",
    "messages": [
      {
        "id": "msg_1234567890",
        "author": "田中太郎",
        "message": "こんにちは！",
        "standardValue": "東京",
        "incrementalValue": "晴れ",
        "emoteValue": "😊",
        "timestamp": "2025-08-18T15:30:00.000Z",
        "isOwner": false
      }
    ],
    "pagination": {
      "page": 1,
      "totalPages": 3,
      "totalMessages": 25,
      "hasNext": true,
      "hasPrev": false
    },
    "settings": {
      "title": "📝 BBS",
      "messagesPerPage": 10,
      "maxMessages": 100,
      "standardSelect": {
        "label": "地域",
        "options": ["東京", "大阪", "名古屋"]
      },
      "incrementalSelect": {
        "label": "天気",
        "options": ["晴れ", "曇り", "雨"]
      },
      "emoteSelect": {
        "label": "気分",
        "options": ["😊", "😢", "😡", "😴"]
      }
    }
  }
}
```

### 6. 全メッセージクリア

掲示板の全メッセージを削除します（オーナー権限必要）。

**Endpoint**: `GET /bbs?action=clear`

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `action` | string | Yes | `"clear"` |
| `url` | string | Yes | サイトのURL |
| `token` | string | Yes | オーナートークン |

---

## 共通パラメータ

### 公開ID形式

各サービスのIDは以下の形式で生成されます：

```
{domain}-{hash8桁}
```

例:

- `blog-a7b9c3d4`
- `mysite-b8c2d5e9`

### トークン

- 長さ: 8-16文字
- 使用可能文字: 英数字、記号
- SHA256でハッシュ化して保存

### 日付形式

すべての日付はISO 8601形式：

```
2025-08-18T15:30:00.000Z
```

---

## 使用例

### Web Componentsでの利用

```html
<!-- カウンター表示 -->
<script src="https://nostalgic.llll-ll.com/components/visit.js"></script>
<nostalgic-counter id="blog-a7b9c3d4" type="total" theme="kawaii"></nostalgic-counter>
```

### JavaScriptでの利用

```javascript
// カウンターをインクリメント
fetch("https://api.nostalgic.llll-ll.com/visit?action=increment&id=blog-a7b9c3d4")
  .then((res) => res.json())
  .then((data) => {
    if (data.success) {
      console.log("Total count:", data.data.total);
    }
  });

// いいねトグル
fetch("https://api.nostalgic.llll-ll.com/like?action=toggle&id=blog-b8c2d5e9")
  .then((res) => res.json())
  .then((data) => {
    if (data.success) {
      console.log("Liked:", data.data.userLiked);
      console.log("Total likes:", data.data.total);
    }
  });
```

### cURLでの利用

```bash
# ランキング作成
curl "https://api.nostalgic.llll-ll.com/ranking?action=create&url=https://mygame.com&token=mysecret123&maxEntries=20"

# スコア送信
curl "https://api.nostalgic.llll-ll.com/ranking?action=submit&id=mygame-c9d3e6f0&name=Player1&score=12345"

# BBS作成（3つのセレクト機能付き）
curl "https://api.nostalgic.llll-ll.com/bbs?action=create&url=https://myblog.com&token=mytoken123&title=私のBBS&standardSelectLabel=地域&standardSelectOptions=東京,大阪,名古屋&incrementalSelectLabel=天気&incrementalSelectOptions=晴れ,曇り,雨&emoteSelectLabel=気分&emoteSelectOptions=😊,😢,😡,😴"

# BBSメッセージ投稿（セレクト値含む）
curl "https://api.nostalgic.llll-ll.com/bbs?action=post&id=myblog-a1b2c3d4&author=太郎&message=今日はいい天気ですね！&standardValue=東京&incrementalValue=晴れ&emoteValue=😊"
```

---

## レート制限

無料運用のため、以下の制限があります：

- リクエスト: 100req/分 per IP
- カウンター: 同一IPから1日1回のみカウント（0時リセット）
- いいね: 同一ユーザーの状態はその日の終わりまで保持（0時リセット）
- BBS: 同一IPから1分に5投稿まで

## エラー時の対処

### 400 Bad Request

パラメータが不正です。エラーメッセージを確認してください。

### 403 Forbidden

トークンが間違っているか、権限がありません。

### 404 Not Found

指定されたIDのリソースが存在しません。

### 422 Unprocessable Entity

ビジネスロジックエラー（例：ランキングの最大エントリー数超過）

### 500 Internal Server Error

サーバーエラーです。時間をおいて再試行してください。
