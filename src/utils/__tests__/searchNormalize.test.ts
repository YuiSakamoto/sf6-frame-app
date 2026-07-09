import { describe, expect, it } from "vitest";
import { normalizeQuery, parseNumpadNotation } from "../searchNormalize";
import { expandAliases } from "../moveAliases";

describe("normalizeQuery", () => {
  it("カタカナをひらがなに変換する", () => {
    expect(normalizeQuery("タツマキ")).toBe("たつまき");
  });
  it("全角英数を半角小文字にする", () => {
    expect(normalizeQuery("ＯＤ波動")).toBe("od波動");
  });
  it("前後空白を除去する", () => {
    expect(normalizeQuery("  dp ")).toBe("dp");
  });
});

describe("parseNumpadNotation", () => {
  it("5MP → 立ち中P の検索語", () => {
    const terms = parseNumpadNotation("5MP");
    expect(terms).toContain("立ち中p");
    expect(terms).toContain("standing medium punch");
  });
  it("2HK → しゃがみ強K の検索語", () => {
    const terms = parseNumpadNotation("2hk");
    expect(terms).toContain("しゃがみ強k");
    expect(terms).toContain("crouching heavy kick");
  });
  it("j.MP / 8MP → ジャンプ中P の検索語(返り値は正規化済み=ひらがな)", () => {
    expect(parseNumpadNotation("j.MP")).toContain("じゃんぷ中p");
    expect(parseNumpadNotation("8MP")).toContain("じゃんぷ中p");
  });
  it("テンキー表記でなければ null", () => {
    expect(parseNumpadNotation("波動")).toBeNull();
    expect(parseNumpadNotation("236P")).toBeNull(); // 必殺技コマンドは対象外
  });
});

describe("expandAliases", () => {
  it("昇竜 → 昇龍(表記ゆれ)を含む", () => {
    expect(expandAliases("昇竜")).toContain("昇龍");
  });
  it("dp → 昇龍 / shoryuken を含む", () => {
    const terms = expandAliases("dp");
    expect(terms).toContain("昇龍");
    expect(terms).toContain("shoryuken");
  });
  it("辞書にない語はそのまま返す", () => {
    expect(expandAliases("波動拳")).toEqual(["波動拳"]);
  });
});
