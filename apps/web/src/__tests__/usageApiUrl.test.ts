/**
 * usage ページの API URL 構築の回帰テスト (Issue #17)
 *
 * usage の各 *Steps の buildApiUrl / buildApiUrlDisplay が
 * API_BASE 起点のフル URL を生成し、相対 `/api/...` を一切含まないことを守る。
 * vite proxy 撤去後も usage の URL が壊れていないことを保証する。
 */

import { describe, test, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { API_BASE, type StepConfig } from "../config/commonSteps";
import { counterSteps } from "../config/services/counterSteps";
import { likeSteps } from "../config/services/likeSteps";
import { rankingSteps } from "../config/services/rankingSteps";
import { bbsSteps } from "../config/services/bbsSteps";
import { yokosoSteps } from "../config/services/yokosoSteps";

// 各サービスの steps 配列と、対応するエンドポイント名（API_BASE 直下のパス）
const SERVICES: { name: string; endpoint: string; steps: StepConfig[] }[] = [
  { name: "counter", endpoint: "/visit", steps: counterSteps },
  { name: "like", endpoint: "/like", steps: likeSteps },
  { name: "ranking", endpoint: "/ranking", steps: rankingSteps },
  { name: "bbs", endpoint: "/bbs", steps: bbsSteps },
  { name: "yokoso", endpoint: "/yokoso", steps: yokosoSteps },
];

// プレースホルダ用のダミー入力（必須/任意の両方を埋めて action 抽出を安定させる）
const FILLED_VALUES: Record<string, string> = {
  url: "https://example.com",
  token: "mytoken123",
  publicId: "example-com-abc123",
  format: "json",
  setValue: "100",
  webhookUrl: "https://hooks.slack.com/services/x",
  // ranking submit/update
  submitName: "player",
  submitScore: "1000",
  submitDisplayScore: "1,000pt",
  updateName: "player",
  updateScore: "2000",
  updateDisplayScore: "2,000pt",
  removeName: "player",
};

// buildApiUrlDisplay の ReactNode をテキスト化する
function displayToText(step: StepConfig, values: Record<string, string>): string {
  const node = step.buildApiUrlDisplay(values);
  return renderToStaticMarkup(createElement("div", null, node)).replace(/<[^>]+>/g, "");
}

describe("環境分岐: API_BASE", () => {
  // 観点6: API_BASE が末尾 /api を持たない絶対 URL であること
  test("API_BASE は絶対 URL で末尾に /api を持たない", () => {
    expect(API_BASE).toMatch(/^https?:\/\//);
    expect(API_BASE.endsWith("/api")).toBe(false);
    expect(API_BASE).not.toContain("/api");
  });

  // 観点6: vitest 実行時は DEV=true なので localhost:8787 になる
  test("DEV 環境（vitest 実行時）では localhost:8787 を指す", () => {
    expect(API_BASE).toBe("http://localhost:8787");
  });
});

describe.each(SERVICES)("正常系/不変条件: $name の buildApiUrl", ({ endpoint, steps }) => {
  // 観点1: 全 step の buildApiUrl が `${API_BASE}${endpoint}?` で始まる
  test.each(steps.map((s) => [s.id, s] as const))(
    "step '%s' は API_BASE+エンドポイント起点のフル URL を返す",
    (_id, step) => {
      const url = step.buildApiUrl(FILLED_VALUES);
      expect(url.startsWith(`${API_BASE}${endpoint}?`)).toBe(true);
    }
  );

  // 観点1: 全 step の buildApiUrl に action= が含まれる
  test.each(steps.map((s) => [s.id, s] as const))(
    "step '%s' は action クエリを含む",
    (_id, step) => {
      const url = step.buildApiUrl(FILLED_VALUES);
      expect(url).toMatch(/[?&]action=[a-z]+/);
    }
  );

  // 観点1: buildApiUrl は相対 /api/ を一切含まない
  test.each(steps.map((s) => [s.id, s] as const))(
    "step '%s' の URL は /api/ を含まない",
    (_id, step) => {
      const url = step.buildApiUrl(FILLED_VALUES);
      expect(url).not.toContain("/api/");
      expect(url).not.toContain("/api?");
    }
  );
});

describe.each(SERVICES)(
  "表示と fetch の一致: $name の buildApiUrlDisplay",
  ({ endpoint, steps }) => {
    // 観点2: 表示テキストが API_BASE+エンドポイント起点で始まる
    test.each(steps.map((s) => [s.id, s] as const))(
      "step '%s' の表示は API_BASE+エンドポイントで始まる",
      (_id, step) => {
        const text = displayToText(step, FILLED_VALUES);
        expect(text.startsWith(`${API_BASE}${endpoint}?`)).toBe(true);
      }
    );

    // 観点2: 表示テキストが /api/ を含まない
    test.each(steps.map((s) => [s.id, s] as const))(
      "step '%s' の表示は /api/ を含まない",
      (_id, step) => {
        const text = displayToText(step, FILLED_VALUES);
        expect(text).not.toContain("/api/");
        expect(text).not.toContain("/api?");
      }
    );

    // 観点2: 表示の action と buildApiUrl の action が一致する
    test.each(steps.map((s) => [s.id, s] as const))(
      "step '%s' の表示 action と fetch URL の action が一致する",
      (_id, step) => {
        const urlAction = step.buildApiUrl(FILLED_VALUES).match(/[?&]action=([a-z]+)/)?.[1];
        const textAction = displayToText(step, FILLED_VALUES).match(/[?&]action=([a-z]+)/)?.[1];
        expect(textAction).toBe(urlAction);
      }
    );
  }
);

describe("null/空文字/未設定: optional フィールド", () => {
  const counterCreate = counterSteps.find((s) => s.id === "create")!;
  const rankingSubmit = rankingSteps.find((s) => s.id === "submit")!;

  // 観点3: counter create の webhookUrl が未設定なら URL に含まれない
  test("counter create: webhookUrl 未設定なら webhookUrl= は付かない", () => {
    const url = counterCreate.buildApiUrl({ url: "https://a.com", token: "tok" });
    expect(url).not.toContain("webhookUrl=");
  });

  // 観点3: counter create の webhookUrl が設定済みなら encodeURIComponent されて含まれる
  test("counter create: webhookUrl 設定時は encodeURIComponent されて付く", () => {
    const webhookUrl = "https://hooks.example.com/a?b=c";
    const url = counterCreate.buildApiUrl({
      url: "https://a.com",
      token: "tok",
      webhookUrl,
    });
    expect(url).toContain(`webhookUrl=${encodeURIComponent(webhookUrl)}`);
  });

  // 観点3: ranking submit の displayScore が未設定なら URL に含まれない
  test("ranking submit: displayScore 未設定なら displayScore= は付かない", () => {
    const url = rankingSubmit.buildApiUrl({
      publicId: "id",
      submitName: "p",
      submitScore: "1",
    });
    expect(url).not.toContain("displayScore=");
  });

  // 観点3: ranking submit の displayScore が設定済みなら encodeURIComponent されて含まれる
  test("ranking submit: displayScore 設定時は encodeURIComponent されて付く", () => {
    const displayScore = "1,234 点";
    const url = rankingSubmit.buildApiUrl({
      publicId: "id",
      submitName: "p",
      submitScore: "1",
      submitDisplayScore: displayScore,
    });
    expect(url).toContain(`displayScore=${encodeURIComponent(displayScore)}`);
  });
});

describe("再発防止: confirmId は lookup を使い create に戻らない (#23)", () => {
  // confirmId の公開ID確認は軽量 lookup を叩く。誤って create に戻ると
  // 「確認」のつもりでサービスを新規作成してしまうため、action を固定で検証する。
  const counterConfirmId = counterSteps.find((s) => s.id === "confirmId")!;
  const likeConfirmId = likeSteps.find((s) => s.id === "confirmId")!;

  test("counter confirmId: buildApiUrl は action=lookup を含み action=create を含まない", () => {
    const url = counterConfirmId.buildApiUrl({ url: "https://a.com", token: "tok" });
    expect(url).toContain("action=lookup");
    expect(url).not.toContain("action=create");
  });

  test("like confirmId: buildApiUrl は action=lookup を含み action=create を含まない", () => {
    const url = likeConfirmId.buildApiUrl({ url: "https://a.com", token: "tok" });
    expect(url).toContain("action=lookup");
    expect(url).not.toContain("action=create");
  });
});

describe("文字種/エンコード: url 値の percent-encode", () => {
  const counterCreate = counterSteps.find((s) => s.id === "create")!;

  // 観点4: 日本語を含む url が percent-encode される
  test("日本語を含む url は percent-encode される", () => {
    const url = "https://例え.テスト/ページ";
    const built = counterCreate.buildApiUrl({ url, token: "tok" });
    expect(built).toContain(`url=${encodeURIComponent(url)}`);
    expect(built).not.toContain(url); // 生の日本語が残っていないこと
  });

  // 観点4: & や = を含む url が percent-encode され、クエリ構造を壊さない
  test("& や = を含む url は percent-encode されクエリを壊さない", () => {
    const url = "https://example.com/?a=1&b=2";
    const built = counterCreate.buildApiUrl({ url, token: "tok" });
    expect(built).toContain(`url=${encodeURIComponent(url)}`);
    // token パラメータが url 値の生の & で割り込まれていないこと
    expect(built).toContain("&token=tok");
  });
});
