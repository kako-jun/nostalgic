/**
 * storage.ts のユニットテスト
 *
 * runCreateBatch の 3 分岐を D1 の最小 fake で検証する。
 * - UNIQUE 制約違反 → AlreadyExistsError（呼び出し側が 400 already-exists に変換できる形）
 * - それ以外の D1 例外 → そのまま透過再 throw（app.onError が 500 に集約する前提を崩さない）
 * - 正常 → resolve（追加の戻り値を作らない）
 * isUniqueConstraintError の判定境界も併せて確認する。
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { runCreateBatch, AlreadyExistsError, isUniqueConstraintError } from "./storage.ts";

/** batch() の挙動だけ差し替えられる最小 fake D1 */
function fakeDb(batchImpl: () => Promise<unknown>): D1Database {
  return {
    batch: batchImpl,
  } as unknown as D1Database;
}

const dummyStatements = [] as unknown as D1PreparedStatement[];

test("runCreateBatch: UNIQUE 制約違反は AlreadyExistsError に変換される", async () => {
  const db = fakeDb(() => Promise.reject(new Error("UNIQUE constraint failed: url_mappings.url")));

  await assert.rejects(
    () => runCreateBatch(db, dummyStatements, "Counter already exists for this URL"),
    (err: unknown) => {
      assert.ok(err instanceof AlreadyExistsError, "AlreadyExistsError で投げ直す");
      assert.equal((err as AlreadyExistsError).message, "Counter already exists for this URL");
      assert.equal((err as AlreadyExistsError).name, "AlreadyExistsError");
      return true;
    }
  );
});

test("runCreateBatch: UNIQUE 以外の D1 例外はそのまま透過再 throw される", async () => {
  // FOREIGN KEY 違反などは already-exists ではないので握りつぶさず、元のエラーを保つ。
  const original = new Error("FOREIGN KEY constraint failed");
  const db = fakeDb(() => Promise.reject(original));

  await assert.rejects(
    () => runCreateBatch(db, dummyStatements, "Counter already exists for this URL"),
    (err: unknown) => {
      assert.equal(err, original, "同一インスタンスがそのまま伝播する");
      assert.ok(!(err instanceof AlreadyExistsError), "AlreadyExistsError に化けない");
      return true;
    }
  );
});

test("runCreateBatch: 正常時は resolve し例外を投げない", async () => {
  let called = false;
  const db = fakeDb(() => {
    called = true;
    return Promise.resolve([{ success: true }]);
  });

  await assert.doesNotReject(() =>
    runCreateBatch(db, dummyStatements, "Counter already exists for this URL")
  );
  assert.equal(called, true, "batch が実際に実行される");
});

test("isUniqueConstraintError: UNIQUE 文言を含む Error のみ true", async () => {
  assert.equal(
    isUniqueConstraintError(new Error("UNIQUE constraint failed: url_mappings.url")),
    true
  );
  assert.equal(isUniqueConstraintError("UNIQUE constraint failed: services.id"), true);
  assert.equal(isUniqueConstraintError(new Error("FOREIGN KEY constraint failed")), false);
  assert.equal(isUniqueConstraintError(new Error("D1_ERROR: no such table")), false);
  assert.equal(isUniqueConstraintError(null), false);
  assert.equal(isUniqueConstraintError(undefined), false);
});
