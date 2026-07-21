// AES-256-GCM seal/open for the sb_session cookie. Encrypts (not just signs)
// because the payload holds a refresh token, a long-lived bearer credential.
// Uses Node's built-in webcrypto, so no runtime dependency.
import { webcrypto as crypto } from "node:crypto";

export type SessionData = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // epoch ms
};

function b64urlEncode(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64url");
}
function b64urlDecode(s: string): Uint8Array {
  return new Uint8Array(Buffer.from(s, "base64url"));
}

async function importKey(): Promise<CryptoKey> {
  const raw = process.env.SESSION_ENC_KEY;
  if (!raw) throw new Error("SESSION_ENC_KEY is not set");
  const keyBytes = new Uint8Array(Buffer.from(raw, "base64"));
  if (keyBytes.byteLength !== 32) {
    throw new Error("SESSION_ENC_KEY must be 32 bytes (base64-encoded)");
  }
  return crypto.subtle.importKey("raw", keyBytes, "AES-GCM", false, ["encrypt", "decrypt"]);
}

export async function sealSession(data: SessionData): Promise<string> {
  const key = await importKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify(data));
  const ct = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext),
  );
  return `${b64urlEncode(iv)}.${b64urlEncode(ct)}`;
}

export async function openSession(sealed: string): Promise<SessionData | null> {
  // A missing key is a config error (throw); a bad blob is an untrusted input (null).
  const key = await importKey();
  try {
    const [ivPart, ctPart] = sealed.split(".");
    if (!ivPart || !ctPart) return null;
    const iv = b64urlDecode(ivPart);
    const ct = b64urlDecode(ctPart);
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
    return JSON.parse(new TextDecoder().decode(pt)) as SessionData;
  } catch {
    return null; // tamper, truncation, or non-JSON plaintext
  }
}
