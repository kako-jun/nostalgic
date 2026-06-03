/**
 * batch.ts のユニットテスト
 *
 * テスト基盤（vitest 等）は未導入のため、Node 標準の `node:test` ランナーと
 * `node:assert` を使い、Node v24 の TypeScript type-stripping で直接実行する
 * ゼロ依存テストにしてある。
 *   実行: pnpm --filter @nostalgic/api test
 *   （= node --experimental-strip-types --test 'src/**​/*.test.ts'）
 *
 * 観点:
 *  - chunkArray が全件を「重複なく・順序を保ったまま」被覆する（batchGet で欠落しない証明）
 *  - 閾値超（98 / 100 / 200 / 1000 件）でも各チャンクが D1 の 100 バインド上限を超えない
 *    （like の likedQuery は chunkSize+3 バインドになるため、その値が 100 未満であること）
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { chunkArray, BATCH_GET_CHUNK_SIZE } from "./batch.ts";

// 連結すると元配列に完全一致する（順序保持 + 全件被覆 + 重複なし）
function assertCovers<T>(original: readonly T[], chunks: T[][], size: number): void {
  const flat = chunks.flat();
  assert.deepEqual(flat, [...original], "chunks concatenated must equal the original array");
  for (const chunk of chunks) {
    assert.ok(chunk.length >= 1, "no empty chunk");
    assert.ok(chunk.length <= size, `chunk size <= ${size}`);
  }
  // 端数を除く全チャンクはちょうど size であること
  for (let i = 0; i < chunks.length - 1; i++) {
    assert.equal(chunks[i].length, size, "non-last chunks are exactly size");
  }
}

test("chunkArray: empty array -> no chunks", () => {
  assert.deepEqual(chunkArray([], 50), []);
});

test("chunkArray: fewer than size -> single chunk", () => {
  const ids = Array.from({ length: 10 }, (_, i) => `id-${i}`);
  const chunks = chunkArray(ids, 50);
  assert.equal(chunks.length, 1);
  assertCovers(ids, chunks, 50);
});

test("chunkArray: exactly size -> single full chunk", () => {
  const ids = Array.from({ length: 50 }, (_, i) => `id-${i}`);
  const chunks = chunkArray(ids, 50);
  assert.equal(chunks.length, 1);
  assertCovers(ids, chunks, 50);
});

test("chunkArray: size+1 -> two chunks (50 + 1)", () => {
  const ids = Array.from({ length: 51 }, (_, i) => `id-${i}`);
  const chunks = chunkArray(ids, 50);
  assert.equal(chunks.length, 2);
  assert.equal(chunks[0].length, 50);
  assert.equal(chunks[1].length, 1);
  assertCovers(ids, chunks, 50);
});

// 実機で 500 になっていた閾値超のケースを網羅
for (const total of [98, 100, 200, 1000]) {
  test(`chunkArray: ${total} ids -> 全件を欠落なく被覆する`, () => {
    const ids = Array.from({ length: total }, (_, i) => `like-${i}`);
    const chunks = chunkArray(ids, BATCH_GET_CHUNK_SIZE);
    assertCovers(ids, chunks, BATCH_GET_CHUNK_SIZE);
    // 全 ID が重複なく現れる
    const seen = new Set(chunks.flat());
    assert.equal(seen.size, total, "no id is dropped or duplicated");
  });
}

test("BATCH_GET_CHUNK_SIZE: 各チャンクは D1 の 100 バインド上限を超えない", () => {
  // like batchGet の likedQuery が最もバインドが多い:
  // IN(...N...) + user_hash + date + action_type = N+3
  const likeWorstCaseBinds = BATCH_GET_CHUNK_SIZE + 3;
  assert.ok(
    likeWorstCaseBinds < 100,
    `like worst-case binds (${likeWorstCaseBinds}) must stay under SQLite limit 100`
  );
  // visit batchGet の dailyQuery: IN(...N...) + monthStart = N+1
  const visitBinds = BATCH_GET_CHUNK_SIZE + 1;
  assert.ok(visitBinds < 100, `visit dailyQuery binds (${visitBinds}) must stay under 100`);
});

test("chunkArray: size が不正なら例外", () => {
  assert.throws(() => chunkArray([1, 2, 3], 0));
  assert.throws(() => chunkArray([1, 2, 3], -1));
  assert.throws(() => chunkArray([1, 2, 3], 1.5));
});
