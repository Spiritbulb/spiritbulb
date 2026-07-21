// GET /go/mcloud?to=<relative> — hand the spiritbulb session over to MCloud web.
// Signed in: request a single-use handoff ticket and 302 to MCloud's redeem URL.
// Signed out (or handoff fails): 302 to MCloud's public login. `to` is forwarded
// to MCloud, which sanitizes it at mint; we only pass it through.
import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, getSession } from "@/lib/auth/session";
import { requestHandoff } from "@/lib/auth/mcloud-client";

const MCLOUD_LOGIN = "https://mcloud.co.ke/auth/login";

export async function GET(req: NextRequest) {
  const to = req.nextUrl.searchParams.get("to") ?? "/";
  const session = await getSession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!session) return NextResponse.redirect(MCLOUD_LOGIN);

  const handoff = await requestHandoff(
    { accessToken: session.data.accessToken, refreshToken: session.data.refreshToken },
    to,
  );
  if (!handoff.ok || !handoff.url) return NextResponse.redirect(MCLOUD_LOGIN);
  return NextResponse.redirect(handoff.url);
}
