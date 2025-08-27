#!/usr/bin/env node
/**
 * Database Detail Viewer
 * 全サービスの詳細データ（設定値含む）をYAML風で表示
 * 
 * Usage:
 *   npm run db:detail          # 全サービス
 *   npm run db:detail counter  # Counterのみ
 *   npm run db:detail like     # Likeのみ  
 *   npm run db:detail ranking  # Rankingのみ
 *   npm run db:detail bbs      # BBSのみ
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
 * Counter詳細データ取得
 */
async function getCounterDetails(id) {
  const pipeline = redis.pipeline()
  pipeline.get(`counter:${id}`)
  pipeline.get(`counter:${id}:total`)
  
  // 日別データ（最新7日分）
  const today = new Date()
  const dates = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    dates.push(dateStr)
    pipeline.get(`counter:${id}:daily:${dateStr}`)
  }
  
  const results = await pipeline.exec()
  let idx = 0
  
  const metadata = results[idx++][1] ? JSON.parse(results[idx-1][1]) : null
  const total = parseInt(results[idx++][1]) || 0
  
  const dailyData = {}
  for (const date of dates) {
    dailyData[date] = parseInt(results[idx++][1]) || 0
  }
  
  return {
    metadata,
    stats: { total, daily: dailyData },
    id
  }
}

/**
 * Like詳細データ取得
 */
async function getLikeDetails(id) {
  const pipeline = redis.pipeline()
  pipeline.get(`like:${id}`)
  pipeline.get(`like:${id}:total`)
  pipeline.keys(`like:${id}:users:*`)
  
  const results = await pipeline.exec()
  
  const metadata = results[0][1] ? JSON.parse(results[0][1]) : null
  const total = parseInt(results[1][1]) || 0
  const activeUsers = results[2][1]?.length || 0
  
  return {
    metadata,
    stats: { total, activeUsers },
    id
  }
}

/**
 * Ranking詳細データ取得
 */
async function getRankingDetails(id) {
  const pipeline = redis.pipeline()
  pipeline.get(`ranking:${id}`)
  pipeline.zrevrange(`ranking:${id}:scores`, 0, 4, 'WITHSCORES') // Top 5
  pipeline.zcard(`ranking:${id}:scores`)
  pipeline.hgetall(`${id}:display_scores`) // 表示用スコア取得
  
  const results = await pipeline.exec()
  
  const metadata = results[0][1] ? JSON.parse(results[0][1]) : null
  const topScores = results[1][1] || []
  const totalEntries = results[2][1] || 0
  const displayScores = results[3][1] || {}
  
  // スコアデータを整形
  const scores = []
  for (let i = 0; i < topScores.length; i += 2) {
    const player = topScores[i]
    const numericScore = parseFloat(topScores[i + 1])
    const displayScore = displayScores[player] || numericScore.toString()
    
    scores.push({
      rank: Math.floor(i / 2) + 1,
      player: player,
      score: numericScore,
      displayScore: displayScore
    })
  }
  
  return {
    metadata,
    stats: { totalEntries, topScores: scores },
    id
  }
}

/**
 * BBS詳細データ取得
 */
async function getBBSDetails(id) {
  const pipeline = redis.pipeline()
  pipeline.get(`bbs:${id}`)
  pipeline.llen(`bbs:${id}:messages`)
  pipeline.lrange(`bbs:${id}:messages`, 0, 2) // 最新3件
  
  const results = await pipeline.exec()
  
  const metadata = results[0][1] ? JSON.parse(results[0][1]) : null
  const messageCount = results[1][1] || 0
  const recentMessages = (results[2][1] || []).map(msg => {
    try {
      const parsed = JSON.parse(msg)
      return {
        id: parsed.id,
        author: parsed.author,
        message: parsed.message.length > 50 ? parsed.message.substring(0, 47) + '...' : parsed.message,
        timestamp: parsed.timestamp
      }
    } catch (e) {
      return { error: 'Failed to parse message' }
    }
  })
  
  return {
    metadata,
    stats: { messageCount, recentMessages },
    id
  }
}

/**
 * YAML風フォーマットで出力（詳細版）
 */
