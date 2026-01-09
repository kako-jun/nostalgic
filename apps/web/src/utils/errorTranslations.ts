/**
 * 多言語対応のための翻訳辞書
 *
 * ブラウザの言語設定を自動検出。日本語以外は英語にフォールバック。
 */

// サポート言語
export type SupportedLanguage = "ja" | "en";

// ブラウザの言語設定から現在の言語を取得
function detectLanguage(): SupportedLanguage {
  if (typeof navigator === "undefined") return "en";
  const browserLang = navigator.language.split("-")[0];
  return browserLang === "ja" ? "ja" : "en"; // 日本語以外は英語にフォールバック
}

export function getLanguage(): SupportedLanguage {
  return detectLanguage();
}

/**
 * UI文字列の翻訳辞書
 */
export const uiTranslations: Record<SupportedLanguage, Record<string, string>> = {
  ja: {
    // BBS
    "bbs.defaultAuthor": "ああああ",
    "bbs.postButton": "投稿",
    "bbs.updateButton": "更新",
    "bbs.deleteButton": "削除",
    "bbs.authorPlaceholder": "投稿者名を入力",
    "bbs.messagePlaceholder": "メッセージを入力",
    // Like
    "like.button": "いいね",
    // Counter
    "counter.visitors": "人目の訪問者",
    // Common
    "common.loading": "読み込み中...",
    "common.error": "エラー",
  },
  en: {
    // BBS
    "bbs.defaultAuthor": "Anonymous",
    "bbs.postButton": "Post",
    "bbs.updateButton": "Update",
    "bbs.deleteButton": "Delete",
    "bbs.authorPlaceholder": "Enter your name",
    "bbs.messagePlaceholder": "Enter message",
    // Like
    "like.button": "Like",
    // Counter
    "counter.visitors": "visitor(s)",
    // Common
    "common.loading": "Loading...",
    "common.error": "Error",
  },
};

/**
 * UI文字列を現在の言語で取得する
 */
export function t(key: string): string {
  const lang = getLanguage();
  return uiTranslations[lang][key] || uiTranslations.en[key] || key;
}

/**
 * APIエラーメッセージの日本語翻訳辞書
 * APIは英語でエラーを返すため、フロントエンドで日本語に翻訳する
 */
const errorTranslations: Record<string, string> = {
  // 共通エラー
  "url and token are required": "URLとトークンが必要です",
  "Token must be 8-16 characters": "トークンは8〜16文字で入力してください",
  "Invalid token": "トークンが無効です",
  "id is required": "IDが必要です",

  // Like サービス
  "Like service not found": "いいねサービスが見つかりません",
  "Like service already exists for this URL": "このURLにはすでにいいねサービスが存在します",
  "Invalid icon. Use: heart, star, thumb, peta":
    "無効なアイコンです。heart, star, thumb, peta から選択してください",
  "At least one of webhookUrl or icon is required": "webhookUrl または icon のいずれかが必要です",
  "Invalid action. Use: create, toggle, get, update, delete":
    "無効なアクションです。create, toggle, get, update, delete から選択してください",

  // Counter サービス
  "Counter not found": "カウンターが見つかりません",
  "Counter already exists for this URL": "このURLにはすでにカウンターが存在します",
  "At least one of value or webhookUrl is required": "value または webhookUrl のいずれかが必要です",
  "Value must be a non-negative number": "値は0以上の数値で入力してください",
  "url, token, and value are required": "URL、トークン、値が必要です",
  "Invalid action. Use: create, increment, get, update, delete":
    "無効なアクションです。create, increment, get, update, delete から選択してください",

  // BBS サービス
  "BBS not found": "掲示板が見つかりません",
  "BBS already exists for this URL": "このURLにはすでに掲示板が存在します",
  "id and message are required": "IDとメッセージが必要です",
  "Message must be 200 characters or less": "メッセージは200文字以内で入力してください",
  "At least one setting parameter is required": "設定パラメータが1つ以上必要です",
  "messageId and message are required": "メッセージIDとメッセージが必要です",
  "Message not found": "メッセージが見つかりません",
  "You can only edit your own messages": "自分のメッセージのみ編集できます",
  "You can only delete your own messages": "自分のメッセージのみ削除できます",
  "id or (url + token) is required": "IDまたは(URL + トークン)が必要です",

  // Ranking サービス
  "Ranking not found": "ランキングが見つかりません",
  "Ranking already exists for this URL": "このURLにはすでにランキングが存在します",
  "id, name, and score are required": "ID、名前、スコアが必要です",
  "score must be a number": "スコアは数値で入力してください",
  "url, token, and name are required": "URL、トークン、名前が必要です",
};

/**
 * 英語のAPIエラーメッセージを日本語に翻訳する
 * 翻訳が見つからない場合は元のメッセージを返す
 */
export function translateError(englishMessage: string): string {
  // 完全一致を試す
  if (errorTranslations[englishMessage]) {
    return errorTranslations[englishMessage];
  }

  // 動的なメッセージ（数値を含む）をパターンマッチ
  const messagePatterns: Array<{
    pattern: RegExp;
    translate: (match: RegExpMatchArray) => string;
  }> = [
    {
      pattern: /^Message must be (\d+) characters or less$/,
      translate: (m) => `メッセージは${m[1]}文字以内で入力してください`,
    },
    {
      pattern: /^Name must be (\d+) characters or less$/,
      translate: (m) => `名前は${m[1]}文字以内で入力してください`,
    },
    {
      pattern: /^Author must be (\d+) characters or less$/,
      translate: (m) => `投稿者名は${m[1]}文字以内で入力してください`,
    },
  ];

  for (const { pattern, translate } of messagePatterns) {
    const match = englishMessage.match(pattern);
    if (match) {
      return translate(match);
    }
  }

  // 翻訳が見つからない場合は元のメッセージを返す
  return englishMessage;
}

export default errorTranslations;
