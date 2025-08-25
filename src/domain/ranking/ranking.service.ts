/**
 * Ranking Domain Service - 新アーキテクチャ版
 */

import { z } from 'zod'
import { Result, Ok, Err, ValidationError, NotFoundError } from '@/lib/core/result'
import { BaseService } from '@/lib/core/base-service'
import { ValidationFramework } from '@/lib/core/validation'
import { getRankingLimits } from '@/lib/core/config'
import { RepositoryFactory, SortedSetRepository } from '@/lib/core/repository'
import { getRedis } from '@/lib/core/db'
import { createHash } from 'crypto'
import { RANKING } from '@/lib/validation/schema-constants'
import {
  RankingEntity,
  RankingData,
  RankingEntry,
  RankingCreateParams,
  RankingSubmitParams,
  RankingUpdateParams,
  RankingRemoveParams,
  RankingEntitySchema,
  RankingDataSchema,
  RankingEntrySchema
} from '@/domain/ranking/ranking.entity'

/**
 * ランキングサービスクラス
 */
export class RankingService extends BaseService<RankingEntity, RankingData, RankingCreateParams> {
  private readonly sortedSetRepository: SortedSetRepository
  private readonly redis = getRedis()

  constructor() {
    const limits = getRankingLimits()
    const config = {
      serviceName: 'ranking' as const,
      maxValue: limits.maxScore
    }
    
    super(config, RankingEntitySchema, RankingDataSchema)
    this.sortedSetRepository = RepositoryFactory.createSortedSet('ranking_scores')
  }

  /**
   * 新しいランキングエンティティを作成
   */
  protected async createNewEntity(
    id: string, 
    url: string, 
    params: RankingCreateParams
  ): Promise<Result<RankingEntity, ValidationError>> {
    const entity: RankingEntity = {
      id,
      url,
      created: new Date(),
      totalEntries: 0,
      maxEntries: params.maxEntries || RANKING.LIMIT.DEFAULT,
      sortOrder: params.sortOrder || RANKING.SORT_ORDER.DEFAULT,
      title: params.title
    }

    const validationResult = ValidationFramework.output(RankingEntitySchema, entity)
    if (!validationResult.success) {
      return validationResult
    }

    return Ok(validationResult.data)
  }

  /**
   * エンティティをデータ形式に変換
   */
  public async transformEntityToData(entity: RankingEntity): Promise<Result<RankingData, ValidationError>> {
    // ランキングエントリを取得
    const entriesResult = await this.getTopEntries(entity.id, RANKING.LIMIT.DEFAULT, entity.sortOrder)
    const entries = entriesResult.success ? entriesResult.data : []

    const data: RankingData = {
      id: entity.id,
      url: entity.url,
      entries,
      totalEntries: entity.totalEntries,
      maxEntries: entity.maxEntries,
      sortOrder: entity.sortOrder,
      title: entity.title,
    }

    return ValidationFramework.output(RankingDataSchema, data)
  }

  /**
   * クリーンアップ処理
   */
  protected async performCleanup(id: string): Promise<Result<void, ValidationError>> {
    // ランキングスコアをクリーンアップ
    const clearResult = await this.sortedSetRepository.clear(`${id}:scores`)
    if (!clearResult.success) {
      return Err(new ValidationError('Failed to cleanup ranking scores', { error: clearResult.error }))
    }

    return Ok(undefined)
  }

