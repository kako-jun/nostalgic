/**
 * Batch utilities
 *
 * D1 (SQLite) は 1 ステートメントあたりのバインド変数を 100 個までしか許可しない
 * (SQLITE_MAX_VARIABLE_NUMBER = 100)。batchGet は `WHERE service_id IN (?,?,...)`
 * を組み立てるため、ids が ~98 件を超えると bind 変数が 100 を超えて D1 が 500 を返す。
 *
 * 実測閾値:
 *  - like batchGet: likedQuery が `IN (...N...) AND user_hash=? AND date=? AND action_type=?`
 *    で N+3 バインド。N=97 で 100、N=98 で 101 → 500（実機で 97/98 が境界と一致）。
 *  - visit batchGet: dailyQuery が `IN (...N...) AND date>=?` で N+1 バインド。N=99 で境界。
 *
 * MAX_BATCH_SIZE(=1000) まで広告どおり受け付けるため、ハンドラ側で ids を
 * D1 が安全に処理できるサイズに内部サブチャンクし、各チャンクの結果をマージして返す。
 */

/**
 * batchGet の内部 D1 サブチャンクサイズ。
 *
 * 最もバインドの多いクエリ（like の likedQuery: N+3 バインド）でも
 * 50+3=53 と 100 の半分以下に収め、固定列が増えても安全マージンを残す。
 */
export const BATCH_GET_CHUNK_SIZE = 50;

/**
 * 配列を指定サイズのチャンクに分割する純粋関数。
 *
 * - 元の順序を保持する
 * - 全要素を重複なく被覆する（連結すると元配列に等しい）
 * - 端数は最後のチャンクに残る
 * - 空配列は空配列を返す
 *
 * @param items 分割対象
 * @param size  1 チャンクの最大要素数（1 以上）
 */
export function chunkArray<T>(items: readonly T[], size: number): T[][] {
  if (size < 1 || !Number.isInteger(size)) {
    throw new Error(`chunkArray: size must be a positive integer, got ${size}`);
  }
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}
