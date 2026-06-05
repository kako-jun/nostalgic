/**
 * like.js / ranking.js のエラー国際化（#28）の回帰テスト
 *
 * bbs.js の #26 パターン（bbsPostUX.test.ts）を横展開した source-scan 方式。
 * like.js / ranking.js は customElements に依存するブラウザ JS のため import できない。
 * node:fs で読んで正規表現で「守りたい性質」だけを機械的に検査する。
 *
 * 正規表現は prettier 整形耐性のため空白箇所に \s* / \s+ を許容させている。
 */

import { describe, test, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const LIKE_JS = resolve(__dirname, "../../public/components/like.js");
const RANKING_JS = resolve(__dirname, "../../public/components/ranking.js");
const BBS_JS = resolve(__dirname, "../../public/components/bbs.js");
const API_INDEX = resolve(__dirname, "../../../api/src/index.ts");

const likeJs = readFileSync(LIKE_JS, "utf8");
const rankingJs = readFileSync(RANKING_JS, "utf8");
const bbsJs = readFileSync(BBS_JS, "utf8");
const apiIndex = readFileSync(API_INDEX, "utf8");

// ---------------------------------------------------------------------------
// ranking.js: 動的エラー（連投制限 voteRateLimitError）
// ---------------------------------------------------------------------------
describe("ranking.js 翻訳: voteRateLimitError 動的関数", () => {
  // テスト1: ja の voteRateLimitError が定義され、日本語の待機文言と ${n} 埋め込みを持つ
  test("ja の voteRateLimitError が定義され、日本語の待機文言と埋め込み値 ${n} を含む", () => {
    const m = rankingJs.match(/voteRateLimitError:\s*\(n\)\s*=>\s*`([^`]*)`/g);
    expect(m).not.toBeNull();
    // ja は先に現れる（RANKING_I18N.ja → en の順）
    const ja = m![0];
    expect(ja).toMatch(/秒/);
    expect(ja).toMatch(/待っ/);
    expect(ja).toContain("${n}");
  });

  // テスト2: en の voteRateLimitError が定義され seconds を含み ${n} 埋め込みを持つ
  test("en の voteRateLimitError が定義され、seconds を含み埋め込み値 ${n} を含む", () => {
    const m = rankingJs.match(/voteRateLimitError:\s*\(n\)\s*=>\s*`([^`]*)`/g);
    expect(m).not.toBeNull();
    expect(m!.length).toBeGreaterThanOrEqual(2);
    const en = m![1];
    expect(en).toMatch(/seconds/);
    expect(en).toContain("${n}");
  });

  // テスト3: translateRankingError に 'Please wait (\\d+) seconds before voting again' の動的マッチが存在
  test("translateRankingError に 'Please wait (\\d+) seconds before voting again' の動的マッチが存在する", () => {
    expect(rankingJs).toMatch(
      /match\(\s*\/\^Please wait \(\\d\+\) seconds before voting again\$\/\s*\)/
    );
  });

  // テスト4: voteRateLimitMatch[1] を voteRateLimitError へ渡している
  test("voteRateLimitMatch のキャプチャを voteRateLimitError へ渡している", () => {
    expect(rankingJs).toMatch(/voteRateLimitError\(\s*voteRateLimitMatch\[1\]\s*\)/);
  });
});

// ---------------------------------------------------------------------------
// ranking.js: errors テーブルの ja/en 両言語網羅
// ---------------------------------------------------------------------------
describe("ranking.js 翻訳: errors テーブルが ja/en 両言語に同数存在する", () => {
  // RANKING_I18N を ja セクションと en セクションに分割して確認
  const rankingI18nMatch = rankingJs.match(/const RANKING_I18N\s*=\s*\{([\s\S]*?)\n\};/);
  const rankingJaSection = rankingI18nMatch ? rankingI18nMatch[1].split(/^\s*en\s*:/m)[0] : "";
  const rankingEnSection = rankingI18nMatch
    ? (rankingI18nMatch[1].split(/^\s*en\s*:/m)[1] ?? "")
    : "";

  const rankingErrorKeys = [
    "Ranking not found",
    "id is required",
    "id and score are required",
    "score must be a number",
    "Failed to load ranking data",
    "Rate limit exceeded. Please try again later.",
  ];

  // テスト5: 各キーが ja セクション / en セクション それぞれに存在する
  test.each(rankingErrorKeys)("ranking.js エラーキー '%s' が ja セクションに存在する", (key) => {
    expect(rankingJaSection).toContain(`"${key}"`);
  });

  test.each(rankingErrorKeys)("ranking.js エラーキー '%s' が en セクションに存在する", (key) => {
    expect(rankingEnSection).toContain(`"${key}"`);
  });
});

// ---------------------------------------------------------------------------
// ranking.js: translateRankingError フォールバック / pre-line / \n
// ---------------------------------------------------------------------------
describe("ranking.js 翻訳: フォールバック・CSS・改行", () => {
  // テスト6: translateRankingError は未知メッセージを原文フォールバックする
  test("translateRankingError は未知メッセージを原文フォールバックする（末尾に return message）", () => {
    const fn = rankingJs.match(/function translateRankingError\([^)]*\)\s*\{([\s\S]*?)\n\}/);
    expect(fn).not.toBeNull();
    const body = fn![1];
    const returns = body.match(/return\s+[^;]+;/g);
    expect(returns).not.toBeNull();
    expect(returns![returns!.length - 1]).toMatch(/return\s+message;/);
  });

  // テスト7: renderError の CSS に white-space: pre-line が存在する
  test("ranking.js の renderError CSS に white-space: pre-line が存在する", () => {
    const fn = rankingJs.match(/renderError\(\s*message\s*\)\s*\{([\s\S]*?)\n {2}\}/);
    expect(fn).not.toBeNull();
    expect(fn![1]).toMatch(/white-space:\s*pre-line/);
  });

  // テスト8: ja の全体レート制限文字列と連投制限文字列に \n が含まれる（文単位改行）
  test("ranking.js ja の全体レート制限訳文に \\n（文単位改行）が含まれる", () => {
    // RANKING_I18N.ja の errors['Rate limit exceeded...'] に \n が入っている
    expect(rankingJs).toMatch(
      /アクセスが集中しています。\\nしばらくしてからもう一度お試しください/
    );
  });

  test("ranking.js ja の voteRateLimitError 訳文に \\n（文単位改行）が含まれる", () => {
    expect(rankingJs).toMatch(/連投制限中です。\\nあと/);
  });
});

