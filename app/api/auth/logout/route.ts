import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { SITE } from "@/lib/products";

// Clears the session cookie and returns home. POST (not GET) so a stray
// prefetch or crawler can't sign a user out. The cookie is expired by setting
// an empty value with maxAge 0, matching the path it was written with.
export async function POST() {
  const res = NextResponse.redirect(new URL("/", SITE));
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
