#!/usr/bin/env node
/**
 * Database Summary Dashboard
 * 人間が一目で把握できるサービス概要を表示
 * 
 * Usage:
 *   npm run db:summary
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
 * 高速データ取得（パイプライン使用）
 */
async function fetchAllData() {
  console.log('Loading services...')
  
  // 1. 全キーをSCANで取得（KEYSより高速）
  const allKeys = []
  const stream = redis.scanStream({ count: 100 })
  
  for await (const keys of stream) {
    allKeys.push(...keys)
  }
  
  // 2. サービス別にIDを抽出
  const services = { counter: [], like: [], ranking: [], bbs: [] }
  const serviceIds = { counter: new Set(), like: new Set(), ranking: new Set(), bbs: new Set() }
  
  // メタデータキーからIDを抽出
  for (const key of allKeys) {
    const match = key.match(/^(counter|like|ranking|bbs):([^:]+)$/)
    if (match) {
      const [, service, id] = match
      serviceIds[service].add(id)
    }
  }
  
  // 3. 各サービスのデータを並列取得
  for (const [serviceName, ids] of Object.entries(serviceIds)) {
    for (const id of ids) {
      const pipeline = redis.pipeline()
      
      // メタデータ
      pipeline.get(`${serviceName}:${id}`)
      
      // 統計データ
      if (serviceName === 'counter') {
        pipeline.get(`${serviceName}:${id}:total`)
        // 今日のカウントも取得
        const today = new Date().toISOString().split('T')[0]
        pipeline.get(`${serviceName}:${id}:daily:${today}`)
      } else if (serviceName === 'like') {
        pipeline.get(`${serviceName}:${id}:total`)
      } else if (serviceName === 'ranking') {
        pipeline.zcard(`ranking:${id}:scores`)
      } else if (serviceName === 'bbs') {
        pipeline.llen(`bbs:${id}:messages`)
      }
      
      const results = await pipeline.exec()
      
      // メタデータのパース
      let metadata = null
      if (results[0][0] === null && results[0][1]) {
        try {
          metadata = JSON.parse(results[0][1])
        } catch (e) {
          console.warn(`Failed to parse metadata for ${serviceName}:${id}`)
          continue
        }
      }
      
      if (!metadata) continue
      
      // 統計データの取得
      let statsData = {}
      if (serviceName === 'counter') {
        // total
        if (results[1][0] === null) {
          statsData.total = parseInt(results[1][1]) || 0
        }
        // today
        if (results[2] && results[2][0] === null) {
          statsData.today = parseInt(results[2][1]) || 0
        }
      } else if (serviceName === 'like') {
        if (results[1][0] === null) {
          statsData.total = parseInt(results[1][1]) || 0
        }
      } else if (serviceName === 'ranking') {
        if (results[1][0] === null) {
          statsData.entries = parseInt(results[1][1]) || 0
        }
      } else if (serviceName === 'bbs') {
        if (results[1][0] === null) {
          statsData.messages = parseInt(results[1][1]) || 0
        }
      }
      
      services[serviceName].push({
        id,
        ...metadata,
        _statsData: statsData
      })
    }
  }
  
  return services
}

/**
 * 日数計算
 */
