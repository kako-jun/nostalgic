/**
 * 自動削除機能
 * 365日間非アクティブなサービスを自動削除（D1版）
 */

import { getDB } from '@/lib/core/db'

const CLEANUP_PROBABILITY = 0.01 // 1%の確率で実行
const EXPIRY_DAYS = 365 // 365日で期限切れ

type ServiceType = 'counter' | 'like' | 'ranking' | 'bbs'

interface ServiceInfo {
  id: string
  url: string
  type: ServiceType
  createdAt: Date
}

/**
 * 自動クリーンアップを実行（確率的）
 */
export async function maybeRunAutoCleanup(): Promise<void> {
  if (Math.random() >= CLEANUP_PROBABILITY) {
    return // 99%の確率でスキップ
  }

  console.log('Running auto-cleanup check...')
  await runAutoCleanup()
}

/**
 * 自動クリーンアップを強制実行
 */
export async function runAutoCleanup(): Promise<{
  deleted: ServiceInfo[]
  errors: string[]
}> {
  const deleted: ServiceInfo[] = []
  const errors: string[] = []

  try {
    const db = await getDB()
    const cutoffDate = new Date(Date.now() - (EXPIRY_DAYS * 24 * 60 * 60 * 1000)).toISOString()

    // 期限切れサービスを検出
    const expiredServices = await db.prepare(`
      SELECT id, type, url, created_at
      FROM services
      WHERE created_at < ?
    `).bind(cutoffDate).all<{ id: string; type: ServiceType; url: string; created_at: string }>()

    console.log(`Found ${expiredServices.results.length} expired services`)

    // 各サービスを削除（関連テーブルを含む）
    for (const service of expiredServices.results) {
      try {
        console.log(`Deleting expired ${service.type}: ${service.id}`)

        // 関連データを削除
        switch (service.type) {
          case 'counter':
            await db.prepare(`DELETE FROM counters WHERE service_id = ?`).bind(service.id).run()
            await db.prepare(`DELETE FROM counter_daily WHERE service_id = ?`).bind(service.id).run()
            break
          case 'like':
            await db.prepare(`DELETE FROM likes WHERE service_id = ?`).bind(service.id).run()
            break
          case 'ranking':
            await db.prepare(`DELETE FROM ranking_scores WHERE service_id = ?`).bind(`ranking:${service.id}:scores`).run()
            break
          case 'bbs':
            await db.prepare(`DELETE FROM bbs_messages WHERE service_id = ?`).bind(service.id).run()
            break
        }

        // URL マッピング削除
        await db.prepare(`DELETE FROM url_mappings WHERE service_id = ?`).bind(service.id).run()

        // 日次アクション削除
        await db.prepare(`DELETE FROM daily_actions WHERE service_id LIKE ?`).bind(`%${service.id}%`).run()

        // サービス削除
        await db.prepare(`DELETE FROM services WHERE id = ?`).bind(service.id).run()

        deleted.push({
          id: service.id,
          url: service.url,
          type: service.type,
          createdAt: new Date(service.created_at)
        })
        console.log(`Deleted expired ${service.type}: ${service.id}`)

      } catch (error: any) {
        const errorMsg = `Error deleting ${service.type} ${service.id}: ${error.message}`
        errors.push(errorMsg)
        console.error(errorMsg)
      }
    }

    // 期限切れのレート制限を削除
    await db.prepare(`DELETE FROM rate_limits WHERE expires_at < datetime('now')`).run()

    // 古い日次アクションを削除（7日以上前）
    const oldDate = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
    await db.prepare(`DELETE FROM daily_actions WHERE date < ?`).bind(oldDate).run()

    console.log(`Auto-cleanup completed: ${deleted.length} deleted, ${errors.length} errors`)

  } catch (error: any) {
    console.error('Auto-cleanup failed:', error.message)
    errors.push(`Auto-cleanup failed: ${error.message}`)
  }

  return { deleted, errors }
}
