import { describe, it, expect } from "vitest";
import {
  parseFrameValue,
  getFrameColor,
  isPunishable,
} from "../frameAdvantage";
import { colors } from "@/theme/colors";

describe("parseFrameValue", () => {
  it("正の数をパースする", () => {
    expect(parseFrameValue("+2")).toBe(2);
  });

  it("負の数をパースする", () => {
    expect(parseFrameValue("-8")).toBe(-8);
  });

  it("符号なしの数値をパースする", () => {
    expect(parseFrameValue("4")).toBe(4);
  });

  it("レンジ表記は最小値を返す", () => {
    expect(parseFrameValue("8~10")).toBe(8);
  });

  it("負のレンジもパースする", () => {
    expect(parseFrameValue("-3~-1")).toBe(-3);
  });

  it("空文字列は null を返す", () => {
    expect(parseFrameValue("")).toBeNull();
  });

  it("ハイフンのみは null を返す", () => {
    expect(parseFrameValue("-")).toBeNull();
  });

  it("N/A は null を返す", () => {
    expect(parseFrameValue("N/A")).toBeNull();
  });

  it("前後の空白を無視する", () => {
    expect(parseFrameValue("  +3  ")).toBe(3);
  });

  it("パースできない文字列は null を返す", () => {
    expect(parseFrameValue("abc")).toBeNull();
  });
});

describe("getFrameColor", () => {
  it("正の値は framePositive 色を返す", () => {
    expect(getFrameColor("+2")).toBe(colors.framePositive);
  });

  it("負の値は frameNegative 色を返す", () => {
    expect(getFrameColor("-8")).toBe(colors.frameNegative);
  });

  it("0 は frameNeutral 色を返す", () => {
    expect(getFrameColor("0")).toBe(colors.frameNeutral);
  });

  it("パース不能な値は frameNeutral 色を返す", () => {
    expect(getFrameColor("-")).toBe(colors.frameNeutral);
  });
});

describe("isPunishable", () => {
  it("負のフレームは確反可能", () => {
    expect(isPunishable("-8")).toBe(true);
  });

  it("正のフレームは確反不可", () => {
    expect(isPunishable("+2")).toBe(false);
  });

  it("0 フレームは確反不可", () => {
    expect(isPunishable("0")).toBe(false);
  });

  it("パース不能な値は確反不可", () => {
    expect(isPunishable("-")).toBe(false);
  });
});