// ---------------------------------------------------------------------------
// like.js: errors テーブルの ja/en 両言語網羅
// ---------------------------------------------------------------------------
describe("like.js 翻訳: errors テーブルが ja/en 両言語に同数存在する", () => {
  // LIKE_I18N を ja セクションと en セクションに分割して、それぞれのキー存在を確認
  // （en の値がキー文字列と同一のため単純な出現数カウントが使えないため分割方式を採用）
  const likeI18nMatch = likeJs.match(/const LIKE_I18N\s*=\s*\{([\s\S]*?)\n\};/);
  // ja セクション: LIKE_I18N の { から "  en:" の手前まで
  const likeJaSection = likeI18nMatch ? likeI18nMatch[1].split(/^\s*en\s*:/m)[0] : "";
  // en セクション: "  en:" 以降
  const likeEnSection = likeI18nMatch ? (likeI18nMatch[1].split(/^\s*en\s*:/m)[1] ?? "") : "";

  const likeErrorKeys = [
    "Like service not found",
    "id is required",
    "API returned an error",
    "Rate limit exceeded. Please try again later.",
  ];

  // テスト9: 各キーが ja セクション / en セクション それぞれに存在する
  test.each(likeErrorKeys)("like.js エラーキー '%s' が ja セクションに存在する", (key) => {
    expect(likeJaSection).toContain(`"${key}"`);
  });

  test.each(likeErrorKeys)("like.js エラーキー '%s' が en セクションに存在する", (key) => {
    expect(likeEnSection).toContain(`"${key}"`);
  });
});

