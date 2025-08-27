/**
 * Like Domain Entity - いいね機能のエンティティ定義
 */

import { z } from 'zod'
import { CommonSchemas } from '@/lib/core/validation'

/**
 * Like固有のフィールドスキーマ
 */
export const LikeFieldSchemas = {
  likeIcon: z.enum(['heart', 'star', 'thumb']),
  likeFormat: z.enum(['interactive', 'text', 'image']),
  userLiked: z.boolean(),
  likeAction: z.enum(['liked', 'unliked'])
} as const

/**
 * Likeエンティティの基本型
 */
/**
 * Like設定の型
 */
export interface LikeSettings {
  webhookUrl?: string
}

export interface LikeEntity {
  id: string
  url: string
  created: Date
  totalLikes: number
  lastLike?: Date
  settings: LikeSettings
}

/**
 * クライアントに返すLikeデータの型
 */
export interface LikeData {
  id: string
  url: string
  total: number
  userLiked: boolean
  lastLike?: Date
}

/**
 * Like作成時のパラメータ
 */
export interface LikeCreateParams {
  webhookUrl?: string
}

/**
 * Likeトグル時のパラメータ
 */
export interface LikeToggleParams {
  userHash: string
}

/**
 * Like増加時のパラメータ
 */
export interface LikeIncrementParams {
  userHash: string
  incrementBy?: number
}

/**
 * Like表示時のパラメータ
 */
export interface LikeDisplayParams {
  id: string
  userHash?: string
}

/**
 * Likeサービス設定スキーマ
 */
export const LikeSettingsSchema = z.object({
  webhookUrl: CommonSchemas.url.optional()
})

/**
 * Zodスキーマ定義
 */
export const LikeEntitySchema = z.object({
  id: CommonSchemas.publicId,
  url: CommonSchemas.url,
  created: CommonSchemas.date,
  totalLikes: CommonSchemas.nonNegativeInt,
  lastLike: CommonSchemas.date.optional(),
  settings: LikeSettingsSchema
})

export const LikeDataSchema = z.object({
  id: z.string(),
  url: CommonSchemas.url,
  total: CommonSchemas.nonNegativeInt,
  userLiked: z.boolean(),
  lastLike: CommonSchemas.date.optional()
})

export const LikeCreateParamsSchema = z.object({
  webhookUrl: CommonSchemas.url.optional()
})

export const LikeToggleParamsSchema = z.object({
  userHash: z.string().min(1)
})

export const LikeIncrementParamsSchema = z.object({
  userHash: z.string().min(1),
  incrementBy: z.coerce.number().int().min(1).default(1)
})

export const LikeDisplayParamsSchema = z.object({
  id: CommonSchemas.publicId,
  userHash: z.string().min(1).optional()
})

/**
 * Like設定更新用パラメータ
 */
export const LikeUpdateSettingsParamsSchema = z.object({
  webhookUrl: CommonSchemas.url.optional()
})

/**
 * 型エクスポート
 */
export type LikeEntityType = z.infer<typeof LikeEntitySchema>
export type LikeDataType = z.infer<typeof LikeDataSchema>
export type LikeCreateParamsType = z.infer<typeof LikeCreateParamsSchema>
export type LikeToggleParamsType = z.infer<typeof LikeToggleParamsSchema>
export type LikeIncrementParamsType = z.infer<typeof LikeIncrementParamsSchema>
export type LikeDisplayParamsType = z.infer<typeof LikeDisplayParamsSchema>