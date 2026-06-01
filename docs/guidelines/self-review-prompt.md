# Self Review Prompt

Nostalgic の実装後レビューでは、次を順に確認する。

1. 仕様と docs
   - 公開 API を変えたなら `docs/user-guide/` が更新されているか
   - 責務境界を変えたなら `docs/design/system-architecture.md` が更新されているか
   - Web Components の防御方針から外れていないか

2. 読み取りとイベント
   - `get` / `batchGet` と `increment` / `toggle` / `submit` / `post` が混ざっていないか
   - Counter の一覧表示で `increment` していないか
   - `batchIncrement` 相当の挙動を作っていないか

3. 定義データと状態
   - `apps/web/src/config/services/*Steps.tsx` に runtime state が入っていないか
   - Web Components の static state はページ全体で共有すべき cache/queue だけか
   - API route に UI 固有の都合が漏れていないか

4. D1 と ID
   - `service_id` の prefix/suffix が既存規則と一致しているか
   - batch response で public ID を壊していないか
   - user hash / daily action の粒度が service と action に合っているか

5. 埋め込み互換性
   - 既存タグがそのまま動くか
   - Markdown/README 用の画像 URL を壊していないか
   - 第三者 origin の CORS を壊していないか

6. 検証
   - TypeScript/build/lint の該当コマンドを実行したか
   - Web Components 変更では Network 件数または fetch 呼び出し数を確認したか
   - rate limit 回避を実装した場合、単に制限値を上げただけで終わっていないか
