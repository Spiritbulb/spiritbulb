import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Action, ActionKind } from "@/lib/products";
import { Tbd } from "@/components/site/tbd";

/**
 * Sign-up and preview buttons are solid. Waitlist and contact buttons are
 * outlined, so they never pass for a way into the product (plan §1).
 */
const KIND: Record<ActionKind, string> = {
  signup: "bg-foreground text-background hover:opacity-90",
  preview: "bg-foreground text-background hover:opacity-90",
  waitlist: "border border-border bg-transparent text-foreground hover:bg-accent",
  contact: "border border-border bg-transparent text-foreground hover:bg-accent",
};

/** The same rule on a solid door colour, where the page's own colours do not apply. */
const KIND_ON_INK: Record<ActionKind, string> = {
  signup: "bg-ink text-on-ink hover:opacity-90",
  preview: "bg-ink text-on-ink hover:opacity-90",
  waitlist: "border border-ink/30 bg-transparent text-ink hover:bg-ink/10",
  contact: "border border-ink/30 bg-transparent text-ink hover:bg-ink/10",
};

const SIZE = {
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-6 text-[15px]",
} as const;

/**
 * A button driven by an Action from config. A plain <a>, not next/link: some
 * targets are route handlers (/go/mcloud starts a session handoff), and a
 * prefetch must never run one.
 */
export function ActionButton({
  action,
  size = "md",
  showNote = true,
  tone = "default",
  className,
}: {
  action: Action;
  size?: keyof typeof SIZE;
  showNote?: boolean;
  /** "ink" on a solid door colour. */
  tone?: "default" | "ink";
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-start gap-2", className)}>
      <a
        href={action.href}
        className={cn(
          "inline-flex items-center gap-2 rounded-xl font-medium transition-[opacity,background-color] duration-150",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          (tone === "ink" ? KIND_ON_INK : KIND)[action.kind],
          SIZE[size]
        )}
      >
        {action.label}
        {(action.kind === "signup" || action.kind === "preview") && (
          <ArrowRight aria-hidden className="size-4" />
        )}
      </a>
      {action.tbd && <Tbd>{action.tbd}</Tbd>}
      {showNote && action.note && (
        <p className={cn("text-xs", tone === "ink" ? "text-ink/75" : "text-muted-foreground")}>
          {action.note}
        </p>
      )}
    </div>
  );
}
