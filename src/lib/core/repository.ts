/**
 * Repository パターン - D1操作の完全抽象化
 */

import { z } from 'zod'
import { Result, Ok, Err, StorageError, NotFoundError, ValidationError } from '@/lib/core/result'
import { ValidationFramework } from '@/lib/core/validation'
import { getDB, getTodayDateString } from '@/lib/core/db'

/**
 * D1 Repository の基底クラス（エンティティ用）
 */
export abstract class BaseRepository<TEntity, TId = string> {
  constructor(
    protected readonly entitySchema: z.ZodType<TEntity>,
    protected readonly keyPrefix: string
  ) {}

  /**
   * エンティティの保存（servicesテーブルに保存）
   */
  async save(id: TId, entity: TEntity): Promise<Result<void, StorageError | ValidationError>> {
    const serializationResult = ValidationFramework.storage(this.entitySchema, entity)

    if (!serializationResult.success) {
      return serializationResult
    }

    try {
      const db = await getDB()
      const key = this.buildKey(id)

      // UPSERT: INSERT OR REPLACE
      await db.prepare(`
        INSERT OR REPLACE INTO services (id, type, url, metadata, created_at)
        VALUES (?, ?, ?, ?, datetime('now'))
      `).bind(
        key,
        this.keyPrefix,
        (entity as any).url || '',
        serializationResult.data
      ).run()

      return Ok(undefined)
    } catch (error) {
      return Err(new StorageError('save', error instanceof Error ? error.message : String(error)))
    }
  }

  /**
   * エンティティの取得
   */
  async get(id: TId): Promise<Result<TEntity, StorageError | ValidationError | NotFoundError>> {
    try {
      const db = await getDB()
      const key = this.buildKey(id)

      const row = await db.prepare(`
        SELECT metadata FROM services WHERE id = ?
      `).bind(key).first<{ metadata: string }>()

      if (!row) {
        return Err(new NotFoundError(this.keyPrefix, String(id)))
      }

      return ValidationFramework.fromStorage(this.entitySchema, row.metadata)
    } catch (error) {
      return Err(new StorageError('get', error instanceof Error ? error.message : String(error)))
    }
  }

  /**
   * エンティティの存在確認
   */
  async exists(id: TId): Promise<Result<boolean, StorageError>> {
    try {
      const db = await getDB()
      const key = this.buildKey(id)

      const row = await db.prepare(`
        SELECT 1 FROM services WHERE id = ?
      `).bind(key).first()

      return Ok(row !== null)
    } catch (error) {
      return Err(new StorageError('exists', error instanceof Error ? error.message : String(error)))
    }
  }

  /**
   * エンティティの削除
   */
  async delete(id: TId): Promise<Result<boolean, StorageError>> {
    try {
      const db = await getDB()
      const key = this.buildKey(id)

      const result = await db.prepare(`
        DELETE FROM services WHERE id = ?
      `).bind(key).run()

      return Ok(result.meta.changes > 0)
    } catch (error) {
      return Err(new StorageError('delete', error instanceof Error ? error.message : String(error)))
    }
  }

  /**
   * TTL設定付き保存（daily_actionsテーブルを使用）
   */
  async saveWithTTL(
    id: TId,
    entity: TEntity,
    _ttlSeconds: number
  ): Promise<Result<void, StorageError | ValidationError>> {
    const serializationResult = ValidationFramework.storage(this.entitySchema, entity)

    if (!serializationResult.success) {
      return serializationResult
    }

    try {
      const db = await getDB()
      const key = this.buildKey(id)
      const today = getTodayDateString()

      // daily_actionsテーブルを使用（日付ベースでクリーンアップ）
      await db.prepare(`
        INSERT OR REPLACE INTO daily_actions (service_id, user_hash, date, action_type, value)
        VALUES (?, ?, ?, ?, ?)
      `).bind(
        key,
        'default',
        today,
        'ttl_entity',
        serializationResult.data
      ).run()

      return Ok(undefined)
    } catch (error) {
      return Err(new StorageError('saveWithTTL', error instanceof Error ? error.message : String(error)))
    }
  }

