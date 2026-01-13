# 未実装機能

## 実装済み

### ~~WebHook送信~~ ✅

- **状態**: 実装完了
- **実装内容**: Discord/Slack両対応、5秒タイムアウト、非同期送信（エラー時はログのみ）
- **対象イベント**:
  - Counter: increment時 → `📊 カウンター更新: {count}`
  - Like: toggle時 → `❤️ いいねされました！` / `💔 いいねが解除されました`
  - Ranking: submit時 → `🏆 ランキング更新: {name} - {score}`
  - BBS: post時 → `📝 新しい投稿 by {author}: {message}`
- **実装箇所**: `apps/api/src/lib/core/webhook.ts`, `apps/api/src/routes/*.ts`

---

## 未実装

### カウンター画像テーマ

- **状態**: 実装中
- **変更点**:
  - `format=svg` を廃止、`format=image` に統一 ✅
  - `theme` パラメータに画像テーマを追加
- **画像テーマ**:
  - `mahjong`: 麻雀牌（萬子）- 一萬〜九萬 + 零萬
  - `segment`: 7セグメントLED - 発光感のあるデジタル表示
  - `nixie`: ニキシー管 - オレンジグロー、ガラス管
  - `dots_f`: ドット絵 - FF5風レトロRPGスタイル
- **実装箇所**: `apps/api/src/routes/visit.ts`

---

_最終更新: 2026-01-09_
