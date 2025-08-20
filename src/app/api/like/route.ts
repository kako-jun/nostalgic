/**
 * Like API - 新アーキテクチャ版
 */

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { ApiHandler } from '@/lib/core/api-handler'
import { Ok, Err, map, ValidationError } from '@/lib/core/result'
import { likeService } from '@/domain/like/like.service'
import { maybeRunAutoCleanup } from '@/lib/core/auto-cleanup'
import { getCacheSettings } from '@/lib/core/config'
import { getClientIP, getUserAgent } from '@/lib/utils/api'
import { LikeDataSchema } from '@/domain/like/like.entity'

/**
 * CREATE アクション
 */
const createHandler = ApiHandler.create({
  paramsSchema: z.object({
    action: z.literal('create'),
    url: z.string().url(),
    token: z.string().min(8).max(16)
  }),
  resultSchema: z.object({
    id: z.string(),
    url: z.string()
  }),
  handler: async ({ url, token }, request) => {
    const createResult = await likeService.create(url, token, {})
    
    if (!createResult.success) {
      return createResult
    }

    return map(createResult, result => ({
      id: result.id,
      url: result.data.url
    }))
  }
})

/**
 * TOGGLE アクション
 */
const toggleHandler = ApiHandler.create({
  paramsSchema: z.object({
    action: z.literal('toggle'),
    id: z.string().regex(/^[a-z0-9-]+-[a-f0-9]{8}$/)
  }),
  resultSchema: LikeDataSchema,
  handler: async ({ id }, request) => {
    const clientIP = getClientIP(request)
    const userAgent = getUserAgent(request)
    const userHash = likeService.generateUserHash(clientIP, userAgent)

    return await likeService.toggleLike(id, userHash)
  }
})

/**
 * GET アクション
 */
const getHandler = ApiHandler.create({
  paramsSchema: z.object({
    action: z.literal('get'),
    id: z.string().regex(/^[a-z0-9-]+-[a-f0-9]{8}$/)
  }),
  resultSchema: LikeDataSchema,
  handler: async ({ id }, request) => {
    const clientIP = getClientIP(request)
    const userAgent = getUserAgent(request)
    const userHash = likeService.generateUserHash(clientIP, userAgent)

    return await likeService.getLikeData(id, userHash)
  }
})

/**
 * DISPLAY アクション（text/json形式）
 */
const displayHandler = ApiHandler.createSpecialResponse(
  z.object({
    action: z.literal('display'),
    id: z.string().regex(/^[a-z0-9-]+-[a-f0-9]{8}$/),
    theme: z.enum(['classic', 'modern', 'retro']).default('classic'),
    format: z.enum(['json', 'text']).default('json')
  }),
  async ({ id, format }, request) => {
    const clientIP = getClientIP(request)
    const userAgent = getUserAgent(request)
    const userHash = likeService.generateUserHash(clientIP, userAgent)

    const likeDataResult = await likeService.getLikeData(id, userHash)
    if (!likeDataResult.success) {
      return likeDataResult
    }

    const likeData = likeDataResult.data

    if (format === 'text') {
      return Ok(likeData.total.toString())
    }

    return Ok(likeData)
  },
  {
    schema: z.union([
      LikeDataSchema, // JSON format
      z.string() // text format
    ]),
    formatter: (data) => {
      if (typeof data === 'object') {
        return JSON.stringify(data, null, 2)
      }
      return data.toString()
    },
    contentType: 'text/plain',
    cacheControl: `public, max-age=${getCacheSettings().displayMaxAge}`
  }
)

/**
 * SVG表示専用ハンドラー
 */
