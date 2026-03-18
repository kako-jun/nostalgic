import { hashTokenWithSalt, verifyTokenHash } from "./crypto";

/**
 * トークンをハッシュ化（PBKDF2 + salt）- async version
 */
export async function hashToken(token: string): Promise<string> {
  return await hashTokenWithSalt(token);
}

/**
 * トークンの検証（保存されたハッシュと照合）
 * Legacy SHA-256 ハッシュにも対応
 */
export async function verifyToken(token: string, storedHash: string): Promise<boolean> {
  return await verifyTokenHash(token, storedHash);
}

/**
 * オーナートークンの検証（8-16文字）
 */
export function validateOwnerToken(token: string): boolean {
  return token.length >= 8 && token.length <= 16;
}
