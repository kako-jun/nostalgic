# 未実装機能

## 必須

### WebHook送信

- **状態**: 設定保存のみ実装、送信処理なし
- **現状**: 4サービス全て（Counter, Like, Ranking, BBS）で `webhookUrl` を metadata に保存可能
- **未実装**: イベント発火時の `fetch()` 呼び出し
- **対象イベント**:
  - Counter: increment時
  - Like: toggle時
  - Ranking: submit時
  - BBS: post時
- **実装箇所**: `apps/api/src/routes/*.ts`

### カウンター画像化

- **状態**: 設計のみ、実装なし
- **設計ドキュメント**: [counter-image-system.md](./counter-image-system.md)
- **未実装**:
  - 数字素材（0-9.svg × テーマ × フォント）
  - `format="image"` + `font` パラメータの処理
  - `generateImageCounterSVG()` 関数
- **実装箇所**: `apps/api/src/routes/visit.ts`, `apps/web/public/components/visit.js`

## オプション（機能強化）

### インクリメンタル検索セレクトの検索UI

- **状態**: 単純な `<select>` として実装済み
- **設計ドキュメント**: [bbs-select-system-expansion.md](./bbs-select-system-expansion.md)
- **未実装**: 入力フィールド + ドロップダウンによる絞り込み検索
- **実装箇所**: `apps/web/public/components/bbs.js`

---

_最終更新: 2025-01-09_
