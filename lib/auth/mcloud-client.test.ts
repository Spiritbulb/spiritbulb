import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { requestCode, verifyCode } from "@/lib/auth/mcloud-client";

const realFetch = global.fetch;

beforeEach(() => {
  process.env.MCLOUD_AUTH_BASE = "https://mcloud.co.ke/api/partner/auth";
  process.env.PARTNER_AUTH_SECRET = "test-secret";
});
afterEach(() => {
  global.fetch = realFetch;
  vi.restoreAllMocks();
});

describe("requestCode", () => {
  it("returns ok on 200", async () => {
    global.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    ) as unknown as typeof fetch;
    const res = await requestCode("a@b.com");
    expect(res.ok).toBe(true);
  });

  it("calls the send-code endpoint", async () => {
    const spy = vi.fn(async () =>
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );
    global.fetch = spy as unknown as typeof fetch;
    await requestCode("a@b.com");
    expect(spy).toHaveBeenCalledWith(
      "https://mcloud.co.ke/api/partner/auth/send-code",
      expect.anything()
    );
  });

  it("sends the x-partner-secret header (partner routes are secret-gated)", async () => {
    const spy = vi.fn(
      async (_url: string, _init?: RequestInit) =>
        new Response(JSON.stringify({ ok: true }), { status: 200 })
    );
    global.fetch = spy as unknown as typeof fetch;
    await requestCode("a@b.com");
    const init = spy.mock.calls[0][1];
    const sent = init?.headers as Record<string, string> | undefined;
    expect(sent?.["x-partner-secret"]).toBe("test-secret");
  });

  it("fails when PARTNER_AUTH_SECRET is unset (no silent unauthenticated call)", async () => {
    delete process.env.PARTNER_AUTH_SECRET;
    const spy = vi.fn();
    global.fetch = spy as unknown as typeof fetch;
    const res = await requestCode("a@b.com");
    expect(res.ok).toBe(false);
    // must not have called MCloud at all without the secret
    expect(spy).not.toHaveBeenCalled();
  });

  it("returns an error on non-200", async () => {
    global.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ error: "rate limited" }), { status: 429 })
    ) as unknown as typeof fetch;
    const res = await requestCode("a@b.com");
    expect(res.ok).toBe(false);
    expect(res.error).toBeTruthy();
  });
});

describe("verifyCode", () => {
  it("returns tokens on success (200 + accessToken)", async () => {
    global.fetch = vi.fn(async () =>
      new Response(
        JSON.stringify({ accessToken: "at_123", refreshToken: "rt_456", expiresIn: 3600 }),
        { status: 200 }
      )
    ) as unknown as typeof fetch;
    const res = await verifyCode("a@b.com", "000000");
    expect(res.ok).toBe(true);
    expect(res.accessToken).toBe("at_123");
    expect(res.refreshToken).toBe("rt_456");
    expect(res.expiresIn).toBe(3600);
  });

  it("calls the verify endpoint", async () => {
    const spy = vi.fn(async () =>
      new Response(JSON.stringify({ accessToken: "at_123" }), { status: 200 })
    );
    global.fetch = spy as unknown as typeof fetch;
    await verifyCode("a@b.com", "000000");
    expect(spy).toHaveBeenCalledWith(
      "https://mcloud.co.ke/api/partner/auth/verify",
      expect.anything()
    );
  });

  it("fails a bad code (400)", async () => {
    global.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ error: "invalid code" }), { status: 400 })
    ) as unknown as typeof fetch;
    const res = await verifyCode("a@b.com", "999999");
    expect(res.ok).toBe(false);
    expect(res.accessToken).toBeUndefined();
  });
});
