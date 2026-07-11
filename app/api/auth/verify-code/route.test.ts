import { describe, it, expect, vi, afterEach } from "vitest";

vi.mock("@/lib/auth/mcloud-client", () => ({
  verifyCode: vi.fn(async () => ({ ok: true, accessToken: "at_abc", refreshToken: "rt_abc", expiresIn: 3600 })),
}));

import { POST } from "@/app/api/auth/verify-code/route";
import { verifyCode } from "@/lib/auth/mcloud-client";

afterEach(() => vi.restoreAllMocks());

function req(body: unknown) {
  return new Request("http://localhost/api/auth/verify-code", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("verify-code route", () => {
  it("sets the session cookie on success", async () => {
    const res = await POST(req({ email: "a@b.com", code: "000000" }) as never);
    expect(res.status).toBe(200);
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("sb_session=at_abc");
    expect(setCookie.toLowerCase()).toContain("httponly");
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
