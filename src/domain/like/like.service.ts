/**
 * Like Domain Service - 新アーキテクチャ版
 */

import { z } from 'zod'
import { Result, Ok, Err, ValidationError, NotFoundError } from '@/lib/core/result'
import { BaseNumericService } from '@/lib/core/base-service'
import { ValidationFramework } from '@/lib/core/validation'
import { LIKE } from '@/lib/validation/schema-constants'
import { RepositoryFactory } from '@/lib/core/repository'
import { createHash } from 'crypto'
import {
  LikeEntity,
  LikeData,
  LikeCreateParams,
  LikeToggleParams,
  LikeEntitySchema,
  LikeDataSchema
} from '@/domain/like/like.entity'

/**
 * いいねサービスクラス
 */
export class LikeService extends BaseNumericService<LikeEntity, LikeData, LikeCreateParams> {
  constructor() {
    const config = {
      serviceName: 'like' as const,
      maxValue: LIKE.COUNT.MAX
    }
    
    super(config, LikeEntitySchema, LikeDataSchema)
  }

  /**
   * 新しいいいねエンティティを作成
   */
  protected async createNewEntity(
    id: string, 
    url: string, 
    params: LikeCreateParams
  ): Promise<Result<LikeEntity, ValidationError>> {
    const entity: LikeEntity = {
      id,
      url,
      created: new Date(),
      totalLikes: 0,
      settings: {
        webhookUrl: params.webhookUrl
      }
    }

    const validationResult = ValidationFramework.output(LikeEntitySchema, entity)
    if (!validationResult.success) {
      return validationResult
    }

    return Ok(validationResult.data)
  }

  /**
   * エンティティをデータ形式に変換
   */
  public async transformEntityToData(entity: LikeEntity): Promise<Result<LikeData, ValidationError>> {
    const data: LikeData = {
      id: entity.id,
      url: entity.url,
      total: entity.totalLikes,
      userLiked: false, // デフォルトはfalse、実際の状態は別途チェック
      lastLike: entity.lastLike,
      settings: entity.settings
    }

    return ValidationFramework.output(LikeDataSchema, data)
  }

  /**
   * ユーザー状態を含むデータ変換
   */
  public async transformEntityToDataWithUser(
    entity: LikeEntity, 
    userHash: string
  ): Promise<Result<LikeData, ValidationError>> {
    const userLikedResult = await this.checkUserLikeStatus(entity.id, userHash)
    const userLiked = userLikedResult.success ? userLikedResult.data : false

    const data: LikeData = {
      id: entity.id,
      url: entity.url,
      total: entity.totalLikes,
      userLiked,
      lastLike: entity.lastLike,
      settings: entity.settings
    }

    return ValidationFramework.output(LikeDataSchema, data)
  }

  /**
   * クリーンアップ処理
   */
  protected async performCleanup(id: string): Promise<Result<void, ValidationError>> {
    // ユーザーのいいね状態をクリーンアップ
    // 実際の実装では、期限切れのユーザー状態を削除
    return Ok(undefined)
  }