  /**
   * 公開IDでスコアを送信
   */
  async submitScoreById(
    publicId: string,
    params: RankingSubmitParams,
    userHash?: string
  ): Promise<Result<RankingData, ValidationError | NotFoundError>> {
    // エンティティ取得
    const entityResult = await this.entityRepository.get(publicId)
    if (!entityResult.success) {
      return Err(new NotFoundError('Ranking not found'))
    }

    const entity = entityResult.data

    // 連投防止チェック（userHashが提供された場合）
    if (userHash) {
      const cooldownResult = await this.checkSubmitCooldown(entity.id, userHash)
      if (!cooldownResult.success) {
        return cooldownResult
      }
      
      if (!cooldownResult.data) {
        return Err(new ValidationError('Please wait before submitting another score (60 seconds cooldown)'))
      }
    }

    // スコア制限チェック
    const limits = getRankingLimits()
    if (params.score > limits.maxScore) {
      return Err(new ValidationError(`Score exceeds maximum of ${limits.maxScore}`))
    }

    if (params.name.length > limits.maxNameLength) {
      return Err(new ValidationError(`Name exceeds maximum length of ${limits.maxNameLength}`))
    }

    // 連投防止マーク（userHashが提供された場合）
    if (userHash) {
      const markResult = await this.markSubmitTime(entity.id, userHash)
      if (!markResult.success) {
        return Err(new ValidationError('Failed to mark submit time', { error: markResult.error }))
      }
    }

    // スコア更新可否チェック（ユーザー用：より高いスコアのみ）
    const shouldUpdateResult = await this.shouldUpdateScore(entity.id, params.name, params.score, true)
    if (!shouldUpdateResult.success) {
      // ロールバック: 連投防止マークを削除
      if (userHash) {
        await this.removeSubmitMark(entity.id, userHash)
      }
      return shouldUpdateResult
    }

    if (!shouldUpdateResult.data) {
      // ロールバック: 連投防止マークを削除（スコア改善なし）
      if (userHash) {
        await this.removeSubmitMark(entity.id, userHash)
      }
      // スコアが改善されていないので更新しない（エラーではない）
      return await this.transformEntityToData(entity)
    }

    // スコアを追加（数値でソート用）
    const addResult = await this.sortedSetRepository.add(`${entity.id}:scores`, params.name, params.score)
    if (!addResult.success) {
      // ロールバック: 連投防止マークを削除
      if (userHash) {
        await this.removeSubmitMark(entity.id, userHash)
      }
      return Err(new ValidationError('Failed to add score', { error: addResult.error }))
    }

    // 表示用スコアを保存（文字列）
    if (params.displayScore) {
      try {
        await this.redis.hset(`${entity.id}:display_scores`, params.name, params.displayScore)
      } catch (error) {
        // ロールバック: スコアと連投防止マークを削除
        await this.sortedSetRepository.remove(`${entity.id}:scores`, params.name)
        if (userHash) {
          await this.removeSubmitMark(entity.id, userHash)
        }
        return Err(new ValidationError('Failed to save display score', { error: error instanceof Error ? error.message : String(error) }))
      }
    }

    // エントリー数制限チェック
    await this.enforceMaxEntries(entity.id, limits.maxEntries)

    // エンティティ更新
    entity.lastSubmit = new Date()
    const totalResult = await this.sortedSetRepository.count(`${entity.id}:scores`)
    if (totalResult.success) {
      entity.totalEntries = totalResult.data
    }

    const saveResult = await this.entityRepository.save(entity.id, entity)
    if (!saveResult.success) {
      // ロールバック処理
      if (userHash) {
        await this.removeSubmitMark(entity.id, userHash)
      }
      return Err(new ValidationError('Failed to save entity', { error: saveResult.error }))
    }

    return await this.transformEntityToData(entity)
  }

