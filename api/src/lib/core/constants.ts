/**
 * スキーマ定数の一元管理
 */

export const TOKEN = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 16,
} as const

export const PUBLIC_ID = {
  PATTERN: /^[a-z0-9-]+-[a-f0-9]{8}$/,
  HASH_LENGTH: 8,
} as const

export const URL_CONST = {
  REQUIRED_PROTOCOL: 'https://',
} as const

export const THEMES = ['light', 'dark', 'retro', 'kawaii', 'mom', 'final'] as const
export const DEFAULT_THEME = 'dark' as const

export const COUNTER = {
  TYPES: ['total', 'today', 'yesterday', 'week', 'month'] as const,
  DEFAULT_TYPE: 'total' as const,
  FORMATS: ['json', 'text', 'image'] as const,
  DEFAULT_FORMAT: 'image' as const,
} as const

export const LIKE = {
  ICONS: ['heart', 'star', 'thumb', 'peta'] as const,
  DEFAULT_ICON: 'heart' as const,
} as const

export const RANKING = {
  LIMIT: { MIN: 1, MAX: 100, DEFAULT: 10 },
  SORT_ORDER: { VALUES: ['desc', 'asc'] as const, DEFAULT: 'desc' as const },
  NAME: { MIN_LENGTH: 1, MAX_LENGTH: 50 },
  DISPLAY_SCORE: { MAX_LENGTH: 100 },
  MAX_ENTRIES: { MIN: 1, MAX: 10000 },
} as const

export const BBS = {
  AUTHOR: { MAX_LENGTH: 20, DEFAULT_VALUE: '名無しさん' },
  MESSAGE: { MIN_LENGTH: 1, MAX_LENGTH: 200 },
  MAX_MESSAGES: { MIN: 1, MAX: 1000 },
  ICONS: ['😀', '😉', '😎', '😠', '😢', '😮'] as const,
} as const

export const TTL = {
  ONE_DAY: 86400,
} as const

// 型エクスポート
export type ThemeType = typeof THEMES[number]
export type CounterType = typeof COUNTER.TYPES[number]
export type CounterFormat = typeof COUNTER.FORMATS[number]
export type LikeIcon = typeof LIKE.ICONS[number]
export type BBSIcon = typeof BBS.ICONS[number]
