/**
 * Crypto utilities using Web Crypto API (Cloudflare Workers compatible)
 */

/**
 * Create SHA256 hash of a string (async)
 */
export async function sha256(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Create SHA256 hash and return first N characters
 */
export async function sha256Short(data: string, length: number = 16): Promise<string> {
  const hash = await sha256(data)
  return hash.substring(0, length)
}

/**
 * Generate a random hex string
 */
export function randomHex(length: number = 8): string {
  const bytes = new Uint8Array(Math.ceil(length / 2))
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .substring(0, length)
}

/**
 * Hash token for storage (owner token verification)
 */
export async function hashToken(token: string): Promise<string> {
  return await sha256(token)
}

/**
 * Generate user hash from IP, UserAgent, and date
 */
export async function generateUserHash(ip: string, userAgent: string, date?: string): Promise<string> {
  const today = date || new Date().toISOString().split('T')[0]
  return await sha256Short(`${ip}:${userAgent}:${today}`, 16)
}
