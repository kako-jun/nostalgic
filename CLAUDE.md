# Nostalgic

昔のWebツール（カウンター・いいね・ランキング・BBS・招き猫）を現代技術で復活させたプラットフォーム。

## 技術スタック

- Cloudflare Workers + D1 (SQLite) + Hono
- Vite + React + TypeScript
- Web Components

## ドキュメント

- [ユーザーガイド](docs/user-guide/index.md) - API仕様、使い方
- [開発ドキュメント](docs/development/) - 設計思想、将来計画
- [未実装機能](docs/development/TODO.md) - 実装待ちの機能一覧

## 開発

```bash
pnpm dev      # 開発サーバー起動
pnpm deploy   # 本番デプロイ
```

## ディレクトリ構成

```
apps/api/     # Cloudflare Workers API
apps/web/     # フロントエンド + Web Components
docs/         # ドキュメント（正）
```
