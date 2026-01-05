# ランキングサービス API

## 概要

自動ソート、スコア管理、設定可能なエントリー制限を持つスコアリーダーボードシステム。

## アクション

### create

新しいランキングリーダーボードを作成。

```
GET /api/ranking?action=create&url={URL}&token={TOKEN}&max={MAX_ENTRIES}&sortOrder={SORT_ORDER}
```

**パラメータ:**

- `url` (必須): ランキング対象URL
- `token` (必須): オーナートークン（8-16文字）
- `max` (オプション): 最大エントリー数（1-1000、デフォルト: 100）
- `sortOrder` (オプション): ソート順 - "desc"で高スコア優先、"asc"で低タイム優先（デフォルト: "desc"）

### submit

ランキングに新しいスコアを送信（公開アクセス）。

```
GET /api/ranking?action=submit&id={ID}&name={PLAYER_NAME}&score={SCORE}
```

**パラメータ:**

- `id` (必須): 公開ランキングID
- `name` (必須): プレイヤー名（最大20文字）
- `score` (必須): スコア値（整数）

### update

既存プレイヤーのスコアを更新。

```
GET /api/ranking?action=update&url={URL}&token={TOKEN}&name={PLAYER_NAME}&score={NEW_SCORE}
```

**パラメータ:**

- `url` (必須): 対象URL
- `token` (必須): オーナートークン
- `name` (必須): プレイヤー名
- `score` (必須): 新しいスコア

**注意:** 設定変更（webhookUrl等）は`updateSettings`アクションを使用してください。

### remove

特定のプレイヤーのスコアを削除。

```
GET /api/ranking?action=remove&url={URL}&token={TOKEN}&name={PLAYER_NAME}
```

### clear

ランキングからすべてのスコアをクリア。

```
GET /api/ranking?action=clear&url={URL}&token={TOKEN}
```

### get

ランキングデータを取得（公開アクセス）。

```
GET /api/ranking?action=get&id={ID}&limit={LIMIT}
```

**パラメータ:**

- `id` (必須): 公開ランキングID
- `limit` (オプション): 返却エントリー数（1-100、デフォルト: 10）

## 使用例

### 基本的なランキング設置

```javascript
// 1. スコア系ゲーム用ランキング作成（高スコア優先）
const response = await fetch(
  "/api/ranking?action=create&url=https://mygame.com&token=game-secret&max=50&sortOrder=desc"
);
const data = await response.json();
console.log("ランキングID:", data.id);

// 2. スコア送信（公開IDを使用）
await fetch("/api/ranking?action=submit&id=" + data.id + "&name=Alice&score=1000");
await fetch("/api/ranking?action=submit&id=" + data.id + "&name=Bob&score=1200");

// 3. リーダーボード取得
const ranking = await fetch("/api/ranking?action=get&id=mygame-a7b9c3d4&limit=10");
const leaderboard = await ranking.json();
console.log("上位プレイヤー:", leaderboard.entries);
// レスポンス例:
// {
//   "id": "mygame-a7b9c3d4",
//   "url": "https://mygame.com",
//   "entries": [
//     {
//       "name": "Bob",
//       "score": 1200,
//       "displayScore": "1,200",
//       "rank": 1,
//       "timestamp": "2025-08-13T10:00:00Z"
//     },
//     {
//       "name": "Alice",
//       "score": 1000,
//       "displayScore": "1,000",
//       "rank": 2,
//       "timestamp": "2025-08-13T09:30:00Z"
//     }
//   ],
//   "totalEntries": 2
// }
```

### タイム系ゲーム設置

```javascript
// 1. タイム系ゲーム用ランキング作成（低タイム優先）
const response = await fetch(
  "/api/ranking?action=create&url=https://racegame.com&token=race-secret&max=100&sortOrder=asc"
);
const data = await response.json();
console.log("レースランキングID:", data.id);

// 2. タイム送信（低い方が良い）
await fetch(
  "/api/ranking?action=submit&id=" +
    data.id +
    "&name=スピードスター&score=1750&displayScore=17.50秒"
);
await fetch(
  "/api/ranking?action=submit&id=" + data.id + "&name=レーサー&score=1820&displayScore=18.20秒"
);

// より良いタイム（17.50秒）の方が悪いタイム（18.20秒）より上位になる
```

