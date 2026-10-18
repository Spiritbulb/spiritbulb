import { cn } from "@/lib/utils";
import { STATUS_LABEL, type ProductStatus } from "@/lib/products";
import type { OfferingStatus } from "@/lib/site";

export type Status = ProductStatus | OfferingStatus;

const LABEL: Record<Status, string> = {
  ...STATUS_LABEL,
  "on-request": "On request",
  coming: "Coming",
  "by-approval": "By approval",
};

const TONE: Record<Status, string> = {
  live: "border-status-live/30 bg-status-live/10 text-status-live",
  preview: "border-status-preview/30 bg-status-preview/10 text-status-preview",
  waitlist: "border-status-waitlist/30 bg-status-waitlist/10 text-status-waitlist",
  "on-request":
    "border-status-on-request/30 bg-status-on-request/10 text-status-on-request",
  "by-approval":
    "border-status-on-request/30 bg-status-on-request/10 text-status-on-request",
  // Dashed and untinted: coming things read as not here yet.
  coming: "border-dashed border-status-coming/60 text-status-coming",
};

/**
 * On a solid door colour or an inverted band the status colours lose their
 * contrast, so the badge falls back to that surface's own text colour.
 */
export type BadgeTone = "default" | "ink" | "inverse";

const SURFACE: Record<Exclude<BadgeTone, "default">, string> = {
  ink: "border-ink/25 bg-ink/10 text-ink",
  inverse: "border-background/30 bg-background/10 text-background",
};

/** The one badge for product and offering status. Its text comes from config, never from a page. */
export function StatusBadge({
  status,
  tone = "default",
  className,
}: {
  status: Status;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tone === "default" ? TONE[status] : SURFACE[tone],
        status === "coming" && "border-dashed",
        className
      )}
    >
      {status === "live" && (
        <span aria-hidden className="size-1.5 rounded-full bg-current" />
      )}
      {LABEL[status]}
    </span>
  );
}
