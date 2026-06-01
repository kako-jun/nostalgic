# Implementation Guidelines

最終更新: 2026-06-01

この文書は Nostalgic の実装規約である。構造の説明は
`docs/design/system-architecture.md`、公開 API の説明は `docs/user-guide/` を参照する。

## 1. docs を正本にする

API の公開仕様を変えるときは `docs/user-guide/` を更新する。実装構造や責務境界を
変えるときは `docs/design/system-architecture.md` を更新する。Web Components の
防御的な書き方は `docs/development/webcomponents-defensive-programming.md` を
正本にする。

## 2. 定義データと実行時状態を分ける

不変の定義と実行時に変わる状態を同じモジュールに混ぜない。

| 種別         | 例                                        | 規約                                                     |
| ------------ | ----------------------------------------- | -------------------------------------------------------- |
| 定義データ   | `apps/web/src/config/services/*Steps.tsx` | UI 手順と field 定義だけを置く                           |
| 定義データ   | `apps/web/src/config/embedConfigs.ts`     | 埋め込みコードの定義だけを置く                           |
| 定義データ   | `apps/api/src/lib/core/constants.ts`      | service 共通の定数だけを置く                             |
| 実行時状態   | React `useState`                          | ページコンポーネントに閉じる                             |
| 実行時状態   | Web Component instance fields             | component instance に閉じる                              |
| 共有 runtime | Web Component static cache / queue        | 取得重複排除など、ページ全体で共有する必要があるものだけ |

新しい設定を追加するときは、まず定義データの型と置き場を決め、その後に処理をつなぐ。

## 3. 読み取りとイベントを分ける

読み取りは集約してよい。イベントは勝手に集約しない。

- `get` / `batchGet` / `sumByPrefix` は表示用の読み取り
- Counter `increment` は閲覧イベント
- Like `toggle` はユーザー操作イベント
- Ranking `submit` と BBS `post` はユーザー投稿イベント

`batchIncrement` は作らない。Counter の一覧表示やデモ表示では `batchGet` を使い、
個別ページや実際の閲覧地点だけで `increment` を単発実行する。

## 4. Web Components は設置者に batching を意識させない

第三者サイトの設置コードは独立したタグのままでよい。

```html
<script src="https://nostalgic.llll-ll.com/components/like.js"></script>
<nostalgic-like id="example" theme="light" icon="heart"></nostalgic-like>
<nostalgic-like id="example" theme="dark" icon="star"></nostalgic-like>
```

内部実装はページ全体で読み取りを集約する。

- service 種別ごとに queue を持つ
- 同一 ID は重複排除する
- theme / icon / format / 見た目グループで通信を分けない
- API 上限を超えるときだけ chunk する
- 短い待ち時間で同時 mount を同じ便に乗せる
- 短い TTL cache で同一ページ内の再取得を抑える

## 5. API route は service 単位に閉じる

`apps/api/src/routes/{service}.ts` は、その service の公開 action を完結して扱う。
共通化する場合は `apps/api/src/lib/core/` に置く。

route を増やすときは次を揃える。

- GET public mode と POST owner/mutation mode の境界
- token を query string に残さない
- D1 の `service_id` 命名
- `docs/user-guide/services/{service}.md`
- デモ UI の `apps/web/src/config/services/{service}Steps.tsx`
- Web Component がある場合は `apps/web/public/components/{service}.js`

## 6. D1 では ID 形式を先に決める

テーブルごとの `service_id` 形式を曖昧にしない。

- service metadata: `{type}:{id}`
- counter total: `counter:{id}:total`
- counter daily: `counter:{id}`
- like total: `like:{id}:total`
- like user state: `like:{id}`

`batchGet` などで ID を戻すときは、prefix/suffix の除去規則をテスト可能な小さな関数に
切り出す。`batchGet` は古い最小レスポンスに合わせず、各 service の `get` と同じ意味を
持つ正規データを返す。

## 7. Web Components の防御はクラッシュ防止に限定する

Web Components 側で過度な validation をしない。ユーザー入力の妥当性、文字数制限、
権限、存在確認は API の責務である。JS 側では DOM 要素の存在確認、`id` 欠落時の
エラー表示、network error 時の fallback だけを行う。

## 8. 画像 URL と Web Component を混同しない

README や Markdown 用の画像 URL は `<img>` として直接 API を叩く前提でよい。
通常の Web ページ向け Web Components は JS が取得を制御できるので、同一ページ内の
通信を dedupe/cache する。両者を同じ実装制約で扱わない。

## 9. 検証

変更の種類ごとに最低限の確認を行う。

- API 変更: `pnpm --filter @nostalgic/api exec tsc --noEmit`
- Web app / React 変更: `pnpm --filter @nostalgic/web build`
- repo 全体の静的確認: `pnpm lint`
- Web Components の通信制御: ブラウザで Network 件数を確認するか、fetch mock で同一 ID の呼び出し数を確認する

Cloudflare Workers / D1 の本番挙動に関わる変更は、local build だけで完了扱いにしない。
可能なら `wrangler dev` か staging 相当で action ごとの実リクエストを確認する。
