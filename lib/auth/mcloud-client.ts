import "server-only";

function base(): string {
  const b = process.env.MCLOUD_AUTH_BASE;
  if (!b) throw new Error("MCLOUD_AUTH_BASE is not set");
  return b.replace(/\/$/, "");
}

function headers(): Record<string, string> {
  const secret = process.env.PARTNER_AUTH_SECRET;
  // The partner routes are secret-gated: without this header MCloud replies 401
  // and the failure surfaces as an opaque 502. Fail loudly on a misconfigured
  // deploy rather than silently sending an unauthenticated request.
  if (!secret) throw new Error("PARTNER_AUTH_SECRET is not set");
  return {
    "Content-Type": "application/json",
    "x-partner-secret": secret,
  };
}

export async function requestCode(
  email: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    // MCloud partner send-code: always 200 { ok: true } even for unknown emails
    // (anti-enumeration). Only a non-2xx (429 rate limit, 400 malformed) is an error.
    // redirect: "error" — a 30x (e.g. apex -> www) silently drops the
    // x-partner-secret header, which would surface as a confusing 401/502.
    // Fail loudly instead: MCLOUD_AUTH_BASE must name the canonical host.
    const res = await fetch(`${base()}/send-code`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ email }),
      redirect: "error",
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

export async function requestHandoff(
  tokens: { accessToken: string; refreshToken: string },
  redirectTo: string
): Promise<{ ok: boolean; url?: string; error?: string }> {
  try {
    // MCloud partner handoff: 200 { url } with a single-use redeem URL on success,
    // 401/429/400 { error } otherwise. redirect: "error" — a 30x would drop the
    // x-partner-secret header (see requestCode).
    const res = await fetch(`${base()}/handoff`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ ...tokens, redirectTo }),
      redirect: "error",
    });
    const d = await res.json().catch(() => null);
    if (!res.ok || !d?.url) {
      return { ok: false, error: d?.error ?? "Could not start the handoff. Please try again." };
    }
    return { ok: true, url: d.url };
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
    // MCloud partner verify: 200 { accessToken, refreshToken, expiresIn } on success,
    // 400 { error } on bad/expired code. Success is HTTP 200 + an accessToken.
    // redirect: "error" — see requestCode; a 30x would drop the secret header.
    const res = await fetch(`${base()}/verify`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ email, code }),
      redirect: "error",
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
