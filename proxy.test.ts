import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";
import { SESSION_COOKIE } from "@/lib/auth/session";

function reqFor(url: string, cookie?: string) {
  const r = new NextRequest(new URL(url, "http://localhost"));
  if (cookie) r.cookies.set(SESSION_COOKIE, cookie);
  return r;
}

/** A request as it would arrive at a given host, which is what routes it. */
function reqAt(host: string, path = "/") {
  return new NextRequest(new URL(path, `https://${host}`), {
    headers: { host },
  });
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

describe("product subdomains", () => {
  it("serves the product page at the root of its subdomain", () => {
    const res = proxy(reqAt("nuru.spiritb.uk", "/"));
    // A rewrite keeps the visitor's URL and serves another path.
    expect(res.headers.get("location")).toBeNull();
    expect(res.headers.get("x-middleware-rewrite")).toContain("/nuru");
  });

  it("redirects the path form to the subdomain, so there is one indexable URL", () => {
    for (const slug of ["nuru", "reach", "tufike", "mcloud"]) {
      const res = proxy(reqAt("spiritb.uk", `/${slug}`));
      expect(res.status).toBe(308);
      expect(res.headers.get("location")).toBe(`https://${slug}.spiritb.uk/`);
    }
  });

  it("does not leave the same page reachable at two URLs on one subdomain", () => {
    const res = proxy(reqAt("nuru.spiritb.uk", "/nuru"));
    expect(res.status).toBe(308);
    expect(res.headers.get("location")).toBe("https://nuru.spiritb.uk/");
  });

  it("leaves non-product paths on the root domain alone", () => {
    const res = proxy(reqAt("spiritb.uk", "/contact"));
    expect(res.headers.get("location")).toBeNull();
    expect(res.headers.get("x-middleware-rewrite")).toBeNull();
  });

  it("does not treat an unknown subdomain as a product", () => {
    const res = proxy(reqAt("blog.spiritb.uk", "/"));
    expect(res.headers.get("x-middleware-rewrite")).toBeNull();
  });
});
