/**
 * Like API - 新アーキテクチャ版
 */

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { ApiHandler } from '@/lib/core/api-handler'
import { Ok, Err, map, ValidationError } from '@/lib/core/result'
import { likeService } from '@/domain/like/like.service'
import { generatePublicId } from '@/lib/core/id'
import { maybeRunAutoCleanup } from '@/lib/core/auto-cleanup'
import { getCacheSettings } from '@/lib/core/config'
import { getClientIP, getUserAgent } from '@/lib/utils/api'
import {
  LikeSchemas,
  LikeActionParams,
  UnifiedAPISchemas,
  CommonResponseSchemas
} from '@/lib/validation/service-schemas'
import { CommonSchemas } from '@/lib/core/validation'
import { CounterFieldSchemas } from '@/domain/counter/counter.entity'

/**
 * CREATE アクション
 */
const createHandler = ApiHandler.create({
  paramsSchema: LikeSchemas.create,
  resultSchema: UnifiedAPISchemas.createSuccess,
  handler: async ({ url, token, webhookUrl }, request) => {
    const createResult = await likeService.create(url, token, { webhookUrl })
    
    if (!createResult.success) {
      return createResult
    }

    return map(createResult, result => ({
      success: true as const,
      id: result.id,
      url: result.data.url
    }))
  }
})

/**
 * TOGGLE アクション
 */
const toggleHandler = ApiHandler.create({
  paramsSchema: LikeSchemas.toggle,
  resultSchema: LikeSchemas.data,
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
  paramsSchema: LikeSchemas.get,
  resultSchema: LikeSchemas.data,
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
  LikeSchemas.display.extend({
    format: CounterFieldSchemas.counterFormat.refine(val => val !== 'image').default('json')
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
      LikeSchemas.data, // JSON format
      CommonResponseSchemas.textResponse // text format
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
  LikeSchemas.display,
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
    schema: CommonResponseSchemas.likeSvgData,
    formatter: (data) => {
      // SVG生成ロジック（Counterと同様）
      const iconType = 'heart' // デフォルトはハート
      const icon = iconType === 'heart' ? '❤️' : 
                   iconType === 'star' ? '⭐' : '👍'
      const count = data.total
      
      // テーマ別の色設定
      const themes = {
        light: {
          bg: '#ffffff',
          text: '#000000',
          border: '#cccccc',
          icon: '#ff6b6b'
        },
        dark: {
          bg: '#2a2a2a',
          text: '#ffffff',
          border: '#444444',
          icon: '#ff6b6b'
        },
        kawaii: {
          bg: '#e0f7fa',
          text: '#ff69b4',
          border: '#9c27b0',
          icon: '#ff69b4'
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
  paramsSchema: LikeSchemas.set,
  resultSchema: LikeSchemas.data,
  handler: async ({ url, token, value, webhookUrl }, request) => {
    const ip = getClientIP(request)
    const userAgent = getUserAgent(request)
    const userHash = likeService.generateUserHash(ip, userAgent)
    
    return await likeService.setLikeValue(url, token, value, userHash, webhookUrl)
  }
})

/**
 * UPDATE SETTINGS アクション
 */
const updateSettingsHandler = ApiHandler.create({
  paramsSchema: LikeSchemas.updateSettings,
  resultSchema: LikeSchemas.data,
  handler: async ({ url, token, webhookUrl }) => {
    return await likeService.updateSettings(url, token, { webhookUrl })
  }
})

/**
 * DELETE アクション
 */
const deleteHandler = ApiHandler.create({
  paramsSchema: LikeSchemas.delete,
  resultSchema: UnifiedAPISchemas.deleteSuccess,
  handler: async ({ url, token }) => {
    const publicId = generatePublicId(url)
    const deleteResult = await likeService.delete(url, token)
    
    if (!deleteResult.success) {
      return deleteResult
    }

    return Ok({ success: true as const, message: 'Like deleted successfully', id: publicId })
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
        // スキーマでデフォルト値が適用されるため、事前判定を削除
        const displayFormat = searchParams.get('format')
        
        if (displayFormat === 'image') {
          return await svgHandler(request)
        } else {
          // format未指定またはinteractive/text指定の場合はdisplayハンドラー
          return await displayHandler(request)
        }
      
      case 'set':
        return await setHandler(request)
      
      case 'updateSettings':
        return await updateSettingsHandler(request)
      
      case 'delete':
        return await deleteHandler(request)
      
      default:
        return ApiHandler.create({
          paramsSchema: CommonResponseSchemas.errorAction,
          resultSchema: CommonResponseSchemas.errorResponse,
          handler: async ({ action }) => {
            throw new Error(`Invalid action: ${action}`)
          }
        })(request)
    }
  } catch (error) {
    console.error('Like API routing error:', error)
    return ApiHandler.create({
      paramsSchema: CommonResponseSchemas.emptyParams,
      resultSchema: CommonResponseSchemas.errorResponse,
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