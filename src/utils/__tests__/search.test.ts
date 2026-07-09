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

describe("searchMoves(強化版)", () => {
  const moves = [
    createMove({ name: "Standing Medium Punch", nameJa: "立ち中P（鉤突き）" }),
    createMove({ name: "L Shoryuken", nameJa: "弱 昇龍拳" }),
    createMove({ name: "M Hadoken", nameJa: "中 波動拳" }),
  ];
  it("テンキー表記 5MP で立ち中Pがヒットする", () => {
    expect(searchMoves(moves, "5MP").map((m) => m.nameJa)).toEqual([
      "立ち中P（鉤突き）",
    ]);
  });
  it("通称 dp で昇龍拳がヒットする", () => {
    expect(searchMoves(moves, "dp").map((m) => m.nameJa)).toEqual([
      "弱 昇龍拳",
    ]);
  });
  it("表記ゆれ 昇竜 で昇龍拳がヒットする", () => {
    expect(searchMoves(moves, "昇竜").map((m) => m.nameJa)).toEqual([
      "弱 昇龍拳",
    ]);
  });
  it("カタカナ ハドウ ではヒットしないが 波動 でヒットする", () => {
    expect(searchMoves(moves, "波動")).toHaveLength(1);
  });
  it("既存の技名部分一致は引き続き動く", () => {
    expect(searchMoves(moves, "中P")).toHaveLength(1);
  });
});
