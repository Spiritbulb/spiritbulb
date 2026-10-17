"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import PATHS from "./lotus-paths.json";
import { PRODUCTS, STATUS_LABEL, type ProductStatus } from "@/lib/products";

/**
 * The five-leaf lotus as navigation.
 *
 * Geometry in lotus-paths.json is the brand mark (public/lotus.svg), split
 * into its five petals by pairing each dark gold outer contour with the light
 * gold inner one that sits inside it. Each petal is two filled contours, and
 * that doubling is what makes it read as the Spiritbulb lotus rather than a
 * generic flower.
 *
 * The paths are copied verbatim from the SVG, in its own coordinates, so there
 * are no per-petal transforms. The source's clip paths only trim each petal to
 * its own bounding box and are dropped. If the mark changes, re-split it the
 * same way: petal by position, outer and inner by fill.
 *
 * Four petals are products. The upright centre petal is Spiritbulb itself. A
 * petal carries its product's colour only when the product is actually
 * reachable, so the flower fills in as the ecosystem ships.
 *
 * The mark paints at x 0..1500, y 267..1233, and the viewBox is fitted to that.
 * The petals carry no text of their own: they are concave crescents, so labels
 * placed against them collide at some breakpoint or another. The panel beside
 * the flower names whichever product is active instead.
 */

export type LeafStatus = ProductStatus;

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

/**
 * One petal per product, straight from the status config. A petal links to
 * the product's primary action, or to its page while that action is still TBD.
 */
export const LEAVES: Leaf[] = PRODUCTS.map((p) => {
  const ready = !p.primary.tbd;
  return {
    id: p.slug,
    name: p.name,
    color: p.color,
    status: p.status,
    lit: p.status !== "waitlist",
    href: ready ? p.primary.href : `/${p.slug}`,
    // The MCloud handoff leaves for mcloud.co.ke, so it opens beside the hub.
    external: ready && p.primary.href.startsWith("/go/"),
    blurb: p.door,
    action: ready ? p.primary.label : `Read about ${p.name}`,
  };
});

const CORE_COLOR = "var(--brand)";

const STATUS_COPY = STATUS_LABEL;

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
      viewBox="-10 255 1520 990"
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
          style={{ fill: CORE_COLOR }}
        />
        <path
          d={PATHS.core.inner.d}
          style={{ fill: CORE_COLOR }}
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
                fill="transparent"
                stroke="transparent"
                strokeWidth={40}
              />

              {/* Outer contour. Lit petals carry the product colour. */}
              <path
                d={p.outer.d}
                style={{ fill: leaf.lit ? leaf.color : "currentColor" }}
                className={cn(
                  "pointer-events-none transition-opacity duration-300",
                  !leaf.lit && "text-muted-foreground"
                )}
                opacity={leaf.lit ? 1 : active ? 0.55 : 0.3}
              />

              {/* Inner contour, the doubling that makes it the Spiritbulb mark. */}
              <path
                d={p.inner.d}
                style={{ fill: leaf.lit ? leaf.color : "currentColor" }}
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
