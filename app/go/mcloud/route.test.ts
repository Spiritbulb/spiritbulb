import { describe, it, expect, vi, afterEach } from "vitest";

vi.mock("@/lib/auth/session", () => ({
  SESSION_COOKIE: "sb_session",
  getSession: vi.fn(),
}));
vi.mock("@/lib/auth/mcloud-client", () => ({ requestHandoff: vi.fn() }));
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ get: () => ({ value: "sealed" }) })),
}));

import { GET } from "@/app/go/mcloud/route";
import { getSession } from "@/lib/auth/session";
import { requestHandoff } from "@/lib/auth/mcloud-client";
import { NextRequest } from "next/server";

function req(url: string) {
  return new NextRequest(new URL(url));
}
afterEach(() => vi.restoreAllMocks());

describe("/go/mcloud", () => {
  it("redirects to the handoff url when signed in", async () => {
    (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { accessToken: "at", refreshToken: "rt", expiresAt: Date.now() + 1e5 },
    });
    (requestHandoff as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      url: "https://mcloud.co.ke/auth/handoff?ticket=abc",
    });
    const res = await GET(req("https://spiritb.uk/go/mcloud?to=/org/onboarding"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/auth/handoff?ticket=");
  });

  it("passes the `to` param through to requestHandoff", async () => {
    (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { accessToken: "at", refreshToken: "rt", expiresAt: Date.now() + 1e5 },
    });
    (requestHandoff as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true, url: "https://x/auth/handoff?ticket=abc" });
    await GET(req("https://spiritb.uk/go/mcloud?to=/stores/acme"));
    expect(requestHandoff).toHaveBeenCalledWith(
      { accessToken: "at", refreshToken: "rt" },
      "/stores/acme",
    );
  });

  it("redirects to MCloud login when not signed in", async () => {
    (getSession as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const res = await GET(req("https://spiritb.uk/go/mcloud?to=/org/onboarding"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login?next=");
  });

  it("stops on an error page when the handoff fails, rather than looping through /login", async () => {
    (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { accessToken: "at", refreshToken: "rt", expiresAt: Date.now() + 1e5 },
    });
    (requestHandoff as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false, error: "no" });
    const res = await GET(req("https://spiritb.uk/go/mcloud?to=/org/onboarding"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("https://spiritb.uk/handoff-failed");
  });
});
