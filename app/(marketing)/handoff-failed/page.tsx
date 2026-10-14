import type { Metadata } from "next";
import Link from "next/link";

// Where /go/mcloud sends a signed-in user whose handoff to MCloud failed. Sending them to
// /login instead would loop: /login sees the valid session and redirects straight back to
// /go/mcloud, which fails again.
export const metadata: Metadata = {
  title: "Couldn't open MCloud",
  robots: { index: false, follow: false },
};

export default function HandoffFailedPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold">We couldn&apos;t open MCloud</h1>
      <p className="text-sm opacity-70">
        You&apos;re signed in to Spiritbulb, but the handoff to MCloud didn&apos;t go through.
        Try again in a moment.
      </p>
      <div className="flex gap-3">
        <Link href="/go/mcloud" className="rounded-md bg-black px-4 py-2 text-sm text-white">
          Try again
        </Link>
        <Link href="/home" className="rounded-md border px-4 py-2 text-sm">
          Back to home
        </Link>
      </div>
    </main>
  );
}
