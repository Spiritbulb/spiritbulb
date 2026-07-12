// TEMPORARY DIAGNOSTIC ROUTE — DELETE AFTER USE.
// Reports what the DEPLOYED function actually sees when it calls MCloud, without
// ever exposing the secret (only a short SHA-256 prefix, so we can compare the
// fingerprint against MCloud's without revealing either value).
import { NextResponse } from "next/server";
import { createHash } from "node:crypto";

export const dynamic = "force-dynamic";

function fingerprint(v: string | undefined) {
  if (!v) return null;
  return {
    length: v.length,
    // fingerprint of the exact stored value (whitespace included)
    sha256_8: createHash("sha256").update(v).digest("hex").slice(0, 8),
    // fingerprint of the trimmed value — if these differ, there is stray whitespace
    sha256_8_trimmed: createHash("sha256").update(v.trim()).digest("hex").slice(0, 8),
    hasLeadingOrTrailingWhitespace: v !== v.trim(),
    hasQuotes: v.startsWith('"') || v.startsWith("'"),
  };
}

export async function GET() {
  const base = process.env.MCLOUD_AUTH_BASE;
  const secret = process.env.PARTNER_AUTH_SECRET;

  const env = {
    MCLOUD_AUTH_BASE: base ?? null,
    PARTNER_AUTH_SECRET: fingerprint(secret),
  };

  // Now make the exact call requestCode makes, and report the raw result.
  let call: Record<string, unknown>;
  try {
    const res = await fetch(`${(base ?? "").replace(/\/$/, "")}/send-code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { "x-partner-secret": secret } : {}),
      },
      body: JSON.stringify({ email: "probe@example.com" }),
      redirect: "manual",
    });
    const text = await res.text().catch(() => "");
    call = {
      status: res.status,
      redirected: res.type === "opaqueredirect" || res.status >= 300 && res.status < 400,
      location: res.headers.get("location"),
      body: text.slice(0, 300),
    };
  } catch (e) {
    call = { threw: true, message: e instanceof Error ? e.message : String(e) };
  }

  return NextResponse.json({ env, call }, { headers: { "Cache-Control": "no-store" } });
}
