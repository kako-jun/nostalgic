/**
 * Counter Domain Service - 新アーキテクチャ版
 */

import { z } from 'zod'
import { Result, Ok, Err, ValidationError, NotFoundError } from '@/lib/core/result'
import { BaseNumericService } from '@/lib/core/base-service'
import { ValidationFramework } from '@/lib/core/validation'
import { getServiceLimits } from '@/lib/core/config'
import { RepositoryFactory } from '@/lib/core/repository'
import { getRedis } from '@/lib/core/db'
import { createHash } from 'crypto'
import {
  CounterEntity,
  CounterData,
  CounterCreateParams,
  CounterEntitySchema,
  CounterDataSchema,
  CounterType
} from '@/domain/counter/counter.entity'

/**
 * カウンターサービスクラス
 */
export class CounterService extends BaseNumericService<CounterEntity, CounterData, CounterCreateParams> {
  private readonly redis = getRedis()

  constructor() {
    const limits = getServiceLimits('counter') as { maxValue: number; maxDigits: number; dailyRetentionDays: number }
    const config = {
      serviceName: 'counter' as const,
      maxValue: limits.maxValue
    }
    
    super(config, CounterEntitySchema, CounterDataSchema)
  }

  /**
   * 新しいカウンターエンティティを作成
   */
  protected async createNewEntity(
    id: string, 
    url: string, 
    params: CounterCreateParams
  ): Promise<Result<CounterEntity, ValidationError>> {
    const entity: CounterEntity = {
      id,
      url,
      created: new Date(),
      totalCount: 0,
      settings: {
        webhookUrl: params.webhookUrl
      }
    }

    const validationResult = ValidationFramework.output(CounterEntitySchema, entity)
    if (!validationResult.success) {
      return validationResult
    }

    return Ok(validationResult.data)
  }

  /**
   * エンティティをデータ形式に変換
   */
  public async transformEntityToData(entity: CounterEntity): Promise<Result<CounterData, ValidationError>> {
    const [today, yesterday, week, month] = await Promise.all([
      this.getTodayCount(entity.id),
      this.getYesterdayCount(entity.id),
      this.getPeriodCount(entity.id, 7),
      this.getPeriodCount(entity.id, 30)
    ])

    const data: CounterData = {
      id: entity.id,
      url: entity.url,
      total: entity.totalCount,
      today: today.success ? today.data : 0,
      yesterday: yesterday.success ? yesterday.data : 0,
      week: week.success ? week.data : 0,
      month: month.success ? month.data : 0,
      lastVisit: entity.lastVisit,
      settings: entity.settings
    }

    return ValidationFramework.output(CounterDataSchema, data)
  }

  /**
   * クリーンアップ処理
   */
  protected async performCleanup(id: string): Promise<Result<void, ValidationError>> {
    // 日別カウントのクリーンアップ
    const today = new Date()
    const cleanupPromises: Promise<any>[] = []

    // 過去1年分のデイリーカウントを削除
    for (let i = 0; i < 365; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const dailyKey = `counter:${id}:daily:${dateStr}`
      
      cleanupPromises.push(
        this.redis.del(dailyKey)
      )
    }

    try {
      await Promise.all(cleanupPromises)
      return Ok(undefined)
    } catch (error) {
      return Err(new ValidationError('Cleanup failed', { error }))
    }
  }

