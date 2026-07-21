// Server-side WorkOS token refresh. Spiritbulb is a server, so it cannot use
// mobile's client-side AuthSession.refreshAsync; it POSTs the refresh token to
// WorkOS's token endpoint directly. This hits api.workos.com, NOT MCloud, so the
// canonical-host/secret-header gotcha for the partner routes does not apply here.
import "server-only";

const TOKEN_URL = "https://api.workos.com/user_management/authenticate";

export async function refreshWorkOSTokens(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string; expiresAt: number } | null> {
  const clientId = process.env.WORKOS_CLIENT_ID;
  if (!clientId) throw new Error("WORKOS_CLIENT_ID is not set");
  try {
    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
      redirect: "error",
    });
    if (!res.ok) return null;
    const d = (await res.json()) as {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
    };
    if (!d.access_token || !d.refresh_token) return null;
    return {
      accessToken: d.access_token,
      refreshToken: d.refresh_token,
      expiresAt: Date.now() + (d.expires_in ?? 0) * 1000,
    };
  } catch {
    return null;
  }
}
