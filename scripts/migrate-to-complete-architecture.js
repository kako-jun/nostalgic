#!/usr/bin/env node
/**
 * Complete Architecture Migration
 * 全フィールドを最新アーキテクチャに完全統一
 * 
 * 修正内容:
 * 1. webhookUrl を settings 内に移動
 * 2. 不足フィールドを追加 (lastSubmit, lastMessage, etc.)
 * 3. フィールド名の統一
 * 
 * Usage:
 *   npm run migrate:complete
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
 * Counter を完全アーキテクチャに移行
 */
async function migrateCounterComplete(id, data) {
  console.log(`  📊 Counter ${id}`)
  
  const migratedData = {
    id: data.id,
    url: data.url,
    created: data.created,
    totalCount: data.totalCount || data.count || 0, // count → totalCount 統一
    lastVisit: data.lastVisit || null,
    settings: data.settings || {}
  }
  
  await redis.set(`counter:${id}`, JSON.stringify(migratedData))
  console.log(`    ✅ フィールド統一完了`)
  return true
}

/**
 * Like を完全アーキテクチャに移行
 */
async function migrateLikeComplete(id, data) {
  console.log(`  💖 Like ${id}`)
  
  const migratedData = {
    id: data.id,
    url: data.url,
    created: data.created,
    totalLikes: data.totalLikes || data.total || 0, // total → totalLikes 統一
    lastLike: data.lastLike || null,
    settings: data.settings || {}
  }
  
  await redis.set(`like:${id}`, JSON.stringify(migratedData))
  console.log(`    ✅ フィールド統一完了`)
  return true
}

/**
 * Ranking を完全アーキテクチャに移行
 */
async function migrateRankingComplete(id, data) {
  console.log(`  🏆 Ranking ${id}`)
  
  // webhookUrl を settings 内に移動
  const settings = { ...data.settings }
  if (data.webhookUrl && !settings.webhookUrl) {
    settings.webhookUrl = data.webhookUrl
  }
  
  const migratedData = {
    id: data.id,
    url: data.url,
    created: data.created,
    lastSubmit: data.lastSubmit || null,
    totalEntries: data.totalEntries || 0,
    settings
  }
  
  await redis.set(`ranking:${id}`, JSON.stringify(migratedData))
  console.log(`    ✅ フィールド統一完了`)
  return true
}

/**
 * BBS を完全アーキテクチャに移行
 */
async function migrateBBSComplete(id, data) {
  console.log(`  💬 BBS ${id}`)
  
  // webhookUrl を settings 内に移動
  const settings = { ...data.settings }
  if (data.webhookUrl && !settings.webhookUrl) {
    settings.webhookUrl = data.webhookUrl
  }
  
  const migratedData = {
    id: data.id,
    url: data.url,
    created: data.created,
    totalMessages: data.totalMessages || 0,
    lastMessage: data.lastMessage || null,
    settings
  }
  
  await redis.set(`bbs:${id}`, JSON.stringify(migratedData))
  console.log(`    ✅ webhookUrl settings内に移動`)
  return true
}

/**
 * サービス別完全移行実行
 */
async function migrateServiceComplete(service) {
  console.log(`\n🔄 Complete migration for ${service.toUpperCase()} services...`)
  
  const keys = await redis.keys(`${service}:*`)
  const metadataKeys = keys.filter(k => k.match(/^[^:]+:[^:]+$/))
  
  let migrated = 0
  
  for (const key of metadataKeys) {
    const id = key.split(':')[1]
    const data = JSON.parse(await redis.get(key))
    
    try {
      let success = false
      switch (service) {
        case 'counter':
          success = await migrateCounterComplete(id, data)
          break
        case 'like':
          success = await migrateLikeComplete(id, data)
          break
        case 'ranking':
          success = await migrateRankingComplete(id, data)
          break
        case 'bbs':
          success = await migrateBBSComplete(id, data)
          break
      }
      
      if (success) migrated++
    } catch (error) {
      console.log(`  ❌ ${id}: Migration failed - ${error.message}`)
    }
  }
  
  console.log(`📊 ${service.toUpperCase()}: ${migrated} services migrated`)
  return migrated
}

/**
 * 完全移行結果の検証
 */
async function verifyCompleteMigration() {
  console.log('\n🔍 Verifying complete migration...')
  
  // webhookUrl が settings 内に正しく配置されているかチェック
  const issues = []
  
  const services = ['counter', 'like', 'ranking', 'bbs']
  for (const service of services) {
    const keys = await redis.keys(`${service}:*`)
    const metadataKeys = keys.filter(k => k.match(/^[^:]+:[^:]+$/))
    
    for (const key of metadataKeys) {
      const data = JSON.parse(await redis.get(key))
      const id = key.split(':')[1]
      
      // webhookUrl がルートレベルに残っている場合
      if (data.webhookUrl) {
        issues.push(`${service}:${id} - webhookUrl still at root level`)
      }
      
      // settings が存在しない場合
      if (!data.settings) {
        issues.push(`${service}:${id} - missing settings object`)
      }
    }
  }
  
  if (issues.length === 0) {
    console.log('✅ Complete migration verification passed')
    return true
  } else {
    console.log('⚠️  Issues found:')
    issues.forEach(issue => console.log(`  - ${issue}`))
    return false
  }
}

/**
 * メイン処理
 */
async function main() {
  console.log('🚀 Complete Architecture Migration - Starting...')
  console.log('Migrating all fields to match latest entity definitions')
  
  try {
    const services = ['counter', 'like', 'ranking', 'bbs']
    let totalMigrated = 0
    
    for (const service of services) {
      const migrated = await migrateServiceComplete(service)
      totalMigrated += migrated
    }
    
    console.log(`\n📈 Complete Migration Summary: ${totalMigrated} services migrated`)
    
    const isComplete = await verifyCompleteMigration()
    
    if (isComplete) {
      console.log('\n🎉 Complete migration successful! All services match latest architecture.')
    } else {
      console.log('\n⚠️  Complete migration needs review. Check issues above.')
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  } finally {
    await redis.quit()
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})