  /**
   * アトミックな設定（キーが存在しない場合のみ）
   */
  async setIfNotExists(
    id: TId,
    entity: TEntity,
    _ttlSeconds: number
  ): Promise<Result<boolean, StorageError | ValidationError>> {
    const serializationResult = ValidationFramework.storage(this.entitySchema, entity)

    if (!serializationResult.success) {
      return serializationResult
    }

    try {
      const db = await getDB()
      const key = this.buildKey(id)
      const today = getTodayDateString()

      // まず存在確認
      const existing = await db.prepare(`
        SELECT 1 FROM daily_actions
        WHERE service_id = ? AND date = ? AND action_type = 'visit'
      `).bind(key, today).first()

      if (existing) {
        return Ok(false) // 既に存在
      }

      // 存在しない場合は挿入
      await db.prepare(`
        INSERT INTO daily_actions (service_id, user_hash, date, action_type, value)
        VALUES (?, 'default', ?, 'visit', ?)
      `).bind(key, today, serializationResult.data).run()

      return Ok(true) // 新規作成
    } catch (error) {
      // UNIQUE制約違反の場合は既に存在
      if (String(error).includes('UNIQUE constraint failed')) {
        return Ok(false)
      }
      return Err(new StorageError('setIfNotExists', error instanceof Error ? error.message : String(error)))
    }
  }

  /**
   * キーの構築
   */
  protected buildKey(id: TId): string {
    return `${this.keyPrefix}:${String(id)}`
  }
}

/**
 * 数値を扱う D1 Repository
 */
export class NumberRepository {
  constructor(private readonly keyPrefix: string) {}

  async get(key: string): Promise<Result<number, StorageError | ValidationError>> {
    try {
      const db = await getDB()
      const fullKey = this.buildKey(key)

      const row = await db.prepare(`
        SELECT total FROM counters WHERE service_id = ?
      `).bind(fullKey).first<{ total: number }>()

      return Ok(row?.total ?? 0)
    } catch (error) {
      return Err(new StorageError('get number', error instanceof Error ? error.message : String(error)))
    }
  }

  async set(key: string, value: number): Promise<Result<void, StorageError>> {
    try {
      const db = await getDB()
      const fullKey = this.buildKey(key)

      await db.prepare(`
        INSERT OR REPLACE INTO counters (service_id, total)
        VALUES (?, ?)
      `).bind(fullKey, value).run()

      return Ok(undefined)
    } catch (error) {
      return Err(new StorageError('set number', error instanceof Error ? error.message : String(error)))
    }
  }

  async increment(key: string, by: number = 1): Promise<Result<number, StorageError>> {
    try {
      const db = await getDB()
      const fullKey = this.buildKey(key)

      // UPSERT with increment
      await db.prepare(`
        INSERT INTO counters (service_id, total)
        VALUES (?, ?)
        ON CONFLICT(service_id) DO UPDATE SET total = total + ?
      `).bind(fullKey, by, by).run()

      // Get new value
      const row = await db.prepare(`
        SELECT total FROM counters WHERE service_id = ?
      `).bind(fullKey).first<{ total: number }>()

      return Ok(row?.total ?? by)
    } catch (error) {
      return Err(new StorageError('increment', error instanceof Error ? error.message : String(error)))
    }
  }

  async decrement(key: string, by: number = 1): Promise<Result<number, StorageError>> {
    try {
      const db = await getDB()
      const fullKey = this.buildKey(key)

      // Decrement but don't go below 0
      await db.prepare(`
        UPDATE counters
        SET total = MAX(0, total - ?)
        WHERE service_id = ?
      `).bind(by, fullKey).run()

      const row = await db.prepare(`
        SELECT total FROM counters WHERE service_id = ?
      `).bind(fullKey).first<{ total: number }>()

      return Ok(row?.total ?? 0)
    } catch (error) {
      return Err(new StorageError('decrement', error instanceof Error ? error.message : String(error)))
    }
  }

