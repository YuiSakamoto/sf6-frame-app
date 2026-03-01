import { describe, it, expect } from "vitest";
import { searchMoves } from "../search";
import { createMove } from "@/__tests__/helpers";

describe("searchMoves", () => {
  const moves = [
    createMove({ name: "Standing LP", nameJa: "立ち弱P", input: "LP" }),
    createMove({ name: "Crouching MK", nameJa: "しゃがみ中K", input: "2MK" }),
    createMove({ name: "Hadoken", nameJa: "波動拳", input: "236P" }),
    createMove({ name: "Shoryuken", nameJa: "昇竜拳", input: "623P" }),
  ];

  it("英語名で検索できる", () => {
    const result = searchMoves(moves, "hadoken");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Hadoken");
  });

  it("大文字小文字を区別しない（英語）", () => {
    const result = searchMoves(moves, "HADOKEN");
    expect(result).toHaveLength(1);
  });

  it("日本語名で検索できる", () => {
    const result = searchMoves(moves, "波動拳");
    expect(result).toHaveLength(1);
    expect(result[0].nameJa).toBe("波動拳");
  });

  it("コマンド入力で検索できる", () => {
    const result = searchMoves(moves, "236");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Hadoken");
  });

  it("空文字列は全技を返す", () => {
    const result = searchMoves(moves, "");
    expect(result).toHaveLength(moves.length);
  });

  it("空白のみは全技を返す", () => {
    const result = searchMoves(moves, "   ");
    expect(result).toHaveLength(moves.length);
  });

  it("マッチしない場合は空配列を返す", () => {
    const result = searchMoves(moves, "zzzzz");
    expect(result).toHaveLength(0);
  });

  it("部分一致で検索できる", () => {
    const result = searchMoves(moves, "standing");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Standing LP");
  });
});
