# Nostalgic - プロジェクト目次

## プロジェクト概要

昔のWebツールを最新技術で復活させた総合プラットフォーム。Cloudflare Workers + D1 + Hono で実装。

## 📚 重要ドキュメント

- [**統一スキーマアーキテクチャ**](.claude/unified-schema-architecture.md) - スキーマ設計原則（新機能追加時は必読）

## 🎨 デザイン・UX設計

- [**Design Philosophy**](.claude/design-philosophy.md) - デザイン哲学（機能はレトロ、見た目は現代ポップ）

## 🚀 将来機能計画

- [**6テーマシステム拡張**](.claude/six-theme-expansion.md) - 6テーマシステム完了（light/dark/retro/kawaii/mom/final）
- [**カウンター画像化システム**](.claude/counter-image-system.md) - SVG数字画像ベースカウンター計画
- [**BBSセレクト機能拡張**](.claude/bbs-select-system-expansion.md) - 3種類セレクト機能の詳細設計

## 🛠️ 設計ドキュメント（開発用）

- [**API Specification**](.claude/api-specification.md) - APIの完全仕様書
- [**BBS Design**](.claude/bbs-design.md) - BBS機能の設計書
- [**WebComponents Design**](.claude/webcomponents-defensive-programming.md) - WebComponentsの設計方針

## 実装済み機能（4サービス）

### 📊 Counter Service

- ✅ 複数期間統計（累計・今日・昨日・週間・月間）
- ✅ 1日1回重複防止（0時リセット）
- ✅ SVG画像生成（6スタイル：light/dark/retro/kawaii/mom/final）
- ✅ Web Components による埋め込み

### 💖 Like Service

- ✅ トグル型いいね/取り消し機能
- ✅ ユーザー状態管理（IP+UserAgent）
- ✅ 1日1回制限（0時リセット）
- ✅ 即座のフィードバック

### 🏆 Ranking Service

- ✅ SQLite ORDER BYによる自動ソート
- ✅ スコア管理（submit/update/remove/clear）
- ✅ 最大エントリー数制限
- ✅ フォーマット済みスコア表示（displayScore）

### 💬 BBS Service

- ✅ メッセージ投稿・取得
- ✅ カスタマイズ可能なドロップダウン（3つ）
- ✅ アイコン選択機能
- ✅ 固定高さ表示（400px）、最新メッセージから表示
- ✅ 投稿者による自分の投稿編集・削除

## API構成（統一アクション型・GET専用）

```
/api/{service}?action={action}&url={URL}&token={TOKEN}&...params
```

### GET専用の理由（1990年代Web文化復活）

- ブラウザのURL欄で全操作が可能
- リンククリックだけでサービス作成
- 掲示板の書き込みもGETパラメータ（昔のまま）
- 共有可能なURL、シンプルな操作性

### サービス別エンドポイント

- `/api/visit` - カウンター（create/increment/display/set/delete）
- `/api/like` - いいね（create/toggle/get/delete）
- `/api/ranking` - ランキング（create/submit/get/remove/clear/delete）
- `/api/bbs` - BBS（create/post/get/update/remove/clear/delete）

## データ構造（D1 SQLite）

### テーブル一覧

```sql
services        -- サービス共通メタデータ
url_mappings    -- URL → ID マッピング
owner_tokens    -- オーナートークン（認証用）
counters        -- カウンター累計
counter_daily   -- カウンター日別
likes           -- いいね累計
ranking_scores  -- ランキングスコア
bbs_messages    -- BBSメッセージ
daily_actions   -- 日次アクション（重複防止）
rate_limits     -- レート制限
```

## 公開ID形式

`{domain}-{hash8桁}` (例: blog-a7b9c3d4)

## ファイル構成

### API（Cloudflare Workers）

```
api/
├── src/
│   ├── index.ts              # エントリーポイント（Hono）
│   ├── routes/
│   │   ├── visit.ts          # カウンターAPI
│   │   ├── like.ts           # いいねAPI
│   │   ├── ranking.ts        # ランキングAPI
│   │   └── bbs.ts            # BBS API
│   └── lib/core/
│       ├── auth.ts           # 認証機能
│       ├── crypto.ts         # ハッシュ生成
│       ├── db.ts             # DB関連ユーティリティ
│       ├── id.ts             # ID生成
│       └── constants.ts      # 定数
├── schema.sql                # D1スキーマ
├── wrangler.toml             # Cloudflare設定
└── package.json
```

### Frontend（Vite + React）

```
web/
├── src/
│   ├── components/           # UIコンポーネント
│   ├── pages/                # ページ
│   ├── hooks/                # カスタムフック
│   └── utils/                # ユーティリティ
├── public/
│   └── components/           # Web Components
└── package.json
```

### Documentation

- `docs/api.md` - 総合API仕様
- `docs/services/` - サービス別詳細文書（英語・日本語）
- `.claude/` - 開発用設計ドキュメント

## メンテナンス・管理

### データ確認・管理

```bash
# D1データベースの確認（ローカル）
cd api && pnpm db:local "SELECT * FROM services"

# D1データベースの確認（本番）
cd api && pnpm db:remote "SELECT * FROM services"
```

### データ削除

```bash
# API経由削除（トークンが分かる場合）
curl "https://nostalgic.llll-ll.com/api/visit?action=delete&url={URL}&token={TOKEN}"
curl "https://nostalgic.llll-ll.com/api/like?action=delete&url={URL}&token={TOKEN}"
curl "https://nostalgic.llll-ll.com/api/ranking?action=delete&url={URL}&token={TOKEN}"
curl "https://nostalgic.llll-ll.com/api/bbs?action=delete&url={URL}&token={TOKEN}"
```

## 使用方法

### 1. サービス作成

ブラウザのアドレスバーに直接入力：

```
https://nostalgic.llll-ll.com/api/{service}?action=create&url=https://example.com&token=your-secret
```

### 2. 操作

```
# カウントアップ
https://nostalgic.llll-ll.com/api/visit?action=increment&id=your-id

# いいねトグル
https://nostalgic.llll-ll.com/api/like?action=toggle&url=https://example.com&token=your-secret

# スコア送信
https://nostalgic.llll-ll.com/api/ranking?action=submit&url=https://example.com&token=your-secret&name=Player&score=1000

# メッセージ投稿（純粋なGET、1990年代スタイル）
https://nostalgic.llll-ll.com/api/bbs?action=post&url=https://example.com&token=your-secret&author=User&message=Hello
```

### 3. 埋め込み（Counter例）

```html
<script src="/components/visit.js"></script>
<nostalgic-counter id="your-id" type="total" theme="dark"></nostalgic-counter>
```

## セキュリティ

- オーナートークンはSHA256でハッシュ化保存
- 公開IDは表示専用（管理操作不可）
- IP+UserAgent+日付での重複防止
- 投稿者確認による編集権限管理
- トークン長8-16文字制限

## 開発・デプロイ

```bash
# 開発サーバー起動（API + Web 並列）
pnpm dev

# APIのみ
cd api && pnpm dev

# Webのみ
cd web && pnpm dev

# 本番デプロイ（Cloudflare Workers）
pnpm deploy

# D1スキーマ初期化（ローカル）
cd api && pnpm db:init
```

## 技術スタック

- Cloudflare Workers
- D1 (SQLite)
- Hono
- Vite + React
- TypeScript
- Tailwind CSS
- Web Components
