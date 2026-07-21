import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { sealSession, type SessionData } from "@/lib/auth/session-crypto";

const KEY = Buffer.alloc(32, 7).toString("base64");
// Local shape so the gate cases don't set a dotted-domain cookie (irrelevant to
// the gate, and unsettable on localhost).
beforeEach(() => {
  process.env.SESSION_ENC_KEY = KEY;
  process.env.SESSION_COOKIE_LOCAL = "1";
});

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

async function sealedLive() {
  const live: SessionData = { accessToken: "at", refreshToken: "rt", expiresAt: Date.now() + 60_000 };
  return sealSession(live);
}

describe("home gate middleware", () => {
  it("redirects unauthenticated /home to /login with next", async () => {
    const res = await proxy(reqFor("http://localhost/home?app=nuru"));
    expect(res.status).toBe(307);
    const loc = res.headers.get("location")!;
    expect(loc).toContain("/login");
    expect(decodeURIComponent(loc)).toContain("next=/home?app=nuru");
  });

  it("redirects an undecryptable cookie to /login", async () => {
    const res = await proxy(reqFor("http://localhost/home?app=nuru", "garbage"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login");
  });

  it("lets an authenticated request with a live sealed session through", async () => {
    const res = await proxy(reqFor("http://localhost/home?app=nuru", await sealedLive()));
    // NextResponse.next() has no redirect location
    expect(res.headers.get("location")).toBeNull();
  });

  it("preserves all query params of a multi-param deep link in next", async () => {
    const res = await proxy(reqFor("http://localhost/home?app=nuru&ref=abc"));
    expect(res.status).toBe(307);
    const loc = res.headers.get("location")!;
    const next = new URL(loc).searchParams.get("next");
    expect(next).toBe("/home?app=nuru&ref=abc");
  });
});

describe("product subdomains", () => {
  it("serves the product page at the root of its subdomain", async () => {
    const res = await proxy(reqAt("nuru.spiritb.uk", "/"));
    // A rewrite keeps the visitor's URL and serves another path.
    expect(res.headers.get("location")).toBeNull();
    expect(res.headers.get("x-middleware-rewrite")).toContain("/nuru");
  });

  it("redirects the path form to the subdomain, so there is one indexable URL", async () => {
    for (const slug of ["nuru", "reach", "tufike", "mcloud"]) {
      const res = await proxy(reqAt("spiritb.uk", `/${slug}`));
      expect(res.status).toBe(308);
      expect(res.headers.get("location")).toBe(`https://${slug}.spiritb.uk/`);
    }
  });

  it("does not leave the same page reachable at two URLs on one subdomain", async () => {
    const res = await proxy(reqAt("nuru.spiritb.uk", "/nuru"));
    expect(res.status).toBe(308);
    expect(res.headers.get("location")).toBe("https://nuru.spiritb.uk/");
  });

  it("leaves non-product paths on the root domain alone", async () => {
    const res = await proxy(reqAt("spiritb.uk", "/contact"));
    expect(res.headers.get("location")).toBeNull();
    expect(res.headers.get("x-middleware-rewrite")).toBeNull();
  });

  it("does not treat an unknown subdomain as a product", async () => {
    const res = await proxy(reqAt("blog.spiritb.uk", "/"));
    expect(res.headers.get("x-middleware-rewrite")).toBeNull();
  });
});
