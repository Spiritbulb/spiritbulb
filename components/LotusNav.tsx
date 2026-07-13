"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import PATHS from "./lotus-paths.json";

/**
 * The five-leaf lotus as navigation.
 *
 * Geometry in lotus-paths.json is the real brand mark (public/logo-sb.svg),
 * split into its five petals by pairing each orange outer contour with the
 * black inner one that sits inside it. Each petal is two filled contours, and
 * that doubling is what makes it read as the Spiritbulb lotus rather than a
 * generic flower.
 *
 * The source SVG is a bitmap trace: every petal is ~1,200 one-pixel `L` steps,
 * which read as jagged once the mark is drawn larger than a favicon. The paths
 * here are simplified (Douglas-Peucker) and re-fitted as curves, keeping the
 * sharp turns as hard corners so the petal tips stay pointed. Regenerate the
 * same way if the mark changes.
 *
 * Four petals are products. The upright centre petal is Spiritbulb itself. A
 * petal carries its product's colour only when the product is actually
 * reachable, so the flower fills in as the ecosystem ships.
 *
 * The mark paints at x 121..1799, y 0..1080, and the viewBox is fitted to that.
 * The petals carry no text of their own: they are concave crescents, so labels
 * placed against them collide at some breakpoint or another. The panel beside
 * the flower names whichever product is active instead.
 */

export type LeafStatus = "live" | "open" | "preview" | "soon";

export type Leaf = {
  id: keyof typeof PATHS;
  name: string;
  color: string;
  status: LeafStatus;
  /** False for products you cannot really use yet. Keeps the flower honest. */
  lit: boolean;
  /** Absent while a product has nowhere to go. An unlit petal is not a link. */
  href?: string;
  external?: boolean;
  blurb: string;
  /** The button label, or the reason there is no button. */
  action: string;
};

export const LEAVES: Leaf[] = [
  {
    id: "nuru",
    name: "Nuru",
    color: "#14B8A6",
    status: "open",
    lit: true,
    href: "/nuru",
    blurb:
      "A study companion that chats with your notes. Open to students in the beta.",
    action: "Go to Nuru",
  },
  {
    id: "reach",
    name: "Reach",
    color: "#E0A030",
    status: "preview",
    lit: false,
    blurb:
      "Storefronts and fulfilment for Kenyan merchants. Live for 13 merchants in Nakuru, but not on the web yet.",
    action: "Opens here when the web view is ready",
  },
  {
    id: "mcloud",
    name: "MCloud",
    color: "#38B6FF",
    status: "live",
    lit: true,
    href: "https://mcloud.co.ke",
    external: true,
    blurb:
      "Apps and cloud services for merchants, brokers, and NGOs. Runs on its own site.",
    action: "Open mcloud.co.ke",
  },
  {
    id: "tufike",
    name: "Tufike",
    color: "#D6453D",
    status: "soon",
    lit: false,
    blurb: "Community events and venues, pop-up style. Still being built.",
    action: "Opens here when it is ready",
  },
];

const CORE_COLOR = "#F0803A";

const STATUS_COPY: Record<LeafStatus, string> = {
  live: "Live",
  open: "Open",
  preview: "Preview",
  soon: "Not open yet",
};

/** Petals bloom outward from the centre. */
const ORDER = ["core", "nuru", "reach", "mcloud", "tufike"] as const;

export default function LotusNav({
  onFocusLeaf,
  activeId,
}: {
  onFocusLeaf: (id: string | null) => void;
  activeId: string | null;
}) {
  const reduce = useReducedMotion();
  const delayOf = (id: string) =>
    reduce ? 0 : ORDER.indexOf(id as (typeof ORDER)[number]) * 0.12;

  // Opacity only. A scale here would transform the petals' CTM and fight the
  // viewBox, so the "opening" read comes from the stagger, not from growth.
  const bloom = (id: string) => ({
    initial: reduce ? false : { opacity: 0 },
    animate: { opacity: 1 },
    transition: reduce
      ? { duration: 0 }
      : {
          duration: 0.55,
          delay: delayOf(id),
          ease: [0.22, 1, 0.36, 1] as const,
        },
  });

  return (
    <svg
      viewBox="91 -30 1738 1140"
      className="block h-auto w-full"
      role="group"
      aria-label="Spiritbulb products"
      onMouseLeave={() => onFocusLeaf(null)}
    >
      <title>The Spiritbulb lotus. Each petal is a product.</title>

      {/* Centre petal: Spiritbulb. Always inked, never a link, and kept quiet
          so it does not outshout the products. */}
      <motion.g
        {...bloom("core")}
        className={cn(
          "transition-opacity duration-300",
          activeId ? "opacity-25" : "opacity-70"
        )}
      >
        <path
          d={PATHS.core.outer.d}
          transform={PATHS.core.outer.t}
          fill={CORE_COLOR}
        />
        <path
          d={PATHS.core.inner.d}
          transform={PATHS.core.inner.t}
          fill={CORE_COLOR}
          opacity={0.4}
        />
      </motion.g>

      {LEAVES.map((leaf) => {
        const active = activeId === leaf.id;
        const dim = activeId !== null && !active;
        const p = PATHS[leaf.id];

        // A petal with nowhere to go is not a link. It still takes focus and
        // hover so you can read what it will be.
        const Petal = leaf.href ? "a" : "g";
        const petalProps = leaf.href
          ? {
              href: leaf.href,
              ...(leaf.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {}),
            }
          : { tabIndex: 0, role: "img" as const };

        return (
          <motion.g key={leaf.id} {...bloom(leaf.id)}>
            <Petal
              {...petalProps}
              aria-label={`${leaf.name}. ${STATUS_COPY[leaf.status]}. ${leaf.blurb}`}
              onMouseEnter={() => onFocusLeaf(leaf.id)}
              onFocus={() => onFocusLeaf(leaf.id)}
              onBlur={() => onFocusLeaf(null)}
              className={cn(
                "transition-opacity duration-300 focus:outline-none",
                leaf.href ? "cursor-pointer" : "cursor-default",
                dim ? "opacity-30" : "opacity-100"
              )}
            >
              {/* Invisible hit shape. The petal outlines are thin, so without a
                  filled target most of the petal would not take a hover. */}
              <path
                d={p.outer.d}
                transform={p.outer.t}
                fill="transparent"
                stroke="transparent"
                strokeWidth={40}
              />

              {/* Outer contour. Lit petals carry the product colour. */}
              <path
                d={p.outer.d}
                transform={p.outer.t}
                fill={leaf.lit ? leaf.color : "currentColor"}
                className={cn(
                  "pointer-events-none transition-opacity duration-300",
                  !leaf.lit && "text-muted-foreground"
                )}
                opacity={leaf.lit ? 1 : active ? 0.55 : 0.3}
              />

              {/* Inner contour, the doubling that makes it the Spiritbulb mark. */}
              <path
                d={p.inner.d}
                transform={p.inner.t}
                fill={leaf.lit ? leaf.color : "currentColor"}
                className={cn(
                  "pointer-events-none transition-opacity duration-300",
                  !leaf.lit && "text-muted-foreground"
                )}
                opacity={leaf.lit ? (active ? 0.6 : 0.38) : 0.2}
              />
            </Petal>
          </motion.g>
        );
      })}
    </svg>
  );
}
