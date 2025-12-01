/**
 * 管理者用クリーンアップAPI
 * 古いフォーマットのインスタンスを削除するための特別なエンドポイント（D1版）
 */

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { ApiHandler } from '@/lib/core/api-handler'
import { Ok, Err, ValidationError } from '@/lib/core/result'
import { getDB } from '@/lib/core/db'
import { runAutoCleanup } from '@/lib/core/auto-cleanup'

const OLD_INSTANCE_IDS = [
  'llll-ll-3f2d5e94',
  'demo-562a8fd7',
  'nostalgi-5e343478'
]

/**
 * インスタンスのクリーンアップ
 */
const cleanupHandler = ApiHandler.create({
  paramsSchema: z.object({
    adminToken: z.string(),
    targetId: z.string().optional()
  }),
  resultSchema: z.object({
    success: z.literal(true),
    deletedCount: z.number(),
    message: z.string()
  }),
  handler: async ({ adminToken, targetId }) => {
    // 管理者トークンの検証（環境変数から取得）
    const expectedToken = process.env.ADMIN_CLEANUP_TOKEN
    if (!expectedToken || adminToken !== expectedToken) {
      return Err(new ValidationError('Invalid admin token'))
    }

    const db = await getDB()
    let totalDeleted = 0

    try {
      // 削除対象のIDリスト（targetIdが指定されていない場合は古いIDリストを使用）
      const idsToDelete = targetId ? [targetId] : OLD_INSTANCE_IDS

      for (const id of idsToDelete) {
        console.log(`Cleaning up instance: ${id}`)

        // 関連データを削除
        const counterResult = await db.prepare(`DELETE FROM counters WHERE service_id LIKE ?`).bind(`%${id}%`).run()
        const dailyResult = await db.prepare(`DELETE FROM counter_daily WHERE service_id LIKE ?`).bind(`%${id}%`).run()
        const likeResult = await db.prepare(`DELETE FROM likes WHERE service_id LIKE ?`).bind(`%${id}%`).run()
        const rankingResult = await db.prepare(`DELETE FROM ranking_scores WHERE service_id LIKE ?`).bind(`%${id}%`).run()
        const bbsResult = await db.prepare(`DELETE FROM bbs_messages WHERE service_id LIKE ?`).bind(`%${id}%`).run()
        const urlResult = await db.prepare(`DELETE FROM url_mappings WHERE service_id LIKE ?`).bind(`%${id}%`).run()
        const dailyActionsResult = await db.prepare(`DELETE FROM daily_actions WHERE service_id LIKE ?`).bind(`%${id}%`).run()
        const serviceResult = await db.prepare(`DELETE FROM services WHERE id LIKE ?`).bind(`%${id}%`).run()

        totalDeleted +=
          (counterResult.meta?.changes || 0) +
          (dailyResult.meta?.changes || 0) +
          (likeResult.meta?.changes || 0) +
          (rankingResult.meta?.changes || 0) +
          (bbsResult.meta?.changes || 0) +
          (urlResult.meta?.changes || 0) +
          (dailyActionsResult.meta?.changes || 0) +
          (serviceResult.meta?.changes || 0)
      }

      return Ok({
        success: true as const,
        deletedCount: totalDeleted,
        message: `Cleaned up ${idsToDelete.length} instances, ${totalDeleted} rows deleted`
      })

    } catch (error: any) {
      return Err(new ValidationError('Cleanup failed', {
        error: error.message
      }))
    }
  }
})

/**
 * 自動クリーンアップ（365日期限切れサービス削除）
 */
const autoCleanupHandler = ApiHandler.create({
  paramsSchema: z.object({
    adminToken: z.string()
  }),
  resultSchema: z.object({
    success: z.literal(true),
    deletedServices: z.array(z.object({
      id: z.string(),
      type: z.string(),
      url: z.string()
    })),
    errors: z.array(z.string()),
    totalDeleted: z.number()
  }),
  handler: async ({ adminToken }) => {
    // 管理者トークンの検証
    const expectedToken = process.env.ADMIN_CLEANUP_TOKEN
    if (!expectedToken || adminToken !== expectedToken) {
      return Err(new ValidationError('Invalid admin token'))
    }

    const { deleted, errors } = await runAutoCleanup()

    return Ok({
      success: true as const,
      deletedServices: deleted.map(s => ({
        id: s.id,
        type: s.type,
        url: s.url
      })),
      errors,
      totalDeleted: deleted.length
    })
  }
})

/**
 * 特定のURLパターンに関連するインスタンスをクリーンアップ
 */
const cleanupByUrlHandler = ApiHandler.create({
  paramsSchema: z.object({
    adminToken: z.string(),
    urlPattern: z.string()
  }),
  resultSchema: z.object({
    success: z.literal(true),
    foundInstances: z.array(z.string()),
    deletedCount: z.number()
  }),
  handler: async ({ adminToken, urlPattern }) => {
    // 管理者トークンの検証
    const expectedToken = process.env.ADMIN_CLEANUP_TOKEN
    if (!expectedToken || adminToken !== expectedToken) {
      return Err(new ValidationError('Invalid admin token'))
    }

    const db = await getDB()
    const foundInstances: string[] = []
    let totalDeleted = 0

    try {
      // URLパターンに一致するインスタンスを検索
      const services = await db.prepare(`
        SELECT service_id FROM url_mappings WHERE url LIKE ?
      `).bind(`%${urlPattern}%`).all<{ service_id: string }>()

      for (const { service_id } of services.results) {
        foundInstances.push(service_id)

        // 関連データを削除
        await db.prepare(`DELETE FROM counters WHERE service_id = ?`).bind(service_id).run()
        await db.prepare(`DELETE FROM counter_daily WHERE service_id = ?`).bind(service_id).run()
        await db.prepare(`DELETE FROM likes WHERE service_id = ?`).bind(service_id).run()
        await db.prepare(`DELETE FROM ranking_scores WHERE service_id LIKE ?`).bind(`%${service_id}%`).run()
        await db.prepare(`DELETE FROM bbs_messages WHERE service_id = ?`).bind(service_id).run()
        await db.prepare(`DELETE FROM url_mappings WHERE service_id = ?`).bind(service_id).run()
        await db.prepare(`DELETE FROM daily_actions WHERE service_id LIKE ?`).bind(`%${service_id}%`).run()
        const result = await db.prepare(`DELETE FROM services WHERE id = ?`).bind(service_id).run()
        totalDeleted += result.meta?.changes || 0
      }

      return Ok({
        success: true as const,
        foundInstances,
        deletedCount: totalDeleted
      })

    } catch (error: any) {
      return Err(new ValidationError('Cleanup failed', {
        error: error.message,
        foundInstances
      }))
    }
  }
})

// HTTPメソッドハンドラー
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  switch (action) {
    case 'cleanup':
      return await cleanupHandler(request)
    case 'autoCleanup':
      return await autoCleanupHandler(request)
    case 'cleanupByUrl':
      return await cleanupByUrlHandler(request)
    default:
      return ApiHandler.create({
        paramsSchema: z.object({ action: z.string() }),
        resultSchema: z.object({ error: z.string() }),
        handler: async ({ action }) => {
          throw new ValidationError(`Invalid action: ${action}`)
        }
      })(request)
  }
}
