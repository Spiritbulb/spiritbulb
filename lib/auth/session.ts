import { openSession, sealSession, type SessionData } from "@/lib/auth/session-crypto";
import { refreshWorkOSTokens } from "@/lib/auth/workos-refresh";

export const SESSION_COOKIE = "sb_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Retained: the nav's cheap presence check until layout switches to getSession.
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
