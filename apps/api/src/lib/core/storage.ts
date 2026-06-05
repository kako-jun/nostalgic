/**
 * D1 書き込みの共通ハンドリング
 *
 * create 系で起きうる UNIQUE 制約違反（事前の existence チェックと
 * 実 INSERT の間に同一 URL/id が作られる競合）を、既存の
 * already-exists 応答（400）と同じ形に正規化するためのヘルパー。
 * それ以外の D1 例外はそのまま投げ直し、app.onError で 500 JSON に集約する。
 */

/** D1 が返す UNIQUE 制約違反かどうかを判定する */
export function isUniqueConstraintError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : typeof err === "string" ? err : String(err);
  // SQLite/D1 は PRIMARY KEY 違反も "UNIQUE constraint failed: <table>.<col>" として
  // 報告するため、この判定は PK 競合（url_mappings の複合PK等）もカバーする。
  // D1_ERROR: プレフィックスが付く場合も substring 一致で拾える。
  return message.includes("UNIQUE constraint failed");
}

/** create 系の競合（UNIQUE 違反）を already-exists として扱うためのエラー */
export class AlreadyExistsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AlreadyExistsError";
  }
}

/**
 * create の INSERT バッチを実行し、UNIQUE 制約違反を AlreadyExistsError に変換する。
 * - UNIQUE 違反 → AlreadyExistsError（呼び出し側で 400 already-exists 応答に変換）
 * - それ以外の例外 → そのまま再 throw（app.onError が 500 JSON に集約）
 *
 * @param db          D1Database
 * @param statements  実行する INSERT ステートメント配列
 * @param conflictMessage UNIQUE 違反時に投げる already-exists メッセージ
 */
export async function runCreateBatch(
  db: D1Database,
  statements: D1PreparedStatement[],
  conflictMessage: string
): Promise<void> {
  try {
    await db.batch(statements);
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      throw new AlreadyExistsError(conflictMessage);
    }
    throw err;
  }
}
