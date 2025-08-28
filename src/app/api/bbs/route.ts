/**
 * BBS API - 新アーキテクチャ版
 */

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { ApiHandler } from '@/lib/core/api-handler'
import { Ok, map } from '@/lib/core/result'
import { bbsService } from '@/domain/bbs/bbs.service'
import { generatePublicId } from '@/lib/core/id'
import { maybeRunAutoCleanup } from '@/lib/core/auto-cleanup'
import { getClientIP, getUserAgent } from '@/lib/utils/api'
import {
  BBSSchemas,
  UnifiedAPISchemas,
  CommonResponseSchemas
} from '@/lib/validation/service-schemas'
import { BBSUpdateSettingsParamsType } from '@/domain/bbs/bbs.entity'

/**
 * CREATE アクション
 */
const createHandler = ApiHandler.create({
  paramsSchema: BBSSchemas.create,
  resultSchema: BBSSchemas.data,
  handler: async ({ url, token, title, messagesPerPage, max, standardSelect, incrementalSelect, emoteSelect, webhookUrl }, request) => {
    const createResult = await bbsService.create(url, token, {
      title,
      messagesPerPage,
      maxMessages: max,
      standardSelect,
      incrementalSelect,
      emoteSelect,
      webhookUrl
    })
    
    if (!createResult.success) {
      return createResult
    }

    // 完全なBBSDataを返す（updateSettingsと同じ）
    return Ok(createResult.data.data)
  }
})

/**
 * POST アクション
 */
const postHandler = ApiHandler.create({
  paramsSchema: BBSSchemas.post,
  resultSchema: BBSSchemas.postResult,
  handler: async ({ id, author, message, standardValue, incrementalValue, emoteValue }, request) => {
    const clientIP = getClientIP(request)
    const userAgent = getUserAgent(request)
    const authorHash = bbsService.generateUserHash(clientIP, userAgent)

    const postResult = await bbsService.postMessageById(id, {
      author,
      message,
      standardValue,
      incrementalValue,
      emoteValue,
      authorHash
    })
    
    if (!postResult.success) {
      return postResult
    }

    return Ok({ 
      success: true as const,
      data: postResult.data.data,
      messageId: postResult.data.messageId,
      editToken: postResult.data.editToken
    })
  }
})


/**
 * EDIT_MESSAGE アクション（オーナー権限）
 */
const editMessageHandler = ApiHandler.create({
  paramsSchema: BBSSchemas.editMessage,
  resultSchema: BBSSchemas.data,
  handler: async ({ url, token, messageId, author, message, standardValue, incrementalValue, emoteValue }, request) => {
    const clientIP = getClientIP(request)
    const userAgent = getUserAgent(request)
    const authorHash = bbsService.generateUserHash(clientIP, userAgent)

    return await bbsService.updateMessage(url, token, {
      messageId,
      author,
      message,
      standardValue,
      incrementalValue,
      emoteValue,
      authorHash
    })
  }
})

/**
 * EDIT_MESSAGE_BY_ID アクション（投稿者権限）
 */
const editMessageByIdHandler = ApiHandler.create({
  paramsSchema: BBSSchemas.editMessageById,
  resultSchema: BBSSchemas.data,
  handler: async ({ id, messageId, editToken, author, message, standardValue, incrementalValue, emoteValue }, request) => {
    return await bbsService.editMessageByIdWithToken(id, messageId, editToken, {
      author,
      message,
      standardValue,
      incrementalValue,
      emoteValue
    })
  }
})

/**
 * DELETE_MESSAGE_BY_ID アクション（投稿者権限）
 */
const deleteMessageByIdHandler = ApiHandler.create({
  paramsSchema: BBSSchemas.deleteMessageById,
  resultSchema: BBSSchemas.data,
  handler: async ({ id, messageId, editToken }, request) => {
    return await bbsService.deleteMessageByIdWithToken(id, messageId, editToken)
  }
})

