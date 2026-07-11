import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";
import { SESSION_COOKIE } from "@/lib/auth/session";

function reqFor(url: string, cookie?: string) {
  const r = new NextRequest(new URL(url, "http://localhost"));
  if (cookie) r.cookies.set(SESSION_COOKIE, cookie);
  return r;
}

describe("home gate middleware", () => {
  it("redirects unauthenticated /home to /login with next", () => {
    const res = proxy(reqFor("http://localhost/home?app=nuru"));
    expect(res.status).toBe(307);
    const loc = res.headers.get("location")!;
    expect(loc).toContain("/login");
    expect(decodeURIComponent(loc)).toContain("next=/home?app=nuru");
  });

  it("lets an authenticated request through", () => {
    const res = proxy(reqFor("http://localhost/home?app=nuru", "tok_abc"));
    // NextResponse.next() has no redirect location
    expect(res.headers.get("location")).toBeNull();
  });

  it("preserves all query params of a multi-param deep link in next", () => {
    const res = proxy(
      reqFor("http://localhost/home?app=nuru&ref=abc")
    );
    expect(res.status).toBe(307);
    const loc = res.headers.get("location")!;
    const next = new URL(loc).searchParams.get("next");
    expect(next).toBe("/home?app=nuru&ref=abc");
  });
});
