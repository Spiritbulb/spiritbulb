import { describe, it, expect } from "vitest";
import { productPath, safeNext } from "@/lib/auth/intent";

describe("productPath", () => {
  it("maps a product to its home deep link", () => {
    expect(productPath("nuru")).toBe("/home?app=nuru");
    expect(productPath("reach")).toBe("/home?app=reach");
  });
});

describe("safeNext", () => {
  it("passes through an internal path", () => {
    expect(safeNext("/home?app=nuru")).toBe("/home?app=nuru");
  });
  it("defaults empty/undefined to /home", () => {
    expect(safeNext(undefined)).toBe("/home");
    expect(safeNext("")).toBe("/home");
  });
  it("rejects protocol-relative and absolute URLs", () => {
    expect(safeNext("//evil.com")).toBe("/home");
    expect(safeNext("https://evil.com")).toBe("/home");
  });
  it("rejects backslash-normalized open-redirect targets", () => {
    expect(safeNext("/\\evil.com")).toBe("/home");
    expect(safeNext("/\\/evil.com")).toBe("/home");
  });
  it("still passes through a legitimate internal path", () => {
    expect(safeNext("/home?app=nuru")).toBe("/home?app=nuru");
  });
});
