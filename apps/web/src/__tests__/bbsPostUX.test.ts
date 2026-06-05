/**
 * BBS 投稿 UX の回帰テスト (Issue #26)
 *
 * 対象は web component 本体 `public/components/bbs.js` と埋め込みページ `src/pages/BBS.tsx`。
 * bbs.js は customElements / CustomEvent / shadowRoot に依存する非モジュールの素のブラウザ JS で、
 * import も eval もできない。そのため noRelativeApiUrl.test.ts と同じ
 * 「node:fs で読んで正規表現で検査する source-scan 方式」で UX の退行を検出する。
 *
 * 実機の timing / イベント発火 / shadow 境界越え / 実表示は本番 golden path で目視確認する範囲なので
 * ここではテスト化せず、ソース上で「守りたい性質が崩れていないか」だけを機械的に守る。
 *
 * 正規表現は prettier 再整形（printWidth 100 / semi / es5 trailingComma）で偽陰性にならないよう
 * 空白に \s+ / \s* を許容させて整形耐性を持たせている。
 */

import { describe, test, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const BBS_JS = resolve(__dirname, "../../public/components/bbs.js");
const BBS_TSX = resolve(__dirname, "../pages/BBS.tsx");

const bbsJs = readFileSync(BBS_JS, "utf8");
const bbsTsx = readFileSync(BBS_TSX, "utf8");

// ---------------------------------------------------------------------------
// bbs.js: 翻訳（rate limit / 動的パターン / フォールバック / 対訳キー網羅）
// ---------------------------------------------------------------------------
describe("bbs.js 翻訳: 連投制限と動的エラー", () => {
  // 観点1: rateLimitError が ja / en 両方に関数として定義され、それぞれ適切な言語表現を持つ
  test("ja の rateLimitError が定義され、日本語の待機文言と埋め込み値 ${n} を含む", () => {
    const m = bbsJs.match(/rateLimitError:\s*\(n\)\s*=>\s*`([^`]*)`/g);
    expect(m).not.toBeNull();
    // ja は最初に現れる（BBS_I18N.ja → en の順）
    const ja = m![0];
    expect(ja).toMatch(/秒/);
    expect(ja).toMatch(/待っ/);
    expect(ja).toContain("${n}");
  });

  test("en の rateLimitError が定義され、seconds を含み埋め込み値 ${n} を含む", () => {
    const m = bbsJs.match(/rateLimitError:\s*\(n\)\s*=>\s*`([^`]*)`/g);
    expect(m).not.toBeNull();
    expect(m!.length).toBeGreaterThanOrEqual(2);
    const en = m![1];
    expect(en).toMatch(/seconds/);
    expect(en).toContain("${n}");
  });

  // 観点2: 連投制限の動的パターン（残り秒数 N をキャプチャ）のマッチ処理が translateBBSError 内にある
  test("translateBBSError に 'Please wait (\\d+) seconds' の動的マッチが存在する", () => {
    expect(bbsJs).toMatch(
      /match\(\s*\/\^Please wait \(\\d\+\) seconds before posting again\$\/\s*\)/
    );
  });

  test("rateLimitMatch のキャプチャ群を rateLimitError へ渡している", () => {
    // rateLimitMatch[1]（N のキャプチャ）を翻訳関数へ渡す経路があること
    expect(bbsJs).toMatch(/rateLimitError\(\s*rateLimitMatch\[1\]\s*\)/);
  });

  // 観点3: 未知エラーは原文へフォールバックする（translateBBSError の末尾が return message）
  test("translateBBSError は未知メッセージを原文フォールバックする（最後に return message）", () => {
    const fn = bbsJs.match(/function translateBBSError\([^)]*\)\s*\{([\s\S]*?)\n\}/);
    expect(fn).not.toBeNull();
    const body = fn![1];
    // 関数本体の最後の return が `return message;` であること
    const returns = body.match(/return\s+[^;]+;/g);
    expect(returns).not.toBeNull();
    expect(returns![returns!.length - 1]).toMatch(/return\s+message;/);
  });
});

describe("bbs.js 翻訳: 対訳キーの ja/en 両言語網羅", () => {
  // 観点4: 追加された messageId 系などの対訳キーが ja / en 両方に存在する（片言語だけの追加漏れ検出）
  const requiredErrorKeys = [
    "messageId and message are required",
    "messageId is required",
    "id or (url + token) is required",
  ];

  test.each(requiredErrorKeys)("エラーキー '%s' が ja / en 両方に存在する", (key) => {
    // キー文字列の出現回数が 2 以上（ja errors と en errors の両方）
    const occurrences = bbsJs.split(`"${key}"`).length - 1;
    expect(occurrences).toBeGreaterThanOrEqual(2);
  });
});

