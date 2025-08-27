#!/usr/bin/env node
/**
 * Redis Key Migration Script
 * 不統一なキー命名規則を仕様に合わせて修正
 * 
 * 修正内容:
 * - bbs_messages:ID:messages → bbs:ID:messages
 * - bbs_owner:ID → bbs:ID:owner
 * - ranking_scores:ID:scores → ranking:ID:scores
 * - ranking_owner:ID → ranking:ID:owner
 * 
 * Usage:
 *   npm run migrate:keys
 */

const Redis = require('ioredis')
require('dotenv').config({ path: '.env.local' })

if (!process.env.REDIS_URL) {
  console.log('❌ REDIS_URL not set')
  console.log('Please create .env.local file with REDIS_URL')
  process.exit(1)
}

const redis = new Redis(process.env.REDIS_URL)

/**
 * キーの移動とデータ保持
 */
async function migrateKey(oldKey, newKey) {
  const type = await redis.type(oldKey)
  
  if (type === 'none') {
    console.log(`  ⚠️  ${oldKey} (not found)`)
    return false
  }
  
  try {
    if (type === 'string') {
      const value = await redis.get(oldKey)
      await redis.set(newKey, value)
    } else if (type === 'list') {
      const length = await redis.llen(oldKey)
      if (length > 0) {
        const values = await redis.lrange(oldKey, 0, -1)
        const pipeline = redis.pipeline()
        values.reverse().forEach(value => pipeline.lpush(newKey, value))
        await pipeline.exec()
      }
    } else if (type === 'zset') {
      const members = await redis.zrange(oldKey, 0, -1, 'WITHSCORES')
      if (members.length > 0) {
        const pipeline = redis.pipeline()
        for (let i = 0; i < members.length; i += 2) {
          pipeline.zadd(newKey, members[i + 1], members[i])
        }
        await pipeline.exec()
      }
    } else if (type === 'hash') {
      const hash = await redis.hgetall(oldKey)
      if (Object.keys(hash).length > 0) {
        await redis.hmset(newKey, hash)
      }
    } else if (type === 'set') {
      const members = await redis.smembers(oldKey)
      if (members.length > 0) {
        await redis.sadd(newKey, ...members)
      }
    }
    
    // 古いキーを削除
    await redis.del(oldKey)
    console.log(`  ✅ ${oldKey} → ${newKey}`)
    return true
  } catch (error) {
    console.log(`  ❌ Error migrating ${oldKey}: ${error.message}`)
    return false
  }
}

/**
 * BBS関連キーの移行
 */
async function migrateBBSKeys() {
  console.log('\n🔄 Migrating BBS keys...')
  
  const pipeline = redis.pipeline()
  pipeline.keys('bbs_messages:*:messages')
  pipeline.keys('bbs_owner:*')
  const results = await pipeline.exec()
  
  const messageKeys = results[0][1] || []
  const ownerKeys = results[1][1] || []
  
  let migrated = 0
  
  // メッセージキーの移行: bbs_messages:ID:messages → bbs:ID:messages
  for (const key of messageKeys) {
    const match = key.match(/^bbs_messages:(.+):messages$/)
    if (match) {
      const id = match[1]
      const newKey = `bbs:${id}:messages`
      if (await migrateKey(key, newKey)) {
        migrated++
      }
    }
  }
  
  // オーナーキーの移行: bbs_owner:ID → bbs:ID:owner
  for (const key of ownerKeys) {
    const match = key.match(/^bbs_owner:(.+)$/)
    if (match) {
      const id = match[1]
      const newKey = `bbs:${id}:owner`
      if (await migrateKey(key, newKey)) {
        migrated++
      }
    }
  }
  
  console.log(`📊 BBS: ${migrated} keys migrated`)
  return migrated
}

/**
 * Ranking関連キーの移行
 */
