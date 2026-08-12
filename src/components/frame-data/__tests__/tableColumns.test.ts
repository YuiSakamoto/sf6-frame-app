// src/components/frame-data/__tests__/tableColumns.test.ts
import { describe, expect, it } from "vitest";
import { TABLE_COLUMNS, sortMovesByColumn } from "../tableColumns";
import type { Move } from "@/types/frame-data";

const move = (over: Partial<Move>): Move => ({
  name: "test",
  nameJa: "テスト",
  input: "",
  startup: "5",
  active: "3",
  recovery: "10",
  onBlock: "-2",
  onHit: "+3",
  damage: "600",
  category: "normal",
  ...over,
});

describe("TABLE_COLUMNS", () => {
  it("9列が定義されている", () => {
    expect(TABLE_COLUMNS).toHaveLength(9);
  });
  it("getValue が Move から値を取り出す", () => {
    const startup = TABLE_COLUMNS.find((c) => c.key === "startup");
    expect(startup?.getValue(move({ startup: "8" }))).toBe("8");
  });
  it("cancel など未定義値は '-' を返す", () => {
    const cancel = TABLE_COLUMNS.find((c) => c.key === "cancel");
    expect(cancel?.getValue(move({ cancel: undefined }))).toBe("-");
  });
});

describe("sortMovesByColumn", () => {
  const moves = [
    move({ nameJa: "A", startup: "8" }),
    move({ nameJa: "B", startup: "4" }),
    move({ nameJa: "C", startup: "-" }), // パース不能は末尾
  ];
  it("昇順ソート・パース不能は末尾", () => {
    const sorted = sortMovesByColumn(moves, "startup", "asc");
    expect(sorted.map((m) => m.nameJa)).toEqual(["B", "A", "C"]);
  });
  it("降順ソート", () => {
    const sorted = sortMovesByColumn(moves, "startup", "desc");
    expect(sorted.map((m) => m.nameJa)).toEqual(["A", "B", "C"]);
  });
  it("key が null なら元の並びを返す", () => {
    expect(sortMovesByColumn(moves, null, "asc")).toEqual(moves);
  });
});
