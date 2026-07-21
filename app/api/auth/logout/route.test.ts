import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/auth/logout/route";

describe("logout route", () => {
  it("clears the session cookie and redirects home", async () => {
    const res = await POST();
    // 307/308 redirect to the site root.
    expect(res.status).toBeGreaterThanOrEqual(300);
    expect(res.status).toBeLessThan(400);
    expect(res.headers.get("location")).toContain("spiritb.uk");

    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("sb_session=");
    // Expired: empty value with Max-Age 0.
    expect(setCookie.toLowerCase()).toContain("max-age=0");
    expect(setCookie.toLowerCase()).toContain("httponly");
  });
});
