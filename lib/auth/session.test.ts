import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  SESSION_COOKIE,
  hasSession,
  getSession,
  sessionCookieOptions,
  SESSION_MAX_AGE,
} from "@/lib/auth/session";
import { sealSession, type SessionData } from "@/lib/auth/session-crypto";

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

const KEY = Buffer.alloc(32, 7).toString("base64");
const realFetch = global.fetch;

describe("getSession", () => {
  beforeEach(() => {
    process.env.SESSION_ENC_KEY = KEY;
    process.env.WORKOS_CLIENT_ID = "client_test";
    delete process.env.SESSION_COOKIE_LOCAL;
  });
  afterEach(() => { global.fetch = realFetch; vi.restoreAllMocks(); });

  it("returns null for a missing cookie", async () => {
    expect(await getSession(undefined)).toBeNull();
  });

  it("returns the data for a live session without refreshing", async () => {
    global.fetch = vi.fn(async () => { throw new Error("should not refresh"); }) as unknown as typeof fetch;
    const live: SessionData = { accessToken: "at", refreshToken: "rt", expiresAt: Date.now() + 60_000 };
    const res = await getSession(await sealSession(live));
    expect(res?.data.accessToken).toBe("at");
    expect(res?.resealed).toBeUndefined();
  });

  it("refreshes and reseals a lapsed session", async () => {
    global.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ access_token: "at2", refresh_token: "rt2", expires_in: 300 }), { status: 200 }),
    ) as unknown as typeof fetch;
    const stale: SessionData = { accessToken: "at", refreshToken: "rt", expiresAt: Date.now() - 1000 };
    const res = await getSession(await sealSession(stale));
    expect(res?.data.accessToken).toBe("at2");
    expect(typeof res?.resealed).toBe("string");
  });

  it("returns null when a lapsed session fails to refresh", async () => {
    global.fetch = vi.fn(async () => new Response("{}", { status: 400 })) as unknown as typeof fetch;
    const stale: SessionData = { accessToken: "at", refreshToken: "rt", expiresAt: Date.now() - 1000 };
    expect(await getSession(await sealSession(stale))).toBeNull();
  });

  it("scopes the cookie to .spiritb.uk in production shape", () => {
    const opts = sessionCookieOptions();
    expect(opts.domain).toBe(".spiritb.uk");
    expect(opts.maxAge).toBe(SESSION_MAX_AGE);
    expect(opts.httpOnly).toBe(true);
  });

  it("omits the domain for local dev", () => {
    process.env.SESSION_COOKIE_LOCAL = "1";
    expect(sessionCookieOptions().domain).toBeUndefined();
  });
});
