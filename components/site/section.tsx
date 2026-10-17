import { cn } from "@/lib/utils";

/**
 * The page section every site page is built from: one container width, one
 * vertical rhythm, an optional eyebrow, heading and intro. Headings are h2 by
 * default; pass `as="h1"` for the page's first section.
 */
export function Section({
  id,
  eyebrow,
  title,
  intro,
  as: Heading = "h2",
  bordered = true,
  className,
  children,
}: {
  id?: string;
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  intro?: React.ReactNode;
  as?: "h1" | "h2";
  bordered?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  const headingId = id ? `${id}-heading` : undefined;

  return (
    <section
      id={id}
      aria-labelledby={title ? headingId : undefined}
      className={cn("w-full py-16 md:py-24", bordered && "border-b", className)}
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {(eyebrow || title || intro) && (
          <header className="mb-10 max-w-2xl space-y-4">
            {eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-ink">
                {eyebrow}
              </p>
            )}
            {title && (
              <Heading
                id={headingId}
                className={cn(
                  "font-bold tracking-tight",
                  Heading === "h1"
                    ? "text-4xl md:text-6xl"
                    : "text-2xl md:text-4xl"
                )}
              >
                {title}
              </Heading>
            )}
            {intro && (
              <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                {intro}
              </p>
            )}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
