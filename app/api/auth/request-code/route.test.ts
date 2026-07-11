import { describe, it, expect, vi, afterEach } from "vitest";

vi.mock("@/lib/auth/mcloud-client", () => ({
  requestCode: vi.fn(async () => ({ ok: true })),
}));

import { POST } from "@/app/api/auth/request-code/route";
import { requestCode } from "@/lib/auth/mcloud-client";

afterEach(() => vi.restoreAllMocks());

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
});
