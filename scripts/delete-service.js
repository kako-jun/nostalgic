#!/usr/bin/env node
/**
 * Service Delete Script (Admin)
 * トークン無しでサービスを完全削除
 *
 * APIの削除処理と同じロジックを使用し、
 * 関連するすべてのRedisキーを適切に削除
 *
 * Usage:
 *   npm run db:delete <service> <id>
 *
 * Examples:
 *   npm run db:delete ranking nostalgic-9c044ad0
 *   npm run db:delete bbs test-396936bd
 *   npm run db:delete counter yoursite-b39b8813
 *   npm run db:delete like debug-test-32c519f3
 */

const Redis = require("ioredis");
require("dotenv").config({ path: ".env.local" });

if (!process.env.REDIS_URL) {
  console.log("❌ REDIS_URL not set");
  console.log("Please create .env.local file with REDIS_URL");
  process.exit(1);
}

const redis = new Redis(process.env.REDIS_URL);

/**
 * Counter サービス削除
 * APIの performCleanup と同じロジック
 */
async function deleteCounter(id) {
  console.log(`🗑️  Deleting Counter: ${id}`);

  // メタデータ取得（URL取得のため）
  const metadata = await redis.get(`counter:${id}`);
  let url = null;
  if (metadata) {
    try {
      const data = JSON.parse(metadata);
      url = data.url;
    } catch (e) {
      console.log("  ⚠️  Failed to parse metadata");
    }
  }

  // 統一キー構造により一括削除
  const serviceKeys = await redis.keys(`counter:${id}*`);
  let deleted = 0;
  if (serviceKeys.length > 0) {
    deleted = await redis.del(...serviceKeys);
    console.log(`    ✅ Deleted ${deleted} counter keys`);
  }

  // URLマッピング削除
  if (url) {
    const encodedUrl = encodeURIComponent(url);
    const mappingDeleted = await redis.del(`url:counter:${encodedUrl}`);
    if (mappingDeleted > 0) {
      console.log(`    ✅ Deleted URL mapping: ${url}`);
      deleted += mappingDeleted;
    }
  }

  return deleted;
}

/**
 * Like サービス削除
 */
async function deleteLike(id) {
  console.log(`🗑️  Deleting Like: ${id}`);

  // メタデータ取得
  const metadata = await redis.get(`like:${id}`);
  let url = null;
  if (metadata) {
    try {
      const data = JSON.parse(metadata);
      url = data.url;
    } catch (e) {
      console.log("  ⚠️  Failed to parse metadata");
    }
  }

  // 統一キー構造により一括削除
  const serviceKeys = await redis.keys(`like:${id}*`);
  let deleted = 0;
  if (serviceKeys.length > 0) {
    deleted = await redis.del(...serviceKeys);
    console.log(`    ✅ Deleted ${deleted} like keys`);
  }

  // URLマッピング削除
  if (url) {
    const encodedUrl = encodeURIComponent(url);
    const mappingDeleted = await redis.del(`url:like:${encodedUrl}`);
    if (mappingDeleted > 0) {
      console.log(`    ✅ Deleted URL mapping: ${url}`);
      deleted += mappingDeleted;
    }
  }

  return deleted;
}

/**
 * Ranking サービス削除
 * APIの performCleanup と同じロジック
 */
async function deleteRanking(id) {
  console.log(`🗑️  Deleting Ranking: ${id}`);

  // メタデータ取得
  const metadata = await redis.get(`ranking:${id}`);
  let url = null;
  if (metadata) {
    try {
      const data = JSON.parse(metadata);
      url = data.url;
    } catch (e) {
      console.log("  ⚠️  Failed to parse metadata");
    }
  }

  // 統一キー構造により一括削除
  const serviceKeys = await redis.keys(`ranking:${id}*`);
  let deleted = 0;
  if (serviceKeys.length > 0) {
    deleted = await redis.del(...serviceKeys);
    console.log(`    ✅ Deleted ${deleted} ranking keys`);
  }

  // 古い形式のdisplay_scoresも削除（互換性のため）
  const displayScoresDeleted = await redis.del(`${id}:display_scores`);
  if (displayScoresDeleted > 0) {
    console.log(`    ✅ Deleted legacy display scores`);
    deleted += displayScoresDeleted;
  }

  // URLマッピング削除
  if (url) {
    const encodedUrl = encodeURIComponent(url);
    const mappingDeleted = await redis.del(`url:ranking:${encodedUrl}`);
    if (mappingDeleted > 0) {
      console.log(`    ✅ Deleted URL mapping: ${url}`);
      deleted += mappingDeleted;
    }
  }

  return deleted;
}

/**
 * BBS サービス削除
 */
async function deleteBBS(id) {
  console.log(`🗑️  Deleting BBS: ${id}`);

  // メタデータ取得
  const metadata = await redis.get(`bbs:${id}`);
  let url = null;
  if (metadata) {
    try {
      const data = JSON.parse(metadata);
      url = data.url;
    } catch (e) {
      console.log("  ⚠️  Failed to parse metadata");
    }
  }

  // 統一キー構造により一括削除
  const serviceKeys = await redis.keys(`bbs:${id}*`);
  let deleted = 0;
  if (serviceKeys.length > 0) {
    deleted = await redis.del(...serviceKeys);
    console.log(`    ✅ Deleted ${deleted} bbs keys`);
  }

  // URLマッピング削除
  if (url) {
    const encodedUrl = encodeURIComponent(url);
    const mappingDeleted = await redis.del(`url:bbs:${encodedUrl}`);
    if (mappingDeleted > 0) {
      console.log(`    ✅ Deleted URL mapping: ${url}`);
      deleted += mappingDeleted;
    }
  }

  return deleted;
}

/**
 * サービス存在確認
 */
async function checkServiceExists(service, id) {
  const exists = await redis.exists(`${service}:${id}`);
  return exists === 1;
}

/**
 * メイン処理
 */
async function main() {
  const service = process.argv[2];
  const id = process.argv[3];

  if (!service || !id) {
    console.log("Usage: npm run db:delete <service> <id>");
    console.log("Services: counter, like, ranking, bbs");
    console.log("Examples:");
    console.log("  npm run db:delete ranking nostalgic-9c044ad0");
    console.log("  npm run db:delete bbs test-396936bd");
    await redis.quit();
    process.exit(1);
  }

  const validServices = ["counter", "like", "ranking", "bbs"];
  if (!validServices.includes(service)) {
    console.log(`❌ Invalid service: ${service}`);
    console.log(`Valid services: ${validServices.join(", ")}`);
    await redis.quit();
    process.exit(1);
  }

  // サービス存在確認
  const exists = await checkServiceExists(service, id);
  if (!exists) {
    console.log(`❌ Service not found: ${service}:${id}`);
    await redis.quit();
    process.exit(1);
  }

  console.log(`\n🗑️  Starting complete deletion of ${service}: ${id}`);
  console.log("⚠️  This will permanently delete all related data!");

  try {
    let totalDeleted = 0;

    switch (service) {
      case "counter":
        totalDeleted = await deleteCounter(id);
        break;
      case "like":
        totalDeleted = await deleteLike(id);
        break;
      case "ranking":
        totalDeleted = await deleteRanking(id);
        break;
      case "bbs":
        totalDeleted = await deleteBBS(id);
        break;
    }

    console.log(`\n✅ Successfully deleted ${totalDeleted} Redis keys`);
    console.log(`🎉 Service ${service}:${id} completely removed`);
  } catch (error) {
    console.error(`❌ Deletion failed: ${error.message}`);
    process.exit(1);
  } finally {
    await redis.quit();
  }
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