  /**
   * スコアを送信
   */
  async submitScore(
    url: string,
    token: string,
    params: RankingSubmitParams,
    userHash?: string
  ): Promise<Result<RankingData, ValidationError | NotFoundError>> {
    // オーナーシップ検証
    const ownershipResult = await this.verifyOwnership(url, token)
    if (!ownershipResult.success) {
      return Err(new ValidationError('Ownership verification failed', { error: ownershipResult.error }))
    }

    if (!ownershipResult.data.isOwner || !ownershipResult.data.entity) {
      return Err(new ValidationError('Invalid token or entity not found'))
    }

    const entity = ownershipResult.data.entity as RankingEntity

    // 連投防止チェック（userHashが提供された場合）
    if (userHash) {
      const cooldownResult = await this.checkSubmitCooldown(entity.id, userHash)
      if (!cooldownResult.success) {
        return cooldownResult
      }
      
      if (!cooldownResult.data) {
        return Err(new ValidationError('Please wait before submitting another score (60 seconds cooldown)'))
      }
    }

    // スコア制限チェック
    const limits = getRankingLimits()
    if (params.score > limits.maxScore) {
      return Err(new ValidationError(`Score exceeds maximum of ${limits.maxScore}`))
    }

    if (params.name.length > limits.maxNameLength) {
      return Err(new ValidationError(`Name exceeds maximum length of ${limits.maxNameLength}`))
    }

    // 連投防止マーク（userHashが提供された場合）
    if (userHash) {
      const markResult = await this.markSubmitTime(entity.id, userHash)
      if (!markResult.success) {
        return Err(new ValidationError('Failed to mark submit time', { error: markResult.error }))
      }
    }

    // スコア更新可否チェック（管理者用：常に更新可能）
    const shouldUpdateResult = await this.shouldUpdateScore(entity.id, params.name, params.score, false)
    if (!shouldUpdateResult.success) {
      // ロールバック: 連投防止マークを削除
      if (userHash) {
        await this.removeSubmitMark(entity.id, userHash)
      }
      return shouldUpdateResult
    }

    // 管理者用は常に更新されるはずだが、念のためチェック
    if (!shouldUpdateResult.data) {
      // ロールバック: 連投防止マークを削除
      if (userHash) {
        await this.removeSubmitMark(entity.id, userHash)
      }
      return Err(new ValidationError('Unexpected: admin update was blocked'))
    }

    // スコアを追加（更新）
    const addResult = await this.sortedSetRepository.add(`${entity.id}:scores`, params.name, params.score)
    if (!addResult.success) {
      // ロールバック: 連投防止マークを削除
      if (userHash) {
        await this.removeSubmitMark(entity.id, userHash)
      }
      return Err(new ValidationError('Failed to add score', { error: addResult.error }))
    }

    // エントリー数制限チェック
    await this.enforceMaxEntries(entity.id, limits.maxEntries)

    // エンティティ更新
    entity.lastSubmit = new Date()
    const totalResult = await this.sortedSetRepository.count(`${entity.id}:scores`)
    if (totalResult.success) {
      entity.totalEntries = totalResult.data
    }

    const saveResult = await this.entityRepository.save(entity.id, entity)
    if (!saveResult.success) {
      // ロールバック処理
      if (userHash) {
        await this.removeSubmitMark(entity.id, userHash)
      }
      return Err(new ValidationError('Failed to save entity', { error: saveResult.error }))
    }

    return await this.transformEntityToData(entity)
  }

  /**
   * スコアを更新
   */
  async updateScore(
    url: string,
    token: string,
    params: RankingUpdateParams
  ): Promise<Result<RankingData, ValidationError | NotFoundError>> {
    // オーナーシップ検証
    const ownershipResult = await this.verifyOwnership(url, token)
    if (!ownershipResult.success) {
      return Err(new ValidationError('Ownership verification failed', { error: ownershipResult.error }))
    }

    if (!ownershipResult.data.isOwner || !ownershipResult.data.entity) {
      return Err(new ValidationError('Invalid token or entity not found'))
    }

    const entity = ownershipResult.data.entity as RankingEntity

    // スコアを更新（既存エントリがあれば更新、なければ追加）
    const updateResult = await this.sortedSetRepository.add(`${entity.id}:scores`, params.name, params.score)
    if (!updateResult.success) {
      return Err(new ValidationError('Failed to update score', { error: updateResult.error }))
    }

    // エンティティ更新
    entity.lastSubmit = new Date()
    const saveResult = await this.entityRepository.save(entity.id, entity)
    if (!saveResult.success) {
      return Err(new ValidationError('Failed to save entity', { error: saveResult.error }))
    }

    return await this.transformEntityToData(entity)
  }

