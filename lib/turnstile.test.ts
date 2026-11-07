import { describe, it, expect, vi, afterEach } from "vitest";
import { clientIp, turnstileEnforced, verifyTurnstile } from "@/lib/turnstile";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("turnstileEnforced", () => {
  it("is on in production even without a secret", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("TURNSTILE_SECRET_KEY", "");
    expect(turnstileEnforced()).toBe(true);
  });
  it("is on wherever a secret is set, off for a bare local checkout", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("TURNSTILE_SECRET_KEY", "s");
    expect(turnstileEnforced()).toBe(true);
    vi.stubEnv("TURNSTILE_SECRET_KEY", "");
    expect(turnstileEnforced()).toBe(false);
  });
});

describe("verifyTurnstile", () => {
  it("fails closed without a secret and never calls Cloudflare", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await verifyTurnstile("t", null)).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("is true only when Cloudflare says success", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "s");
    const fetchMock = vi.fn().mockResolvedValueOnce({ json: async () => ({ success: true }) }).mockResolvedValueOnce({ json: async () => ({ success: false }) });
    vi.stubGlobal("fetch", fetchMock);
    expect(await verifyTurnstile("t", "1.2.3.4")).toBe(true);
    expect(await verifyTurnstile("t", null)).toBe(false);
    expect(String(fetchMock.mock.calls[0][1].body)).toContain("remoteip=1.2.3.4");
  });
  it("fails closed when the request throws", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "s");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await verifyTurnstile("t", null)).toBe(false);
  });
});

describe("clientIp", () => {
  it("prefers Cloudflare's header, then the first forwarded address", () => {
    expect(clientIp(new Headers({ "cf-connecting-ip": "1.1.1.1", "x-forwarded-for": "2.2.2.2" }))).toBe("1.1.1.1");
    expect(clientIp(new Headers({ "x-forwarded-for": "2.2.2.2, 3.3.3.3" }))).toBe("2.2.2.2");
    expect(clientIp(new Headers())).toBe(null);
  });
});
