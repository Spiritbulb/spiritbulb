import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, getSession, writeSession } from "@/lib/auth/session";

/**
 * Gate for the signed-in hub only. Product subdomain routing lives in next.config
 * (lib/product-hosts.ts) so that public pages never invoke this function.
 */
export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // The hub is the only thing behind a session. Verify (decrypt + refresh),
  // do not merely check the cookie exists.
  if (pathname === "/home" || pathname.startsWith("/home/")) {
    const session = await getSession(req.cookies.get(SESSION_COOKIE)?.value);
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.search = "";
      url.searchParams.set("next", pathname + search);
      return NextResponse.redirect(url);
    }
    // If the session was refreshed mid-request, write the new blob back.
    if (session.resealed) {
      const res = NextResponse.next();
      writeSession(res.cookies, session.resealed);
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/home", "/home/:path*"],
};
