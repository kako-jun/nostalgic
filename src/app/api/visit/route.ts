/**
 * Counter API v2 - 新アーキテクチャ版
 */

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { ApiHandler, ApiHandlerFactory } from '@/lib/core/api-handler'
import { Ok, map, ValidationError } from '@/lib/core/result'
import { counterService } from '@/domain/counter/counter.service'
import { generateCounterSVG } from '@/lib/image-generator'
import { maybeRunAutoCleanup } from '@/lib/core/auto-cleanup'
import { getCacheSettings } from '@/lib/core/config'
import { getClientIP, getUserAgent } from '@/lib/utils/api'
import {
  CounterSchemas,
  CounterActionParams,
  UnifiedAPISchemas,
  CommonResponseSchemas,
  type CounterData
} from '@/lib/validation/service-schemas'
import { CommonSchemas } from '@/lib/core/validation'
import { CounterFieldSchemas } from '@/domain/counter/counter.entity'

/**
 * 統合API パラメータスキーマ - service-schemas から使用
 */
const ApiParamsSchema = CounterActionParams

/**
 * CREATE アクション
 */
const createHandler = ApiHandler.create({
  paramsSchema: CounterSchemas.create,
  resultSchema: UnifiedAPISchemas.createSuccess,
  handler: async ({ url, token, webhookUrl }, request) => {
    const createResult = await counterService.create(url, token, { enableDailyStats: true, webhookUrl })
    
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
 * INCREMENT アクション
 */
const incrementHandler = ApiHandler.create({
  paramsSchema: CounterSchemas.increment,
  resultSchema: CounterSchemas.data,
  handler: async ({ id }, request) => {
    const clientIP = getClientIP(request)
    const userAgent = getUserAgent(request)
    const userHash = counterService.generateUserHash(clientIP, userAgent)

    const result = await counterService.incrementCounter(id, userHash)
    
    if (!result.success) {
      return result
    }

    return map(result, data => ({
      ...data,
      id
    }))
  }
})

/**
 * SET アクション
 */
const setHandler = ApiHandler.create({
  paramsSchema: CounterSchemas.set,
  resultSchema: CounterSchemas.data,
  handler: async ({ url, token, total, webhookUrl }) => {
    return await counterService.setCounterValue(url, token, total, webhookUrl)
  }
})
const updateSettingsHandler = ApiHandler.create({
  paramsSchema: CounterSchemas.updateSettings,
  resultSchema: CounterSchemas.data,
  handler: async ({ url, token, maxValue, enableDailyStats, webhookUrl }) => {
    return await counterService.updateSettings(url, token, { maxValue, enableDailyStats, webhookUrl })
  }
})

/**
 * DISPLAY アクション（特殊レスポンス）
 */
const displayHandler = ApiHandler.createSpecialResponse(
  CounterSchemas.display.extend({
    format: CounterFieldSchemas.counterFormat.default('json')
  }),
  async ({ id, type, format, digits }) => {
    if (format === 'json') {
      return await counterService.getCounterData(id)
    }

    const displayDataResult = await counterService.getDisplayData(id, type)
    if (!displayDataResult.success) {
      return displayDataResult
    }
    
    const displayData = displayDataResult.data
    
    // テキスト形式の場合は指定桁数でパディング
    if (format === 'text' && typeof displayData === 'number') {
      const paddedValue = digits ? String(displayData).padStart(digits, '0') : String(displayData)
      return Ok(paddedValue)
    }
    
    return Ok(displayData)
  },
  {
    schema: z.union([
      CounterSchemas.data, // JSON format
      CommonResponseSchemas.numberResponse, // number format
      CommonResponseSchemas.textResponse // padded text format
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
  CounterSchemas.display,
  async ({ id, type, theme, digits }) => {
    const displayResult = await counterService.getDisplayData(id, type)
    if (!displayResult.success) {
      return displayResult
    }
    
    return Ok({
      value: displayResult.data,
      type: type,
      theme: theme,
      digits: digits
    })
  },
  {
    schema: CommonResponseSchemas.counterSvgData,
    formatter: (data) => generateCounterSVG({
      value: data.value,
      type: data.type,
      style: data.theme,
      digits: data.digits
    }),
    contentType: getCacheSettings().contentTypes.svg,
    cacheControl: `public, max-age=${getCacheSettings().displayMaxAge}`
  }
)

/**
 * DELETE アクション
 */
const deleteHandler = ApiHandler.create({
  paramsSchema: CounterSchemas.delete,
  resultSchema: UnifiedAPISchemas.deleteSuccess,
  handler: async ({ url, token }) => {
    const deleteResult = await counterService.delete(url, token)
    
    if (!deleteResult.success) {
      return deleteResult
    }

    return map(deleteResult, result => ({ 
      success: true as const, 
      message: 'Counter deleted successfully',
      id: result.id 
    }))
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
      
      case 'increment':
        return await incrementHandler(request)
      
      case 'set':
        return await setHandler(request)
      
      case 'updateSettings':
        return await updateSettingsHandler(request)
      
      case 'display':
        // スキーマでデフォルト値が適用されるため、事前判定を削除
        // パラメータ解析をハンドラー側に委譲
        const { searchParams: displayParams } = new URL(request.url)
        const displayFormat = displayParams.get('format')
        
        if (displayFormat === 'json' || displayFormat === 'text') {
          return await displayHandler(request)
        } else {
          // format未指定またはimage指定の場合はSVGハンドラー
          return await svgHandler(request)
        }
      
      case 'delete':
        return await deleteHandler(request)
      
      default:
        return ApiHandler.create({
          paramsSchema: CommonResponseSchemas.errorAction,
          resultSchema: CommonResponseSchemas.errorResponse,
          handler: async ({ action }) => {
            throw new ValidationError(`Invalid action: ${action}`)
          }
        })(request)
    }
  } catch (error) {
    console.error('Counter API routing error:', error)
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