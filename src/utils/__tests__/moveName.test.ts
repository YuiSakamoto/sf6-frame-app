import { describe, it, expect } from "vitest";
import { getMoveName, getComboScaling, getProperties, getNotes } from "../moveName";
import { createMove } from "@/__tests__/helpers";

describe("getMoveName", () => {
  const move = createMove({ name: "Hadoken", nameJa: "波動拳" });

  it("日本語の場合は nameJa を返す", () => {
    expect(getMoveName(move, "ja")).toBe("波動拳");
  });

  it("英語の場合は name を返す", () => {
    expect(getMoveName(move, "en")).toBe("Hadoken");
  });

  it("他の言語コードでも name を返す", () => {
    expect(getMoveName(move, "ko")).toBe("Hadoken");
  });
});

describe("getComboScaling", () => {
  it("日本語の場合は comboScaling を返す", () => {
    const move = createMove({ comboScaling: "初段100%", comboScalingEn: "1st 100%" });
    expect(getComboScaling(move, "ja")).toBe("初段100%");
  });

  it("英語の場合は comboScalingEn を返す", () => {
    const move = createMove({ comboScaling: "初段100%", comboScalingEn: "1st 100%" });
    expect(getComboScaling(move, "en")).toBe("1st 100%");
  });

  it("comboScalingEn がない場合は comboScaling にフォールバック", () => {
    const move = createMove({ comboScaling: "初段100%" });
    expect(getComboScaling(move, "en")).toBe("初段100%");
  });

  it("両方未設定の場合は undefined", () => {
    const move = createMove();
    expect(getComboScaling(move, "ja")).toBeUndefined();
  });
});

describe("getProperties", () => {
  it("日本語の場合は properties を返す", () => {
    const move = createMove({ properties: "中", propertiesEn: "M" });
    expect(getProperties(move, "ja")).toBe("中");
  });

  it("英語の場合は propertiesEn を返す", () => {
    const move = createMove({ properties: "中", propertiesEn: "M" });
    expect(getProperties(move, "en")).toBe("M");
  });

  it("propertiesEn がない場合は properties にフォールバック", () => {
    const move = createMove({ properties: "中" });
    expect(getProperties(move, "en")).toBe("中");
  });
});

describe("getNotes", () => {
  it("日本語の場合は notes を返す", () => {
    const move = createMove({ notes: "飛び道具", notesEn: "Projectile" });
    expect(getNotes(move, "ja")).toBe("飛び道具");
  });

  it("英語の場合は notesEn を返す", () => {
    const move = createMove({ notes: "飛び道具", notesEn: "Projectile" });
    expect(getNotes(move, "en")).toBe("Projectile");
  });

  it("notesEn がない場合は notes にフォールバック", () => {
    const move = createMove({ notes: "飛び道具" });
    expect(getNotes(move, "en")).toBe("飛び道具");
  });
});
