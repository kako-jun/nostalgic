#!/usr/bin/env node
/**
 * Unified Settings Architecture Migration
 * 全サービスを統一設定アーキテクチャに移行
 * 
 * 移行内容:
 * - Counter: 設定なし → settings: {} (空オブジェクト)
 * - Like: 設定なし → settings: {} (空オブジェクト)  
 * - Ranking: maxEntries, sortOrder → settings: { maxEntries, sortOrder }
 * - BBS: 移行済みなのでスキップ
 * 
 * Usage:
 *   npm run migrate:settings
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
 * Counter を統一設定アーキテクチャに移行
 */
async function migrateCounter(id, data) {
  console.log(`  📊 Counter ${id}`)
  
  // Counter は設定項目が少ないので空のsettingsオブジェクトを追加
  const migratedData = {
    ...data,
    settings: {} // Counter は現在設定可能項目なし
  }
  
  await redis.set(`counter:${id}`, JSON.stringify(migratedData))
  console.log(`    ✅ settings: {} 追加`)
  return true
}

/**
 * Like を統一設定アーキテクチャに移行
 */
async function migrateLike(id, data) {
  console.log(`  💖 Like ${id}`)
  
  // Like も設定項目が少ないので空のsettingsオブジェクトを追加
  const migratedData = {
    ...data,
    settings: {} // Like は現在設定可能項目なし
  }
  
  await redis.set(`like:${id}`, JSON.stringify(migratedData))
  console.log(`    ✅ settings: {} 追加`)
  return true
}

/**
 * Ranking を統一設定アーキテクチャに移行
 */
async function migrateRanking(id, data) {
  console.log(`  🏆 Ranking ${id}`)
  
  // 旧アーキテクチャの設定項目をsettingsに移動
  const settings = {
    maxEntries: data.maxEntries || 100,
    sortOrder: data.sortOrder || 'desc'
  }
  
  // title, webhookUrl があれば追加
  if (data.title) settings.title = data.title
  if (data.webhookUrl) settings.webhookUrl = data.webhookUrl
  
  const migratedData = {
    ...data,
    settings
  }
  
  // 旧設定項目を削除
  delete migratedData.maxEntries
  delete migratedData.sortOrder
  delete migratedData.title  // settingsに移動済み
  
  await redis.set(`ranking:${id}`, JSON.stringify(migratedData))
  console.log(`    ✅ settings: { maxEntries: ${settings.maxEntries}, sortOrder: "${settings.sortOrder}" }`)
  return true
}

/**
 * サービス別移行実行
 */
async function migrateService(service) {
  console.log(`\n🔄 Migrating ${service.toUpperCase()} services...`)
  
  const keys = await redis.keys(`${service}:*`)
  const metadataKeys = keys.filter(k => k.match(/^[^:]+:[^:]+$/))
  
  let migrated = 0
  let skipped = 0
  
  for (const key of metadataKeys) {
    const id = key.split(':')[1]
    const data = JSON.parse(await redis.get(key))
    
    // 既に新アーキテクチャか確認
    if (data.settings) {
      console.log(`  ✅ ${id}: Already migrated`)
      skipped++
      continue
    }
    
    try {
      let success = false
      switch (service) {
        case 'counter':
          success = await migrateCounter(id, data)
          break
        case 'like':
          success = await migrateLike(id, data)
          break
        case 'ranking':
          success = await migrateRanking(id, data)
          break
        case 'bbs':
          // BBS は既に移行済みのはず
          console.log(`  ✅ ${id}: Already migrated`)
          skipped++
          continue
      }
      
      if (success) migrated++
    } catch (error) {
      console.log(`  ❌ ${id}: Migration failed - ${error.message}`)
    }
  }
  
  console.log(`📊 ${service.toUpperCase()}: ${migrated} migrated, ${skipped} skipped`)
  return migrated
}

/**
 * 移行結果の検証
 */
async function verifyMigration() {
  console.log('\n🔍 Verifying migration...')
  
  const services = ['counter', 'like', 'ranking', 'bbs']
  let totalServices = 0
  let migratedServices = 0
  
  for (const service of services) {
    const keys = await redis.keys(`${service}:*`)
    const metadataKeys = keys.filter(k => k.match(/^[^:]+:[^:]+$/))
    
    for (const key of metadataKeys) {
      totalServices++
      const data = JSON.parse(await redis.get(key))
      if (data.settings !== undefined) {
        migratedServices++
      } else {
        const id = key.split(':')[1]
        console.log(`  ⚠️  ${service}:${id} still missing settings`)
      }
    }
  }
  
  console.log(`✅ Migration verification: ${migratedServices}/${totalServices} services have settings`)
  return migratedServices === totalServices
}

/**
 * メイン処理
 */
async function main() {
  console.log('🚀 Unified Settings Architecture Migration - Starting...')
  console.log('Migrating all services to use unified settings structure')
  
  try {
    const services = ['counter', 'like', 'ranking', 'bbs']
    let totalMigrated = 0
    
    for (const service of services) {
      const migrated = await migrateService(service)
      totalMigrated += migrated
    }
    
    console.log(`\n📈 Migration Summary: ${totalMigrated} services migrated`)
    
    const isComplete = await verifyMigration()
    
    if (isComplete) {
      console.log('\n🎉 Migration complete! All services now use unified settings architecture.')
    } else {
      console.log('\n⚠️  Migration incomplete. Some services still need manual review.')
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