"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import PATHS from "./lotus-paths.json";

/**
 * The five-leaf lotus, ambient.
 *
 * With no `active`, every petal carries its full product colour: the hero's job
 * is to state the pitch, not to report status.
 *
 * With `active`, the mark becomes wayfinding for a product page. That product's
 * petal keeps its colour and the other three drop back to grey, so the page
 * shows you where you are in the ecosystem. The centre petal is Spiritbulb
 * itself, not a product, so it always stays inked.
 *
 * The interactive, status-aware version of the same geometry lives in LotusNav
 * and is used on the signed-in hub. Shares lotus-paths.json with it; see that
 * file's header for how the geometry is derived from public/logo-sb.svg.
 */

const PETALS = [
  { id: "core", color: "#F0803A" },
  { id: "nuru", color: "#14B8A6" },
  { id: "reach", color: "#E0A030" },
  { id: "mcloud", color: "#38B6FF" },
  { id: "tufike", color: "#D6453D" },
] as const;

export type PetalId = (typeof PETALS)[number]["id"];

export default function LotusMark({
  className = "",
  active,
}: {
  className?: string;
  /** Colour only this product's petal. The centre petal stays inked regardless. */
  active?: Exclude<PetalId, "core">;
}) {
  const reduce = useReducedMotion();

  const label = active
    ? `The Spiritbulb lotus, with the ${active} petal lit.`
    : "The Spiritbulb lotus. One petal for each product, and one for Spiritbulb.";

  return (
    <svg
      viewBox="91 -30 1738 1140"
      className={cn("block h-auto w-full", className)}
      role="img"
      aria-label={label}
    >
      {PETALS.map((petal, i) => {
        // The centre petal is Spiritbulb, so it is never one of the greyed out
        // products. Everything else dims unless it is the page you are on.
        const lit = !active || petal.id === "core" || petal.id === active;

        return (
          <motion.g
            key={petal.id}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={
              reduce
                ? { duration: 0 }
                : {
                    duration: 0.7,
                    // Petals arrive outward from the centre, so it reads as opening.
                    delay: i * 0.14,
                    ease: [0.22, 1, 0.36, 1],
                  }
            }
          >
            <path
              d={PATHS[petal.id].outer.d}
              transform={PATHS[petal.id].outer.t}
              fill={lit ? petal.color : "currentColor"}
              className={lit ? undefined : "text-muted-foreground"}
              opacity={lit ? 1 : 0.3}
            />
            <path
              d={PATHS[petal.id].inner.d}
              transform={PATHS[petal.id].inner.t}
              fill={lit ? petal.color : "currentColor"}
              className={lit ? undefined : "text-muted-foreground"}
              opacity={lit ? 0.42 : 0.18}
            />
          </motion.g>
        );
      })}
    </svg>
  );
}
