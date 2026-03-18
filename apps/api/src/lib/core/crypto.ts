/**
 * Crypto utilities using Web Crypto API (Cloudflare Workers compatible)
 */

/**
 * Create SHA256 hash of a string (async)
 */
export async function sha256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Create SHA256 hash and return first N characters
 */
export async function sha256Short(data: string, length: number = 16): Promise<string> {
  const hash = await sha256(data);
  return hash.substring(0, length);
}

/**
 * Generate a random hex string
 */
export function randomHex(length: number = 8): string {
  const bytes = new Uint8Array(Math.ceil(length / 2));
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .substring(0, length);
}

/**
 * Generate a random salt for token hashing
 */
export function generateSalt(length: number = 16): string {
  return randomHex(length);
}

/**
 * Hash token with salt using PBKDF2 (Web Crypto API compatible)
 * Returns "salt:hash" format for storage
 */
export async function hashTokenWithSalt(token: string, salt?: string): Promise<string> {
  const tokenSalt = salt || generateSalt();
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(token), "PBKDF2", false, [
    "deriveBits",
  ]);
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: encoder.encode(tokenSalt),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );
  const hashArray = Array.from(new Uint8Array(derivedBits));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${tokenSalt}:${hashHex}`;
}

/**
 * Verify a token against a stored "salt:hash" string
 */
export async function verifyTokenHash(token: string, storedHash: string): Promise<boolean> {
  // Support legacy unsalted SHA-256 hashes (no colon separator)
  if (!storedHash.includes(":")) {
    const legacyHash = await sha256(token);
    return legacyHash === storedHash;
  }
  const [salt] = storedHash.split(":");
  const recomputed = await hashTokenWithSalt(token, salt);
  return recomputed === storedHash;
}

/**
 * Hash token for storage (owner token verification)
 * @deprecated Use hashTokenWithSalt for new tokens
 */
export async function hashToken(token: string): Promise<string> {
  return await hashTokenWithSalt(token);
}

/**
 * Generate user hash from IP, UserAgent, and date
 */
export async function generateUserHash(
  ip: string,
  userAgent: string,
  date?: string
): Promise<string> {
  const today = date || new Date().toISOString().split("T")[0];
  return await sha256Short(`${ip}:${userAgent}:${today}`, 16);
}
