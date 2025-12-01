import { hashToken as hashTokenCrypto } from './crypto'

/**
 * トークンをハッシュ化（SHA256）- async version
 */
export async function hashToken(token: string): Promise<string> {
  return await hashTokenCrypto(token)
}

/**
 * オーナートークンの検証（8-16文字）
 */
export function validateOwnerToken(token: string): boolean {
  return token.length >= 8 && token.length <= 16
}
