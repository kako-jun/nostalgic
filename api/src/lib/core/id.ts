import { sha256Short } from './crypto'

/**
 * 公開ID生成（ドメイン-ハッシュ8桁）- async version
 */
export async function generatePublicId(url: string): Promise<string> {
  const urlObject = new URL(url)
  const domain = urlObject.hostname.replace(/^www\./, '').split('.')[0]
  const hash = await sha256Short(url, 8)
  return `${domain}-${hash}`
}
