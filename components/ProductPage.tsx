"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import LotusMark from "@/components/LotusMark";
import { SITE, type Product } from "@/lib/products";

// mcloud exposes the beta-join API (adds the email to the shared
// beta@spiritbulb.org Google Group wired to Play closed testing) and returns
// the Nuru Play opt-in URL. Only members of that group can install the beta.
const JOIN_API = "https://www.mcloud.co.ke/api/beta/join";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SignupForm({ product }: { product: Product }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState<{ optInUrl: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, start] = useTransition();

  const isBeta = product.status === "beta";

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
        const res = await fetch(JOIN_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: trimmed,
            source: `spiritbulb-${product.slug}`,
          }),
        });
        const data = (await res.json()) as {
          ok?: boolean;
          optInUrl?: string | null;
          error?: string;
        };
        if (res.ok && data.ok) setDone({ optInUrl: data.optInUrl ?? null });
        else setError(data.error ?? "Something went wrong. Please try again.");
      } catch {
        setError("Could not reach the server. Please try again.");
      }
    });
  };

  const inputCls = cn(
    "h-11 w-full rounded-xl px-4 text-[14px] text-foreground placeholder:text-muted-foreground/60",
    "border border-border bg-foreground/5",
    "transition-all duration-150 focus:border-foreground/30 focus:bg-foreground/[0.08] focus:outline-none"
  );

  if (done) {
    return (
      <div className="space-y-3 rounded-xl border border-border bg-foreground/5 px-4 py-4">
        <p className="text-[14px] text-foreground">You are on the list.</p>
        {isBeta && done.optInUrl && (
          <a
            href={done.optInUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-medium text-background transition-opacity hover:opacity-90"
            style={{ backgroundColor: product.color }}
          >
            Opt in to the Android beta
            <ArrowUpRight className="h-4 w-4" />
          </a>
        )}
        <p className="text-[12px] text-muted-foreground">
          {isBeta
            ? "Open this on the Android device you will test with, signed in to the Google account on this email."
            : `We will email you when ${product.name} opens.`}
        </p>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(null);
          }}
          placeholder={isBeta ? "you@gmail.com" : "you@example.com"}
          aria-label="Email address"
          className={inputCls}
          required
        />
        <button
          type="submit"
          disabled={isPending}
          className="h-11 shrink-0 rounded-xl px-6 text-[14px] font-medium text-background transition-opacity duration-150 hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: product.color }}
        >
          {isPending ? "Joining" : isBeta ? "Join the beta" : "Keep me posted"}
        </button>
      </form>
      {error && <p className="mt-2 text-[13px] text-destructive">{error}</p>}
      {isBeta && (
        <p className="mt-3 text-[12px] text-muted-foreground/60">
          Use a Google account. The Android beta installs through Google Play, so
          we can only invite Google accounts.
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

      <div className="container relative z-10 mx-auto max-w-2xl px-6 py-28 md:px-12 md:py-36">
        <FadeIn className="space-y-5">
          {/* Wayfinding: this product's petal is lit, the rest of the ecosystem
              sits behind it in grey. The link is absolute because on a product
              subdomain "/" is this same page, not the Spiritbulb home. */}
          <Link
            href={SITE}
            aria-label="Spiritbulb home"
            className="inline-block rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
          >
            <LotusMark active={product.slug} className="w-[112px]" />
          </Link>

          <p
            className="text-[12px] font-semibold uppercase tracking-widest"
            style={{ color: product.color }}
          >
            {product.name}
          </p>

          <h1 className="text-[2.8rem] font-bold leading-[1.04] tracking-tight md:text-[3.5rem]">
            {product.heading}
          </h1>

          <p className="max-w-lg text-[15px] leading-relaxed text-muted-foreground">
            {product.intro}
          </p>

          <p className="text-[13px] text-muted-foreground/70">
            {product.statusLine}
          </p>
        </FadeIn>

        <FadeIn delay={0.1} className="mt-10">
          {product.slug === "mcloud" ? (
            // MCloud is the one product we can hand a session to. Route through
            // /go/mcloud (same tab, so cookies travel): signed-in visitors land
            // in MCloud already authed via the handoff, signed-out ones go to
            // MCloud's login. Not target="_blank" and not the raw external href.
            <a
              href="/go/mcloud?to=/"
              className="inline-flex h-11 items-center gap-2 rounded-xl px-6 text-[14px] font-medium text-background transition-opacity hover:opacity-90"
              style={{ backgroundColor: product.color }}
            >
              {product.external?.label ?? "Go to MCloud"}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          ) : product.external ? (
            <a
              href={product.external.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-xl px-6 text-[14px] font-medium text-background transition-opacity hover:opacity-90"
              style={{ backgroundColor: product.color }}
            >
              {product.external.label}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          ) : (
            <SignupForm product={product} />
          )}
        </FadeIn>

        <FadeIn delay={0.2} className="mt-14">
          <ul className="flex flex-wrap gap-x-8 gap-y-3">
            {product.facts.map((f) => (
              <li
                key={f}
                className="flex items-center gap-2 text-[13px] text-muted-foreground"
              >
                <span
                  aria-hidden
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: product.color }}
                />
                {f}
              </li>
            ))}
          </ul>
        </FadeIn>
      </div>
    </div>
  );
}
