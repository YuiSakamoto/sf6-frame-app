import { describe, expect, it } from "vitest";
import { contrastRatio } from "../contrast";
import { darkColors, lightColors } from "@/theme/tokens";

describe("contrastRatio", () => {
  it("白と黒のコントラスト比は21", () => {
    expect(contrastRatio("#FFFFFF", "#000000")).toBeCloseTo(21, 0);
  });
  it("同色のコントラスト比は1", () => {
    expect(contrastRatio("#808080", "#808080")).toBeCloseTo(1, 5);
  });
});

// テーマトークンが WCAG 基準を満たすことを機械的に保証する
describe.each([
  ["dark", darkColors],
  ["light", lightColors],
])("%s テーマのコントラスト", (_name, c) => {
  it.each([
    ["textPrimary/bg", c.textPrimary, c.bg, 4.5],
    ["textPrimary/surface", c.textPrimary, c.surface, 4.5],
    ["textPrimary/surfaceRaised", c.textPrimary, c.surfaceRaised, 4.5],
    ["textSecondary/bg", c.textSecondary, c.bg, 4.5],
    ["textSecondary/surface", c.textSecondary, c.surface, 4.5],
    // フレーム数値は太字表示のため WCAG AA (large text) の 3:1 を基準にする
    ["framePositive/surface", c.framePositive, c.surface, 3],
    ["frameNegative/surface", c.frameNegative, c.surface, 3],
    ["accent/surface", c.accent, c.surface, 3],
    // muted はヒント用途。最低限の可読性のみ担保
    ["textMuted/bg", c.textMuted, c.bg, 3],
  ])("%s は %d:1 以上", (_label, fg, bg, min) => {
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(min);
  });
});
