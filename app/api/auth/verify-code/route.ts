import { NextRequest, NextResponse } from "next/server";
import { verifyCode } from "@/lib/auth/mcloud-client";
import { writeSession } from "@/lib/auth/session";
import { sealSession } from "@/lib/auth/session-crypto";

export async function POST(req: NextRequest) {
  let body: { email?: string; code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const email = body.email?.trim() ?? "";
  const code = body.code?.trim() ?? "";
  if (!email || !code) {
    return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
  }
  const result = await verifyCode(email, code);
  if (!result.ok || !result.accessToken || !result.refreshToken) {
    return NextResponse.json({ error: result.error ?? "That code did not work." }, { status: 401 });
  }
  // Seal the FULL token set so getSession can refresh later. expiresIn is
  // seconds; store an absolute epoch-ms deadline.
  const sealed = await sealSession({
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    expiresAt: Date.now() + (result.expiresIn ?? 0) * 1000,
  });
  const res = NextResponse.json({ success: true });
  writeSession(res.cookies, sealed);
  return res;
}