  /**
   * カウンターを増加
   */
  async incrementCounter(
    id: string,
    userHash: string,
    incrementBy: number = 1
  ): Promise<Result<CounterData, ValidationError | NotFoundError>> {
    // アトミックな訪問マーク（競合状態を解決）
    const visitMarkResult = await this.atomicMarkVisit(id, userHash)
    if (!visitMarkResult.success) {
      return Err(new ValidationError('Failed to mark visit atomically', { error: visitMarkResult.error }))
    }

    if (!visitMarkResult.data) {
      // 重複の場合は現在値を返す
      const entityResult = await this.getById(id)
      if (!entityResult.success) {
        return entityResult
      }

      return await this.transformEntityToData(entityResult.data)
    }

    // エンティティ取得
    const entityResult = await this.getById(id)
    if (!entityResult.success) {
      // 訪問マークを削除（ロールバック）
      await this.removeVisitMark(id, userHash)
      return entityResult
    }

    const entity = entityResult.data

    // 総カウント増加
    const incrementResult = await this.incrementValue(`${id}:total`, incrementBy)
    if (!incrementResult.success) {
      // 訪問マークを削除（ロールバック）
      await this.removeVisitMark(id, userHash)
      return incrementResult
    }

    // 日別カウント増加
    const today = new Date().toISOString().split('T')[0]
    const dailyKey = `counter:${id}:daily:${today}`
    try {
      await this.redis.incrby(dailyKey, incrementBy)
    } catch (error) {
      // ロールバック処理
      await this.incrementValue(`${id}:total`, -incrementBy)
      await this.removeVisitMark(id, userHash)
      return Err(new ValidationError('Failed to increment daily count', { error }))
    }
    
    // 最終訪問時刻の更新
    const previousCount = entity.totalCount
    entity.totalCount = incrementResult.data
    entity.lastVisit = new Date()

    // エンティティ保存
    const saveResult = await this.entityRepository.save(id, entity)
    if (!saveResult.success) {
      // ロールバック処理
      await this.incrementValue(`${id}:total`, -incrementBy)
      await this.redis.decrby(dailyKey, incrementBy)
      await this.removeVisitMark(id, userHash)
      return Err(new ValidationError('Failed to save entity', { error: saveResult.error }))
    }

    // Webhook 通知を送信（webhookUrlが設定されている場合のみ）
    if (entity.settings.webhookUrl) {
      const webhookPayload = {
        event: 'counter.increment',
        timestamp: new Date().toISOString(),
        serviceId: id,
        url: entity.url,
        data: {
          previousCount,
          newCount: entity.totalCount,
          incrementBy
        }
      }

      // シンプルなWebhook送信（失敗してもメイン処理は継続）
      fetch(entity.settings.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookPayload)
      }).catch(error => {
        console.warn('Webhook delivery failed for counter increment:', error)
      })
    }

    return await this.transformEntityToData(entity)
  }

  /**
   * カウンター値を設定
   */
  async setCounterValue(
    url: string,
    token: string,
    value: number
  ): Promise<Result<CounterData, ValidationError | NotFoundError>> {
    // オーナーシップ検証
    const ownershipResult = await this.verifyOwnership(url, token)
    if (!ownershipResult.success) {
      return Err(new ValidationError('Ownership verification failed', { error: ownershipResult.error }))
    }

    if (!ownershipResult.data.isOwner || !ownershipResult.data.entity) {
      return Err(new ValidationError('Invalid token or entity not found'))
    }

    const entity = ownershipResult.data.entity as CounterEntity

    // 値の設定
    const setResult = await this.setValue(`${entity.id}:total`, value)
    if (!setResult.success) {
      return setResult
    }

    // エンティティ更新
    entity.totalCount = value
    const saveResult = await this.entityRepository.save(entity.id, entity)
    if (!saveResult.success) {
      return Err(new ValidationError('Failed to save entity', { error: saveResult.error }))
    }

    return await this.transformEntityToData(entity)
  }

  // 設定更新（管理者用）
  async updateSettings(
    url: string,
    token: string,
    params: {
      webhookUrl?: string
    }
  ): Promise<Result<CounterData, ValidationError | NotFoundError>> {
    // オーナーシップ検証
    const ownershipResult = await this.verifyOwnership(url, token)
    if (!ownershipResult.success) {
      return Err(new ValidationError('Ownership verification failed', { error: ownershipResult.error }))
    }

    if (!ownershipResult.data.isOwner || !ownershipResult.data.entity) {
      return Err(new ValidationError('Invalid token or entity not found'))
    }

    const entity = ownershipResult.data.entity as CounterEntity

    // 設定更新
    if (params.webhookUrl !== undefined) {
      entity.settings.webhookUrl = params.webhookUrl
    }

    // エンティティ保存
    const saveResult = await this.entityRepository.save(entity.id, entity)
    if (!saveResult.success) {
      return Err(new ValidationError('Failed to save entity', { error: saveResult.error }))
    }

    return await this.transformEntityToData(entity)
  }

  /**
   * 重複訪問のチェック
   */
  private async checkDuplicateVisit(id: string, userHash: string): Promise<Result<boolean, ValidationError>> {
    const visitKey = `counter:${id}:visit:${userHash}`
    const visitRepo = RepositoryFactory.createEntity(z.string(), 'visit_check')
    
    const existsResult = await visitRepo.exists(visitKey)
    if (!existsResult.success) {
      return Err(new ValidationError('Failed to check visit', { error: existsResult.error }))
    }

    return Ok(existsResult.data)
  }

  /**
   * アトミックな訪問マーク（競合状態を解決、日付ベース制限）
   */
  private async atomicMarkVisit(id: string, userHash: string): Promise<Result<boolean, ValidationError>> {
    const visitKey = `counter:${id}:visit:${userHash}`
    const visitRepo = RepositoryFactory.createEntity(z.string(), 'visit_check')
    
    // 今日の終わりまでのTTLを計算
    const now = new Date()
    const endOfDay = new Date(now)
    endOfDay.setHours(23, 59, 59, 999)
    const ttl = Math.floor((endOfDay.getTime() - now.getTime()) / 1000)

    try {
      // Redis SET NX EX を使用してアトミックにチェック＆設定
      const result = await visitRepo.setIfNotExists(visitKey, new Date().toISOString(), ttl)
      if (!result.success) {
        return Err(new ValidationError('Failed to atomically mark visit', { error: result.error }))
      }
      
      // true = 新規訪問、false = 重複訪問
      return Ok(result.data)
    } catch (error) {
      return Err(new ValidationError('Redis operation failed', { error }))
    }
  }

  /**
   * 訪問マークを削除（ロールバック用）
   */
  private async removeVisitMark(id: string, userHash: string): Promise<Result<void, ValidationError>> {
    const visitKey = `counter:${id}:visit:${userHash}`
    const visitRepo = RepositoryFactory.createEntity(z.string(), 'visit_check')

    const deleteResult = await visitRepo.delete(visitKey)
    if (!deleteResult.success) {
      return Err(new ValidationError('Failed to remove visit mark', { error: deleteResult.error }))
    }

    return Ok(undefined)
  }

  /**
   * 訪問をマーク（日付ベース制限）
   */
  private async markVisit(id: string, userHash: string): Promise<Result<void, ValidationError>> {
    const visitKey = `counter:${id}:visit:${userHash}`
    const visitRepo = RepositoryFactory.createEntity(z.string(), 'visit_check')
    
    // 今日の終わりまでのTTLを計算
    const now = new Date()
    const endOfDay = new Date(now)
    endOfDay.setHours(23, 59, 59, 999)
    const ttl = Math.floor((endOfDay.getTime() - now.getTime()) / 1000)

    const saveResult = await visitRepo.saveWithTTL(visitKey, new Date().toISOString(), ttl)
    if (!saveResult.success) {
      return Err(new ValidationError('Failed to mark visit', { error: saveResult.error }))
    }

    return Ok(undefined)
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

  /**
   * 今日のカウント取得
   */
  private async getTodayCount(id: string): Promise<Result<number, ValidationError>> {
    const today = new Date().toISOString().split('T')[0]
    const dailyKey = `counter:${id}:daily:${today}`
    try {
      const value = await this.redis.get(dailyKey)
      return Ok(value ? parseInt(value) : 0)
    } catch (error) {
      return Err(new ValidationError('Failed to get today count', { error }))
    }
  }

  /**
   * 昨日のカウント取得
   */
  private async getYesterdayCount(id: string): Promise<Result<number, ValidationError>> {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const dailyKey = `counter:${id}:daily:${yesterday}`
    try {
      const value = await this.redis.get(dailyKey)
      return Ok(value ? parseInt(value) : 0)
    } catch (error) {
      return Err(new ValidationError('Failed to get yesterday count', { error }))
    }
  }

  /**
   * 指定期間のカウント取得
   */
  private async getPeriodCount(id: string, days: number): Promise<Result<number, ValidationError>> {
    const promises: Promise<number>[] = []
    
    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      const dailyKey = `counter:${id}:daily:${dateStr}`
      
      promises.push(
        this.redis.get(dailyKey).then(value => value ? parseInt(value) : 0)
      )
    }

    try {
      const results = await Promise.all(promises)
      const total = results.reduce((sum, count) => sum + count, 0)
      return Ok(total)
    } catch (error) {
      return Err(new ValidationError('Failed to get period count', { error }))
    }
  }

  /**
   * 表示用データの取得
   */
  async getDisplayData(id: string, type: CounterType): Promise<Result<number, ValidationError | NotFoundError>> {
    const entityResult = await this.getById(id)
    if (!entityResult.success) {
      return Ok(0) // エンティティが存在しない場合は0を返す
    }

    const dataResult = await this.transformEntityToData(entityResult.data)
    if (!dataResult.success) {
      return dataResult
    }

    return Ok(dataResult.data[type])
  }


  /**
   * IDでカウンターデータを取得（パブリックメソッド）
   */
  public async getCounterData(id: string): Promise<Result<CounterData, ValidationError | NotFoundError>> {
    const entityResult = await this.getById(id)
    if (!entityResult.success) {
      return entityResult
    }

    return await this.transformEntityToData(entityResult.data)
  }

}

// シングルトンインスタンス
export const counterService = new CounterService()