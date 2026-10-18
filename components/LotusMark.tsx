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
 * file's header for how the geometry is derived from public/lotus.svg.
 */

// Design tokens from app/globals.css, so the mark follows the site's colours.
const PETALS = [
  { id: "core", color: "var(--brand)" },
  { id: "nuru", color: "var(--nuru)" },
  { id: "reach", color: "var(--reach)" },
  { id: "mcloud", color: "var(--mcloud)" },
  { id: "tufike", color: "var(--tufike)" },
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
  const label = active
    ? `The Spiritbulb lotus, with the ${active} petal lit.`
    : "The Spiritbulb lotus. One petal for each product, and one for Spiritbulb.";

  return (
    <svg
      viewBox="-10 255 1520 990"
      className={cn("block h-auto w-full", className)}
      role="img"
      aria-label={label}
    >
      {PETALS.map((petal, i) => {
        // The centre petal is Spiritbulb, so it is never one of the greyed out
        // products. Everything else dims unless it is the page you are on.
        const lit = !active || petal.id === "core" || petal.id === active;

        return (
          // A CSS animation, not framer-motion: it runs without JavaScript, so
          // the mark is never stuck invisible waiting for hydration. Petals
          // arrive outward from the centre, so it reads as opening.
          <g
            key={petal.id}
            className="petal-in"
            style={{ animationDelay: `${i * 0.14}s` }}
          >
            <path
              d={PATHS[petal.id].outer.d}
              style={{ fill: lit ? petal.color : "currentColor" }}
              className={lit ? undefined : "text-muted-foreground"}
              opacity={lit ? 1 : 0.3}
            />
            <path
              d={PATHS[petal.id].inner.d}
              style={{ fill: lit ? petal.color : "currentColor" }}
              className={lit ? undefined : "text-muted-foreground"}
              opacity={lit ? 0.42 : 0.18}
            />
          </g>
        );
      })}
    </svg>
  );
}
