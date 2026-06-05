/**
 * 相対 /api/... 再混入ガード (Issue #17)
 *
 * apps/web/src 配下のソースに、相対パスの API 呼び出しリテラル
 * （`"/api/visit` や `` `/api/ranking `` 等）が再混入していないことを
 * fs で機械的に検査する。vite proxy 撤去後に相対 /api を書くと本番で 404 になる。
 */

import { describe, test, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const SRC_DIR = resolve(__dirname, "..");

// 検査対象から除外するファイル名（テスト自身・型宣言）
const EXCLUDE_FILES = new Set(["noRelativeApiUrl.test.ts", "usageApiUrl.test.ts", "vite-env.d.ts"]);

// 再混入を禁じる相対リテラルのパターン。
// クォート/バッククォート直後に /api/{service} が来る形を検出する。
const FORBIDDEN_PATTERNS = [
  /["'`]\/api\/visit/,
  /["'`]\/api\/like/,
  /["'`]\/api\/bbs/,
  /["'`]\/api\/ranking/,
  /["'`]\/api\/yokoso/,
  // service 名を問わない一般形（クォート直後の相対 /api/）も禁止
  /["'`]\/api\//,
];

function collectSourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...collectSourceFiles(full));
    } else if (/\.(ts|tsx)$/.test(entry) && !EXCLUDE_FILES.has(entry)) {
      out.push(full);
    }
  }
  return out;
}

describe("再混入ガード: 相対 /api リテラル", () => {
  const files = collectSourceFiles(SRC_DIR);

  // 走査が空振りしていないことの保証（除外漏れ・パス誤りの早期検出）
  test("apps/web/src 配下に検査対象の .ts/.tsx ファイルが存在する", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  // 観点5: いずれのソースにも相対 /api/ リテラルが無い
  test.each(FORBIDDEN_PATTERNS.map((p) => [p.source, p] as const))(
    "ソースに相対リテラル %s が含まれない",
    (_label, pattern) => {
      const offenders = files.filter((f) => pattern.test(readFileSync(f, "utf8")));
      expect(offenders).toEqual([]);
    }
  );
});
