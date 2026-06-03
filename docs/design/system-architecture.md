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
- `ranking` / `bbs` / `yokoso` には batch API を設けない。これらは1ページに通常1個（singleton）運用で、
  複数 ID batch の価値が薄いため。代わりに各 Web Component にクライアント側の
  **in-flight dedupe + 短期 TTL 読み取りキャッシュ**（静的 `sharedRead(key, url)`）を入れ、同時並行の
  同一 ID GET を1本に畳む。`ranking` / `yokoso` は読み取り専用なので 5s TTL キャッシュ込み、
  `bbs` は内容が揮発的（多人数投稿）かつページング有りのため **dedupe のみ（TTL=0）** とし、
  自分の投稿/削除後は `invalidateId` で in-flight を破棄してリロードを最新化する。
  将来、同一ページに同種ウィジェットを多数並べる実利用が出たら、そのとき複数 ID batch API を別途検討する