  /**
   * いいねをトグル（いいね/取り消し）
   */
  async toggleLike(
    id: string,
    userHash: string
  ): Promise<Result<LikeData, ValidationError | NotFoundError>> {
    // エンティティ取得
    const entityResult = await this.getById(id)
    if (!entityResult.success) {
      return entityResult
    }

    const entity = entityResult.data
    
    // 現在のユーザーのいいね状態をチェック
    const userLikedResult = await this.checkUserLikeStatus(id, userHash)
    const currentlyLiked = userLikedResult.success ? userLikedResult.data : false

    if (currentlyLiked) {
      // いいねを取り消し（日付制限を維持するためキーは削除せず値を更新）
      const updateResult = await this.updateUserLikeStatus(id, userHash, false)
      if (!updateResult.success) {
        return Err(new ValidationError('Failed to update user like status', { error: updateResult.error }))
      }

      const decrementResult = await this.incrementValue(`${id}:total`, -1)
      if (!decrementResult.success) {
        // ロールバック: ユーザー状態を復元
        await this.updateUserLikeStatus(id, userHash, true)
        return decrementResult
      }
      
      entity.totalLikes = decrementResult.data
      entity.lastLike = new Date() // 取り消しもアクセスとして記録
    } else {
      // いいねを追加（アトミック操作）
      const atomicSetResult = await this.atomicSetUserLikeStatus(id, userHash)
      if (!atomicSetResult.success) {
        return Err(new ValidationError('Failed to atomically set user status', { error: atomicSetResult.error }))
      }

      if (!atomicSetResult.data) {
        // 既にいいね済み（競合状態で他のリクエストが先に処理された）
        // 現在の状態を再取得して返す
        const updatedEntityResult = await this.getById(id)
        if (!updatedEntityResult.success) {
          return updatedEntityResult
        }
        return await this.transformEntityToDataWithUser(updatedEntityResult.data, userHash)
      }

      const incrementResult = await this.incrementValue(`${id}:total`, 1)
      if (!incrementResult.success) {
        // ロールバック: ユーザー状態を削除
        await this.removeUserLikeStatus(id, userHash)
        return incrementResult
      }
      
      entity.totalLikes = incrementResult.data
      entity.lastLike = new Date()
    }

    const previousLikes = currentlyLiked ? entity.totalLikes + 1 : entity.totalLikes - 1

    // エンティティ保存
    const saveResult = await this.entityRepository.save(id, entity)
    if (!saveResult.success) {
      // ロールバック処理
      if (currentlyLiked) {
        // 取り消し処理の場合のロールバック
        await this.incrementValue(`${id}:total`, 1)
        await this.updateUserLikeStatus(id, userHash, true)
      } else {
        // 追加処理の場合のロールバック
        await this.incrementValue(`${id}:total`, -1)
        await this.removeUserLikeStatus(id, userHash)
      }
      return Err(new ValidationError('Failed to save entity', { error: saveResult.error }))
    }

    // Webhook 通知を送信（webhookUrlが設定されている場合のみ）
    if (entity.settings.webhookUrl) {
      const webhookPayload = {
        event: 'like.toggle',
        timestamp: new Date().toISOString(),
        serviceId: id,
        url: entity.url,
        data: {
          previousLikes,
          newLikes: entity.totalLikes,
          userAction: currentlyLiked ? 'unlike' : 'like'
        }
      }

      // シンプルなWebhook送信（失敗してもメイン処理は継続）
      fetch(entity.settings.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookPayload)
      }).catch(error => {
        console.warn('Webhook delivery failed for like toggle:', error)
      })
    }

    return await this.transformEntityToDataWithUser(entity, userHash)
  }

  /**
   * いいねを増加（管理用）
   */
  async incrementLike(
    url: string,
    token: string,
    userHash: string,
    incrementBy: number = 1
  ): Promise<Result<LikeData, ValidationError | NotFoundError>> {
    // オーナーシップ検証
    const ownershipResult = await this.verifyOwnership(url, token)
    if (!ownershipResult.success) {
      return Err(new ValidationError('Ownership verification failed', { error: ownershipResult.error }))
    }

    if (!ownershipResult.data.isOwner || !ownershipResult.data.entity) {
      return Err(new ValidationError('Invalid token or entity not found'))
    }

    const entity = ownershipResult.data.entity as LikeEntity

    // いいね数を増加
    const incrementResult = await this.incrementValue(`${entity.id}:total`, incrementBy)
    if (!incrementResult.success) {
      return incrementResult
    }

    // エンティティ更新
    entity.totalLikes = incrementResult.data
    entity.lastLike = new Date()
    
    const saveResult = await this.entityRepository.save(entity.id, entity)
    if (!saveResult.success) {
      return Err(new ValidationError('Failed to save entity', { error: saveResult.error }))
    }

    return await this.transformEntityToDataWithUser(entity, userHash)
  }

  /**
   * いいね数を設定（管理用）
   */
  async setLikeValue(
    url: string,
    token: string,
    value: number,
    userHash: string
  ): Promise<Result<LikeData, ValidationError | NotFoundError>> {
    // オーナーシップ検証
    const ownershipResult = await this.verifyOwnership(url, token)
    if (!ownershipResult.success) {
      return Err(new ValidationError('Ownership verification failed', { error: ownershipResult.error }))
    }

    if (!ownershipResult.data.isOwner || !ownershipResult.data.entity) {
      return Err(new ValidationError('Invalid token or entity not found'))
    }

    const entity = ownershipResult.data.entity as LikeEntity

    // 値の検証
    if (value < 0) {
      return Err(new ValidationError('Like count cannot be negative'))
    }

    if (value > LIKE.COUNT.MAX) {
      return Err(new ValidationError(`Like count cannot exceed ${LIKE.COUNT.MAX}`))
    }

    // いいね数を設定
    const setResult = await this.setValue(`${entity.id}:total`, value)
    if (!setResult.success) {
      return setResult
    }

    // エンティティ更新
    entity.totalLikes = value
    entity.lastLike = new Date()
    
    const saveResult = await this.entityRepository.save(entity.id, entity)
    if (!saveResult.success) {
      return Err(new ValidationError('Failed to save entity', { error: saveResult.error }))
    }

    return await this.transformEntityToDataWithUser(entity, userHash)
  }

  // 設定更新（管理者用）
  async updateSettings(
    url: string,
    token: string,
    params: {
      webhookUrl?: string
    }
  ): Promise<Result<LikeData, ValidationError | NotFoundError>> {
    // オーナーシップ検証
    const ownershipResult = await this.verifyOwnership(url, token)
    if (!ownershipResult.success) {
      return Err(new ValidationError('Ownership verification failed', { error: ownershipResult.error }))
    }

    if (!ownershipResult.data.isOwner || !ownershipResult.data.entity) {
      return Err(new ValidationError('Invalid token or entity not found'))
    }

    const entity = ownershipResult.data.entity as LikeEntity

    // 設定更新
    if (params.webhookUrl !== undefined) {
      entity.settings.webhookUrl = params.webhookUrl
    }

    // エンティティ保存
    const saveResult = await this.entityRepository.save(entity.id, entity)
    if (!saveResult.success) {
      return Err(new ValidationError('Failed to save entity', { error: saveResult.error }))
    }

    return await this.transformEntityToDataWithUser(entity, '')
  }

  /**
   * ユーザーのいいね状態をチェック
   */
  private async checkUserLikeStatus(id: string, userHash: string): Promise<Result<boolean, ValidationError>> {
    const userKey = `like:${id}:users:${userHash}`
    const userRepo = RepositoryFactory.createEntity(z.string(), 'like_users')
    
    console.log(`[LIKE] Check: ${userKey}`)
    const getResult = await userRepo.get(userKey)
    if (!getResult.success) {
      console.log(`[LIKE] Key not found`)
      return Ok(false)
    }
    
    const liked = getResult.data === 'true'
    console.log(`[LIKE] Key found: value=${getResult.data}, liked=${liked}`)
    return Ok(liked)
  }

  /**
   * ユーザーのいいね状態を設定（日付ベース制限）
   */
  private async setUserLikeStatus(id: string, userHash: string): Promise<Result<void, ValidationError>> {
    const userKey = `like:${id}:users:${userHash}`
    const userRepo = RepositoryFactory.createEntity(z.string(), 'like_users')
    
    // 今日の終わりまでのTTLを計算
    const now = new Date()
    const endOfDay = new Date(now)
    endOfDay.setHours(23, 59, 59, 999)
    const ttl = Math.floor((endOfDay.getTime() - now.getTime()) / 1000)

    const saveResult = await userRepo.saveWithTTL(userKey, 'true', ttl)
    if (!saveResult.success) {
      return Err(new ValidationError('Failed to set user status', { error: saveResult.error }))
    }

    return Ok(undefined)
  }

  /**
   * ユーザーのいいね状態を更新（日付ベース制限）
   */
  private async updateUserLikeStatus(id: string, userHash: string, liked: boolean): Promise<Result<void, ValidationError>> {
    const userKey = `like:${id}:users:${userHash}`
    const userRepo = RepositoryFactory.createEntity(z.string(), 'like_users')
    
    // 今日の終わりまでのTTLを計算
    const now = new Date()
    const endOfDay = new Date(now)
    endOfDay.setHours(23, 59, 59, 999)
    const ttl = Math.floor((endOfDay.getTime() - now.getTime()) / 1000)

    console.log(`[LIKE] Update: ${userKey} = ${liked ? 'true' : 'false'}, TTL=${ttl}s until midnight`)
    const saveResult = await userRepo.saveWithTTL(userKey, liked ? 'true' : 'false', ttl)
    if (!saveResult.success) {
      console.log(`[LIKE] Update failed:`, saveResult.error)
      return Err(new ValidationError('Failed to update user status', { error: saveResult.error }))
    }

    return Ok(undefined)
  }

  /**
   * アトミックなユーザー状態設定（競合状態を解決）
   */
  private async atomicSetUserLikeStatus(id: string, userHash: string): Promise<Result<boolean, ValidationError>> {
    const userKey = `like:${id}:users:${userHash}`
    const userRepo = RepositoryFactory.createEntity(z.string(), 'like_users')
    
    // 今日の終わりまでのTTLを計算
    const now = new Date()
    const endOfDay = new Date(now)
    endOfDay.setHours(23, 59, 59, 999)
    const ttl = Math.floor((endOfDay.getTime() - now.getTime()) / 1000)

    try {
      // まずキーが存在するかチェック
      const getResult = await userRepo.get(userKey)
      if (getResult.success) {
        // キーが存在する場合、値をチェック
        if (getResult.data === 'true') {
          // 既にいいね済み
          return Ok(false)
        } else {
          // いいね取り消し状態 - 値を'true'に更新
          const updateResult = await this.updateUserLikeStatus(id, userHash, true)
          if (!updateResult.success) {
            return Err(new ValidationError('Failed to update user status', { error: updateResult.error }))
          }
          return Ok(true)
        }
      }
      
      // キーが存在しない場合、新規作成（TTL付き）
      const result = await userRepo.setIfNotExists(userKey, 'true', ttl)
      if (!result.success) {
        return Err(new ValidationError('Failed to atomically set user status', { error: result.error }))
      }
      
      return Ok(result.data)
    } catch (error) {
      return Err(new ValidationError('Redis operation failed', { error }))
    }
  }

  /**
   * ユーザーのいいね状態を削除
   */
  private async removeUserLikeStatus(id: string, userHash: string): Promise<Result<void, ValidationError>> {
    const userKey = `like:${id}:users:${userHash}`
    const userRepo = RepositoryFactory.createEntity(z.string(), 'like_users')

    const deleteResult = await userRepo.delete(userKey)
    if (!deleteResult.success) {
      return Err(new ValidationError('Failed to remove user status', { error: deleteResult.error }))
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
   * IDでいいねデータを取得（パブリックメソッド）
   */
  public async getLikeData(id: string, userHash?: string): Promise<Result<LikeData, ValidationError | NotFoundError>> {
    const entityResult = await this.getById(id)
    if (!entityResult.success) {
      return entityResult
    }

    if (userHash) {
      return await this.transformEntityToDataWithUser(entityResult.data, userHash)
    } else {
      return await this.transformEntityToData(entityResult.data)
    }
  }

  /**
   * SVG画像を生成
   */
  async generateSVG(
    likeData: LikeData,
    theme: 'light' | 'dark' | 'retro' | 'kawaii' | 'mom' | 'final'
  ): Promise<Result<string, ValidationError>> {
    try {
      const iconType = 'heart' // デフォルトはハート
      const icon = iconType === 'heart' ? '❤️' : 
                   iconType === 'star' ? '⭐' : '👍'
      const count = likeData.total
      
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
        retro: {
          bg: '#0d1117',
          text: '#00ff41',
          border: '#00ff41',
          icon: '#00cc33'
        },
        kawaii: {
          bg: '#ffe4e1',
          text: '#ff69b4',
          border: '#ffb6c1',
          icon: '#ff1493'
        },
        mom: {
          bg: '#f0f8e8',
          text: '#2d4a2b',
          border: '#ff8c00',
          icon: '#ff8c00'
        },
        final: {
          bg: '#1a237e',
          text: '#e3f2fd',
          border: '#64b5f6',
          icon: '#64b5f6'
        }
      }
      
      const themeColors = themes[theme]
      
      const svg = `
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
      
      return Ok(svg)
    } catch (error) {
      return Err(new ValidationError('Failed to generate SVG', { error }))
    }
  }
}

// シングルトンインスタンス
export const likeService = new LikeService()