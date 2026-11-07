import { describe, it, expect, vi, afterEach } from "vitest";

vi.mock("@/lib/auth/mcloud-client", () => ({
  requestCode: vi.fn(async () => ({ ok: true })),
}));

vi.mock("@/lib/turnstile", () => ({
  turnstileEnforced: vi.fn(() => false),
  verifyTurnstile: vi.fn(async () => true),
  clientIp: vi.fn(() => "203.0.113.9"),
}));

import { POST } from "@/app/api/auth/request-code/route";
import { requestCode } from "@/lib/auth/mcloud-client";
import { turnstileEnforced, verifyTurnstile } from "@/lib/turnstile";

afterEach(() => {
  vi.clearAllMocks();
  (turnstileEnforced as ReturnType<typeof vi.fn>).mockReturnValue(false);
  (verifyTurnstile as ReturnType<typeof vi.fn>).mockResolvedValue(true);
});

function req(body: unknown) {
  return new Request("http://localhost/api/auth/request-code", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("request-code route", () => {
  it("400s an invalid email", async () => {
    const res = await POST(req({ email: "nope" }) as never);
    expect(res.status).toBe(400);
  });

  it("200s a valid email", async () => {
    const res = await POST(req({ email: "a@b.com" }) as never);
    expect(res.status).toBe(200);
    expect(requestCode).toHaveBeenCalledWith("a@b.com");
  });

  it("502s when the client fails", async () => {
    (requestCode as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: false, error: "x" });
    const res = await POST(req({ email: "a@b.com" }) as never);
    expect(res.status).toBe(502);
  });

  describe("with the challenge enforced", () => {
    it("400s a missing token and sends nothing", async () => {
      (turnstileEnforced as ReturnType<typeof vi.fn>).mockReturnValue(true);
      const res = await POST(req({ email: "a@b.com" }) as never);
      expect(res.status).toBe(400);
      expect(verifyTurnstile).not.toHaveBeenCalled();
      expect(requestCode).not.toHaveBeenCalled();
    });

    it("403s a token Cloudflare rejects and sends nothing", async () => {
      (turnstileEnforced as ReturnType<typeof vi.fn>).mockReturnValue(true);
      (verifyTurnstile as ReturnType<typeof vi.fn>).mockResolvedValue(false);
      const res = await POST(req({ email: "a@b.com", turnstileToken: "bad" }) as never);
      expect(res.status).toBe(403);
      expect(requestCode).not.toHaveBeenCalled();
    });

    it("sends the code for a valid token, checking it against the client address", async () => {
      (turnstileEnforced as ReturnType<typeof vi.fn>).mockReturnValue(true);
      const res = await POST(req({ email: "a@b.com", turnstileToken: " good " }) as never);
      expect(res.status).toBe(200);
      expect(verifyTurnstile).toHaveBeenCalledWith("good", "203.0.113.9");
      expect(requestCode).toHaveBeenCalledWith("a@b.com");
    });
  });
});
