import { NextRequest, NextResponse } from "next/server";
import { requestCode } from "@/lib/auth/mcloud-client";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const email = body.email?.trim() ?? "";
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }
  const result = await requestCode(email);
  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "Could not send a code." }, { status: 502 });
  }
  return NextResponse.json({ success: true });
}
