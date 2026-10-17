/**
 * A visible placeholder for copy or a link the owner has not supplied yet.
 * Renders as `{{TBD: ...}}` so it cannot be mistaken for finished copy, and
 * `grep -rn "<Tbd\|tbd:" app components lib` lists every one for the report.
 */
export function Tbd({ children }: { children: React.ReactNode }) {
  return (
    <span
      data-tbd
      className="rounded border border-dashed border-status-waitlist/60 bg-status-waitlist/10 px-1.5 font-mono text-[0.85em] text-status-waitlist"
    >
      {"{{TBD: "}
      {children}
      {"}}"}
    </span>
  );
}
