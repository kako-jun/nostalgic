/**
 * BBS Domain Entity - 掲示板機能のエンティティ定義
 */

import { z } from 'zod'
import { CommonSchemas } from '@/lib/core/validation'

/**
 * BBS制限値定数
 */
export const BBS_LIMITS = {
  TITLE_MAX: 100,
  AUTHOR_MAX: 20,
  MESSAGE_TEXT_MIN: 1,
  MESSAGE_TEXT_MAX: 200,
  SELECT_LABEL_MIN: 1,
  SELECT_LABEL_MAX: 50,
  SELECT_OPTION_MIN: 1,
  SELECT_OPTION_MAX: 50,
  MAX_MESSAGES_MIN: 1,
  MAX_MESSAGES_MAX: 10000,
  MESSAGES_PER_PAGE_MIN: 1,
  MESSAGES_PER_PAGE_MAX: 100,
  UPDATE_MESSAGES_PER_PAGE_MIN: 1,
  UPDATE_MESSAGES_PER_PAGE_MAX: 50,
  UPDATE_MAX_MESSAGES_MIN: 1,
  UPDATE_MAX_MESSAGES_MAX: 1000,
} as const

/**
 * BBS固有のフィールドスキーマ
 */
export const BBSFieldSchemas = {
  bbsTitle: z.string().max(BBS_LIMITS.TITLE_MAX),
  author: z.string().max(BBS_LIMITS.AUTHOR_MAX),
  messageText: z.string().min(BBS_LIMITS.MESSAGE_TEXT_MIN).max(BBS_LIMITS.MESSAGE_TEXT_MAX),
  messageId: z.string(),
  authorHash: z.string(),
  page: z.coerce.number().int().min(1),
  maxMessages: z.coerce.number().int().min(BBS_LIMITS.MAX_MESSAGES_MIN).max(BBS_LIMITS.MAX_MESSAGES_MAX),
  messagesPerPage: z.coerce.number().int().min(BBS_LIMITS.MESSAGES_PER_PAGE_MIN).max(BBS_LIMITS.MESSAGES_PER_PAGE_MAX),
  selectLabel: z.string().min(BBS_LIMITS.SELECT_LABEL_MIN).max(BBS_LIMITS.SELECT_LABEL_MAX),
  selectOption: z.string().min(BBS_LIMITS.SELECT_OPTION_MIN).max(BBS_LIMITS.SELECT_OPTION_MAX),
  format: z.enum(['interactive']),
  enableFlags: z.coerce.boolean(),
  updateMessagesPerPage: z.coerce.number().int().min(BBS_LIMITS.UPDATE_MESSAGES_PER_PAGE_MIN).max(BBS_LIMITS.UPDATE_MESSAGES_PER_PAGE_MAX),
  updateMaxMessages: z.coerce.number().int().min(BBS_LIMITS.UPDATE_MAX_MESSAGES_MIN).max(BBS_LIMITS.UPDATE_MAX_MESSAGES_MAX),
  editToken: z.string(),
  // 3種類のセレクト機能用
  selectConfig: z.object({
    label: z.string().default(''),
    options: z.array(z.string()).default([])
  }).default({ label: '', options: [] }),
  standardValue: z.string().optional(),
  incrementalValue: z.string().optional(),
  emoteValue: z.string().optional()
} as const

/**
 * BBSエンティティの基本型
 */
export interface BBSEntity {
  id: string
  url: string
  created: Date
  totalMessages: number
  lastMessage?: Date
  settings: BBSSettings
}

/**
 * BBS設定の型
 */
export interface BBSSettings {
  title: string
  maxMessages: number
  messagesPerPage: number
  standardSelect?: SelectConfig
  incrementalSelect?: SelectConfig
  emoteSelect?: SelectConfig
  webhookUrl?: string
}

/**
 * セレクト設定の型
 */
export interface SelectConfig {
  label: string
  options: string[]
}


/**
 * BBSメッセージの型
 */
export interface BBSMessage {
  id: string
  author: string
  message: string
  timestamp: Date
  standardValue?: string
  incrementalValue?: string
  emoteValue?: string
  authorHash: string
}

/**
 * クライアントに返すBBSデータの型
 */
export interface BBSData {
  id: string
  url: string
  title: string
  messages: BBSMessage[]
  totalMessages: number
  currentPage: number
  totalPages: number
  pagination: {
    page: number
    totalPages: number
    hasPrev: boolean
    hasNext: boolean
  }
  settings: BBSSettings
  lastMessage?: Date
}

/**
 * BBS作成時のパラメータ
 */
export interface BBSCreateParams {
  title?: string
  maxMessages?: number
  messagesPerPage?: number
  standardSelect?: SelectConfig
  incrementalSelect?: SelectConfig
  emoteSelect?: SelectConfig
  webhookUrl?: string
}

/**
 * メッセージ投稿時のパラメータ
 */
export interface BBSPostParams {
  author: string
  message: string
  standardValue?: string
  incrementalValue?: string
  emoteValue?: string
  authorHash: string
}

/**
 * メッセージ更新時のパラメータ
 */
export interface BBSUpdateParams {
  messageId: string
  author: string
  message: string
  standardValue?: string
  incrementalValue?: string
  emoteValue?: string
  authorHash: string
}

/**
 * メッセージ削除時のパラメータ
 */
