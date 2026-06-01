# Dev Doctrine Roadmap

最終更新: 2026-06-01

進捗の正本は GitHub Issue と dev note に置く。この文書は、設計先行で進めるための
phase 分割だけを持つ。

## Phase 1: Read batching の設計確定

対象 Issue: https://github.com/kako-jun/nostalgic/issues/4

実装前に決めること:

- `visit` / `like` の共通 batching client の置き場
- Web Components から使う public API
- Osaka Kenpo など外部 React app から使う形
- `like.batchGet` は `id` / `total` / `liked` を返す
- `visit.batchGet` は `id` / `total` / `today` / `yesterday` / `week` / `month` を返す

完了条件:

- `batchIncrement` を作らない方針が docs と Issue に明記されている
- Counter の一覧表示と個別閲覧の責務が分かれている
- 既存 `batchGet` の後方互換には縛られず、新しい正規レスポンスに寄せる

## Phase 2: Counter / Like の自動 batch/dedupe

対象:

- `apps/web/public/components/visit.js`
- `apps/web/public/components/like.js`
- 必要に応じて `apps/api/src/routes/visit.ts`
- 必要に応じて `apps/api/src/routes/like.ts`

方針:

- 同一ページ内の同じ service 種別をページ全体で queue する
- 同一 ID を dedupe する
- chunk 上限を明示する
- 短い TTL cache を持つ
- `increment` / `toggle` は集約しない

## Phase 3: Osaka Kenpo の明示 batchGet 移行

対象:

- `/home/d131/repos/2025/osaka-kenpo/src/app/law/[law_category]/[law]/components/ArticleListWithEeyan.tsx`
- `/home/d131/repos/2025/osaka-kenpo/src/lib/eeyan.ts`

方針:

- 条文一覧は read-only のまま
- Like と Counter の表示取得だけ共通 batching client へ寄せる
- 条文個別ページの `increment` は単発のまま

## Phase 4: Ranking / BBS / Yokoso の重複通信点検

対象:

- `apps/web/public/components/ranking.js`
- `apps/web/public/components/bbs.js`
- `apps/web/public/components/yokoso.js`

方針:

- まず同一 ID の in-flight dedupe/cache を入れる
- 複数 ID の batch API が必要かは、デモページの通信数と実利用から判断する
- batch API が必要なら Counter / Like とは別 Issue にする

## Phase 5: Rate limit の再評価

方針:

- batching/dedupe 後の通信数を測ってから `RATE_LIMIT_MAX` を判断する
- 読み取りと mutation の rate limit を分けるか検討する
- 429 を単に隠すのではなく、通信数が減ったことを Network で確認する