function formatYAML(obj, indent = 0) {
  const spaces = '  '.repeat(indent)
  let output = ''
  
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      output += `${spaces}${key}: null\n`
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      output += `${spaces}${key}:\n${formatYAML(value, indent + 1)}`
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        output += `${spaces}${key}: []\n`
      } else {
        output += `${spaces}${key}:\n`
        for (const item of value) {
          if (typeof item === 'object' && item !== null) {
            output += `${spaces}  -\n`
            for (const [subKey, subValue] of Object.entries(item)) {
              if (typeof subValue === 'object') {
                output += `${spaces}    ${subKey}:\n${formatYAML(subValue, indent + 3)}`
              } else {
                output += `${spaces}    ${subKey}: ${subValue}\n`
              }
            }
          } else {
            output += `${spaces}  - ${item}\n`
          }
        }
      }
    } else if (typeof value === 'string' && value.length > 100) {
      // 長い文字列は改行して表示
      output += `${spaces}${key}: |\n`
      const lines = value.match(/.{1,80}/g) || []
      for (const line of lines) {
        output += `${spaces}  ${line}\n`
      }
    } else {
      output += `${spaces}${key}: ${value}\n`
    }
  }
  
  return output
}

/**
 * サービス別詳細表示
 */
async function showServiceDetails(serviceType) {
  const allKeys = []
  const stream = redis.scanStream({ match: `${serviceType}:*`, count: 100 })
  
  for await (const keys of stream) {
    allKeys.push(...keys)
  }
  
  // メタデータキーのみを抽出（サービスID取得）
  const serviceIds = allKeys
    .filter(key => /^[^:]+:[^:]+$/.test(key))
    .map(key => key.split(':')[1])
  
  if (serviceIds.length === 0) {
    console.log(`No ${serviceType} services found.`)
    return
  }
  
  console.log(`${serviceType.toUpperCase()} SERVICES (${serviceIds.length} found):\n`)
  
  for (const id of serviceIds) {
    let details
    
    try {
      switch (serviceType) {
        case 'counter':
          details = await getCounterDetails(id)
          break
        case 'like':
          details = await getLikeDetails(id)
          break
        case 'ranking':
          details = await getRankingDetails(id)
          break
        case 'bbs':
          details = await getBBSDetails(id)
          break
        default:
          console.log(`Unknown service type: ${serviceType}`)
          continue
      }
      
      if (!details.metadata) {
        console.log(`  ${id}: (no metadata found)`)
        continue
      }
      
      console.log(`  ${id}:`)
      console.log(`    url: ${details.metadata.url}`)
      console.log(`    created: ${details.metadata.created}`)
      
      if (details.stats) {
        console.log('    stats:')
        console.log(formatYAML(details.stats, 3))
      }
      
      // 設定表示（統一設定アーキテクチャ）
      if (details.metadata.settings) {
        console.log('    settings:')
        console.log(formatYAML(details.metadata.settings, 3))
      }
      
      // webhookUrl の表示（settingsの外にある場合）
      if (details.metadata.webhookUrl) {
        console.log('    webhookUrl: ' + details.metadata.webhookUrl)
      }
      
      // メタデータの他のプロパティも表示
      const metadataToShow = { ...details.metadata }
      delete metadataToShow.service
      delete metadataToShow.id
      delete metadataToShow.url
      delete metadataToShow.created
      delete metadataToShow.settings
      delete metadataToShow.lastVisit
      delete metadataToShow.lastLike
      delete metadataToShow.lastSubmit
      delete metadataToShow.lastMessage
      delete metadataToShow.webhookUrl
      
      if (Object.keys(metadataToShow).length > 0) {
        console.log('    metadata:')
        console.log(formatYAML(metadataToShow, 3))
      }
      
      // 最終アクティビティ
      const lastActivity = details.metadata.lastVisit || 
                          details.metadata.lastLike || 
                          details.metadata.lastSubmit || 
                          details.metadata.lastMessage
      if (lastActivity) {
        console.log(`    lastActivity: ${lastActivity}`)
      }
      
      console.log()
      
    } catch (error) {
      console.log(`  ${id}: (error loading details - ${error.message})`)
    }
  }
}

/**
 * 全サービス表示
 */
async function showAllServices() {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19)
  console.log(`# Redis Database - Full Details (${timestamp})\n`)
  
  const services = ['counter', 'like', 'ranking', 'bbs']
  
  for (const service of services) {
    await showServiceDetails(service)
  }
}

/**
 * メイン処理
 */
async function main() {
  const serviceFilter = process.argv[2]
  
  try {
    if (serviceFilter && ['counter', 'like', 'ranking', 'bbs'].includes(serviceFilter)) {
      console.log(`# ${serviceFilter.toUpperCase()} Service Details\n`)
      await showServiceDetails(serviceFilter)
    } else if (serviceFilter) {
      console.log(`❌ Invalid service: ${serviceFilter}`)
      console.log('Valid services: counter, like, ranking, bbs')
      console.log('Usage: npm run db:detail [service]')
      process.exit(1)
    } else {
      await showAllServices()
    }
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