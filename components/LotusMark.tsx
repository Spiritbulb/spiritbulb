"use client";

import { motion, useReducedMotion } from "framer-motion";
import PATHS from "./lotus-paths.json";

/**
 * The five-leaf lotus, ambient.
 *
 * The hero's job is to state the pitch, not to report status, so every petal
 * carries its full product colour here. The interactive, status-aware version
 * of the same geometry lives in LotusNav and is used on the signed-in hub.
 *
 * Shares lotus-paths.json with LotusNav; see that file's header for how the
 * geometry is derived from public/logo-sb.svg.
 */

const PETALS = [
  { id: "core", color: "#F0803A" },
  { id: "nuru", color: "#14B8A6" },
  { id: "reach", color: "#E0A030" },
  { id: "mcloud", color: "#38B6FF" },
  { id: "tufike", color: "#D6453D" },
] as const;

export default function LotusMark({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();

  return (
    <svg
      viewBox="91 -30 1738 1140"
      className={`block h-auto w-full ${className}`}
      role="img"
      aria-label="The Spiritbulb lotus. One petal for each product, and one for Spiritbulb."
    >
      {PETALS.map((petal, i) => (
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
            fill={petal.color}
          />
          <path
            d={PATHS[petal.id].inner.d}
            transform={PATHS[petal.id].inner.t}
            fill={petal.color}
            opacity={0.42}
          />
        </motion.g>
      ))}
    </svg>
  );
}