const svgHandler = ApiHandler.createSpecialResponse(
  z.object({
    action: z.literal('display'),
    id: z.string().regex(/^[a-z0-9-]+-[a-f0-9]{8}$/),
    theme: z.enum(['classic', 'modern', 'retro']).default('classic'),
    format: z.literal('image')
  }),
  async ({ id, theme }, request) => {
    const clientIP = getClientIP(request)
    const userAgent = getUserAgent(request)
    const userHash = likeService.generateUserHash(clientIP, userAgent)

    const likeDataResult = await likeService.getLikeData(id, userHash)
    if (!likeDataResult.success) {
      return likeDataResult
    }

    const likeData = likeDataResult.data
    const svgResult = await likeService.generateSVG(likeData, theme)
    
    if (!svgResult.success) {
      return svgResult
    }

    return Ok({
      total: likeData.total,
      theme: theme
    })
  },
  {
    schema: z.object({
      total: z.number().int().min(0),
      theme: z.enum(['classic', 'modern', 'retro'])
    }),
    formatter: (data) => {
      // SVG生成ロジック（Counterと同様）
      const iconType = 'heart' // デフォルトはハート
      const icon = iconType === 'heart' ? '❤️' : 
                   iconType === 'star' ? '⭐' : '👍'
      const count = data.total
      
      // テーマ別の色設定
      const themes = {
        classic: {
          bg: '#ffffff',
          text: '#333333',
          border: '#cccccc',
          icon: '#ff6b6b'
        },
        modern: {
          bg: '#f8f9fa',
          text: '#495057',
          border: '#dee2e6',
          icon: '#e91e63'
        },
        retro: {
          bg: '#fdf6e3',
          text: '#586e75',
          border: '#93a1a1',
          icon: '#dc322f'
        }
      }
      
      const themeColors = themes[data.theme]
      
      return `
        <svg width="120" height="40" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="120" height="40" 
                fill="${themeColors.bg}" 
                stroke="${themeColors.border}" 
                stroke-width="1" 
                rx="5"/>
          <text x="10" y="25" 
                font-family="Arial, sans-serif" 
                font-size="14" 
                fill="${themeColors.icon}">${icon}</text>
          <text x="30" y="25" 
                font-family="Arial, sans-serif" 
                font-size="14" 
                fill="${themeColors.text}">${count}</text>
        </svg>
      `.replace(/\n\s+/g, ' ').trim()
    },
    contentType: getCacheSettings().contentTypes.svg,
    cacheControl: `public, max-age=${getCacheSettings().displayMaxAge}`
  }
)

/**
 * SET アクション
 */
const setHandler = ApiHandler.create({
  paramsSchema: z.object({
    action: z.literal('set'),
    url: z.string().url(),
    token: z.string().min(8).max(16),
    value: z.coerce.number().min(0)
  }),
  resultSchema: LikeDataSchema,
  handler: async ({ url, token, value }, request) => {
    const ip = getClientIP(request)
    const userAgent = getUserAgent(request)
    const userHash = likeService.generateUserHash(ip, userAgent)
    
    const setResult = await likeService.setLikeValue(url, token, value, userHash)
    
    if (!setResult.success) {
      return setResult
    }

    return setResult
  }
})

/**
 * DELETE アクション
 */
const deleteHandler = ApiHandler.create({
  paramsSchema: z.object({
    action: z.literal('delete'),
    url: z.string().url(),
    token: z.string().min(8).max(16)
  }),
  resultSchema: z.object({
    success: z.literal(true),
    message: z.string()
  }),
  handler: async ({ url, token }) => {
    const deleteResult = await likeService.delete(url, token)
    
    if (!deleteResult.success) {
      return deleteResult
    }

    return Ok({ success: true as const, message: 'Like deleted successfully' })
  }
})

/**
 * ルーティング関数
 */
async function routeRequest(request: NextRequest) {
  // 1%の確率で自動クリーンアップを実行
  await maybeRunAutoCleanup()
  
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'create':
        return await createHandler(request)
      
      case 'toggle':
        return await toggleHandler(request)
      
      case 'get':
        return await getHandler(request)
      
      case 'display':
        const format = searchParams.get('format') || 'json'
        if (format === 'image') {
          return await svgHandler(request)
        } else {
          return await displayHandler(request)
        }
      
      case 'set':
        return await setHandler(request)
      
      case 'delete':
        return await deleteHandler(request)
      
      default:
        return ApiHandler.create({
          paramsSchema: z.object({ action: z.string() }),
          resultSchema: z.object({ error: z.string() }),
          handler: async ({ action }) => {
            throw new Error(`Invalid action: ${action}`)
          }
        })(request)
    }
  } catch (error) {
    console.error('Like API routing error:', error)
    return ApiHandler.create({
      paramsSchema: z.object({}),
      resultSchema: z.object({ error: z.string() }),
      handler: async () => {
        throw new Error('Internal server error')
      }
    })(request)
  }
}

// HTTP メソッドハンドラー
export async function GET(request: NextRequest) {
  return await routeRequest(request)
}