  /**
   * エントリを削除
   */
  async removeEntry(
    url: string,
    token: string,
    params: RankingRemoveParams
  ): Promise<Result<RankingData, ValidationError | NotFoundError>> {
    // オーナーシップ検証
    const ownershipResult = await this.verifyOwnership(url, token)
    if (!ownershipResult.success) {
      return Err(new ValidationError('Ownership verification failed', { error: ownershipResult.error }))
    }

    if (!ownershipResult.data.isOwner || !ownershipResult.data.entity) {
      return Err(new ValidationError('Invalid token or entity not found'))
    }

    const entity = ownershipResult.data.entity as RankingEntity

    // エントリを削除
    const removeResult = await this.sortedSetRepository.remove(`${entity.id}:scores`, params.name)
    if (!removeResult.success) {
      return Err(new ValidationError('Failed to remove entry', { error: removeResult.error }))
    }

    // エンティティ更新
    entity.lastSubmit = new Date()
    const totalResult = await this.sortedSetRepository.count(`${entity.id}:scores`)
    if (totalResult.success) {
      entity.totalEntries = totalResult.data
    }

    const saveResult = await this.entityRepository.save(entity.id, entity)
    if (!saveResult.success) {
      return Err(new ValidationError('Failed to save entity', { error: saveResult.error }))
    }

    return await this.transformEntityToData(entity)
  }

  /**
   * ランキング全体をクリア
   */
  async clearRanking(
    url: string,
    token: string
  ): Promise<Result<RankingData, ValidationError | NotFoundError>> {
    // オーナーシップ検証
    const ownershipResult = await this.verifyOwnership(url, token)
    if (!ownershipResult.success) {
      return Err(new ValidationError('Ownership verification failed', { error: ownershipResult.error }))
    }

    if (!ownershipResult.data.isOwner || !ownershipResult.data.entity) {
      return Err(new ValidationError('Invalid token or entity not found'))
    }

    const entity = ownershipResult.data.entity as RankingEntity

    // ランキングをクリア
    const clearResult = await this.sortedSetRepository.clear(`${entity.id}:scores`)
    if (!clearResult.success) {
      return Err(new ValidationError('Failed to clear ranking', { error: clearResult.error }))
    }

    // エンティティ更新
    entity.totalEntries = 0
    entity.lastSubmit = new Date()

    const saveResult = await this.entityRepository.save(entity.id, entity)
    if (!saveResult.success) {
      return Err(new ValidationError('Failed to save entity', { error: saveResult.error }))
    }

    return await this.transformEntityToData(entity)
  }

  /**
   * トップエントリを取得（ソート順対応）
   */
  private async getTopEntries(id: string, limit: number, sortOrder: 'desc' | 'asc' = 'desc'): Promise<Result<RankingEntry[], ValidationError>> {
    const entriesResult = await this.sortedSetRepository.getRangeWithScores(
      `${id}:scores`, 
      0, 
      limit - 1,
      sortOrder === 'asc'  // ascending = true for asc, false for desc
    )
    if (!entriesResult.success) {
      return Ok([]) // エラーの場合は空配列を返す
    }

    // 表示用スコアを取得
    let displayScores: Record<string, string> = {}
    try {
      displayScores = await this.redis.hgetall(`${id}:display_scores`)
    } catch (error) {
      // エラーの場合は空オブジェクトを使用
      displayScores = {}
    }

    const entries: RankingEntry[] = entriesResult.data.map((entry, index) => ({
      name: entry.member,
      score: entry.score,
      displayScore: displayScores[entry.member] || entry.score.toString(),
      rank: index + 1, // Web Components用にランク番号を追加（1から開始）
      timestamp: new Date() // 実際には保存時のタイムスタンプを使用
    }))

    return Ok(entries)
  }

  /**
   * 最大エントリー数を制限
   */
  private async enforceMaxEntries(id: string, maxEntries: number): Promise<Result<void, ValidationError>> {
    const totalResult = await this.sortedSetRepository.count(`${id}:scores`)
    if (!totalResult.success) {
      return Ok(undefined) // エラーの場合はスキップ
    }

    if (totalResult.data > maxEntries) {
      // 下位のエントリを削除
      const removeCount = totalResult.data - maxEntries
      const removeResult = await this.sortedSetRepository.removeRange(`${id}:scores`, 0, removeCount - 1)
      if (!removeResult.success) {
        return Err(new ValidationError('Failed to enforce max entries', { error: removeResult.error }))
      }
    }

    return Ok(undefined)
  }

