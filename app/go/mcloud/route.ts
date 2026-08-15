// app/go/mcloud/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, getSession } from "@/lib/auth/session";
import { requestHandoff } from "@/lib/auth/mcloud-client";

export async function GET(req: NextRequest) {
  const to = req.nextUrl.searchParams.get("to") ?? "/";
  const session = await getSession((await cookies()).get(SESSION_COOKIE)?.value);

  if (!session) {
    // Send them to OUR login, remembering to come back through this same
    // handoff route once they're signed in, not MCloud's own login anymore.
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set(
      "next",
      `/go/mcloud?to=${encodeURIComponent(to)}`
    );
    return NextResponse.redirect(loginUrl);
  }

  const handoff = await requestHandoff(
    { accessToken: session.data.accessToken, refreshToken: session.data.refreshToken },
    to,
  );
  if (!handoff.ok || !handoff.url) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("next", `/go/mcloud?to=${encodeURIComponent(to)}`);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.redirect(handoff.url);
}