async function migrateRankingKeys() {
  console.log('\n🔄 Migrating Ranking keys...')
  
  const pipeline = redis.pipeline()
  pipeline.keys('ranking_scores:*:scores')
  pipeline.keys('ranking_owner:*')
  const results = await pipeline.exec()
  
  const scoreKeys = results[0][1] || []
  const ownerKeys = results[1][1] || []
  
  let migrated = 0
  
  // スコアキーの移行: ranking_scores:ID:scores → ranking:ID:scores
  for (const key of scoreKeys) {
    const match = key.match(/^ranking_scores:(.+):scores$/)
    if (match) {
      const id = match[1]
      const newKey = `ranking:${id}:scores`
      if (await migrateKey(key, newKey)) {
        migrated++
      }
    }
  }
  
  // オーナーキーの移行: ranking_owner:ID → ranking:ID:owner
  for (const key of ownerKeys) {
    const match = key.match(/^ranking_owner:(.+)$/)
    if (match) {
      const id = match[1]
      const newKey = `ranking:${id}:owner`
      if (await migrateKey(key, newKey)) {
        migrated++
      }
    }
  }
  
  console.log(`📊 Ranking: ${migrated} keys migrated`)
  return migrated
}

/**
 * Counter関連オーナーキーの移行
 */
async function migrateCounterOwnerKeys() {
  console.log('\n🔄 Migrating Counter owner keys...')
  
  const ownerKeys = await redis.keys('counter_owner:*')
  let migrated = 0
  
  // オーナーキーの移行: counter_owner:ID → counter:ID:owner
  for (const key of ownerKeys) {
    const match = key.match(/^counter_owner:(.+)$/)
    if (match) {
      const id = match[1]
      const newKey = `counter:${id}:owner`
      if (await migrateKey(key, newKey)) {
        migrated++
      }
    }
  }
  
  console.log(`📊 Counter: ${migrated} owner keys migrated`)
  return migrated
}

/**
 * Like関連オーナーキーの移行
 */
async function migrateLikeOwnerKeys() {
  console.log('\n🔄 Migrating Like owner keys...')
  
  const ownerKeys = await redis.keys('like_owner:*')
  let migrated = 0
  
  // オーナーキーの移行: like_owner:ID → like:ID:owner
  for (const key of ownerKeys) {
    const match = key.match(/^like_owner:(.+)$/)
    if (match) {
      const id = match[1]
      const newKey = `like:${id}:owner`
      if (await migrateKey(key, newKey)) {
        migrated++
      }
    }
  }
  
  console.log(`📊 Like: ${migrated} owner keys migrated`)
  return migrated
}

/**
 * 移行結果の検証
 */
async function verifyMigration() {
  console.log('\n🔍 Verifying migration...')
  
  const pipeline = redis.pipeline()
  pipeline.keys('bbs_messages:*')
  pipeline.keys('bbs_owner:*')
  pipeline.keys('ranking_scores:*')
  pipeline.keys('ranking_owner:*')
  pipeline.keys('counter_owner:*')
  pipeline.keys('like_owner:*')
  const results = await pipeline.exec()
  
  const oldKeys = [
    ...(results[0][1] || []),
    ...(results[1][1] || []),
    ...(results[2][1] || []),
    ...(results[3][1] || []),
    ...(results[4][1] || []),
    ...(results[5][1] || [])
  ]
  
  if (oldKeys.length === 0) {
    console.log('✅ Migration successful - no old keys remaining')
    return true
  } else {
    console.log('⚠️  Old keys still exist:')
    oldKeys.forEach(key => console.log(`  - ${key}`))
    return false
  }
}

/**
 * メイン処理
 */
async function main() {
  console.log('🚀 Redis Key Migration - Starting...')
  console.log('Fixing inconsistent key naming patterns to match specification')
  
  try {
    const bbsMigrated = await migrateBBSKeys()
    const rankingMigrated = await migrateRankingKeys()
    const counterMigrated = await migrateCounterOwnerKeys()
    const likeMigrated = await migrateLikeOwnerKeys()
    
    const totalMigrated = bbsMigrated + rankingMigrated + counterMigrated + likeMigrated
    
    if (totalMigrated > 0) {
      console.log(`\n📈 Migration Summary: ${totalMigrated} keys migrated`)
      await verifyMigration()
    } else {
      console.log('\n📋 No keys needed migration - database is already consistent')
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  } finally {
    await redis.quit()
  }
  
  console.log('\n🎉 Migration complete!')
}

main().catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})