/**
 * DELETE_MESSAGE アクション（オーナー権限）
 */
const deleteMessageHandler = ApiHandler.create({
  paramsSchema: BBSSchemas.deleteMessage,
  resultSchema: BBSSchemas.data,
  handler: async ({ url, token, messageId }, request) => {
    const clientIP = getClientIP(request)
    const userAgent = getUserAgent(request)
    const authorHash = bbsService.generateUserHash(clientIP, userAgent)
    
    return await bbsService.removeMessage(url, token, {
      messageId,
      authorHash
    })
  }
})

/**
 * CLEAR アクション
 */
const clearHandler = ApiHandler.create({
  paramsSchema: BBSSchemas.clear,
  resultSchema: BBSSchemas.data,
  handler: async ({ url, token }) => {
    return await bbsService.clearBBS(url, token)
  }
})

/**
 * GET アクション
 */
const getHandler = ApiHandler.create({
  paramsSchema: BBSSchemas.get,
  resultSchema: BBSSchemas.data,
  handler: async ({ id, page }) => {
    return await bbsService.getBBSData(id, page)
  }
})

/**
 * DISPLAY アクション (Web Components用)
 */
const displayHandler = ApiHandler.create({
  paramsSchema: BBSSchemas.display,
  resultSchema: BBSSchemas.data,
  handler: async ({ id, page }) => {
    return await bbsService.getBBSData(id, page)
  }
})

/**
 * UPDATE_SETTINGS アクション（オーナー限定）
 */
const updateSettingsHandler = ApiHandler.create({
  paramsSchema: BBSSchemas.updateSettings,
  resultSchema: BBSSchemas.data,
  handler: async ({ url, token, standardSelectLabel, standardSelectOptions, incrementalSelectLabel, incrementalSelectOptions, emoteSelectLabel, emoteSelectOptions, ...params }) => {
    // 個別パラメータをオブジェクトに変換
    const processedParams: Partial<BBSUpdateSettingsParamsType> = { ...params }
    
    if (standardSelectLabel || standardSelectOptions) {
      processedParams.standardSelect = {
        label: standardSelectLabel || '',
        options: standardSelectOptions ? standardSelectOptions.split(',').map(s => s.trim()) : []
      }
    }
    
    if (incrementalSelectLabel || incrementalSelectOptions) {
      processedParams.incrementalSelect = {
        label: incrementalSelectLabel || '',
        options: incrementalSelectOptions ? incrementalSelectOptions.split(',').map(s => s.trim()) : []
      }
    }
    
    if (emoteSelectLabel || emoteSelectOptions) {
      processedParams.emoteSelect = {
        label: emoteSelectLabel || '',
        options: emoteSelectOptions ? emoteSelectOptions.split(',').map(s => s.trim()) : []
      }
    }
    
    return await bbsService.updateSettings(url, token, processedParams)
  }
})

/**
 * DELETE アクション
 */
const deleteHandler = ApiHandler.create({
  paramsSchema: BBSSchemas.delete,
  resultSchema: UnifiedAPISchemas.deleteSuccess,
  handler: async ({ url, token }) => {
    const publicId = generatePublicId(url)
    const deleteResult = await bbsService.delete(url, token)
    
    if (!deleteResult.success) {
      return deleteResult
    }

    return Ok({ success: true as const, message: 'BBS deleted successfully', id: publicId })
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
      
      case 'post':
        return await postHandler(request)
      
      case 'editMessage':
        return await editMessageHandler(request)
      
      case 'deleteMessage':
        return await deleteMessageHandler(request)
      
      case 'editMessageById':
        return await editMessageByIdHandler(request)
      
      case 'deleteMessageById':
        return await deleteMessageByIdHandler(request)
      
      case 'clear':
        return await clearHandler(request)
      
      case 'get':
        return await getHandler(request)
      
      case 'display':
        return await displayHandler(request)
      
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
    console.error('BBS API routing error:', error)
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