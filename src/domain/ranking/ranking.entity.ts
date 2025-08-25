/**
 * Ranking Domain Entity - ランキング機能のエンティティ定義
 */

import { z } from 'zod'
import { CommonSchemas } from '@/lib/core/validation'
import { RANKING } from '@/lib/validation/schema-constants'

/**
 * Ranking固有のフィールドスキーマ
 */
export const RankingFieldSchemas = {
  playerName: z.string().min(RANKING.NAME.MIN_LENGTH).max(RANKING.NAME.MAX_LENGTH),
  score: CommonSchemas.nonNegativeInt,
  displayScore: z.string().min(RANKING.DISPLAY_SCORE.MIN_LENGTH).max(RANKING.DISPLAY_SCORE.MAX_LENGTH),
  maxEntries: z.coerce.number().int().min(RANKING.MAX_ENTRIES.MIN).max(RANKING.MAX_ENTRIES.MAX),
  limit: z.coerce.number().int().min(RANKING.LIMIT.MIN).max(RANKING.LIMIT.MAX),
  format: z.enum(['interactive']),
  sortOrder: z.enum(RANKING.SORT_ORDER.VALUES).default(RANKING.SORT_ORDER.DEFAULT)
} as const

/**
 * Rankingエンティティの基本型
 */
export interface RankingEntity {
  id: string
  url: string
  created: Date
  lastSubmit?: Date
  totalEntries: number
  maxEntries: number
  sortOrder: 'desc' | 'asc' // 'desc'=高いスコア順, 'asc'=低いスコア順（タイム系）
  title?: string
}

/**
 * ランキングエントリの型
 */
export interface RankingEntry {
  name: string
  score: number
  displayScore?: string
  rank: number // Web Components用にランク番号を追加
  timestamp: Date
}

/**
 * クライアントに返すRankingデータの型
 */
export interface RankingData {
  id: string
  url: string
  entries: RankingEntry[]
  totalEntries: number
  maxEntries: number
  sortOrder: 'desc' | 'asc'
  title?: string
}

/**
 * Ranking作成時のパラメータ
 */
export interface RankingCreateParams {
  maxEntries?: number
  sortOrder?: 'desc' | 'asc'
  title?: string
}

/**
 * スコア送信時のパラメータ
 */
export interface RankingSubmitParams {
  name: string
  score: number
  displayScore?: string
}

/**
 * スコア更新時のパラメータ
 */
export interface RankingUpdateParams {
  name: string
  score: number
}

/**
 * エントリ削除時のパラメータ
 */
export interface RankingRemoveParams {
  name: string
}

/**
 * ランキング表示時のパラメータ
 */
export interface RankingDisplayParams {
  id: string
  limit?: number
}

/**
 * Zodスキーマ定義
 */
export const RankingEntitySchema = z.object({
  id: CommonSchemas.publicId,
  url: CommonSchemas.url,
  created: CommonSchemas.date,
  lastSubmit: CommonSchemas.date.optional(),
  totalEntries: CommonSchemas.nonNegativeInt,
  maxEntries: CommonSchemas.nonNegativeInt,
  sortOrder: RankingFieldSchemas.sortOrder,
  title: CommonSchemas.title.optional()
})

export const RankingEntrySchema = z.object({
  name: RankingFieldSchemas.playerName,
  score: RankingFieldSchemas.score,
  displayScore: RankingFieldSchemas.displayScore.optional(),
  rank: CommonSchemas.positiveInt, // Web Components用にランク番号を追加
  timestamp: CommonSchemas.date
})

export const RankingDataSchema = z.object({
  id: z.string(),
  url: CommonSchemas.url,
  entries: z.array(RankingEntrySchema),
  totalEntries: CommonSchemas.nonNegativeInt,
  maxEntries: CommonSchemas.nonNegativeInt,
  sortOrder: RankingFieldSchemas.sortOrder,
  title: CommonSchemas.title.optional()
})

export const RankingCreateParamsSchema = z.object({
  maxEntries: RankingFieldSchemas.maxEntries.default(RANKING.LIMIT.DEFAULT),
  sortOrder: RankingFieldSchemas.sortOrder.default(RANKING.SORT_ORDER.DEFAULT),
  title: CommonSchemas.title.default('RANKING')
})

export const RankingSubmitParamsSchema = z.object({
  name: RankingFieldSchemas.playerName,
  score: RankingFieldSchemas.score,
  displayScore: RankingFieldSchemas.displayScore.optional()
})

export const RankingUpdateParamsSchema = z.object({
  name: RankingFieldSchemas.playerName,
  score: RankingFieldSchemas.score
})

export const RankingRemoveParamsSchema = z.object({
  name: RankingFieldSchemas.playerName
})

export const RankingDisplayParamsSchema = z.object({
  id: CommonSchemas.publicId,
  limit: RankingFieldSchemas.limit.default(RANKING.LIMIT.DEFAULT)
})

/**
 * 型エクスポート
 */
export type RankingEntityType = z.infer<typeof RankingEntitySchema>
export type RankingEntryType = z.infer<typeof RankingEntrySchema>
export type RankingDataType = z.infer<typeof RankingDataSchema>
export type RankingCreateParamsType = z.infer<typeof RankingCreateParamsSchema>
export type RankingSubmitParamsType = z.infer<typeof RankingSubmitParamsSchema>
export type RankingUpdateParamsType = z.infer<typeof RankingUpdateParamsSchema>
export type RankingRemoveParamsType = z.infer<typeof RankingRemoveParamsSchema>
export type RankingDisplayParamsType = z.infer<typeof RankingDisplayParamsSchema>