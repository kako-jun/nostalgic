/**
 * lookup.ts のユニットテスト
 *
 * D1 の最小 fake を使い、Counter / Like / Ranking / BBS / Yokoso の URL owner lookup が
 * 順序保持・重複保持・missing/invalid token を正規形で返すことを確認する。
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { sha256 } from "./crypto.ts";
import {
  batchLookupServices,
  lookupService,
  MAX_LOOKUP_BATCH_SIZE,
  type LookupServiceType,
} from "./lookup.ts";
import { BATCH_GET_CHUNK_SIZE } from "./batch.ts";

type ServiceRow = {
  id: string;
  type: LookupServiceType;
  url: string;
  serviceId: string;
  metadata?: string | null;
  tokenHash?: string;
};

class FakeStatement {
  db: FakeD1Database;
  sql: string;

  constructor(db: FakeD1Database, sql: string) {
    this.db = db;
    this.sql = sql;
  }

  bind(...values: unknown[]) {
    this.db.bindCalls.push(values);
    return {
      all: async <T>() => ({ results: this.db.query<T>(this.sql, values) }),
    };
  }
}

class FakeD1Database {
  bindCalls: unknown[][] = [];
  rows: ServiceRow[];

  constructor(rows: ServiceRow[]) {
    this.rows = rows;
  }

  prepare(sql: string) {
    return new FakeStatement(this, sql);
  }

  query<T>(sql: string, values: unknown[]): T[] {
    if (sql.includes("FROM url_mappings")) {
      const [type, _joinType, ...urls] = values as [
        LookupServiceType,
        LookupServiceType,
        ...string[],
      ];
      return this.rows
        .filter((row) => row.type === type && urls.includes(row.url))
        .map((row) => ({
          url: row.url,
          public_id: row.id,
          service_id: row.serviceId,
          metadata: row.metadata,
        })) as T[];
    }

    if (sql.includes("FROM owner_tokens")) {
      const serviceIds = values as string[];
      return this.rows
        .filter((row) => row.tokenHash && serviceIds.includes(row.serviceId))
        .map((row) => ({
          service_id: row.serviceId,
          token_hash: row.tokenHash,
        })) as T[];
    }

    throw new Error(`Unexpected query: ${sql}`);
  }
}

async function makeDb(): Promise<FakeD1Database> {
  const valid = await sha256("valid-token");
  const other = await sha256("other-token");
  return new FakeD1Database([
    {
      id: "bbs-a1",
      type: "bbs",
      url: "https://a.example/post/",
      serviceId: "bbs:bbs-a1",
      metadata: JSON.stringify({ title: "Comments" }),
      tokenHash: valid,
    },
    {
      id: "ranking-a1",
      type: "ranking",
      url: "https://a.example/post/",
      serviceId: "ranking:ranking-a1",
      metadata: JSON.stringify({ title: "High Score" }),
      tokenHash: other,
    },
    {
      id: "yokoso-a1",
      type: "yokoso",
      url: "https://welcome.example/",
      serviceId: "yokoso:yokoso-a1",
      metadata: JSON.stringify({ message: "Welcome!" }),
      tokenHash: valid,
    },
    {
      id: "bbs-bad-json",
      type: "bbs",
      url: "https://bad-json.example/",
      serviceId: "bbs:bbs-bad-json",
      metadata: "{",
      tokenHash: valid,
    },
    {
      id: "bbs-no-token",
      type: "bbs",
      url: "https://no-token.example/",
      serviceId: "bbs:bbs-no-token",
      metadata: JSON.stringify({ title: "No Token" }),
    },
    {
      // counter は title を持たない（メタデータは webhookUrl 等のみ）。
      // lookup 応答に title が漏れないことの検証に使う。
      id: "counter-a1",
      type: "counter",
      url: "https://counter.example/",
      serviceId: "counter:counter-a1",
      metadata: JSON.stringify({ webhookUrl: null }),
      tokenHash: valid,
    },
    {
      // like も同様に title を持たない。
      id: "like-a1",
      type: "like",
      url: "https://like.example/",
      serviceId: "like:like-a1",
      metadata: JSON.stringify({ webhookUrl: null, icon: "heart" }),
      tokenHash: other,
    },
  ]);
}

test("lookupService: found authorized service returns id and title", async () => {
  const db = await makeDb();
  const result = await lookupService(
    db as unknown as D1Database,
    "bbs",
    "https://a.example/post/",
    "valid-token"
  );

  assert.deepEqual(result, {
    url: "https://a.example/post/",
    exists: true,
    authorized: true,
    id: "bbs-a1",
    title: "Comments",
  });
});

test("lookupService: missing URL returns exists false", async () => {
  const db = await makeDb();
  const result = await lookupService(
    db as unknown as D1Database,
    "bbs",
    "https://missing.example/",
    "valid-token"
  );

  assert.deepEqual(result, {
    url: "https://missing.example/",
    exists: false,
  });
});

test("lookupService: invalid token is item-level unauthorized without id/title", async () => {
  const db = await makeDb();
  const result = await lookupService(
    db as unknown as D1Database,
    "bbs",
    "https://a.example/post/",
    "wrong-token"
  );

  assert.deepEqual(result, {
    url: "https://a.example/post/",
    exists: true,
    authorized: false,
    id: undefined,
    title: undefined,
  });
});

test("lookupService: service type is isolated by URL mapping type", async () => {
  const db = await makeDb();
  const result = await lookupService(
    db as unknown as D1Database,
    "ranking",
    "https://a.example/post/",
    "valid-token"
  );

  assert.deepEqual(result, {
    url: "https://a.example/post/",
    exists: true,
    authorized: false,
    id: undefined,
    title: undefined,
  });
});

test("lookupService: missing owner token row is unauthorized", async () => {
  const db = await makeDb();
  const result = await lookupService(
    db as unknown as D1Database,
    "bbs",
    "https://no-token.example/",
    "valid-token"
  );

  assert.deepEqual(result, {
    url: "https://no-token.example/",
    exists: true,
    authorized: false,
    id: undefined,
    title: undefined,
  });
});

test("lookupService: malformed metadata does not crash", async () => {
  const db = await makeDb();
  const result = await lookupService(
    db as unknown as D1Database,
    "bbs",
    "https://bad-json.example/",
    "valid-token"
  );

  assert.deepEqual(result, {
    url: "https://bad-json.example/",
    exists: true,
    authorized: true,
    id: "bbs-bad-json",
    title: undefined,
  });
});

test("lookupService: Yokoso returns fixed title without exposing message", async () => {
  const db = await makeDb();
  const result = await lookupService(
    db as unknown as D1Database,
    "yokoso",
    "https://welcome.example/",
    "valid-token"
  );

  assert.deepEqual(result, {
    url: "https://welcome.example/",
    exists: true,
    authorized: true,
    id: "yokoso-a1",
    title: "Yokoso",
  });
});

test("batchLookupServices: preserves order, duplicates, and mixed results", async () => {
  const db = await makeDb();
  const result = await batchLookupServices(
    db as unknown as D1Database,
    "bbs",
    [
      "https://missing.example/",
      "https://a.example/post/",
      "https://a.example/post/",
      "https://no-token.example/",
    ],
    "valid-token"
  );

  assert.deepEqual(result, [
    { url: "https://missing.example/", exists: false },
    {
      url: "https://a.example/post/",
      exists: true,
      authorized: true,
      id: "bbs-a1",
      title: "Comments",
    },
    {
      url: "https://a.example/post/",
      exists: true,
      authorized: true,
      id: "bbs-a1",
      title: "Comments",
    },
    {
      url: "https://no-token.example/",
      exists: true,
      authorized: false,
      id: undefined,
      title: undefined,
    },
  ]);
});

test("batchLookupServices: chunks URL and token queries under D1 bind limit", async () => {
  const valid = await sha256("valid-token");
  const rows = Array.from({ length: MAX_LOOKUP_BATCH_SIZE }, (_, i) => ({
    id: `bbs-${i}`,
    type: "bbs" as const,
    url: `https://example.com/${i}`,
    serviceId: `bbs:bbs-${i}`,
    metadata: JSON.stringify({ title: `Comments ${i}` }),
    tokenHash: valid,
  }));
  const db = new FakeD1Database(rows);
  const urls = rows.map((row) => row.url);
  const result = await batchLookupServices(db as unknown as D1Database, "bbs", urls, "valid-token");

  assert.equal(result.length, MAX_LOOKUP_BATCH_SIZE);
  assert.equal(
    result.every((item) => item.exists && item.authorized),
    true
  );
  for (const values of db.bindCalls) {
    assert.ok(values.length <= BATCH_GET_CHUNK_SIZE + 2, "URL lookup bind count stays chunked");
    assert.ok(values.length <= 100, "D1 bind count stays under 100");
  }
});

// --- #23: counter / like の lookup を helper レベルで検証 ---

test("lookupService(counter): authorized は id を返すが title は付かない", async () => {
  const db = await makeDb();
  const result = await lookupService(
    db as unknown as D1Database,
    "counter",
    "https://counter.example/",
    "valid-token"
  );

  assert.deepEqual(result, {
    url: "https://counter.example/",
    exists: true,
    authorized: true,
    id: "counter-a1",
    title: undefined,
  });
  assert.equal("title" in result && result.title !== undefined, false);
});

test("lookupService(like): authorized は id を返すが title は付かない", async () => {
  const db = await makeDb();
  const result = await lookupService(
    db as unknown as D1Database,
    "like",
    "https://like.example/",
    "other-token"
  );

  assert.deepEqual(result, {
    url: "https://like.example/",
    exists: true,
    authorized: true,
    id: "like-a1",
    title: undefined,
  });
});

test("lookupService(counter): 未存在 URL は exists false を返す", async () => {
  const db = await makeDb();
  const result = await lookupService(
    db as unknown as D1Database,
    "counter",
    "https://missing-counter.example/",
    "valid-token"
  );

  assert.deepEqual(result, {
    url: "https://missing-counter.example/",
    exists: false,
  });
});

test("lookupService(like): token 不一致は authorized false かつ id を隠す", async () => {
  const db = await makeDb();
  const result = await lookupService(
    db as unknown as D1Database,
    "like",
    "https://like.example/",
    "valid-token" // like-a1 の所有者トークンは other-token なので不一致
  );

  assert.deepEqual(result, {
    url: "https://like.example/",
    exists: true,
    authorized: false,
    id: undefined,
    title: undefined,
  });
});

test("batchLookupServices(counter): 入力順を保持して結果を返す", async () => {
  const db = await makeDb();
  const result = await batchLookupServices(
    db as unknown as D1Database,
    "counter",
    ["https://missing-counter.example/", "https://counter.example/"],
    "valid-token"
  );

  assert.equal(result.length, 2);
  assert.equal(result[0].url, "https://missing-counter.example/");
  assert.equal(result[0].exists, false);
  assert.equal(result[1].url, "https://counter.example/");
  assert.equal(result[1].exists, true);
  assert.equal(result[1].authorized, true);
  assert.equal(result[1].id, "counter-a1");
});

test("batchLookupServices(counter): 空配列は許容して空配列を返す", async () => {
  const db = await makeDb();
  const result = await batchLookupServices(
    db as unknown as D1Database,
    "counter",
    [],
    "valid-token"
  );

  assert.deepEqual(result, []);
});

test("batchLookupServices(counter): 境界値 MAX_LOOKUP_BATCH_SIZE - 1 件を処理する", async () => {
  const valid = await sha256("valid-token");
  const size = MAX_LOOKUP_BATCH_SIZE - 1;
  const rows = Array.from({ length: size }, (_, i) => ({
    id: `counter-${i}`,
    type: "counter" as const,
    url: `https://counter.example/${i}`,
    serviceId: `counter:counter-${i}`,
    metadata: JSON.stringify({ webhookUrl: null }),
    tokenHash: valid,
  }));
  const db = new FakeD1Database(rows);
  const urls = rows.map((row) => row.url);
  const result = await batchLookupServices(
    db as unknown as D1Database,
    "counter",
    urls,
    "valid-token"
  );

  assert.equal(result.length, size);
  assert.equal(
    result.every((item) => item.exists && item.authorized),
    true
  );
});

test("batchLookupServices(counter): 境界値 MAX_LOOKUP_BATCH_SIZE 件ちょうどを処理する", async () => {
  const valid = await sha256("valid-token");
  const rows = Array.from({ length: MAX_LOOKUP_BATCH_SIZE }, (_, i) => ({
    id: `counter-${i}`,
    type: "counter" as const,
    url: `https://counter.example/${i}`,
    serviceId: `counter:counter-${i}`,
    metadata: JSON.stringify({ webhookUrl: null }),
    tokenHash: valid,
  }));
  const db = new FakeD1Database(rows);
  const urls = rows.map((row) => row.url);
  const result = await batchLookupServices(
    db as unknown as D1Database,
    "counter",
    urls,
    "valid-token"
  );

  assert.equal(result.length, MAX_LOOKUP_BATCH_SIZE);
});
