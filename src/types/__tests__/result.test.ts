import { describe, it, expect } from "vitest";
import { ok, err } from "../result";
import type { Result } from "../result";

describe("ok", () => {
  it("ok: true と value を持つオブジェクトを返す", () => {
    const result = ok(42);
    expect(result).toEqual({ ok: true, value: 42 });
  });

  it("文字列値でも動作する", () => {
    const result = ok("success");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("success");
    }
  });

  it("null 値でも動作する", () => {
    const result = ok(null);
    expect(result).toEqual({ ok: true, value: null });
  });
});

describe("err", () => {
  it("ok: false と error を持つオブジェクトを返す", () => {
    const result = err("something went wrong");
    expect(result).toEqual({ ok: false, error: "something went wrong" });
  });

  it("Error オブジェクトでも動作する", () => {
    const error = new Error("test error");
    const result = err(error);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(error);
    }
  });
});

describe("Result 型の型ガード", () => {
  it("ok の場合は value にアクセスできる", () => {
    const result: Result<number, string> = ok(42);
    if (result.ok) {
      expect(result.value).toBe(42);
    }
  });

  it("err の場合は error にアクセスできる", () => {
    const result: Result<number, string> = err("failed");
    if (!result.ok) {
      expect(result.error).toBe("failed");
    }
  });
});
