/**
 * create の例外正規化 + app.onError の結合テスト
 *
 * 事前 existence チェック（getXxxByUrl 等）は通過させ（first() が null を返す fake）、
 * 実 INSERT の db.batch() で例外を起こして、ルート層の振る舞いを検証する。
 *
 * - UNIQUE 違反: create が既存 already-exists と同じ 400 JSON を返す（visit / bbs で代表確認）
 * - batchCreate: 競合 1 件が skipped にカウントされ created に入らない（visit / like）
 * - 非 UNIQUE の DB 例外（FOREIGN KEY）: app.onError が 500 / JSON / {"error":"Internal Server Error"}
 * - ログ汚染防止: console.error に統一プレフィックスが出て、かつ token 値が混ざらない
 * - 正常系: batch 成功時に create が 200 成功 JSON を返す
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import visitApp from "./visit.ts";
import likeApp from "./like.ts";
import bbsApp from "./bbs.ts";
import app from "../index.ts";

/**
 * 最小 fake D1。
 * - prepare().bind().first() は常に null（= 事前 existence チェックは「存在しない」を返す）
 * - prepare().bind().all() は空（batchCreate のループ前チェック用に一応用意）
 * - batch() は注入した挙動を使う。callIndex で複数回の挙動を出し分けられる
 */
function makeFakeDb(batchImpl: (callIndex: number) => Promise<unknown>): { db: D1Database } {
  let batchCount = 0;
  const stmt = {
    bind: () => ({
      first: async () => null,
      all: async () => ({ results: [] }),
      run: async () => ({ success: true }),
    }),
  };
  const db = {
    prepare: () => stmt,
    batch: () => {
      const idx = batchCount;
      batchCount++;
      return batchImpl(idx);
    },
  } as unknown as D1Database;
  return { db };
}

const uniqueError = () => Promise.reject(new Error("UNIQUE constraint failed: url_mappings.url"));
const foreignKeyError = () => Promise.reject(new Error("FOREIGN KEY constraint failed"));
const batchOk = () => Promise.resolve([{ success: true }]);

const VALID_TOKEN = "valid-token-12"; // 8-16 文字

function postInit(body: unknown): RequestInit {
  return {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

test("結合: visit create の UNIQUE 違反は既存 already-exists と同じ 400 JSON を返す", async () => {
  const { db } = makeFakeDb(uniqueError);
  const res = await visitApp.request(
    `/?action=create&url=https://example.com/visit&token=${VALID_TOKEN}`,
    { method: "GET" },
    { DB: db }
  );
  assert.equal(res.status, 400);
  const json = (await res.json()) as { error?: string };
  assert.equal(json.error, "Counter already exists for this URL");
});

test("結合: bbs create の UNIQUE 違反は既存 already-exists と同じ 400 JSON を返す", async () => {
  const { db } = makeFakeDb(uniqueError);
  const res = await bbsApp.request(
    `/?action=create&url=https://example.com/bbs&token=${VALID_TOKEN}`,
    { method: "GET" },
    { DB: db }
  );
  assert.equal(res.status, 400);
  const json = (await res.json()) as { error?: string };
  assert.equal(json.error, "BBS already exists for this URL");
});

test("結合: visit batchCreate は競合 1 件を skipped に数え created に入れない", async () => {
  // 2 件目の batch だけ UNIQUE 違反させる（1 件目は成功）。
  const { db } = makeFakeDb((idx) => (idx === 1 ? uniqueError() : batchOk()));
  const res = await visitApp.request(
    "/?action=batchCreate",
    postInit({
      token: VALID_TOKEN,
      items: [
        { id: "alpha", url: "https://example.com/a" },
        { id: "beta", url: "https://example.com/b" },
      ],
    }),
    { DB: db }
  );
  assert.equal(res.status, 200);
  const json = (await res.json()) as { success: boolean; created: number; skipped: number };
  assert.equal(json.success, true);
  assert.equal(json.created, 1, "成功した 1 件だけ created");
  assert.equal(json.skipped, 1, "競合 1 件は skipped");
});

test("結合: like batchCreate は競合 1 件を skipped に数え created に入れない", async () => {
  const { db } = makeFakeDb((idx) => (idx === 1 ? uniqueError() : batchOk()));
  const res = await likeApp.request(
    "/?action=batchCreate",
    postInit({
      token: VALID_TOKEN,
      items: [
        { id: "alpha", url: "https://example.com/a" },
        { id: "beta", url: "https://example.com/b" },
      ],
    }),
    { DB: db }
  );
  assert.equal(res.status, 200);
  const json = (await res.json()) as { success: boolean; created: number; skipped: number };
  assert.equal(json.success, true);
  assert.equal(json.created, 1);
  assert.equal(json.skipped, 1);
});

test("結合: 非 UNIQUE の DB 例外は onError で 500 / application/json / 規定 body になる", async () => {
  // 本物の index app を使い、Hono 既定の text/plain ではなく JSON で返ることを保証する。
  const { db } = makeFakeDb(foreignKeyError);
  const originalError = console.error;
  console.error = () => {}; // この test では本筋でないので黙らせる
  try {
    const res = await app.request(
      `/visit?action=create&url=https://example.com/fk&token=${VALID_TOKEN}`,
      { method: "GET" },
      { DB: db }
    );
    assert.equal(res.status, 500);
    assert.equal(res.headers.get("content-type"), "application/json");
    const json = (await res.json()) as { error?: string };
    assert.deepEqual(json, { error: "Internal Server Error" });
  } finally {
    console.error = originalError;
  }
});

test("結合: onError ログは統一プレフィックスを出し、token 値を含めない", async () => {
  const { db } = makeFakeDb(foreignKeyError);
  const captured: string[] = [];
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    captured.push(args.map((a) => (a instanceof Error ? a.message : String(a))).join(" "));
  };
  try {
    const res = await app.request(
      `/visit?action=create&url=https://example.com/fk2&token=${VALID_TOKEN}`,
      { method: "GET" },
      { DB: db }
    );
    assert.equal(res.status, 500);
  } finally {
    console.error = originalError;
  }

  const joined = captured.join("\n");
  assert.ok(joined.includes("[nostalgic-api] unhandled error:"), "統一プレフィックスでログされる");
  assert.ok(joined.includes("create"), "action はログに残る（観測性）");
  assert.ok(!joined.includes(VALID_TOKEN), "token 値はログに漏れない");
});

test("結合: visit create は batch 成功時に 200 成功 JSON を返す", async () => {
  const { db } = makeFakeDb(batchOk);
  const res = await visitApp.request(
    `/?action=create&url=https://example.com/ok&token=${VALID_TOKEN}`,
    { method: "GET" },
    { DB: db }
  );
  assert.equal(res.status, 200);
  const json = (await res.json()) as { success?: boolean; message?: string; id?: string };
  assert.equal(json.success, true);
  assert.equal(json.message, "Counter created successfully");
  assert.ok(typeof json.id === "string" && json.id.length > 0, "id が払い出される");
});
