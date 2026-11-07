import "server-only";

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Whether a route must see a valid Turnstile token. Always in production, and in any environment
 * that has a secret. Only a local checkout with no secret configured skips it (the login form
 * renders no widget there either).
 */
export function turnstileEnforced(): boolean {
  return process.env.NODE_ENV === "production" || !!process.env.TURNSTILE_SECRET_KEY;
}

/** Verifies a token with Cloudflare. Fails closed: no secret, a network error or a bad token all return false. */
export async function verifyTurnstile(token: string, remoteip: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error("TURNSTILE_SECRET_KEY is not set");
    return false;
  }

  const form = new URLSearchParams();
  form.append("secret", secret);
  form.append("response", token);
  if (remoteip) form.append("remoteip", remoteip);

  try {
    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (err) {
    console.error("Turnstile verification error:", err);
    return false;
  }
}

/** The client address Cloudflare should judge the token against. */
export function clientIp(headers: Headers): string | null {
  return headers.get("cf-connecting-ip") ?? headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}
