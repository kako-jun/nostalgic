#!/usr/bin/env node
/**
 * BBS Select Migration Script
 * 古いselects[]形式を新しい3種類セレクトシステムに移行
 */

const Redis = require("ioredis");
require("dotenv").config({ path: ".env.local" });

if (!process.env.REDIS_URL) {
  console.log("❌ REDIS_URL not set");
  process.exit(1);
}

const redis = new Redis(process.env.REDIS_URL);

async function migrateBBSSelects() {
  console.log("🔄 Migrating BBS selects to new 3-type system...\n");

  // 全BBSサービスを取得
  const allKeys = [];
  const stream = redis.scanStream({ match: "bbs:*", count: 100 });

  for await (const keys of stream) {
    allKeys.push(...keys);
  }

  // メタデータキーのみを抽出
  const serviceIds = allKeys
    .filter((key) => /^bbs:[^:]+$/.test(key))
    .map((key) => key.split(":")[1]);

  console.log(`Found ${serviceIds.length} BBS services to check`);

  for (const id of serviceIds) {
    const metadataKey = `bbs:${id}`;
    const metadataStr = await redis.get(metadataKey);

    if (!metadataStr) {
      console.log(`❌ No metadata found for ${id}`);
      continue;
    }

    let metadata;
    try {
      metadata = JSON.parse(metadataStr);
    } catch (e) {
      console.log(`❌ Failed to parse metadata for ${id}`);
      continue;
    }

    if (!metadata.settings) {
      console.log(`⚠️  No settings found for ${id}`);
      continue;
    }

    const settings = metadata.settings;
    let needsUpdate = false;

    // 古い形式をチェックして削除
    if (settings.selects) {
      console.log(`📝 ${id}: Removing old selects array`);
      delete settings.selects;
      needsUpdate = true;
    }

    if (settings.icons) {
      console.log(`📝 ${id}: Removing old icons array`);
      delete settings.icons;
      needsUpdate = true;
    }

    // 新しい形式が存在しない場合は追加
    if (!settings.standardSelect) {
      settings.standardSelect = { label: "", options: [] };
      needsUpdate = true;
    }

    if (!settings.incrementalSelect) {
      settings.incrementalSelect = { label: "", options: [] };
      needsUpdate = true;
    }

    if (!settings.emoteSelect) {
      settings.emoteSelect = { label: "", options: [] };
      needsUpdate = true;
    }

    if (needsUpdate) {
      console.log(`✅ ${id}: Updated to new select format`);
      await redis.set(metadataKey, JSON.stringify(metadata));
    } else {
      console.log(`✨ ${id}: Already using new format`);
    }
  }

  console.log("\n🎉 Migration completed!");
}

async function main() {
  try {
    await migrateBBSSelects();
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await redis.quit();
  }
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
