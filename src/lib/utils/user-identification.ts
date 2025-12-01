import { sha256, sha256Short } from '@/lib/core/crypto'

/**
 * Generates a user hash from IP and User-Agent
 * Used for like service user identification
 */
export async function generateUserHash(ip: string, userAgent: string): Promise<string> {
  const combined = `${ip}:${userAgent}`
  return await sha256Short(combined, 16)
}

/**
 * Generates a daily user hash from IP, User-Agent, and date
 * Used for counter service duplicate prevention (24h window)
 */
export async function generateDailyUserHash(ip: string, userAgent: string, date?: Date): Promise<string> {
  const targetDate = date || new Date()
  const dateStr = targetDate.toISOString().split('T')[0] // YYYY-MM-DD format
  const combined = `${ip}:${userAgent}:${dateStr}`
  return await sha256Short(combined, 16)
}

/**
 * Generates a simple IP hash
 * Used for basic IP-based identification
 */
export async function generateIPHash(ip: string): Promise<string> {
  return await sha256Short(ip, 12)
}

/**
 * Generates an author hash for BBS posts
 * Combines IP, User-Agent, and additional entropy for post identification
 */
export async function generateAuthorHash(ip: string, userAgent: string, timestamp?: number): Promise<string> {
  const time = timestamp || Date.now()
  const combined = `${ip}:${userAgent}:${time}`
  return await sha256Short(combined, 12)
}

/**
 * Validates if a hash matches the expected format
 */
export function isValidHash(hash: string, expectedLength: number = 16): boolean {
  if (typeof hash !== 'string') return false
  if (hash.length !== expectedLength) return false
  return /^[a-f0-9]+$/.test(hash)
}

/**
 * Generates a session-based hash for temporary identification
 * Used for preventing rapid duplicate actions within a session
 */
export async function generateSessionHash(ip: string, userAgent: string, sessionKey?: string): Promise<string> {
  const session = sessionKey || 'default'
  const combined = `${ip}:${userAgent}:${session}`
  return await sha256Short(combined, 8)
}

/**
 * User identification utility class
 * Provides consistent user identification across services
 */
export class UserIdentification {
  constructor(
    private ip: string,
    private userAgent: string
  ) {}

  /**
   * Get standard user hash (for likes, persistent user state)
   */
  async getUserHash(): Promise<string> {
    return await generateUserHash(this.ip, this.userAgent)
  }

  /**
   * Get daily user hash (for 24h duplicate prevention)
   */
  async getDailyHash(date?: Date): Promise<string> {
    return await generateDailyUserHash(this.ip, this.userAgent, date)
  }

  /**
   * Get IP hash (for IP-based tracking)
   */
  async getIPHash(): Promise<string> {
    return await generateIPHash(this.ip)
  }

  /**
   * Get author hash (for BBS posts)
   */
  async getAuthorHash(timestamp?: number): Promise<string> {
    return await generateAuthorHash(this.ip, this.userAgent, timestamp)
  }

  /**
   * Get session hash (for temporary session tracking)
   */
  async getSessionHash(sessionKey?: string): Promise<string> {
    return await generateSessionHash(this.ip, this.userAgent, sessionKey)
  }
}

/**
 * Creates a UserIdentification instance from IP and User-Agent
 */
export function createUserIdentification(ip: string, userAgent: string): UserIdentification {
  return new UserIdentification(ip, userAgent)
}