function getDaysAgo(dateStr) {
  if (!dateStr) return null
  const today = new Date()
  const date = new Date(dateStr)
  const diffTime = today.getTime() - date.getTime()
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * ステータス判定（最終アクティビティから）
 */
function getStatus(daysAgo) {
  if (daysAgo === null) return 'never'
  if (daysAgo <= 1) return 'active'
  if (daysAgo <= 7) return 'quiet'
  return 'stale'
}

/**
 * メインダッシュボード表示
 */
async function showDashboard() {
  const services = await fetchAllData()
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16)
  
  console.log(`\n=== NOSTALGIC SERVICES DASHBOARD ===                    ${now}\n`)
  
  // Counter Services
  if (services.counter.length > 0) {
    console.log('📊 COUNTERS')
    console.log('┌────────────────────────────────────────┬──────────────────────┬─────────┬─────────┬─────────────────────┬──────────────┐')
    console.log('│ URL                                    │ ID                   │ Total   │ Today   │ Last Access         │ Status       │')
    console.log('├────────────────────────────────────────┼──────────────────────┼─────────┼─────────┼─────────────────────┼──────────────┤')
    
    for (const counter of services.counter.sort((a, b) => a.url.localeCompare(b.url))) {
      const url = counter.url.length > 38 ? counter.url.substring(0, 35) + '...' : counter.url
      const id = counter.id.padEnd(20)
      const total = (counter._statsData.total || 0).toLocaleString()
      const today = (counter._statsData.today || 0).toLocaleString()
      const lastAccess = counter.lastVisit ? counter.lastVisit.substring(0, 19).replace('T', ' ') : 'Never'
      const daysAgo = getDaysAgo(counter.lastVisit)
      const status = getStatus(daysAgo)
      
      console.log(`│ ${url.padEnd(38)} │ ${id} │ ${total.padStart(7)} │ ${today.padStart(7)} │ ${lastAccess.padEnd(19)} │ ${status.padEnd(12)} │`)
    }
    
    console.log('└────────────────────────────────────────┴──────────────────────┴─────────┴─────────┴─────────────────────┴──────────────┘\n')
  }
  
  // Like Services  
  if (services.like.length > 0) {
    console.log('💖 LIKES')
    console.log('┌────────────────────────────────────────┬──────────────────────┬─────────┬─────────────────────┬──────────────┐')
    console.log('│ URL                                    │ ID                   │ Hearts  │ Last Like           │ Status       │')
    console.log('├────────────────────────────────────────┼──────────────────────┼─────────┼─────────────────────┼──────────────┤')
    
    for (const like of services.like.sort((a, b) => a.url.localeCompare(b.url))) {
      const url = like.url.length > 38 ? like.url.substring(0, 35) + '...' : like.url
      const id = like.id.padEnd(20)
      const total = (like._statsData.total || 0).toLocaleString()
      const lastLike = like.lastLike ? like.lastLike.substring(0, 19).replace('T', ' ') : 'Never'
      const daysAgo = getDaysAgo(like.lastLike)
      const status = getStatus(daysAgo)
      
      console.log(`│ ${url.padEnd(38)} │ ${id} │ ${total.padStart(7)} │ ${lastLike.padEnd(19)} │ ${status.padEnd(12)} │`)
    }
    
    console.log('└────────────────────────────────────────┴──────────────────────┴─────────┴─────────────────────┴──────────────┘\n')
  }
  
  // Ranking Services
  if (services.ranking.length > 0) {
    console.log('🏆 RANKINGS')
    console.log('┌────────────────────────────────────────┬──────────────────────┬─────────┬─────────────────────┬──────────────┐')
    console.log('│ URL                                    │ ID                   │ Entries │ Last Submit         │ Status       │')
    console.log('├────────────────────────────────────────┼──────────────────────┼─────────┼─────────────────────┼──────────────┤')
    
    for (const ranking of services.ranking.sort((a, b) => a.url.localeCompare(b.url))) {
      const url = ranking.url.length > 38 ? ranking.url.substring(0, 35) + '...' : ranking.url
      const id = ranking.id.padEnd(20)
      const maxEntries = ranking.settings?.maxEntries || 100
      const entries = `${ranking._statsData.entries || 0}/${maxEntries}`
      const lastSubmit = ranking.lastSubmit ? ranking.lastSubmit.substring(0, 19).replace('T', ' ') : 'Never'
      const daysAgo = getDaysAgo(ranking.lastSubmit)
      const status = getStatus(daysAgo)
      
      console.log(`│ ${url.padEnd(38)} │ ${id} │ ${entries.padStart(7)} │ ${lastSubmit.padEnd(19)} │ ${status.padEnd(12)} │`)
    }
    
    console.log('└────────────────────────────────────────┴──────────────────────┴─────────┴─────────────────────┴──────────────┘\n')
  }
  
  // BBS Services
  if (services.bbs.length > 0) {
    console.log('💬 BBS')
    console.log('┌────────────────────────────────────────┬──────────────────────┬──────────┬─────────────────────┬──────────────┐')
    console.log('│ URL                                    │ ID                   │ Messages │ Last Post           │ Status       │')
    console.log('├────────────────────────────────────────┼──────────────────────┼──────────┼─────────────────────┼──────────────┤')
    
    for (const bbs of services.bbs.sort((a, b) => a.url.localeCompare(b.url))) {
      const url = bbs.url.length > 38 ? bbs.url.substring(0, 35) + '...' : bbs.url
      const id = bbs.id.padEnd(20)
      const maxMessages = bbs.settings?.maxMessages || 1000
      const messages = `${bbs._statsData.messages || 0}/${maxMessages}`
      const lastMessage = bbs.lastMessage ? bbs.lastMessage.substring(0, 19).replace('T', ' ') : 'Never'
      const daysAgo = getDaysAgo(bbs.lastMessage)
      const status = getStatus(daysAgo)
      
      console.log(`│ ${url.padEnd(38)} │ ${id} │ ${messages.padStart(8)} │ ${lastMessage.padEnd(19)} │ ${status.padEnd(12)} │`)
    }
    
    console.log('└────────────────────────────────────────┴──────────────────────┴──────────┴─────────────────────┴──────────────┘\n')
  }
  
  // Summary
  const totalServices = services.counter.length + services.like.length + services.ranking.length + services.bbs.length
  const activeCount = Object.values(services).flat().filter(s => {
    const lastActivity = s.lastVisit || s.lastLike || s.lastSubmit || s.lastMessage
    const daysAgo = getDaysAgo(lastActivity)
    return getStatus(daysAgo) === 'active'
  }).length
  
  console.log('📈 OVERVIEW')
  console.log(`Total Services: ${totalServices} | Active Today: ${activeCount}`)
  console.log(`Counters: ${services.counter.length} | Likes: ${services.like.length} | Rankings: ${services.ranking.length} | BBS: ${services.bbs.length}`)
  
  console.log('\n💡 Commands:')
  console.log('  npm run db:detail [service]  - Show detailed data with settings')
  console.log('  API delete: curl "HOST/api/SERVICE?action=delete&url=URL&token=TOKEN"')
}

/**
 * メイン実行
 */
async function main() {
  try {
    await showDashboard()
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    await redis.quit()
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})