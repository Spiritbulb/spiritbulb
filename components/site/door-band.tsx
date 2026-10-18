import { cn } from "@/lib/utils";
import type { Product } from "@/lib/products";
import { StatusBadge } from "@/components/site/status-badge";
import { ActionButton } from "@/components/site/action-button";

/**
 * One of the four doors as a full-width band. The status shows in the band
 * itself: a live door is filled with its colour and its verb is solid; an
 * early-access door (preview, waitlist) is a tint with its verb faded, not
 * filled in yet. (Not an outline: the display font's contours overlap, and a
 * text stroke draws every overlap.) Both follow from the status in lib/products.ts.
 */
export function DoorBand({ product }: { product: Product }) {
  const live = product.status === "live";
  const headingId = `door-${product.slug}`;

  return (
    <section
      aria-labelledby={headingId}
      className={cn("relative w-full", live ? "text-ink" : "border-t-2 border-dashed")}
      style={
        live
          ? { backgroundColor: product.color }
          : {
              backgroundColor: `color-mix(in srgb, ${product.color} 12%, var(--background))`,
              borderColor: product.color,
            }
      }
    >
      <div className="container mx-auto grid gap-6 px-4 py-10 md:grid-cols-[1.25fr_1fr] md:items-end md:gap-10 md:px-6 md:py-14 lg:px-8">
        {/* The verb is the poster; the product name below is the real heading. */}
        <p
          aria-hidden
          className="font-display text-[clamp(4.5rem,17vw,11rem)] font-extrabold uppercase leading-[0.82] tracking-tight"
          style={
            live
              ? undefined
              : { color: `color-mix(in srgb, ${product.color} 45%, var(--background))` }
          }
        >
          {product.verb}.
        </p>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <h3 id={headingId} className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              <a
                href={`/${product.slug}`}
                className="rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
              >
                {product.name}
              </a>
            </h3>
            <StatusBadge status={product.status} tone={live ? "ink" : "default"} />
          </div>
          <p className={cn("max-w-md text-base leading-relaxed md:text-lg", live ? "text-ink/80" : "text-foreground/75")}>
            {product.door}
          </p>
          <ActionButton action={product.primary} tone={live ? "ink" : "default"} size="lg" />
        </div>
      </div>
    </section>
  );
}
