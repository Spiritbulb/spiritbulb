// app/api/auth/google/start/route.ts
// Redirects to WorkOS, which then redirects to Google itself. Your app never
// talks to accounts.google.com directly — WorkOS is the middleman that later
// lets you exchange the returned `code` for a real session.
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { WorkOS } from "@workos-inc/node";
import { safeNext } from "@/lib/auth/intent";

const workos = new WorkOS(process.env.WORKOS_API_KEY!);

export async function GET(req: NextRequest) {
  const next = safeNext(req.nextUrl.searchParams.get("next"));
  const state = crypto.randomBytes(16).toString("base64url");

  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === "production";

  cookieStore.set("g_oauth_state", state, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  cookieStore.set("g_oauth_next", next, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  const authorizationUrl = workos.userManagement.getAuthorizationUrl({
    provider: "GoogleOAuth",
    clientId: process.env.WORKOS_CLIENT_ID!,
    redirectUri: `${req.nextUrl.origin}/api/auth/google/callback`,
    state,
  });

  return NextResponse.redirect(authorizationUrl);
}

