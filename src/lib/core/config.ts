/**
 * 統一設定管理システム
 * 全ての設定を型安全に一元化
 */

import { z } from 'zod'
import { ValidationFramework } from '@/lib/core/validation'
import { Result, Ok, Err, ValidationError } from '@/lib/core/result'

/**
 * 設定スキーマの定義
 */

const CacheSettingsSchema = z.object({
  displayMaxAge: z.number().int().positive().default(60),
  metadataMaxAge: z.number().int().positive().default(300),
  contentTypes: z.object({
    svg: z.string().default('image/svg+xml'),
    text: z.string().default('text/plain; charset=utf-8'),
    json: z.string().default('application/json; charset=utf-8')
  }).default({
    svg: 'image/svg+xml',
    text: 'text/plain; charset=utf-8',
    json: 'application/json; charset=utf-8'
  })
}).default({
  displayMaxAge: 60,
  metadataMaxAge: 300,
  contentTypes: {
    svg: 'image/svg+xml',
    text: 'text/plain; charset=utf-8',
    json: 'application/json; charset=utf-8'
  }
})

const SecuritySettingsSchema = z.object({
  token: z.object({
    minLength: z.number().int().min(1).default(8),
    maxLength: z.number().int().max(128).default(16),
    allowedChars: z.string().default('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')
  }).default({
    minLength: 8,
    maxLength: 16,
    allowedChars: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  }),
  publicId: z.object({
    hashLength: z.number().int().min(4).max(16).default(8),
    pattern: z.string().default('^[a-z0-9-]+-[a-f0-9]{8}$')
  }).default({
    hashLength: 8,
    pattern: '^[a-z0-9-]+-[a-f0-9]{8}$'
  }),
  cors: z.object({
    allowedOrigins: z.array(z.string()).default(['*']),
    allowedMethods: z.array(z.string()).default(['GET', 'POST', 'OPTIONS']),
    allowedHeaders: z.array(z.string()).default(['Content-Type', 'Authorization'])
  }).default({
    allowedOrigins: ['*'],
    allowedMethods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
}).default({
  token: {
    minLength: 8,
    maxLength: 16,
    allowedChars: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  },
  publicId: {
    hashLength: 8,
    pattern: '^[a-z0-9-]+-[a-f0-9]{8}$'
  },
  cors: {
    allowedOrigins: ['*'],
    allowedMethods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
})

const RedisSettingsSchema = z.object({
  keyPrefix: z.string().default('nostalgic'),
  defaultTTL: z.number().int().positive().default(86400),
  visitDuplicationTTL: z.number().int().positive().default(86400),
  connectionTimeout: z.number().int().positive().default(5000),
  retryAttempts: z.number().int().min(0).default(3)
}).default({
  keyPrefix: 'nostalgic',
  defaultTTL: 86400,
  visitDuplicationTTL: 86400,
  connectionTimeout: 5000,
  retryAttempts: 3
})

const LoggingSettingsSchema = z.object({
  level: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  enablePerformanceLogging: z.boolean().default(false),
  enableValidationLogging: z.boolean().default(false),
  slowOperationThreshold: z.number().int().positive().default(1000)
}).default({
  level: 'info' as const,
  enablePerformanceLogging: false,
  enableValidationLogging: false,
  slowOperationThreshold: 1000
})

/**
 * メイン設定スキーマ
 */
export const ConfigSchema = z.object({
  cache: CacheSettingsSchema,
  security: SecuritySettingsSchema,
  redis: RedisSettingsSchema,
  logging: LoggingSettingsSchema
}).default(() => ({
  cache: {
    displayMaxAge: 60,
    metadataMaxAge: 300,
    contentTypes: {
      svg: 'image/svg+xml',
      text: 'text/plain; charset=utf-8',
      json: 'application/json; charset=utf-8'
    }
  },
  security: {
    token: {
      minLength: 8,
      maxLength: 16,
      allowedChars: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    },
    publicId: {
      hashLength: 8,
      pattern: '^[a-z0-9-]+-[a-f0-9]{8}$'
    },
    cors: {
      allowedOrigins: ['*'],
      allowedMethods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }
  },
  redis: {
    keyPrefix: 'nostalgic',
    defaultTTL: 86400,
    visitDuplicationTTL: 86400,
    connectionTimeout: 5000,
    retryAttempts: 3
  },
  logging: {
    level: 'info' as const,
    enablePerformanceLogging: false,
    enableValidationLogging: false,
    slowOperationThreshold: 1000
  }
}))

export type Config = z.infer<typeof ConfigSchema>
export type CacheSettings = z.infer<typeof CacheSettingsSchema>
export type SecuritySettings = z.infer<typeof SecuritySettingsSchema>
export type RedisSettings = z.infer<typeof RedisSettingsSchema>
export type LoggingSettings = z.infer<typeof LoggingSettingsSchema>

/**
 * 設定管理クラス
 */
export class ConfigManager {
  private static instance: ConfigManager
  private config: Config
  private initialized = false

  private constructor() {
    // デフォルト設定で初期化
    this.config = ConfigSchema.parse({})
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager()
    }
    return ConfigManager.instance
  }

  /**
   * 設定の初期化
   */
  initialize(customConfig?: Partial<Config>): Result<void, ValidationError> {
    const mergedConfig = customConfig || {}
    
    const validationResult = ValidationFramework.input(ConfigSchema, mergedConfig)
    
    if (!validationResult.success) {
      return validationResult
    }

    this.config = validationResult.data
    this.initialized = true

    console.log('Configuration initialized:', {
      cacheEnabled: this.config.cache.displayMaxAge > 0,
      loggingLevel: this.config.logging.level
    })

    return Ok(undefined)
  }

  /**
   * 設定値の取得
   */
  get<K extends keyof Config>(key: K): Config[K] {
    this.ensureInitialized()
    return this.config[key]
  }


  getCacheSettings(): CacheSettings {
    return this.get('cache')
  }

  getSecuritySettings(): SecuritySettings {
    return this.get('security')
  }

  getRedisSettings(): RedisSettings {
    return this.get('redis')
  }

  getLoggingSettings(): LoggingSettings {
    return this.get('logging')
  }

  /**
   * 設定値の動的更新（開発・テスト用）
   */
  updateConfig(updates: Partial<Config>): Result<void, ValidationError> {
    const mergedConfig = this.mergeDeep(this.config, updates)
    const validationResult = ValidationFramework.input(ConfigSchema, mergedConfig)
    
    if (!validationResult.success) {
      return validationResult
    }

    this.config = validationResult.data
    return Ok(undefined)
  }

  /**
   * 現在の設定をJSONで取得（デバッグ用）
   */
  toJSON(): Config {
    this.ensureInitialized()
    return JSON.parse(JSON.stringify(this.config))
  }

  /**
   * 設定の検証
   */
  validate(): Result<void, ValidationError> {
    const result = ValidationFramework.input(ConfigSchema, this.config)
    if (!result.success) {
      return result
    }
    return Ok(undefined)
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      const result = this.initialize()
      if (!result.success) {
        throw new Error(`Configuration not initialized: ${result.error.message}`)
      }
    }
  }

  private mergeDeep(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
    const result = { ...target }
    
    for (const key in source) {
      const sourceValue = source[key]
      const targetValue = target[key]
      
      if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
        const targetObj = (targetValue && typeof targetValue === 'object' && !Array.isArray(targetValue)) 
          ? targetValue as Record<string, unknown>
          : {} as Record<string, unknown>
        result[key] = this.mergeDeep(targetObj, sourceValue as Record<string, unknown>)
      } else {
        result[key] = sourceValue
      }
    }
    
    return result
  }
}

/**
 * グローバル設定インスタンス
 */
export const config = ConfigManager.getInstance()


export const getCacheSettings = (): CacheSettings => config.getCacheSettings()

export const getSecuritySettings = (): SecuritySettings => config.getSecuritySettings()

export const getRedisSettings = (): RedisSettings => config.getRedisSettings()

export const getLoggingSettings = (): LoggingSettings => config.getLoggingSettings()


