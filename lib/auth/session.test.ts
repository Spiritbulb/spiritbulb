import { describe, it, expect } from "vitest";
import { SESSION_COOKIE, hasSession } from "@/lib/auth/session";

describe("session", () => {
  it("names the cookie", () => {
    expect(SESSION_COOKIE).toBe("sb_session");
  });
  it("treats a non-empty value as a session", () => {
    expect(hasSession("abc.def.ghi")).toBe(true);
  });
  it("treats empty/undefined as no session", () => {
    expect(hasSession(undefined)).toBe(false);
    expect(hasSession("")).toBe(false);
  });
});
