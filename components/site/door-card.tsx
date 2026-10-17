import { cn } from "@/lib/utils";
import type { Product } from "@/lib/products";
import { StatusBadge } from "@/components/site/status-badge";
import { ActionButton } from "@/components/site/action-button";

/**
 * One of the four doors. Live products get more room; preview and waitlist
 * products read as early access. Both follow from the status in config.
 */
export function DoorCard({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const featured = product.status === "live";

  return (
    <article
      aria-labelledby={`door-${product.slug}`}
      className={cn(
        "relative flex flex-col gap-4 overflow-hidden rounded-2xl border bg-card",
        featured ? "p-6 md:p-8" : "p-6",
        className
      )}
    >
      {/* The door's own colour, as a rule along the top edge. */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-1"
        style={{ backgroundColor: product.color }}
      />

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {product.verb}
        </p>
        <StatusBadge status={product.status} />
      </div>

      <h3
        id={`door-${product.slug}`}
        className={cn(
          "font-bold tracking-tight",
          featured ? "text-3xl md:text-4xl" : "text-2xl"
        )}
      >
        <a
          href={`/${product.slug}`}
          className="rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {product.name}
        </a>
      </h3>

      <p
        className={cn(
          "leading-relaxed text-muted-foreground",
          featured ? "text-base" : "text-sm"
        )}
      >
        {product.door}
      </p>

      <ActionButton action={product.primary} className="mt-auto pt-2" />
    </article>
  );
}
