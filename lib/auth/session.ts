import { openSession, sealSession, type SessionData } from "@/lib/auth/session-crypto";
import { refreshWorkOSTokens } from "@/lib/auth/workos-refresh";

export const SESSION_COOKIE = "sb_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Non-secret "someone signed in here" flag the nav reads in the browser. The session
// itself is httpOnly, so the nav cannot see it; reading it on the server instead
// (cookies() in a layout) makes every page dynamic, i.e. a function run per view.
// A UI hint only: /home and the product gates still verify the real session.
export const SESSION_HINT_COOKIE = "sb_li";

export function hasSession(cookieValue: string | undefined): boolean {
  return typeof cookieValue === "string" && cookieValue.length > 0;
}

export function sessionCookieOptions() {
  // .spiritb.uk shares the cookie across nuru/reach/tufike/parent (subdomain SSO).
  // localhost cannot set a dotted-domain cookie, so omit it in local dev.
  const local = process.env.SESSION_COOKIE_LOCAL === "1";
  return {
    httpOnly: true as const,
    secure: true as const,
    sameSite: "lax" as const,
    path: "/",
    ...(local ? {} : { domain: ".spiritb.uk" }),
    maxAge: SESSION_MAX_AGE,
  };
}

function hintCookieOptions() {
  return { ...sessionCookieOptions(), httpOnly: false as const };
}

type CookieJar = { set(name: string, value: string, options: object): unknown };

/** Write the session cookie and its UI hint together. Works on NextResponse.cookies and cookies(). */
export function writeSession(jar: CookieJar, sealed: string) {
  jar.set(SESSION_COOKIE, sealed, sessionCookieOptions());
  jar.set(SESSION_HINT_COOKIE, "1", hintCookieOptions());
}

/** Expire both cookies, with the same domain they were written with (a mismatch leaves them set). */
export function clearSession(jar: CookieJar) {
  jar.set(SESSION_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
  jar.set(SESSION_HINT_COOKIE, "", { ...hintCookieOptions(), maxAge: 0 });
}

/**
 * Open the sealed cookie and return the live session. If the access token has
 * lapsed, refresh against WorkOS and return the new sealed blob in `resealed`
 * for the caller to write back (this helper runs in both middleware and route
 * contexts, so it does not touch cookies itself). Null when there is no valid,
 * refreshable session.
 */
export async function getSession(
  sealed: string | undefined,
): Promise<{ data: SessionData; resealed?: string } | null> {
  if (!sealed) return null;
  const data = await openSession(sealed);
  if (!data) return null;
  if (data.expiresAt > Date.now()) return { data };

  const refreshed = await refreshWorkOSTokens(data.refreshToken);
  if (!refreshed) return null;
  const next: SessionData = refreshed;
  return { data: next, resealed: await sealSession(next) };
}
