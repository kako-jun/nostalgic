import { hashToken as hashTokenAsync } from '@/lib/core/crypto'

/**
 * トークンをハッシュ化（SHA256）- async version
 */
export async function hashToken(token: string): Promise<string> {
  return await hashTokenAsync(token)
}

/**
 * オーナートークンの検証（8-16文字）
 */
export function validateOwnerToken(token: string): boolean {
  return token.length >= 8 && token.length <= 16
}
