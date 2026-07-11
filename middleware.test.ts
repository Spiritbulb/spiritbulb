import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";

function reqFor(url: string, cookie?: string) {
  const r = new NextRequest(new URL(url, "http://localhost"));
  if (cookie) r.cookies.set("sb_session", cookie);
  return r;
}

describe("home gate middleware", () => {
  it("redirects unauthenticated /home to /login with next", () => {
    const res = middleware(reqFor("http://localhost/home?app=nuru"));
    expect(res.status).toBe(307);
    const loc = res.headers.get("location")!;
    expect(loc).toContain("/login");
    expect(decodeURIComponent(loc)).toContain("next=/home?app=nuru");
  });

  it("lets an authenticated request through", () => {
    const res = middleware(reqFor("http://localhost/home?app=nuru", "tok_abc"));
    // NextResponse.next() has no redirect location
    expect(res.headers.get("location")).toBeNull();
  });
});