export interface BBSRemoveParams {
  messageId: string
  authorHash: string
}

/**
 * BBS表示時のパラメータ
 */
export interface BBSDisplayParams {
  id: string
  page?: number
}

/**
 * Zodスキーマ定義
 */
export const BBSSettingsSchema = z.object({
  title: BBSFieldSchemas.bbsTitle.default('📝 BBS'),
  maxMessages: BBSFieldSchemas.maxMessages,
  messagesPerPage: BBSFieldSchemas.messagesPerPage,
  standardSelect: BBSFieldSchemas.selectConfig.optional(),
  incrementalSelect: BBSFieldSchemas.selectConfig.optional(),
  emoteSelect: BBSFieldSchemas.selectConfig.optional(),
  webhookUrl: CommonSchemas.url.optional()
})

export const BBSEntitySchema = z.object({
  id: CommonSchemas.publicId,
  url: CommonSchemas.url,
  created: CommonSchemas.date,
  totalMessages: CommonSchemas.nonNegativeInt,
  lastMessage: CommonSchemas.date.optional(),
  settings: BBSSettingsSchema
})

export const BBSMessageSchema = z.object({
  id: BBSFieldSchemas.messageId,
  author: BBSFieldSchemas.author,
  message: BBSFieldSchemas.messageText,
  timestamp: CommonSchemas.date,
  standardValue: BBSFieldSchemas.standardValue,
  incrementalValue: BBSFieldSchemas.incrementalValue,
  emoteValue: BBSFieldSchemas.emoteValue,
  authorHash: BBSFieldSchemas.authorHash
})

export const BBSDataSchema = z.object({
  id: z.string(),
  url: CommonSchemas.url,
  title: BBSFieldSchemas.bbsTitle,
  messages: z.array(BBSMessageSchema),
  totalMessages: CommonSchemas.nonNegativeInt,
  currentPage: CommonSchemas.positiveInt,
  totalPages: CommonSchemas.nonNegativeInt,
  pagination: z.object({
    page: CommonSchemas.positiveInt,
    totalPages: CommonSchemas.nonNegativeInt,
    hasPrev: z.boolean(),
    hasNext: z.boolean()
  }), // Web Components用のページネーション
  settings: BBSSettingsSchema,
  lastMessage: CommonSchemas.date.optional()
})

export const BBSCreateParamsSchema = z.object({
  title: BBSFieldSchemas.bbsTitle.default('💬 BBS'),
  maxMessages: BBSFieldSchemas.maxMessages.default(1000),
  messagesPerPage: BBSFieldSchemas.messagesPerPage.default(10),
  webhookUrl: CommonSchemas.url.optional()
})

export const BBSPostParamsSchema = z.object({
  author: BBSFieldSchemas.author,
  message: BBSFieldSchemas.messageText,
  standardValue: BBSFieldSchemas.standardValue.optional(),
  incrementalValue: BBSFieldSchemas.incrementalValue.optional(),
  emoteValue: BBSFieldSchemas.emoteValue.optional(),
  authorHash: BBSFieldSchemas.authorHash
})

export const BBSUpdateParamsSchema = z.object({
  messageId: BBSFieldSchemas.messageId,
  author: BBSFieldSchemas.author,
  message: BBSFieldSchemas.messageText,
  standardValue: BBSFieldSchemas.standardValue.optional(),
  incrementalValue: BBSFieldSchemas.incrementalValue.optional(),
  emoteValue: BBSFieldSchemas.emoteValue.optional(),
  authorHash: BBSFieldSchemas.authorHash
})

export const BBSRemoveParamsSchema = z.object({
  messageId: BBSFieldSchemas.messageId,
  authorHash: BBSFieldSchemas.authorHash
})

export const BBSDisplayParamsSchema = z.object({
  id: CommonSchemas.publicId,
  page: BBSFieldSchemas.page.default(1)
})

/**
 * BBS設定更新用パラメータ
 */
export const BBSUpdateSettingsParamsSchema = z.object({
  title: BBSFieldSchemas.bbsTitle.optional(),
  messagesPerPage: BBSFieldSchemas.messagesPerPage.optional(),
  maxMessages: BBSFieldSchemas.maxMessages.optional(),
  standardSelect: BBSFieldSchemas.selectConfig.optional(),
  incrementalSelect: BBSFieldSchemas.selectConfig.optional(),
  emoteSelect: BBSFieldSchemas.selectConfig.optional(),
  webhookUrl: CommonSchemas.url.optional()
})

/**
 * 型エクスポート
 */
export type BBSEntityType = z.infer<typeof BBSEntitySchema>
export type BBSSettingsType = z.infer<typeof BBSSettingsSchema>
export type BBSMessageType = z.infer<typeof BBSMessageSchema>
export type BBSDataType = z.infer<typeof BBSDataSchema>
export type BBSCreateParamsType = z.infer<typeof BBSCreateParamsSchema>
export type BBSPostParamsType = z.infer<typeof BBSPostParamsSchema>
export type BBSUpdateParamsType = z.infer<typeof BBSUpdateParamsSchema>
export type BBSRemoveParamsType = z.infer<typeof BBSRemoveParamsSchema>
export type BBSDisplayParamsType = z.infer<typeof BBSDisplayParamsSchema>
export type BBSUpdateSettingsParamsType = z.infer<typeof BBSUpdateSettingsParamsSchema>