### スコア管理

```javascript
// プレイヤースコア更新
await fetch(
  "/api/ranking?action=update&url=https://mygame.com&token=game-secret&name=Alice&score=1500"
);

// 不正プレイヤー削除
await fetch("/api/ranking?action=remove&url=https://mygame.com&token=game-secret&name=Cheater");

// 全スコアクリア（シーズンリセット）
await fetch("/api/ranking?action=clear&url=https://mygame.com&token=game-secret");
```

## 特徴

- **柔軟なソート**: 高スコア優先(desc)と低タイム優先(asc)を選択可能
- **エントリー制限**: 設定可能な最大エントリー数
- **スコア管理**: 個別スコアの送信・更新・削除
- **一括操作**: すべてのスコアを一度にクリア
- **フォーマット済みスコア表示**: カンマ区切りのdisplayScoreフィールド
- **リアルタイム更新**: 即座のリーダーボード更新
- **公開アクセス**: 公開IDでランキング閲覧

## データ構造

ランキングは効率的なソートのためD1 (SQLite)のインデックス付きORDER BYを使用：

- スコアはsortOrderに応じて自動ソート（desc=降順、asc=昇順）
- 最大エントリー数を超えると下位スコアが削除
- インデックスによる高速検索

### updateSettings

ランキング設定を更新（オーナーのみ）。

```
GET /api/ranking?action=updateSettings&url={URL}&token={TOKEN}&title={TITLE}&max={MAX_ENTRIES}&sortOrder={SORT_ORDER}&webhookUrl={WEBHOOK_URL}
```

**パラメータ:**

- `url` (必須): 対象URL
- `token` (必須): オーナートークン
- `title` (オプション): ランキングタイトル
- `max` (オプション): 最大エントリー数（1-1000）
- `sortOrder` (オプション): ソート順（"desc"で高スコア優先、"asc"で低タイム優先）
- `webhookUrl` (オプション): 通知用WebhookURL

**レスポンス:**

```json
{
  "id": "yoursite-a7b9c3d4",
  "url": "https://yoursite.com",
  "title": "ハイスコアリーダーボード",
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

## Web Component 統合

```html
<script src="https://nostalgic.llll-ll.com/components/ranking.js"></script>

<!-- インタラクティブランキング表示 -->
<nostalgic-ranking id="yoursite-a7b9c3d4" theme="light" limit="10"></nostalgic-ranking>

<!-- テキスト形式ランキング -->
<nostalgic-ranking id="yoursite-a7b9c3d4" format="text" theme="dark" limit="5"></nostalgic-ranking>
```

**属性:**

- `id`: 公開ランキングID
- `theme`: 表示スタイル（light, dark, retro, kawaii, mom, final）
- `limit`: 表示エントリー数（1-100、デフォルト: 10）
- `format`: 表示形式（interactive, text）- デフォルト: interactive
- `api-base`: カスタムAPIベースURL（オプション）

**表示特徴:**

- 横幅: 300px～500px（レスポンシブ）
- 名前とスコアの間隔: 40px
- スコア表示: カンマ区切りフォーマット（displayScore）

## TypeScript サポート

TypeScriptプロジェクトでWeb Componentsを使用する場合、プロジェクトルートに `types.d.ts` ファイルを作成してください：

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
        limit?: string;
        theme?: "light" | "dark" | "retro" | "kawaii" | "mom" | "final";
        format?: "interactive" | "text";
        url?: string;
        token?: string;
        "api-base"?: string;
      };
    }
  }
}
```

これにより、React/Next.jsプロジェクトでWeb Componentsを使用してもTypeScriptビルドエラーが発生しません。

## セキュリティ注意事項

- ランキングオーナーのみがスコア送信/変更可能
- 公開IDはリーダーボードの読み取り専用アクセス
- プレイヤー名は20文字制限
- スコア値は整数のみ