// ---------------------------------------------------------------------------
// bbs.js: 成功色 / 自動消去タイマー / wasEdit
// ---------------------------------------------------------------------------
describe("bbs.js 成功表示の見た目", () => {
  // 観点5: .message-area.success に明るい緑(#ccffcc)背景 + 濃い緑系の border/color が定義されている
  test(".message-area.success が緑背景 #ccffcc と緑系 border/color を持つ", () => {
    const rule = bbsJs.match(/\.message-area\.success\s*\{([\s\S]*?)\}/);
    expect(rule).not.toBeNull();
    const body = rule![1];
    expect(body).toMatch(/background:\s*#ccffcc/i);
    expect(body).toMatch(/border:\s*[^;]*#2e7d32/i);
    expect(body).toMatch(/color:\s*#1b5e20/i);
  });

  // 観点5-b: .message-area が white-space: pre-line を持つ（案内文の \n を文単位改行として反映）
  test(".message-area が white-space: pre-line を持つ（文単位改行を反映）", () => {
    const rule = bbsJs.match(/\.message-area\s*\{([\s\S]*?)\}/);
    expect(rule).not.toBeNull();
    const body = rule![1];
    expect(body).toMatch(/white-space:\s*pre-line/i);
  });
});

describe("bbs.js メッセージ自動消去タイマー", () => {
  // 観点6: showMessage は前タイマーを clearTimeout し、7000ms で消す（3000 への退行検出）
  test("showMessage が clearTimeout(this._messageTimer) を行う", () => {
    expect(bbsJs).toMatch(/clearTimeout\(\s*this\._messageTimer\s*\)/);
  });

  test("自動消去の setTimeout が 7000ms（3000 退行でない）", () => {
    // showMessage 内の setTimeout の遅延が 7000
    expect(bbsJs).toMatch(/this\._messageTimer\s*=\s*setTimeout\([\s\S]*?\}\s*,\s*7000\s*\)/);
    // 旧仕様の 3000ms 自動消去が残っていないこと
    expect(bbsJs).not.toMatch(
      /setTimeout\([\s\S]{0,80}?display\s*=\s*"none"[\s\S]{0,40}?,\s*3000\s*\)/
    );
  });
});

describe("bbs.js wasEdit の退避タイミング", () => {
  // 観点7: const wasEdit = this.editMode が clearEditMode() 呼び出しより前に現れる
  test("wasEdit の退避が clearEditMode() より前にある", () => {
    const wasEditIdx = bbsJs.indexOf("const wasEdit = this.editMode");
    const clearIdx = bbsJs.indexOf("this.clearEditMode()");
    expect(wasEditIdx).toBeGreaterThan(-1);
    expect(clearIdx).toBeGreaterThan(-1);
    expect(wasEditIdx).toBeLessThan(clearIdx);
  });

  test("投稿成功の分岐は editMode ではなく退避した wasEdit を参照する", () => {
    // 成功メッセージ分岐が wasEdit を使う（this.editMode 直接参照への退行を防ぐ）
    expect(bbsJs).toMatch(/if\s*\(\s*wasEdit\s*\)/);
  });
});

// ---------------------------------------------------------------------------
// bbs.js: CustomEvent 発火
// ---------------------------------------------------------------------------
describe("bbs.js nostalgic-bbs-posted イベント発火", () => {
  // 観点8: CustomEvent が bubbles:true / composed:true で発火される
  test("dispatchBBSEvent が CustomEvent を bubbles:true / composed:true で発火する", () => {
    const fn = bbsJs.match(/dispatchBBSEvent\([^)]*\)\s*\{([\s\S]*?)\n {2}\}/);
    expect(fn).not.toBeNull();
    const body = fn![1];
    expect(body).toMatch(/new CustomEvent\(/);
    expect(body).toMatch(/bubbles:\s*true/);
    expect(body).toMatch(/composed:\s*true/);
  });

  test("nostalgic-bbs-posted が dispatch されている", () => {
    expect(bbsJs).toMatch(/dispatchBBSEvent\(\s*["']nostalgic-bbs-posted["']/);
  });

  test("detail に id と action が含まれ、action は post/update/remove の3種が登場する", () => {
    // detail に id を含む発火がある
    expect(bbsJs).toMatch(
      /dispatchBBSEvent\(\s*["']nostalgic-bbs-posted["']\s*,\s*\{[\s\S]*?\bid\b/
    );
    // action の3値が出現（投稿=post, 編集=update, 削除=remove）
    expect(bbsJs).toMatch(/action:\s*wasEdit\s*\?\s*["']update["']\s*:\s*["']post["']/);
    expect(bbsJs).toMatch(/action:\s*["']remove["']/);
  });
});

// ---------------------------------------------------------------------------
// bbs.js <-> BBS.tsx の配線（イベント名のタイポ相互照合）
// ---------------------------------------------------------------------------
describe("配線: イベント名の相互一致", () => {
  // 観点9: bbs.js の dispatch 名と BBS.tsx の addEventListener 名が完全一致する
  test("dispatch 名 と addEventListener 名がソース双方から抽出して一致する", () => {
    // bbs.js 側: dispatchBBSEvent("...") の第1引数
    const dispatched = bbsJs.match(/dispatchBBSEvent\(\s*["']([^"']+)["']/);
    expect(dispatched).not.toBeNull();
    const dispatchName = dispatched![1];

    // BBS.tsx 側: addEventListener("...") の第1引数（remove 側ではなく add）
    const listened = bbsTsx.match(/addEventListener\(\s*["']([^"']+)["']/);
    expect(listened).not.toBeNull();
    const listenName = listened![1];

    // ハードコード二重化ではなく、両ファイルから抽出した名前同士を照合する
    expect(listenName).toBe(dispatchName);
  });

  test("BBS.tsx の addEventListener と removeEventListener が同名（クリーンアップ漏れ防止）", () => {
    const add = bbsTsx.match(/addEventListener\(\s*["']([^"']+)["']/);
    const remove = bbsTsx.match(/removeEventListener\(\s*["']([^"']+)["']/);
    expect(add).not.toBeNull();
    expect(remove).not.toBeNull();
    expect(remove![1]).toBe(add![1]);
  });
});

// ---------------------------------------------------------------------------
// BBS.tsx: リロード誘導の購読
// ---------------------------------------------------------------------------
describe("BBS.tsx リロード誘導", () => {
  // 観点10: ja / en のリロード誘導文言が定義されている（文単位で行分割した配列）
  test("リロード誘導 posted 文言が ja / en 両方に定義されている", () => {
    // embedTexts.ja.posted（日本語: 再読み込み誘導）— 文単位で配列化されていても拾える
    expect(bbsTsx).toMatch(/posted:\s*\[[^\]]*再読み込み[^\]]*\]/);
    // embedTexts.en.posted（英語: reload 誘導）
    expect(bbsTsx).toMatch(/posted:\s*\[[^\]]*reload[^\]]*\]/i);
  });

  // 観点10-b: posted は文単位で行分割した配列で、行ごとに描画される（途中折返し回避）
  test("posted が配列（文単位で行分割）で定義されている", () => {
    // ja / en それぞれ posted が配列リテラルで、2要素（2文）に分かれている
    const arrays = bbsTsx.match(/posted:\s*\[([\s\S]*?)\]/g);
    expect(arrays).not.toBeNull();
    expect(arrays!.length).toBeGreaterThanOrEqual(2);
    for (const arr of arrays!) {
      // 各配列に文字列が2つ以上（"…", "…"）含まれる
      const items = arr.match(/"[^"]*"/g);
      expect(items).not.toBeNull();
      expect(items!.length).toBeGreaterThanOrEqual(2);
    }
  });

  test("posted を行ごとに描画している（map で <br /> を挟む）", () => {
    expect(bbsTsx).toMatch(/t\.posted\.map\(/);
    expect(bbsTsx).toMatch(/<br\s*\/>/);
  });

  test("embedPosted は useState(false) で初期非表示", () => {
    expect(bbsTsx).toMatch(
      /const\s*\[\s*embedPosted\s*,\s*setEmbedPosted\s*\]\s*=\s*useState\(\s*false\s*\)/
    );
  });

  test("embedId が無ければリスナー登録せず早期 return する", () => {
    // useEffect 内の最初に if (!embedId) return; がある
    const effect = bbsTsx.match(/useEffect\(\s*\(\)\s*=>\s*\{([\s\S]*?)\},\s*\[embedId\]\s*\)/);
    expect(effect).not.toBeNull();
    const body = effect![1];
    const guardIdx = body.indexOf("if (!embedId) return");
    const addIdx = body.indexOf("addEventListener");
    expect(guardIdx).toBeGreaterThan(-1);
    expect(addIdx).toBeGreaterThan(-1);
    // 早期 return が addEventListener より前にある
    expect(guardIdx).toBeLessThan(addIdx);
  });

  test("リロード誘導は embedPosted が真のときだけ描画される", () => {
    expect(bbsTsx).toMatch(/\{embedPosted\s*&&/);
  });
});
