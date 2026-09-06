"use client";
import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { safeNext } from "@/lib/auth/intent";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import LotusMark from "@/components/LotusMark";

type Status = 'idle' | 'submitting' | 'success' | 'error';

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.44c-.28 1.48-1.13 2.73-2.4 3.58v2.98h3.88c2.27-2.09 3.57-5.17 3.57-8.8z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.88-2.98c-1.08.72-2.45 1.16-4.05 1.16-3.11 0-5.74-2.1-6.68-4.92H1.32v3.07C3.29 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.32 14.35c-.24-.72-.38-1.49-.38-2.35s.14-1.63.38-2.35V6.58H1.32A11.98 11.98 0 0 0 0 12c0 1.93.46 3.76 1.32 5.42l4-3.07z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.94 1.19 15.24 0 12 0 7.31 0 3.29 2.7 1.32 6.58l4 3.07c.94-2.82 3.57-4.88 6.68-4.88z"
      />
    </svg>
  );
}

export default function LoginClient() {
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [token, setToken] = useState('');
  const turnstileRef = useRef<TurnstileInstance>(null);

  function signInWithGoogle() {
    setGoogleBusy(true);
    setError(null);
    // Server route builds the Google authorization URL (with PKCE + state)
    // and redirects. Never build the OAuth URL or hold the client secret here.
    const url = `/api/auth/google/start?next=${encodeURIComponent(next)}`;
    window.location.assign(url);
  }

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      setError('Please complete the verification challenge.');

      return;
    }

    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/request-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setBusy(false);
    if (!res.ok) {
      const d = await res.json().catch(() => null);
      setError(d?.error ?? "Could not send a code. Please try again.");
      // Token is single-use — reset the widget so the user can retry.
      turnstileRef.current?.reset();
      setToken('');
      return;
    }
    setStep("code");
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    setBusy(false);
    if (!res.ok) {
      const d = await res.json().catch(() => null);
      setError(d?.error ?? "That code did not work. Please try again.");
      return;
    }
    window.location.assign(next);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 md:py-20">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <LotusMark />
          <h1 className="text-2xl font-bold tracking-tight">Sign in to Spiritbulb</h1>
          <p className="text-sm text-muted-foreground">
           We&apos;ll send you a one-time code to your email address.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full gap-2"
          onClick={signInWithGoogle}
          disabled={googleBusy}
        >
          <GoogleIcon />
          {googleBusy ? "Redirecting" : "Continue with Google"}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with email
            </span>
          </div>
        </div>

        {step === "email" ? (
          <form onSubmit={sendCode} className="space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />

            {SITE_KEY && (
              <Turnstile
                ref={turnstileRef}
                siteKey={SITE_KEY}
                onSuccess={(t) => {
                  setToken(t);
                }}
                onExpire={() => setToken('')}
                onError={() => setToken('')}
                // 'flexible' lets the widget fill its container, so it lines up
                // with the input and button instead of sitting at a fixed 300px.
                options={{ theme: 'auto', size: 'flexible' }}
              />
            )}
            <Button type="submit" size="lg" className="w-full" disabled={busy || (!!SITE_KEY && !token)}>
              {busy ? "Sending" : "Send code"}
            </Button>
          </form>
        ) : (
          <form onSubmit={verify} className="space-y-3">
            <input
              inputMode="numeric"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter the code we emailed"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? "Verifying" : "Verify"}
            </Button>
          </form>
        )}

        {error && <p className="text-sm text-destructive text-center">{error}</p>}
      </div>
    </main>
  );
}