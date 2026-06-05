/**
 * method-routing のテスト
 *
 * 全サービスの書き込み系アクションが GET（query パラメータ）でも受理されることを、
 * ルーティング層（メソッド分岐）で確認する。DB に到達する前のバリデーション
 * エラーメッセージを使い、「Invalid action for GET」で弾かれずに各アクションの
 * 分岐へ到達していることを検証する（DB を使う網羅テストは別途）。
 *
 * - GET で書き込み系アクションが各 action 分岐に到達する
 * - POST（JSON body）も従来どおり同じ分岐に到達する
 * - batch 系（batchGet / batchCreate / batchLookup）は POST 専用のまま
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import visitApp from "./visit.ts";
import likeApp from "./like.ts";
import rankingApp from "./ranking.ts";
import bbsApp from "./bbs.ts";
import yokosoApp from "./yokoso.ts";

// バリデーションが DB アクセスより先に走るため、DB スタブは未使用のままでよい
const env = { DB: undefined as unknown as D1Database };

async function getJson(
  app: { request: (path: string, init: RequestInit, env: unknown) => Promise<Response> },
  path: string,
  method: "GET" | "POST" = "GET",
  body?: unknown
): Promise<{ status: number; json: { error?: string } }> {
  const init: RequestInit =
    method === "POST"
      ? {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body ?? {}),
        }
      : { method };
  const res = await app.request(path, init, env);
  return { status: res.status, json: (await res.json()) as { error?: string } };
}

test("GET: visit の書き込み系アクションが action 分岐に到達する", async () => {
  // create（url/token 不足 → そのアクションのバリデーションエラー）
  const create = await getJson(visitApp, "/?action=create");
  assert.equal(create.status, 400);
  assert.equal(create.json.error, "url and token are required");

  // update
  const update = await getJson(visitApp, "/?action=update");
  assert.equal(update.json.error, "url and token are required");

  // set
  const set = await getJson(visitApp, "/?action=set");
  assert.equal(set.json.error, "url, token, and value are required");

  // delete
  const del = await getJson(visitApp, "/?action=delete");
  assert.equal(del.json.error, "url and token are required");

  // increment（従来から GET 対応）
  const inc = await getJson(visitApp, "/?action=increment");
  assert.equal(inc.json.error, "id is required");
});

test("GET: like の toggle / 書き込み系アクションが action 分岐に到達する", async () => {
  const toggle = await getJson(likeApp, "/?action=toggle");
  assert.equal(toggle.status, 400);
  assert.equal(toggle.json.error, "id is required");

  const create = await getJson(likeApp, "/?action=create");
  assert.equal(create.json.error, "url and token are required");

  const update = await getJson(likeApp, "/?action=update");
  assert.equal(update.json.error, "url and token are required");

  const del = await getJson(likeApp, "/?action=delete");
  assert.equal(del.json.error, "url and token are required");
});

test("GET: bbs の post / update / remove / clear / delete が action 分岐に到達する", async () => {
  const post = await getJson(bbsApp, "/?action=post");
  assert.equal(post.status, 400);
  assert.equal(post.json.error, "id and message are required");

  const update = await getJson(bbsApp, "/?action=update");
  assert.equal(update.json.error, "messageId and message are required");

  const remove = await getJson(bbsApp, "/?action=remove");
  assert.equal(remove.json.error, "messageId is required");

  const clear = await getJson(bbsApp, "/?action=clear");
  assert.equal(clear.json.error, "url and token are required");

  const del = await getJson(bbsApp, "/?action=delete");
  assert.equal(del.json.error, "url and token are required");

  const create = await getJson(bbsApp, "/?action=create");
  assert.equal(create.json.error, "url and token are required");
});

test("GET: ranking の submit / 書き込み系アクションが action 分岐に到達する", async () => {
  const submit = await getJson(rankingApp, "/?action=submit");
  assert.equal(submit.status, 400);
  assert.equal(submit.json.error, "id and score are required");

  const create = await getJson(rankingApp, "/?action=create");
  assert.equal(create.json.error, "url and token are required");

  const remove = await getJson(rankingApp, "/?action=remove");
  assert.equal(remove.json.error, "url, token, and name are required");

  const clear = await getJson(rankingApp, "/?action=clear");
  assert.equal(clear.json.error, "url and token are required");
});

test("GET: yokoso の create / update / delete が action 分岐に到達する", async () => {
  const create = await getJson(yokosoApp, "/?action=create");
  assert.equal(create.status, 400);
  assert.equal(create.json.error, "url, token, and message are required");

  const update = await getJson(yokosoApp, "/?action=update");
  assert.equal(update.json.error, "url and token are required");

  const del = await getJson(yokosoApp, "/?action=delete");
  assert.equal(del.json.error, "url and token are required");
});

test("GET: lookup が query パラメータで action 分岐に到達する", async () => {
  for (const app of [rankingApp, bbsApp, yokosoApp]) {
    const lookup = await getJson(app, "/?action=lookup");
    assert.equal(lookup.status, 400);
    assert.equal(lookup.json.error, "url and token are required for lookup");
  }
});

test("POST: JSON body でも従来どおり同じ分岐に到達する（body 優先経路）", async () => {
  // body も query も空 → 各アクションのバリデーションエラー（「Invalid action」ではない）
  const toggle = await getJson(likeApp, "/?action=toggle", "POST", {});
  assert.equal(toggle.json.error, "id is required");

  const post = await getJson(bbsApp, "/?action=post", "POST", {});
  assert.equal(post.json.error, "id and message are required");

  const create = await getJson(visitApp, "/?action=create", "POST", {});
  assert.equal(create.json.error, "url and token are required");
});

test("batch 系は POST 専用のまま（GET は明示エラー）", async () => {
  const batchGetVisit = await getJson(visitApp, "/?action=batchGet");
  assert.equal(batchGetVisit.status, 400);
  assert.equal(batchGetVisit.json.error, "batchGet requires POST with a JSON body");

  const batchCreateVisit = await getJson(visitApp, "/?action=batchCreate");
  assert.equal(batchCreateVisit.json.error, "batchCreate requires POST with a JSON body");

  const batchGetLike = await getJson(likeApp, "/?action=batchGet");
  assert.equal(batchGetLike.json.error, "batchGet requires POST with a JSON body");

  for (const app of [rankingApp, bbsApp, yokosoApp]) {
    const batchLookup = await getJson(app, "/?action=batchLookup");
    assert.equal(batchLookup.json.error, "batchLookup requires POST with a JSON body");
  }
});

test("不明な action は GET でも 400（メソッドではなく action の問題として返る）", async () => {
  const res = await getJson(visitApp, "/?action=unknown");
  assert.equal(res.status, 400);
  assert.ok(res.json.error?.startsWith("Invalid action."));
  assert.ok(!res.json.error?.includes("Invalid action for GET"));
});
