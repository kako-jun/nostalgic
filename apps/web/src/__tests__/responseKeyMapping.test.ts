/**
 * responseKey の一意性・相違・配線整合の回帰テスト (Issue #18)
 *
 * usage ページは step ごとに固有の responseKey を持ち、操作したフォームの
 * 直下にだけレスポンスを表示する。複数の step が同じ responseKey を共有していると、
 * 別フォームを操作した結果が無関係な step の下に表示される（#18 のバグ）。
 *
 * ここでは
 *   1. 各サービスの steps 内で responseKey / id が一意であること
 *   2. confirmId / updateAuthor / removeAuthor が create / 管理者操作と別キーであること
 *   3. 各 step の handlerKey / responseKey が、対応するページの
 *      handlers / responses マッピングに実在すること（source-scan）
 * を機械的に検査する。
 */

import { describe, test, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { StepConfig } from "../config/commonSteps";
import { counterSteps } from "../config/services/counterSteps";
import { likeSteps } from "../config/services/likeSteps";
import { rankingSteps } from "../config/services/rankingSteps";
import { bbsSteps } from "../config/services/bbsSteps";
import { yokosoSteps } from "../config/services/yokosoSteps";

const PAGES_DIR = resolve(__dirname, "..", "pages");

// 各サービスの steps 配列と、配線先のページソースファイル
const SERVICES: { name: string; steps: StepConfig[]; pageFile: string }[] = [
  { name: "counter", steps: counterSteps, pageFile: "Counter.tsx" },
  { name: "like", steps: likeSteps, pageFile: "Like.tsx" },
  { name: "ranking", steps: rankingSteps, pageFile: "Ranking.tsx" },
  { name: "bbs", steps: bbsSteps, pageFile: "BBS.tsx" },
  { name: "yokoso", steps: yokosoSteps, pageFile: "Yokoso.tsx" },
];

/**
 * ページソースから `const NAME = { ... }` のオブジェクトリテラル直下の
 * shorthand プロパティ名を抽出する。
 * handlers / responses は shorthand（`handleCreate,` / `createResponse,`）で
 * 書かれているため、`identifier,` または `identifier:` の形を拾えば十分。
 */
function extractObjectKeys(source: string, varName: string): Set<string> {
  const start = source.indexOf(`const ${varName} = {`);
  if (start < 0) {
    throw new Error(`'const ${varName} = {' がページソースに見つからない`);
  }
  const open = source.indexOf("{", start);
  // 最初の閉じ括弧 } までをブロックとみなす（handlers/responses はネストしない）
  const close = source.indexOf("}", open);
  const block = source.slice(open + 1, close);
  const keys = new Set<string>();
  for (const line of block.split("\n")) {
    const m = line.trim().match(/^([A-Za-z_$][\w$]*)\s*[,:]/);
    if (m) keys.add(m[1]);
  }
  return keys;
}

describe.each(SERVICES)("一意性: $name の steps", ({ steps }) => {
  // 観点1: responseKey がサービス内で一意（#18 再発防止の本丸）
  test("responseKey がサービス内で重複しない", () => {
    const keys = steps.map((s) => s.responseKey);
    expect(new Set(keys).size).toBe(keys.length);
  });

  // 観点2: id もサービス内で一意（保険）
  test("id がサービス内で重複しない", () => {
    const ids = steps.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("相違: counter / like の confirmId step", () => {
  for (const { name, steps } of [
    { name: "counter", steps: counterSteps },
    { name: "like", steps: likeSteps },
  ]) {
    const confirmId = steps.find((s) => s.id === "confirmId");
    const create = steps.find((s) => s.id === "create");

    // 観点3: confirmId step が存在する
    test(`${name}: confirmId step が存在する`, () => {
      expect(confirmId).toBeDefined();
      expect(create).toBeDefined();
    });

    // 観点3: confirmId の responseKey が専用キーで、create と異なる
    test(`${name}: confirmId.responseKey は confirmIdResponse で create と異なる`, () => {
      expect(confirmId!.responseKey).toBe("confirmIdResponse");
      expect(confirmId!.responseKey).not.toBe(create!.responseKey);
    });

    // 観点3: confirmId の handlerKey が専用ハンドラで、create と異なる
    test(`${name}: confirmId.handlerKey は handleConfirmId で create と異なる`, () => {
      expect(confirmId!.handlerKey).toBe("handleConfirmId");
      expect(confirmId!.handlerKey).not.toBe(create!.handlerKey);
    });
  }
});

describe("相違: bbs の author 操作 vs admin 操作", () => {
  const get = (id: string) => {
    const step = bbsSteps.find((s) => s.id === id);
    expect(step, `bbs step '${id}' が存在する`).toBeDefined();
    return step!;
  };

  // 観点4: updateAuthor と updateSettings(管理者) の responseKey が異なる
  test("updateAuthor の responseKey は admin 系 update と異なる", () => {
    const updateAuthor = get("updateAuthor");
    const updateAdmin = get("updateSettings");
    expect(updateAuthor.responseKey).toBe("updateAuthorResponse");
    expect(updateAuthor.responseKey).not.toBe(updateAdmin.responseKey);
  });

  // 観点4: removeAuthor と delete(管理者) の responseKey が異なる
  test("removeAuthor の responseKey は admin 系 remove/delete と異なる", () => {
    const removeAuthor = get("removeAuthor");
    const removeAdmin = get("delete");
    expect(removeAuthor.responseKey).toBe("removeAuthorResponse");
    expect(removeAuthor.responseKey).not.toBe(removeAdmin.responseKey);
  });
});

describe.each(SERVICES)("配線整合: $name の steps とページ", ({ steps, pageFile }) => {
  const source = readFileSync(resolve(PAGES_DIR, pageFile), "utf8");
  const handlerKeys = extractObjectKeys(source, "handlers");
  const responseKeys = extractObjectKeys(source, "responses");

  // 走査が空振りしていないことの保証
  test("ページの handlers / responses からキーを抽出できる", () => {
    expect(handlerKeys.size).toBeGreaterThan(0);
    expect(responseKeys.size).toBeGreaterThan(0);
  });

  // 観点5: 各 step の handlerKey がページの handlers に実在する
  test.each(steps.map((s) => [s.id, s.handlerKey] as const))(
    "step '%s' の handlerKey '%s' がページの handlers に存在する",
    (_id, handlerKey) => {
      expect(handlerKeys.has(handlerKey)).toBe(true);
    }
  );

  // 観点5: 各 step の responseKey がページの responses に実在する
  test.each(steps.map((s) => [s.id, s.responseKey] as const))(
    "step '%s' の responseKey '%s' がページの responses に存在する",
    (_id, responseKey) => {
      expect(responseKeys.has(responseKey)).toBe(true);
    }
  );
});
