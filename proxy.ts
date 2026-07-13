import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, hasSession } from "@/lib/auth/session";

/** Products served from their own subdomain. Keep in step with lib/products.ts. */
const PRODUCT_SLUGS = ["nuru", "reach", "tufike", "mcloud"] as const;
type Slug = (typeof PRODUCT_SLUGS)[number];

const ROOT_HOST = "spiritb.uk";

/**
 * Which product subdomain is this, if any? Matches nuru.spiritb.uk and also
 * nuru.localhost:3000 so the rewrite can be exercised in development.
 */
function productFromHost(host: string): Slug | null {
  const sub = host.split(":")[0].split(".")[0].toLowerCase();
  return (PRODUCT_SLUGS as readonly string[]).includes(sub)
    ? (sub as Slug)
    : null;
}

export function proxy(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const { pathname, search } = req.nextUrl;
  const slug = productFromHost(host);

  if (slug) {
    // On a product subdomain the root serves that product's page. The path is
    // rewritten, not redirected, so the visitor keeps seeing nuru.spiritb.uk.
    if (pathname === "/") {
      const url = req.nextUrl.clone();
      url.pathname = `/${slug}`;
      return NextResponse.rewrite(url);
    }
    // nuru.spiritb.uk/nuru would be the same page at a second URL. Send it home.
    if (pathname === `/${slug}`) {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url, 308);
    }
  } else if (host.endsWith(ROOT_HOST) || host.startsWith("localhost")) {
    // On the root domain the product paths are not canonical, so send them to
    // the subdomain that is. One page, one indexable URL.
    const match = PRODUCT_SLUGS.find((s) => pathname === `/${s}`);
    if (match && host.endsWith(ROOT_HOST)) {
      return NextResponse.redirect(
        new URL(`https://${match}.${ROOT_HOST}${search}`),
        308
      );
    }
  }

  // The hub is the only thing behind a session.
  if (pathname === "/home" || pathname.startsWith("/home/")) {
    const session = req.cookies.get(SESSION_COOKIE)?.value;
    if (!hasSession(session)) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.search = "";
      url.searchParams.set("next", pathname + search);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Everything except static assets and the API, so the host can be inspected.
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|xml|txt|webmanifest)$).*)",
  ],
};
