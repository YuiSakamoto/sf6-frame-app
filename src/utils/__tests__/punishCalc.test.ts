import { describe, it, expect } from "vitest";
import { findPunishes, parseDamage, isDerivedMove } from "../punishCalc";
import { createMove } from "@/__tests__/helpers";

describe("parseDamage", () => {
  it("単純な数値をパースする", () => {
    expect(parseDamage("800")).toBe(800);
  });

  it("マルチヒット表記をパースする (500x2)", () => {
    expect(parseDamage("500x2")).toBe(1000);
  });

  it("大文字 X でもパースできる (500X3)", () => {
    expect(parseDamage("500X3")).toBe(1500);
  });

  it("加算表記をパースする (300+200)", () => {
    expect(parseDamage("300+200")).toBe(500);
  });

  it("空文字列は 0 を返す", () => {
    expect(parseDamage("")).toBe(0);
  });

  it("ハイフンは 0 を返す", () => {
    expect(parseDamage("-")).toBe(0);
  });

  it("前後の空白を無視する", () => {
    expect(parseDamage("  800  ")).toBe(800);
  });
});

describe("isDerivedMove", () => {
  it("(2) を含む技名は派生技", () => {
    expect(isDerivedMove("Tatsumaki Senpukyaku (2)")).toBe(true);
  });

  it("(3) を含む技名は派生技", () => {
    expect(isDerivedMove("Some Move (3)")).toBe(true);
  });

  it("(1) は初段なので派生技ではない", () => {
    expect(isDerivedMove("Some Move (1)")).toBe(false);
  });

  it("日本語の（2段目）は派生技", () => {
    expect(isDerivedMove("竜巻旋風脚（2段目）")).toBe(true);
  });

  it("日本語の（1段目）は派生技ではない", () => {
    expect(isDerivedMove("竜巻旋風脚（1段目）")).toBe(false);
  });

  it("2nd hit パターンは派生技", () => {
    expect(isDerivedMove("Move (2nd hit)")).toBe(true);
  });

  it("通常の技名は派生技ではない", () => {
    expect(isDerivedMove("Hadoken")).toBe(false);
  });
});

describe("findPunishes", () => {
  it("確反可能な技を返す", () => {
    const moves = [
      createMove({ name: "LP", startup: "4", damage: "300", category: "normal" }),
      createMove({ name: "MP", startup: "6", damage: "500", category: "normal" }),
      createMove({ name: "HP", startup: "8", damage: "800", category: "normal" }),
    ];

    const result = findPunishes("-6", moves);

    expect(result).toHaveLength(2);
    expect(result[0].move.name).toBe("LP");
    expect(result[1].move.name).toBe("MP");
  });

  it("startup 昇順、同 startup ならダメージ降順でソートされる", () => {
    const moves = [
      createMove({ name: "Move A", startup: "4", damage: "300", category: "normal" }),
      createMove({ name: "Move B", startup: "4", damage: "500", category: "normal" }),
    ];

    const result = findPunishes("-6", moves);

    expect(result[0].move.name).toBe("Move B");
    expect(result[1].move.name).toBe("Move A");
  });

  it("正のガードフレームでは確反なし", () => {
    const moves = [
      createMove({ name: "LP", startup: "4", category: "normal" }),
    ];

    const result = findPunishes("+2", moves);

    expect(result).toHaveLength(0);
  });

  it("パース不能な onBlock では確反なし", () => {
    const moves = [
      createMove({ name: "LP", startup: "4", category: "normal" }),
    ];

    const result = findPunishes("-", moves);

    expect(result).toHaveLength(0);
  });

  it("投げカテゴリは除外される", () => {
    const moves = [
      createMove({ name: "Throw", startup: "5", category: "throw" }),
    ];

    const result = findPunishes("-8", moves);

    expect(result).toHaveLength(0);
  });

  it("common カテゴリは除外される（ドライブインパクト以外）", () => {
    const moves = [
      createMove({ name: "Some Common Move", nameJa: "共通技", startup: "4", category: "common" }),
    ];

    const result = findPunishes("-8", moves);

    expect(result).toHaveLength(0);
  });

  it("ドライブインパクトは common でも含まれる", () => {
    const moves = [
      createMove({ name: "Drive Impact", nameJa: "ドライブインパクト", startup: "26", category: "common" }),
    ];

    const result = findPunishes("-30", moves);

    expect(result).toHaveLength(1);
  });

  it("ジャンプ攻撃は除外される", () => {
    const moves = [
      createMove({ name: "Jumping HP", nameJa: "ジャンプ強P", startup: "4", category: "normal" }),
    ];

    const result = findPunishes("-8", moves);

    expect(result).toHaveLength(0);
  });

  it("派生技は除外される", () => {
    const moves = [
      createMove({ name: "Move (2)", startup: "4", category: "special" }),
    ];

    const result = findPunishes("-8", moves);

    expect(result).toHaveLength(0);
  });

  it("framesToSpare が正しく計算される", () => {
    const moves = [
      createMove({ name: "LP", startup: "4", damage: "300", category: "normal" }),
    ];

    const result = findPunishes("-8", moves);

    expect(result[0].framesToSpare).toBe(4); // |8| - 4 = 4
  });
});
