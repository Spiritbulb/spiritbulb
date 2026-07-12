"use client";
import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { safeNext } from "@/lib/auth/intent";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
type Status = 'idle' | 'submitting' | 'success' | 'error';

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export default function LoginClient() {
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [token, setToken] = useState('');
  const turnstileRef = useRef<TurnstileInstance>(null);

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
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Sign in to Spiritbulb</h1>
          <p className="text-sm text-muted-foreground">
            One login opens all four products.
          </p>
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
                options={{ theme: 'auto' }}
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
