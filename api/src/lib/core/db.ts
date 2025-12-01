/**
 * D1 Database utilities
 */

/**
 * 今日の日付文字列を取得 (YYYY-MM-DD)
 */
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * 昨日の日付文字列を取得
 */
export function getYesterdayDateString(): string {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday.toISOString().split('T')[0]
}

/**
 * 指定日数前からの日付リストを取得
 */
export function getDateRange(days: number): string[] {
  const dates: string[] = []
  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    dates.push(date.toISOString().split('T')[0])
  }
  return dates
}
