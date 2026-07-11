import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, hasSession } from "@/lib/auth/session";

export function middleware(req: NextRequest) {
  const session = req.cookies.get(SESSION_COOKIE)?.value;
  if (hasSession(session)) return NextResponse.next();

  const nextPath = req.nextUrl.pathname + req.nextUrl.search;
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  url.searchParams.set("next", nextPath);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/home/:path*", "/home"],
};
