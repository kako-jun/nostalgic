/**
 * Counter Domain Entity
 */

import { z } from 'zod'
import { CommonSchemas } from '@/lib/core/validation'

/**
 * Counter固有のフィールドスキーマ
 */
export const CounterFieldSchemas = {
  counterType: z.enum(['total', 'today', 'yesterday', 'week', 'month']),
  counterFormat: z.enum(['json', 'text', 'image']),
  counterDigits: z.coerce.number().int().min(1).max(10).optional()
} as const

/**
 * カウンター設定の型
 */
export interface CounterSettings {
  webhookUrl?: string
}

/**
 * カウンターエンティティの型
 */
export interface CounterEntity {
  id: string
  url: string
  created: Date
  lastVisit?: Date
  totalCount: number
  settings: CounterSettings
}

/**
 * クライアントに返すCounterデータの型
 */
export interface CounterData {
  id: string
  url: string
  total: number
  today: number
  yesterday: number
  week: number
  month: number
  lastVisit?: Date
  settings: CounterSettings
}

/**
 * Counter作成時のパラメータ
 */
export interface CounterCreateParams {
  maxValue?: number
  enableDailyStats?: boolean
  webhookUrl?: string
}

/**
 * Counter表示時のパラメータ
 */
export interface CounterDisplayParams {
  id: string
  type?: 'total' | 'today' | 'yesterday' | 'week' | 'month'
  theme?: string
  digits?: number
  format?: 'json' | 'text' | 'image'
}

/**
 * Zodスキーマ定義
 */
export const CounterSettingsSchema = z.object({
  webhookUrl: CommonSchemas.url.optional()
})

export const CounterEntitySchema = z.object({
  id: CommonSchemas.publicId,
  url: CommonSchemas.url,
  created: CommonSchemas.date,
  lastVisit: CommonSchemas.date.optional(),
  totalCount: CommonSchemas.nonNegativeInt.default(0),
  settings: CounterSettingsSchema
})

export const CounterDataSchema = z.object({
  id: z.string(),
  url: CommonSchemas.url,
  total: CommonSchemas.nonNegativeInt,
  today: CommonSchemas.nonNegativeInt,
  yesterday: CommonSchemas.nonNegativeInt,
  week: CommonSchemas.nonNegativeInt,
  month: CommonSchemas.nonNegativeInt,
  lastVisit: CommonSchemas.date.optional(),
  settings: CounterSettingsSchema
})

export const CounterCreateParamsSchema = z.object({
  webhookUrl: CommonSchemas.url.optional()
})

export const CounterIncrementParamsSchema = z.object({
  id: CommonSchemas.publicId,
  by: CommonSchemas.positiveInt.default(1)
})

export const CounterSetParamsSchema = z.object({
  url: CommonSchemas.url,
  token: CommonSchemas.token,
  value: CommonSchemas.nonNegativeInt
})

export const CounterDisplayParamsSchema = z.object({
  id: CommonSchemas.publicId,
  type: CounterFieldSchemas.counterType.default('total'),
  theme: CommonSchemas.theme.default('dark'),
  digits: CounterFieldSchemas.counterDigits,
  format: CounterFieldSchemas.counterFormat.default('image')
})

/**
 * Counter設定更新用パラメータ
 */
export const CounterUpdateSettingsParamsSchema = z.object({
  webhookUrl: CommonSchemas.url.optional()
})

/**
 * 型エクスポート
 */
export type CounterEntityType = z.infer<typeof CounterEntitySchema>

// 型定義は schema-constants からインポート
export type { CounterType } from '@/lib/validation/schema-constants'