  private buildKey(key: string): string {
    return `${this.keyPrefix}:${key}`
  }
}

/**
 * リストを扱う D1 Repository（BBS用）
 */
export class ListRepository<T> {
  constructor(
    private readonly itemSchema: z.ZodType<T>,
    private readonly keyPrefix: string
  ) {}

  async push(key: string, items: T[]): Promise<Result<number, StorageError | ValidationError>> {
    try {
      const db = await getDB()
      const serviceId = this.buildKey(key)

      const statements = []
      for (const item of items) {
        const serializationResult = ValidationFramework.storage(this.itemSchema, item)
        if (!serializationResult.success) {
          return serializationResult
        }

        const itemData = item as any
        statements.push(
          db.prepare(`
            INSERT INTO bbs_messages (id, service_id, author, message, icon, selects, user_hash, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
          `).bind(
            itemData.id || crypto.randomUUID(),
            serviceId,
            itemData.author || '',
            itemData.message || '',
            itemData.icon || null,
            itemData.selects ? JSON.stringify(itemData.selects) : null,
            itemData.userHash || ''
          )
        )
      }

      await db.batch(statements)

      // Get total count
      const countRow = await db.prepare(`
        SELECT COUNT(*) as count FROM bbs_messages WHERE service_id = ?
      `).bind(serviceId).first<{ count: number }>()

      return Ok(countRow?.count ?? items.length)
    } catch (error) {
      return Err(new StorageError('list push', error instanceof Error ? error.message : String(error)))
    }
  }

  async range(
    key: string,
    start: number = 0,
    end: number = -1
  ): Promise<Result<T[], StorageError | ValidationError>> {
    try {
      const db = await getDB()
      const serviceId = this.buildKey(key)

      // Calculate limit
      const limit = end === -1 ? 1000 : (end - start + 1)

      const { results } = await db.prepare(`
        SELECT id, author, message, icon, selects, user_hash as userHash, created_at as timestamp
        FROM bbs_messages
        WHERE service_id = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `).bind(serviceId, limit, start).all()

      // Convert to expected format
      const items = results.map((row: any) => ({
        id: row.id,
        author: row.author,
        message: row.message,
        icon: row.icon,
        selects: row.selects ? JSON.parse(row.selects) : undefined,
        userHash: row.userHash,
        timestamp: row.timestamp
      }))

      return ValidationFramework.fromStringArray(this.itemSchema, items.map(i => JSON.stringify(i)))
    } catch (error) {
      return Err(new StorageError('list range', error instanceof Error ? error.message : String(error)))
    }
  }

  async length(key: string): Promise<Result<number, StorageError>> {
    try {
      const db = await getDB()
      const serviceId = this.buildKey(key)

      const row = await db.prepare(`
        SELECT COUNT(*) as count FROM bbs_messages WHERE service_id = ?
      `).bind(serviceId).first<{ count: number }>()

      return Ok(row?.count ?? 0)
    } catch (error) {
      return Err(new StorageError('list length', error instanceof Error ? error.message : String(error)))
    }
  }

  async trim(key: string, start: number, end: number): Promise<Result<void, StorageError>> {
    try {
      const db = await getDB()
      const serviceId = this.buildKey(key)

      // Keep only messages within range by deleting others
      // Get IDs to keep
      const keep = end - start + 1

      await db.prepare(`
        DELETE FROM bbs_messages
        WHERE service_id = ?
        AND id NOT IN (
          SELECT id FROM bbs_messages
          WHERE service_id = ?
          ORDER BY created_at DESC
          LIMIT ?
        )
      `).bind(serviceId, serviceId, keep).run()

      return Ok(undefined)
    } catch (error) {
      return Err(new StorageError('list trim', error instanceof Error ? error.message : String(error)))
    }
  }

