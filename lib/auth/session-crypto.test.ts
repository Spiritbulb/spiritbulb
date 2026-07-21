import { describe, it, expect, beforeEach } from "vitest";
import { sealSession, openSession, type SessionData } from "@/lib/auth/session-crypto";

// 32-byte key, base64. AES-256-GCM.
const KEY = Buffer.alloc(32, 7).toString("base64");
const sample: SessionData = { accessToken: "at_1", refreshToken: "rt_1", expiresAt: 1_800_000_000_000 };

describe("session-crypto", () => {
  beforeEach(() => { process.env.SESSION_ENC_KEY = KEY; });

  it("round-trips a session", async () => {
    const sealed = await sealSession(sample);
    expect(sealed).not.toContain("at_1"); // opaque, not the raw token
    expect(await openSession(sealed)).toEqual(sample);
  });

  it("returns null on a tampered blob", async () => {
    const sealed = await sealSession(sample);
    const tampered = sealed.slice(0, -2) + (sealed.endsWith("AA") ? "BB" : "AA");
    expect(await openSession(tampered)).toBeNull();
  });

  it("returns null on garbage input", async () => {
    expect(await openSession("not-a-real-blob")).toBeNull();
  });

  it("throws when the key is missing", async () => {
    delete process.env.SESSION_ENC_KEY;
    await expect(sealSession(sample)).rejects.toThrow();
  });
});
