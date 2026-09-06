// ----------------------------------------------------------------------------

// app/api/auth/google/callback/route.ts
// WorkOS redirects here with ?code&state after it finishes the Google
// handshake on your behalf. Exchange the code for a WorkOS session — the
// same accessToken/refreshToken/expiresIn shape verifyCode() already returns.
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { WorkOS } from "@workos-inc/node";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth/session";
import { sealSession } from "@/lib/auth/session-crypto";

const workos = new WorkOS(process.env.WORKOS_API_KEY!);

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error");

  const cookieStore = await cookies();
  const savedState = cookieStore.get("g_oauth_state")?.value;
  const next = cookieStore.get("g_oauth_next")?.value ?? "/";

  cookieStore.delete("g_oauth_state");
  cookieStore.delete("g_oauth_next");

  if (errorParam || !code || !state || !savedState || state !== savedState) {
    return NextResponse.redirect(
      new URL(`/login?error=google_oauth_failed`, url.origin)
    );
  }

  let auth;
  try {
    auth = await workos.userManagement.authenticateWithCode({
      clientId: process.env.WORKOS_CLIENT_ID!,
      code,
    });
  } catch {
    return NextResponse.redirect(
      new URL(`/login?error=google_token_exchange_failed`, url.origin)
    );
  }

  const { accessToken, refreshToken } = auth;
  if (!accessToken || !refreshToken) {
    return NextResponse.redirect(
      new URL(`/login?error=google_oauth_failed`, url.origin)
    );
  }

  // WorkOS access tokens are JWTs — decode the `exp` claim (seconds since
  // epoch) instead of assuming a fixed TTL like the email-code path does.
  const payload = JSON.parse(
    Buffer.from(accessToken.split(".")[1], "base64url").toString("utf8")
  );
  const expiresAt = payload.exp ? payload.exp * 1000 : Date.now() + 5 * 60 * 1000;

  const sealed = await sealSession({ accessToken, refreshToken, expiresAt });

  // IMPORTANT: set the cookie on the redirect response you actually return.
  // Creating a separate NextResponse.json() (or a second redirect object) and
  // setting cookies on that one is the classic reason "the session doesn't
  // get recorded" — the browser never sees a Set-Cookie header at all.
  const res = NextResponse.redirect(new URL(next, url.origin));
  res.cookies.set(SESSION_COOKIE, sealed, sessionCookieOptions());
  return res;
}