  async clear(key: string): Promise<Result<void, StorageError>> {
    try {
      const db = await getDB()
      const serviceId = this.buildKey(key)

      await db.prepare(`
        DELETE FROM bbs_messages WHERE service_id = ?
      `).bind(serviceId).run()

      return Ok(undefined)
    } catch (error) {
      return Err(new StorageError('list clear', error instanceof Error ? error.message : String(error)))
    }
  }

  private buildKey(key: string): string {
    return `${this.keyPrefix}:${key}`
  }
}

/**
 * ソートセットを扱う D1 Repository（ランキング用）
 */
export class SortedSetRepository {
  constructor(private readonly keyPrefix: string) {}

  async add(key: string, member: string, score: number): Promise<Result<boolean, StorageError>> {
    try {
      const db = await getDB()
      const serviceId = this.buildKey(key)

      // Parse member to get name and unique_id
      const [name, uniqueId] = member.includes(':')
        ? [member.split(':')[0], member.split(':').slice(1).join(':')]
        : [member, '']

      await db.prepare(`
        INSERT OR REPLACE INTO ranking_scores (service_id, name, score, unique_id, created_at)
        VALUES (?, ?, ?, ?, datetime('now'))
      `).bind(serviceId, name, score, uniqueId).run()

      return Ok(true)
    } catch (error) {
      return Err(new StorageError('sorted set add', error instanceof Error ? error.message : String(error)))
    }
  }

  async remove(key: string, member: string): Promise<Result<boolean, StorageError>> {
    try {
      const db = await getDB()
      const serviceId = this.buildKey(key)

      const [name, uniqueId] = member.includes(':')
        ? [member.split(':')[0], member.split(':').slice(1).join(':')]
        : [member, '']

      const result = await db.prepare(`
        DELETE FROM ranking_scores
        WHERE service_id = ? AND name = ? AND unique_id = ?
      `).bind(serviceId, name, uniqueId).run()

      return Ok(result.meta.changes > 0)
    } catch (error) {
      return Err(new StorageError('sorted set remove', error instanceof Error ? error.message : String(error)))
    }
  }

  async getScore(key: string, member: string): Promise<Result<number | null, StorageError>> {
    try {
      const db = await getDB()
      const serviceId = this.buildKey(key)

      const [name, uniqueId] = member.includes(':')
        ? [member.split(':')[0], member.split(':').slice(1).join(':')]
        : [member, '']

      const row = await db.prepare(`
        SELECT score FROM ranking_scores
        WHERE service_id = ? AND name = ? AND unique_id = ?
      `).bind(serviceId, name, uniqueId).first<{ score: number }>()

      return Ok(row?.score ?? null)
    } catch (error) {
      return Err(new StorageError('sorted set get score', error instanceof Error ? error.message : String(error)))
    }
  }

  async getRangeWithScores(
    key: string,
    start: number = 0,
    end: number = -1,
    ascending: boolean = false
  ): Promise<Result<Array<{member: string, score: number}>, StorageError | ValidationError>> {
    try {
      const db = await getDB()
      const serviceId = this.buildKey(key)

      const limit = end === -1 ? 1000 : (end - start + 1)
      const order = ascending ? 'ASC' : 'DESC'

      const { results } = await db.prepare(`
        SELECT name, unique_id, score
        FROM ranking_scores
        WHERE service_id = ?
        ORDER BY score ${order}
        LIMIT ? OFFSET ?
      `).bind(serviceId, limit, start).all()

      const entries = (results as any[]).map(row => ({
        member: row.unique_id ? `${row.name}:${row.unique_id}` : row.name,
        score: row.score
      }))

      return Ok(entries)
    } catch (error) {
      return Err(new StorageError('sorted set range', error instanceof Error ? error.message : String(error)))
    }
  }

