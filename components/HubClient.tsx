"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import LotusNav, { LEAVES, type Leaf } from "@/components/LotusNav";
import { STATUS_LABEL as STATUS_COPY } from "@/lib/products";

/** Shown when no petal is being pointed at. */
function Resting({ litCount }: { litCount: number }) {
  return (
    <div className="space-y-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">
        The ecosystem
      </p>
      <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
        Five petals, one stem.
      </h2>
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
        The centre is Spiritbulb. The four around it are the products, and a
        petal is coloured in once you can actually use it. {litCount} of four are
        open today. Choose one to see what it does.
      </p>
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
        Payments and real participation live in the mobile apps. On the web you
        can look around.
      </p>
    </div>
  );
}

function Panel({ leaf }: { leaf: Leaf }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{
            backgroundColor: leaf.lit ? leaf.color : "transparent",
            border: leaf.lit ? undefined : "1.5px solid var(--border-color)",
          }}
          aria-hidden
        />
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
          {STATUS_COPY[leaf.status]}
        </span>
      </div>

      <h2
        className="text-3xl font-bold tracking-tight md:text-4xl"
        style={{ color: leaf.lit ? leaf.color : undefined }}
      >
        {leaf.name}
      </h2>

      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
        {leaf.blurb}
      </p>

      {leaf.href ? (
        <a
          href={leaf.href}
          {...(leaf.external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-foreground/[0.04] px-4 py-2.5 text-[13px] font-medium transition-colors hover:bg-foreground/[0.08] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          {leaf.action}
          {leaf.external ? (
            <ArrowUpRight className="h-4 w-4" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
        </a>
      ) : (
        // Nothing to click yet. Say so rather than offering a dead button.
        <p className="text-[13px] text-muted-foreground/70">{leaf.action}</p>
      )}
    </div>
  );
}

export default function HubClient({ initialApp }: { initialApp?: string }) {
  const reduce = useReducedMotion();
  // If login sent someone here for a specific product, start on that petal.
  const seeded = LEAVES.some((l) => l.id === initialApp) ? initialApp! : null;
  const [activeId, setActiveId] = useState<string | null>(seeded);

  const active = LEAVES.find((l) => l.id === activeId) ?? null;
  const litCount = LEAVES.filter((l) => l.lit).length;

  return (
    <main className="min-h-[100dvh] bg-background text-foreground">
      <div className="container mx-auto px-4 py-14 md:px-8 md:py-20">
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60"
        >
          Welcome back
        </motion.p>

        <div className="mt-8 grid grid-cols-1 items-center gap-12 lg:mt-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          {/* The lotus is the navigation. */}
          <div className="order-2 lg:order-1">
            <div className="mx-auto w-full max-w-[560px]">
              <LotusNav activeId={activeId} onFocusLeaf={setActiveId} />
            </div>

            {/* The petals carry no text, so the key lives here. It doubles as a
                plain list for keyboard and touch. */}
            <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3">
              {LEAVES.map((leaf) => {
                const Item = leaf.href ? "a" : "span";
                return (
                  <li key={leaf.id}>
                    <Item
                      {...(leaf.href
                        ? {
                            href: leaf.href,
                            ...(leaf.external
                              ? {
                                  target: "_blank",
                                  rel: "noopener noreferrer",
                                }
                              : {}),
                          }
                        : { tabIndex: 0 })}
                      onMouseEnter={() => setActiveId(leaf.id)}
                      onMouseLeave={() => setActiveId(null)}
                      onFocus={() => setActiveId(leaf.id)}
                      onBlur={() => setActiveId(null)}
                      className="flex items-center gap-2 rounded-md px-1 py-0.5 text-[12px] font-semibold uppercase tracking-[0.16em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                      style={{
                        color: leaf.lit ? leaf.color : undefined,
                        opacity: leaf.lit ? 1 : 0.5,
                      }}
                    >
                      <span
                        aria-hidden
                        className="inline-block h-1.5 w-1.5 rounded-full"
                        style={{
                          backgroundColor: leaf.lit
                            ? leaf.color
                            : "currentColor",
                        }}
                      />
                      {leaf.name}
                    </Item>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* One panel, driven by whichever petal you are on. */}
          <div className="order-1 min-h-[280px] lg:order-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={active?.id ?? "resting"}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                {active ? (
                  <Panel leaf={active} />
                ) : (
                  <Resting litCount={litCount} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}
