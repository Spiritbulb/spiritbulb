import { NextRequest, NextResponse } from "next/server";
import { requestCode } from "@/lib/auth/mcloud-client";
import { clientIp, turnstileEnforced, verifyTurnstile } from "@/lib/turnstile";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: { email?: string; turnstileToken?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const email = body.email?.trim() ?? "";
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }
  // The challenge is checked here, not only in the browser: a token is single use, so every send
  // (including a resend) carries a fresh one.
  if (turnstileEnforced()) {
    const token = body.turnstileToken?.trim() ?? "";
    if (!token) {
      return NextResponse.json({ error: "Please complete the verification challenge." }, { status: 400 });
    }
    if (!(await verifyTurnstile(token, clientIp(req.headers)))) {
      return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 403 });
    }
  }
  const result = await requestCode(email);
  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "Could not send a code." }, { status: 502 });
  }
  return NextResponse.json({ success: true });
}
