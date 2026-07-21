import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { refreshWorkOSTokens } from "@/lib/auth/workos-refresh";

const realFetch = global.fetch;
beforeEach(() => { process.env.WORKOS_CLIENT_ID = "client_test"; });
afterEach(() => { global.fetch = realFetch; vi.restoreAllMocks(); });

describe("refreshWorkOSTokens", () => {
  it("exchanges a refresh token for a new pair", async () => {
    global.fetch = vi.fn(async () =>
      new Response(
        JSON.stringify({ access_token: "at_new", refresh_token: "rt_new", expires_in: 300 }),
        { status: 200 },
      ),
    ) as unknown as typeof fetch;
    const before = Date.now();
    const res = await refreshWorkOSTokens("rt_old");
    expect(res?.accessToken).toBe("at_new");
    expect(res?.refreshToken).toBe("rt_new");
    expect(res!.expiresAt).toBeGreaterThanOrEqual(before + 300_000 - 1000);
  });

  it("posts to the WorkOS token endpoint with grant_type=refresh_token", async () => {
    const spy = vi.fn(async (_url: RequestInfo | URL, _init?: RequestInit) =>
      new Response(JSON.stringify({ access_token: "a", refresh_token: "r", expires_in: 300 }), { status: 200 }),
    );
    global.fetch = spy as unknown as typeof fetch;
    await refreshWorkOSTokens("rt_old");
    const [url, init] = spy.mock.calls[0];
    expect(String(url)).toContain("api.workos.com");
    expect(String(init?.body)).toContain("grant_type=refresh_token");
    expect(String(init?.body)).toContain("rt_old");
  });

  it("returns null on a non-2xx", async () => {
    global.fetch = vi.fn(async () => new Response("{}", { status: 400 })) as unknown as typeof fetch;
    expect(await refreshWorkOSTokens("rt_old")).toBeNull();
  });

  it("returns null on a network error", async () => {
    global.fetch = vi.fn(async () => { throw new Error("network"); }) as unknown as typeof fetch;
    expect(await refreshWorkOSTokens("rt_old")).toBeNull();
  });
});