  /**
   * IDでランキングデータを取得（パブリックメソッド）
   */
  public async getRankingData(id: string, limit: number = RANKING.LIMIT.DEFAULT): Promise<Result<RankingData, ValidationError | NotFoundError>> {
    const entityResult = await this.getById(id)
    if (!entityResult.success) {
      return entityResult
    }

    const entity = entityResult.data
    
    // 指定された数のエントリを取得
    const entriesResult = await this.getTopEntries(entity.id, limit, entity.sortOrder)
    const entries = entriesResult.success ? entriesResult.data : []

    const data: RankingData = {
      id: entity.id,
      url: entity.url,
      entries,
      totalEntries: entity.totalEntries,
      maxEntries: entity.maxEntries,
      sortOrder: entity.sortOrder,
      title: entity.title,
    }

    return ValidationFramework.output(RankingDataSchema, data)
  }

  /**
   * 連投防止チェック
   */
  private async checkSubmitCooldown(id: string, userHash: string): Promise<Result<boolean, ValidationError>> {
    const submitKey = `submit:${id}:${userHash}`
    const submitRepo = RepositoryFactory.createEntity(z.string(), 'ranking_submit')
    
    const existsResult = await submitRepo.exists(submitKey)
    if (!existsResult.success) {
      return Err(new ValidationError('Failed to check submit cooldown', { error: existsResult.error }))
    }

    // true = 送信可能、false = クールダウン中
    return Ok(!existsResult.data)
  }

  /**
   * 送信時刻をマーク
   */
  private async markSubmitTime(id: string, userHash: string): Promise<Result<void, ValidationError>> {
    const submitKey = `submit:${id}:${userHash}`
    const submitRepo = RepositoryFactory.createEntity(z.string(), 'ranking_submit')
    const limits = getRankingLimits() as { submitCooldown: number }
    const ttl = limits.submitCooldown // デフォルト60秒

    const saveResult = await submitRepo.saveWithTTL(submitKey, new Date().toISOString(), ttl)
    if (!saveResult.success) {
      return Err(new ValidationError('Failed to mark submit time', { error: saveResult.error }))
    }

    return Ok(undefined)
  }

  /**
   * 送信マークを削除（ロールバック用）
   */
  private async removeSubmitMark(id: string, userHash: string): Promise<Result<void, ValidationError>> {
    const submitKey = `submit:${id}:${userHash}`
    const submitRepo = RepositoryFactory.createEntity(z.string(), 'ranking_submit')

    const deleteResult = await submitRepo.delete(submitKey)
    if (!deleteResult.success) {
      return Err(new ValidationError('Failed to remove submit mark', { error: deleteResult.error }))
    }

    return Ok(undefined)
  }

  /**
   * スコア更新可否チェック（共通ロジック）
   */
  private async shouldUpdateScore(
    entityId: string, 
    playerName: string, 
    newScore: number,
    onlyHigherScore: boolean = false
  ): Promise<Result<boolean, ValidationError>> {
    if (!onlyHigherScore) {
      return Ok(true) // 管理者用：常に更新可能
    }

    // ユーザー用：既存スコアをチェック
    const existingScoreResult = await this.sortedSetRepository.getScore(`${entityId}:scores`, playerName)
    
    if (!existingScoreResult.success) {
      return Err(new ValidationError('Failed to check existing score', { error: existingScoreResult.error }))
    }

    // 既存スコアがない場合は更新可能
    if (existingScoreResult.data === null) {
      return Ok(true)
    }

    // 新しいスコアが既存スコアより高い場合のみ更新可能
    return Ok(newScore > existingScoreResult.data)
  }

  /**
   * ユーザーハッシュの生成
   */
  generateUserHash(ip: string, userAgent: string): string {
    const today = new Date().toISOString().split('T')[0]
    return createHash('sha256')
      .update(`${ip}:${userAgent}:${today}`)
      .digest('hex')
      .substring(0, 16)
  }

}

// シングルトンインスタンス
export const rankingService = new RankingService()