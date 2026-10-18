import { cn } from "@/lib/utils";
import type { Product } from "@/lib/products";
import { StatusBadge } from "@/components/site/status-badge";
import { ActionButton } from "@/components/site/action-button";

/**
 * The top of a product page: the same band as the product's door on the
 * homepage, so the page reads as walking through that door. Live products are
 * a solid fill with ink text; preview and waitlist products are a tint.
 */
export function ProductHero({ product }: { product: Product }) {
  const live = product.status === "live";
  const tone = live ? "ink" : "default";

  return (
    <section
      className={cn("relative w-full overflow-hidden", live ? "text-ink" : "border-b-2 border-dashed")}
      style={
        live
          ? { backgroundColor: product.color }
          : {
              backgroundColor: `color-mix(in srgb, ${product.color} 12%, var(--background))`,
              borderColor: product.color,
            }
      }
    >
      {/* The door's verb as a watermark, bleeding off the bottom right. */}
      <p
        aria-hidden
        className="pointer-events-none absolute -bottom-[0.18em] -right-[0.04em] select-none font-display text-[clamp(8rem,30vw,22rem)] font-extrabold uppercase leading-none tracking-tight"
        style={{ opacity: live ? 0.09 : 0.14, color: live ? "var(--ink)" : product.color }}
      >
        {product.verb}.
      </p>

      <div className="container relative mx-auto space-y-7 px-4 pb-32 pt-14 md:px-6 md:pb-28 md:pt-20 lg:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <p className={cn("text-xs font-semibold uppercase tracking-widest", live ? "text-ink/70" : "text-muted-foreground")}>
            {product.verb} · {product.name}
          </p>
          <StatusBadge status={product.status} tone={tone} />
        </div>
        <h1 className="max-w-4xl font-display text-[clamp(2.75rem,7vw,5.5rem)] font-extrabold leading-[0.95] tracking-tight">
          {product.heading}
        </h1>
        <p className={cn("max-w-2xl text-lg leading-relaxed md:text-xl", live ? "text-ink/80" : "text-foreground/75")}>
          {product.intro}
        </p>
        <div className="flex flex-wrap items-start gap-3">
          <ActionButton action={product.primary} size="lg" tone={tone} />
          {product.secondary && <ActionButton action={product.secondary} size="lg" tone={tone} />}
        </div>
      </div>
    </section>
  );
}
