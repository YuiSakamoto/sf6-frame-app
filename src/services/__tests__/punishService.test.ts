import { describe, it, expect } from "vitest";
import { getPunishSummaries, sortPunishes } from "../punishService";
import { createMove, createCharacterData } from "@/__tests__/helpers";
import type { PunishOption } from "@/utils/punishCalc";

describe("sortPunishes", () => {
  const punishes: PunishOption[] = [
    {
      move: createMove({ name: "LP", startup: "4", damage: "300" }),
      startup: 4,
      framesToSpare: 4,
      damageValue: 300,
    },
    {
      move: createMove({ name: "HP", startup: "8", damage: "800" }),
      startup: 8,
      framesToSpare: 0,
      damageValue: 800,
    },
    {
      move: createMove({ name: "MP", startup: "6", damage: "500" }),
      startup: 6,
      framesToSpare: 2,
      damageValue: 500,
    },
  ];

  it("startup モードでは元の順序を維持する", () => {
    const result = sortPunishes(punishes, "startup");

    expect(result[0].move.name).toBe("LP");
    expect(result[1].move.name).toBe("HP");
    expect(result[2].move.name).toBe("MP");
  });

  it("damage モードではダメージ降順でソートする", () => {
    const result = sortPunishes(punishes, "damage");

    expect(result[0].damageValue).toBe(800);
    expect(result[1].damageValue).toBe(500);
    expect(result[2].damageValue).toBe(300);
  });

  it("元の配列を変更しない（イミュータブル）", () => {
    const original = [...punishes];
    sortPunishes(punishes, "damage");

    expect(punishes).toEqual(original);
  });
});

describe("getPunishSummaries", () => {
  const opponent = createCharacterData({
    moves: [
      { nameJa: "確反あり技", onBlock: "-8" },
      { nameJa: "確反なし技", onBlock: "-2" },
      { nameJa: "有利技", onBlock: "+2" },
      { nameJa: "投げ", onBlock: "-", category: "throw" },
    ],
  });
  const me = createCharacterData({
    moves: [{ nameJa: "立ち中P", startup: "6", damage: "600" }],
  });

  it("onBlock がパース可能な全技のサマリを返す(投げ等パース不能は除外)", () => {
    const summaries = getPunishSummaries(opponent, me);
    expect(summaries.map((s) => s.move.nameJa)).toEqual([
      "確反あり技",
      "確反なし技",
      "有利技",
    ]);
  });

  it("発生 <= |onBlock| の技があれば punishable", () => {
    const summaries = getPunishSummaries(opponent, me);
    expect(summaries[0].punishable).toBe(true);
    expect(summaries[0].punishes[0].move.nameJa).toBe("立ち中P");
    expect(summaries[0].punishes[0].framesToSpare).toBe(2);
    expect(summaries[1].punishable).toBe(false);
    expect(summaries[2].punishable).toBe(false);
  });
});
