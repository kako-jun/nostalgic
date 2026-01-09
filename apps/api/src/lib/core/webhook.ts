/**
 * WebHook送信モジュール
 *
 * Discord/Slack両対応のWebHook送信を行う
 * 送信失敗してもメイン処理には影響しない（非同期・エラー握りつぶし）
 */

export type WebHookEvent = "counter.increment" | "like.toggle" | "ranking.submit" | "bbs.post";

export interface WebHookPayload {
  content: string; // Discord用
  text: string; // Slack用
  event: WebHookEvent;
  timestamp: string;
  data: Record<string, unknown>;
}

/**
 * WebHookを送信する（非同期、エラーは握りつぶす）
 */
export async function sendWebHook(
  webhookUrl: string | null | undefined,
  event: WebHookEvent,
  message: string,
  data: Record<string, unknown>
): Promise<void> {
  if (!webhookUrl) return;

  const payload: WebHookPayload = {
    content: message,
    text: message,
    event,
    timestamp: new Date().toISOString(),
    data,
  };

  try {
    // タイムアウト5秒
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
  } catch {
    // WebHook送信失敗は無視（メイン処理を止めない）
    console.error(`WebHook send failed: ${webhookUrl}`);
  }
}

/**
 * 固定文面生成
 */
export const WebHookMessages = {
  counter: {
    increment: (count: number) => `📊 カウンター更新: ${count}`,
  },
  like: {
    liked: (total: number) => `❤️ いいねされました！ 合計: ${total}`,
    unliked: (total: number) => `💔 いいねが解除されました 合計: ${total}`,
  },
  ranking: {
    submit: (name: string, score: number | string) => `🏆 ランキング更新: ${name} - ${score}`,
  },
  bbs: {
    post: (author: string, message: string) =>
      `📝 新しい投稿 by ${author}: ${message.slice(0, 50)}${message.length > 50 ? "..." : ""}`,
  },
};
