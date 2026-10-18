"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import LotusMark from "@/components/LotusMark";
import { StatusBadge } from "@/components/site/status-badge";
import { ActionButton } from "@/components/site/action-button";
import type { Product } from "@/lib/products";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Rises in with CSS, so the content is visible without JavaScript. */
function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div className={cn("fade-up", className)} style={{ animationDelay: `${delay}s` }}>
      {children}
    </div>
  );
}

/**
 * The waitlist, on the page itself. Posts to /api/waitlist, which stores the
 * signup with MCloud's partner waitlist. One field: the fewer, the better.
 */
function WaitlistForm({ product }: { product: Product }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, start] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    start(async () => {
      try {
        const res = await fetch("/api/waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmed }),
        });
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        if (res.ok) setDone(true);
        else setError(data.error ?? "Something went wrong. Please try again.");
      } catch {
        setError("Could not reach the server. Please try again.");
      }
    });
  };

  if (done) {
    return (
      <div className="rounded-xl border border-border bg-foreground/5 px-4 py-4">
        <p className="text-[14px] text-foreground">
          You are on the {product.name} waitlist.
        </p>
        {product.primary.note && (
          <p className="mt-1 text-[12px] text-muted-foreground">
            {product.primary.note}
          </p>
        )}
      </div>
    );
  }

  return (
    <div id="waitlist" className="scroll-mt-24">
      <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(null);
          }}
          placeholder="you@example.com"
          aria-label="Email address"
          autoComplete="email"
          className={cn(
            "h-11 w-full rounded-xl px-4 text-[14px] text-foreground placeholder:text-muted-foreground/60",
            "border border-border bg-foreground/5",
            "transition-all duration-150 focus:border-foreground/30 focus:bg-foreground/[0.08] focus:outline-none"
          )}
          required
        />
        {/* Outlined like every waitlist button: joining a list is not signing up. */}
        <button
          type="submit"
          disabled={isPending}
          className="h-11 shrink-0 rounded-xl border border-border px-6 text-[14px] font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-60"
        >
          {isPending ? "Joining" : product.primary.label}
        </button>
      </form>
      {error && <p className="mt-2 text-[13px] text-destructive">{error}</p>}
      {product.primary.note && (
        <p className="mt-3 text-[12px] text-muted-foreground">
          {product.primary.note}
        </p>
      )}
    </div>
  );
}

export default function ProductPage({ product }: { product: Product }) {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      {/* A wash of the product's own colour, so each page feels like its petal. */}
      <div className="pointer-events-none fixed inset-0" aria-hidden>
        <div
          className="absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full blur-[120px]"
          style={{ backgroundColor: product.color, opacity: 0.14 }}
        />
      </div>

      <div className="container relative z-10 mx-auto max-w-2xl px-6 py-20 md:px-12 md:py-28">
        <FadeIn className="space-y-5">
          {/* Wayfinding: this product's petal is lit, the rest of the ecosystem
              sits behind it in grey. */}
          <LotusMark active={product.slug} className="w-[112px]" />

          <div className="flex flex-wrap items-center gap-3">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
              {product.verb} · {product.name}
            </p>
            <StatusBadge status={product.status} />
          </div>

          <h1 className="font-display text-[2.4rem] font-bold leading-[1.06] tracking-tight md:text-[3.25rem]">
            {product.heading}
          </h1>

          <p className="max-w-lg text-[15px] leading-relaxed text-muted-foreground">
            {product.intro}
          </p>
        </FadeIn>

        <FadeIn delay={0.1} className="mt-10 flex flex-wrap items-start gap-3">
          {product.primary.kind === "waitlist" ? (
            <WaitlistForm product={product} />
          ) : (
            <ActionButton action={product.primary} size="lg" />
          )}
          {product.secondary && (
            <ActionButton action={product.secondary} size="lg" />
          )}
        </FadeIn>
      </div>
    </div>
  );
}
