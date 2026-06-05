/**
 * Batch utilities
 *
 * D1 (SQLite) は 1 ステートメントあたりのバインド変数を D1_BIND_LIMIT 個までしか許可しない
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
 * D1 の内部サブチャンクサイズ。
 *
 * 最もバインドの多い batch クエリ（like の likedQuery）は、ID の IN 句に加えて
 * user_hash / date / action_type の 3 固定 bind を使う。公開 API 上限とは別に、
 * 1 SQL statement が D1_BIND_LIMIT を超えないよう、ここから機械的に算出する。
 */
export const D1_BIND_LIMIT = 100;
export const MAX_BATCH_QUERY_FIXED_BINDS = 3;
export const D1_BATCH_CHUNK_SIZE = D1_BIND_LIMIT - MAX_BATCH_QUERY_FIXED_BINDS;
export const BATCH_GET_CHUNK_SIZE = D1_BATCH_CHUNK_SIZE;

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
