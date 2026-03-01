import { describe, it, expect } from "vitest";
import { getPunishableMoves, sortPunishes } from "../punishService";
import { createMove, createCharacterData } from "@/__tests__/helpers";
import type { PunishOption } from "@/utils/punishCalc";

describe("getPunishableMoves", () => {
  it("負の onBlock を持つ技のみを返す", () => {
    const data = createCharacterData({
      moves: [
        { name: "LP", onBlock: "+2" },
        { name: "HP", onBlock: "-8" },
        { name: "Hadoken", onBlock: "-6" },
        { name: "MP", onBlock: "0" },
      ],
    });

    const result = getPunishableMoves(data);

    expect(result).toHaveLength(2);
    expect(result.map((m) => m.name)).toEqual(
      expect.arrayContaining(["HP", "Hadoken"]),
    );
  });

  it("全技が有利フレームの場合は空配列を返す", () => {
    const data = createCharacterData({
      moves: [
        { name: "LP", onBlock: "+2" },
        { name: "MP", onBlock: "+1" },
      ],
    });

    const result = getPunishableMoves(data);

    expect(result).toHaveLength(0);
  });

  it("パース不能な onBlock は除外される", () => {
    const data = createCharacterData({
      moves: [
        { name: "LP", onBlock: "-" },
        { name: "HP", onBlock: "-8" },
      ],
    });

    const result = getPunishableMoves(data);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("HP");
  });
});

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
