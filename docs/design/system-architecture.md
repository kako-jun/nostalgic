# Nostalgic System Architecture

最終更新: 2026-06-01

この文書は Nostalgic の実装構造の正本である。利用者向け API 仕様は
`docs/user-guide/`、見た目の設計は `DESIGN.md` と
`docs/development/design-philosophy.md` を参照する。

## 目的

Nostalgic は、カウンター・いいね・ランキング・BBS・招き猫を、静的サイトや
README に埋め込める Web ツールとして提供する。API は Cloudflare Workers +
D1、管理・デモ UI は React、第三者サイトへの設置面は Web Components と
画像 URL で構成する。

## 実行単位

| 層             | パス                              | 責務                                           |
| -------------- | --------------------------------- | ---------------------------------------------- |
| API Worker     | `apps/api/src/index.ts`           | CORS、rate limit、各サービス route の mount    |
| API routes     | `apps/api/src/routes/*.ts`        | サービス別の create/get/update/delete/mutation |
| API core       | `apps/api/src/lib/core/`          | token、ID、日付、hash、webhook、共通型         |
| D1 schema      | `apps/api/schema.sql`             | 永続化スキーマ                                 |
| Web app        | `apps/web/src/`                   | Nostalgic 本体サイト、デモ、API 操作用 UI      |
| Web Components | `apps/web/public/components/*.js` | 第三者サイトに貼る埋め込み部品                 |

`apps/web/dist/` はビルド成果物であり、設計判断の正本にしない。

## サービス ID と永続化

サービスは `services.id` に `type:publicId` の形で登録する。
サービスごとの実データは用途別テーブルに分ける。

| サービス | メタデータ                    | 実データ                                                          | ユーザー状態                                         |
| -------- | ----------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------- |
| Counter  | `services(id='counter:{id}')` | `counters('counter:{id}:total')`, `counter_daily('counter:{id}')` | `daily_actions('counter:{id}', action_type='visit')` |
| Like     | `services(id='like:{id}')`    | `likes('like:{id}:total')`                                        | `daily_actions('like:{id}', action_type='like')`     |
| Ranking  | `services(id='ranking:{id}')` | `ranking_scores('ranking:{id}')`                                  | `daily_actions` for submit identity                  |
| BBS      | `services(id='bbs:{id}')`     | `bbs_messages('bbs:{id}')`                                        | message `user_hash`                                  |
| Yokoso   | `services(id='yokoso:{id}')`  | `services.metadata`                                               | none                                                 |

`url_mappings` は owner-mode lookup 用であり、公開埋め込みは public ID を使う。

## 読み取りと書き込みの境界

Nostalgic は「表示」と「イベント」を分ける。

- `get`, `batchGet`, `sumByPrefix`: 表示用の読み取り
- `create`, `update`, `delete`, `batchCreate`: 管理操作
- `increment`, `toggle`, `submit`, `post`, `remove`, `clear`: ユーザーイベントまたは状態変更

Counter の `increment` は閲覧イベントであり、表示取得ではない。複数ページや一覧の
都合で `increment` をまとめる API は作らない。

## Web Components の境界

`apps/web/public/components/*.js` は、React アプリとは独立して第三者ページで動く。

- Shadow DOM 内で完結する
- 設置者がビルドツールを持たない前提で素の JavaScript にする
- `id` がなければエラー表示し、ページ全体を壊さない
- ビジネスルールの検証は API に任せる
- 同じページ内の重複通信は JS 側で抑制する

React 側の `apps/web/src/config/services/*Steps.tsx` は操作 UI の定義データである。
Web Components の runtime state と混ぜない。

## CORS と HTTP method

`apps/api/src/index.ts` で CORS と rate limit をまとめて扱う。

- `GET` / `HEAD` / `OPTIONS` / `batchGet`: 第三者埋め込みのため `origin: "*"`
- mutation や token を含む操作: POST body を使い、許可 origin を絞る
- `batchGet` は読み取りだが、大量 ID を扱うため POST body を使う

React 側の `apps/web/src/utils/apiHelpers.ts` と `apps/web/src/hooks/useFetchApi.ts`
は、token や POST action を URL から body に移す責務を持つ。

## 現在の設計上の注意点

- `visit.ts` / `like.ts` には `batchGet` がある。Web Components はこれを内部利用して読み取りを集約する
- `like` の `batchGet` は `id` / `total` / 現在ユーザーの `liked` を返す正規の一覧取得 API とする
- `visit` の `batchGet` は `id` / `total` / `today` / `yesterday` / `week` / `month` を返す正規の一覧取得 API とする
- `ranking` / `bbs` / `yokoso` には、重い内容一覧の `batchGet` ではなく URL owner の存在確認だけを行う
  `lookup` / `batchLookup` がある。静的サイトのビルド時に「この URL にサービスがあるか」「公開 ID は何か」
  をまとめて確認するための API で、token は POST body に置く。
- `ranking` / `bbs` / `yokoso` の Web Components は、通常1ページに1個（singleton）運用なので、
  同一 ID の読み取りはクライアント側の **in-flight dedupe + 短期 TTL 読み取りキャッシュ**
  （静的 `sharedRead(key, url)`）で1リクエストに畳む。
- **実トラフィック削減の本体は TTL キャッシュ**。実機検証（Playwright）で、複数ウィジェットは
  同時並行ではなく**逐次ロード**されると判明したため、in-flight dedupe（同時並行のみ畳む）だけでは
  別ウィジェットの重複が消えない。逐次の2個目を畳むのは TTL キャッシュ側。よって全 service に
  TTL を入れる: `ranking` / `yokoso` は読み取り専用で 5s、`bbs` は揮発的（多人数投稿）なので短め 3s。
- `bbs` は自分の投稿/編集/削除後に `invalidateId` で `(id, *)` の cache/in-flight を破棄してリロードを
  最新化する（他者投稿による stale は最長 TTL=3s で解消）。
- 検証: 6ウィジェット（各 service 2個）→ 実 GET 3本（各 service 1本）に畳まれることを実機で確認済み。
- 将来、同一ページに同種ウィジェットを多数並べる実利用が出たら、そのとき内容一覧の複数 ID batch API を別途検討する