  async count(key: string): Promise<Result<number, StorageError>> {
    try {
      const db = await getDB()
      const serviceId = this.buildKey(key)

      const row = await db.prepare(`
        SELECT COUNT(*) as count FROM ranking_scores WHERE service_id = ?
      `).bind(serviceId).first<{ count: number }>()

      return Ok(row?.count ?? 0)
    } catch (error) {
      return Err(new StorageError('sorted set count', error instanceof Error ? error.message : String(error)))
    }
  }

  async removeRange(key: string, start: number, end: number): Promise<Result<number, StorageError>> {
    try {
      const db = await getDB()
      const serviceId = this.buildKey(key)

      // Remove entries by rank (lowest scores first)
      const toRemove = end - start + 1

      const result = await db.prepare(`
        DELETE FROM ranking_scores
        WHERE service_id = ?
        AND rowid IN (
          SELECT rowid FROM ranking_scores
          WHERE service_id = ?
          ORDER BY score ASC
          LIMIT ? OFFSET ?
        )
      `).bind(serviceId, serviceId, toRemove, start).run()

      return Ok(result.meta.changes)
    } catch (error) {
      return Err(new StorageError('sorted set remove range', error instanceof Error ? error.message : String(error)))
    }
  }

  async clear(key: string): Promise<Result<void, StorageError>> {
    try {
      const db = await getDB()
      const serviceId = this.buildKey(key)

      await db.prepare(`
        DELETE FROM ranking_scores WHERE service_id = ?
      `).bind(serviceId).run()

      return Ok(undefined)
    } catch (error) {
      return Err(new StorageError('sorted set clear', error instanceof Error ? error.message : String(error)))
    }
  }

  private buildKey(key: string): string {
    return `${this.keyPrefix}:${key}`
  }
}

/**
 * URL → ID のマッピングを扱うRepository
 */
export class UrlMappingRepository {
  constructor(private readonly keyPrefix: string) {}

  async set(url: string, id: string): Promise<Result<void, StorageError>> {
    try {
      const db = await getDB()

      await db.prepare(`
        INSERT OR REPLACE INTO url_mappings (type, url, service_id)
        VALUES (?, ?, ?)
      `).bind(this.keyPrefix, url, id).run()

      return Ok(undefined)
    } catch (error) {
      return Err(new StorageError('url mapping set', error instanceof Error ? error.message : String(error)))
    }
  }

  async get(url: string): Promise<Result<string | null, StorageError>> {
    try {
      const db = await getDB()

      const row = await db.prepare(`
        SELECT service_id FROM url_mappings WHERE type = ? AND url = ?
      `).bind(this.keyPrefix, url).first<{ service_id: string }>()

      return Ok(row?.service_id ?? null)
    } catch (error) {
      return Err(new StorageError('url mapping get', error instanceof Error ? error.message : String(error)))
    }
  }

  async delete(url: string): Promise<Result<boolean, StorageError>> {
    try {
      const db = await getDB()

      const result = await db.prepare(`
        DELETE FROM url_mappings WHERE type = ? AND url = ?
      `).bind(this.keyPrefix, url).run()

      return Ok(result.meta.changes > 0)
    } catch (error) {
      return Err(new StorageError('url mapping delete', error instanceof Error ? error.message : String(error)))
    }
  }
}

/**
 * Repository Factory - サービス毎にRepositoryを作成
 */
export class RepositoryFactory {
  static createEntity<T>(
    schema: z.ZodType<T>,
    service: string
  ): BaseRepository<T> {
    return new (class extends BaseRepository<T> {
      constructor() {
        super(schema, service)
      }
    })()
  }

  static createNumber(service: string): NumberRepository {
    return new NumberRepository(service)
  }

  static createList<T>(schema: z.ZodType<T>, service: string): ListRepository<T> {
    return new ListRepository(schema, service)
  }

  static createSortedSet(service: string): SortedSetRepository {
    return new SortedSetRepository(service)
  }

  static createUrlMapping(service: string): UrlMappingRepository {
    return new UrlMappingRepository(service)
  }
}
