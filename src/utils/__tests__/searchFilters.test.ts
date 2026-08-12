import { describe, expect, it } from "vitest";
import { createMove } from "@/__tests__/helpers";
import { applyFilters, DEFAULT_FILTERS } from "../searchFilters";

describe("applyFilters", () => {
  const moves = [
    createMove({
      nameJa: "速い技",
      startup: "4",
      onBlock: "-2",
      category: "normal",
    }),
    createMove({
      nameJa: "遅い技",
      startup: "12",
      onBlock: "-8",
      category: "special",
    }),
    createMove({
      nameJa: "投げ",
      startup: "5",
      onBlock: "-",
      category: "throw",
    }),
  ];

  it("デフォルトは全件返す", () => {
    expect(applyFilters(moves, DEFAULT_FILTERS)).toHaveLength(3);
  });

  it("maxStartup: 発生N以下のみ", () => {
    const result = applyFilters(moves, { ...DEFAULT_FILTERS, maxStartup: 5 });
    expect(result.map((m) => m.nameJa)).toEqual(["速い技", "投げ"]);
  });

  it("maxOnBlock: ガード時 -N 以下のみ(パース不能は除外)", () => {
    const result = applyFilters(moves, { ...DEFAULT_FILTERS, maxOnBlock: -6 });
    expect(result.map((m) => m.nameJa)).toEqual(["遅い技"]);
  });

  it("category 絞り込み", () => {
    const result = applyFilters(moves, {
      ...DEFAULT_FILTERS,
      category: "special",
    });
    expect(result.map((m) => m.nameJa)).toEqual(["遅い技"]);
  });
});
