import "server-only";

function base(): string {
  const b = process.env.MCLOUD_AUTH_BASE;
  if (!b) throw new Error("MCLOUD_AUTH_BASE is not set");
  return b.replace(/\/$/, "");
}

function headers(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  const secret = process.env.MCLOUD_AUTH_SECRET;
  if (secret) h["x-spiritbulb-secret"] = secret;
  return h;
}

export async function requestCode(
  email: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    // MCloud mobile send-code: always 200 { ok: true } even for unknown emails
    // (anti-enumeration). Only a non-2xx (429 rate limit, 400 malformed) is an error.
    const res = await fetch(`${base()}/send-code`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => null);
      return { ok: false, error: d?.error ?? "Could not send a code. Please try again." };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}

export async function verifyCode(
  email: string,
  code: string
): Promise<{
  ok: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  error?: string;
}> {
  try {
    // MCloud mobile verify: 200 { accessToken, refreshToken, expiresIn } on success,
    // 400 { error } on bad/expired code. Success is HTTP 200 + an accessToken.
    const res = await fetch(`${base()}/verify`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ email, code }),
    });
    const d = await res.json().catch(() => null);
    if (!res.ok || !d?.accessToken) {
      return { ok: false, error: d?.error ?? "That code did not work. Please try again." };
    }
    return {
      ok: true,
      accessToken: d.accessToken,
      refreshToken: d.refreshToken,
      expiresIn: d.expiresIn,
    };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}
