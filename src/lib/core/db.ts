/**
 * D1 Database - Cloudflare D1 connection
 */

import { getCloudflareContext } from '@opennextjs/cloudflare'

export interface D1Database {
  prepare(query: string): D1PreparedStatement
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>
  exec(query: string): Promise<D1ExecResult>
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement
  first<T = unknown>(colName?: string): Promise<T | null>
  run(): Promise<D1Result<unknown>>
  all<T = unknown>(): Promise<D1Result<T>>
  raw<T = unknown>(): Promise<T[]>
}

export interface D1Result<T> {
  results: T[]
  success: boolean
  meta: {
    duration: number
    changes: number
    last_row_id: number
    rows_read: number
    rows_written: number
  }
}

export interface D1ExecResult {
  count: number
  duration: number
}

/**
 * Get D1 database instance from Cloudflare context
 */
export async function getDB(): Promise<D1Database> {
  const { env } = await getCloudflareContext() as { env: { DB?: D1Database } }

  if (!env.DB) {
    throw new Error('D1 database binding "DB" not found in environment')
  }

  return env.DB
}

/**
 * Helper to get today's date string in YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Helper to calculate seconds until end of day (for TTL-like behavior)
 */
export function getSecondsUntilEndOfDay(): number {
  const now = new Date()
  const endOfDay = new Date(now)
  endOfDay.setHours(23, 59, 59, 999)
  return Math.floor((endOfDay.getTime() - now.getTime()) / 1000)
}
