import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";

vi.mock("@/lib/auth/mcloud-client", () => ({
  verifyCode: vi.fn(async () => ({ ok: true, accessToken: "at_abc", refreshToken: "rt_abc", expiresIn: 3600 })),
}));

import { POST } from "@/app/api/auth/verify-code/route";
import { verifyCode } from "@/lib/auth/mcloud-client";
import { openSession } from "@/lib/auth/session-crypto";

beforeEach(() => { process.env.SESSION_ENC_KEY = Buffer.alloc(32, 7).toString("base64"); });
afterEach(() => vi.restoreAllMocks());

function req(body: unknown) {
  return new Request("http://localhost/api/auth/verify-code", { method: "POST", body: JSON.stringify(body) });
}

describe("verify-code route", () => {
  it("sets an ENCRYPTED session cookie holding the full token set", async () => {
    const res = await POST(req({ email: "a@b.com", code: "000000" }) as never);
    expect(res.status).toBe(200);
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("sb_session=");
    expect(setCookie).not.toContain("at_abc"); // opaque, not the raw token
    expect(setCookie.toLowerCase()).toContain("httponly");
    // Extract the cookie value and confirm it decrypts to the full set.
    const value = decodeURIComponent(setCookie.split("sb_session=")[1].split(";")[0]);
    const data = await openSession(value);
    expect(data).toMatchObject({ accessToken: "at_abc", refreshToken: "rt_abc" });
    expect(data!.expiresAt).toBeGreaterThan(Date.now());
  });

  it("401s a bad code without setting a cookie", async () => {
    (verifyCode as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: false, error: "bad" });
    const res = await POST(req({ email: "a@b.com", code: "999999" }) as never);
    expect(res.status).toBe(401);
    expect(res.headers.get("set-cookie")).toBeNull();
  });

  it("400s missing code", async () => {
    const res = await POST(req({ email: "a@b.com" }) as never);
    expect(res.status).toBe(400);
  });
});