// ---------------------------------------------------------------------------
// like.js: translateLikeError フォールバック / エラーパス経由 / pre-line
// ---------------------------------------------------------------------------
describe("like.js 翻訳: translateLikeError の存在・エラーパス・CSS", () => {
  // テスト10: translateLikeError 関数が定義されている
  test("translateLikeError 関数が定義されている", () => {
    expect(likeJs).toMatch(/function translateLikeError\s*\(/);
  });

  // テスト11: translateLikeError は未知メッセージを原文フォールバックする
  test("translateLikeError は未知メッセージを原文フォールバックする（末尾に return message）", () => {
    const fn = likeJs.match(/function translateLikeError\([^)]*\)\s*\{([\s\S]*?)\n\}/);
    expect(fn).not.toBeNull();
    const body = fn![1];
    const returns = body.match(/return\s+[^;]+;/g);
    expect(returns).not.toBeNull();
    expect(returns![returns!.length - 1]).toMatch(/return\s+message;/);
  });

  // テスト12: toggleLike のエラーパスが translateLikeError を経由する
  //           （toggleLike 関数本体の throw が translateLikeError を通る）
  test("toggleLike の throw が translateLikeError を経由する", () => {
    // toggleLike 関数を抽出（async toggleLike(...) { ... } の本体）
    const fn = likeJs.match(/async toggleLike\([^)]*\)\s*\{([\s\S]*?)\n {2}\}/);
    expect(fn).not.toBeNull();
    const body = fn![1];
    // 翻訳経由の throw が存在する
    expect(body).toMatch(/throw new Error\(\s*translateLikeError\(\s*responseData\.error/);
  });

  // テスト13: renderError の :host CSS に white-space: pre-line が存在する
  test("like.js の renderError :host CSS に white-space: pre-line が存在する", () => {
    const fn = likeJs.match(/renderError\(\s*message\s*\)\s*\{([\s\S]*?)\n {2}\}/);
    expect(fn).not.toBeNull();
    expect(fn![1]).toMatch(/white-space:\s*pre-line/);
  });
});

// ---------------------------------------------------------------------------
// 横断: 3コンポーネントすべてに translate〜Error 関数が存在する
// ---------------------------------------------------------------------------
describe("横断: bbs / like / ranking の3コンポーネントに translate〜Error 関数が存在する", () => {
  // テスト14: bbs.js に translateBBSError が存在する
  test("bbs.js に translateBBSError 関数が存在する", () => {
    expect(bbsJs).toMatch(/function translateBBSError\s*\(/);
  });

  // テスト15: like.js に translateLikeError が存在する
  test("like.js に translateLikeError 関数が存在する", () => {
    expect(likeJs).toMatch(/function translateLikeError\s*\(/);
  });

  // テスト16: ranking.js に translateRankingError が存在する
  test("ranking.js に translateRankingError 関数が存在する", () => {
    expect(rankingJs).toMatch(/function translateRankingError\s*\(/);
  });

  // テスト17: 全体レート制限文字列が3コンポーネント全部の対訳表に存在し、
  //           API 実装（apps/api/src/index.ts）の実文言と一字一句一致する
  test("Rate limit exceeded 文字列が3コンポーネントすべての errors テーブルに存在し API 実文言と一致する", () => {
    // API 実装からレート制限エラー文言を抽出
    const apiMatch = apiIndex.match(
      /return c\.json\(\s*\{\s*error:\s*"([^"]+)"\s*\}\s*,\s*429\s*\)/
    );
    expect(apiMatch).not.toBeNull();
    const apiMsg = apiMatch![1];
    expect(apiMsg).toBe("Rate limit exceeded. Please try again later.");

    // 各コンポーネントの errors テーブルにその文言が2回以上（ja + en）存在する
    expect(bbsJs.split(`"${apiMsg}"`).length - 1).toBeGreaterThanOrEqual(2);
    expect(likeJs.split(`"${apiMsg}"`).length - 1).toBeGreaterThanOrEqual(2);
    expect(rankingJs.split(`"${apiMsg}"`).length - 1).toBeGreaterThanOrEqual(2);
  });
});
