/**
 * Copy blocks shared across pages, taken from docs/site-plan.md §2 and
 * §6.1. Per-product lines live with the product in lib/products.ts.
 *
 * Voice: confident, plain, a little playful. If a line would look at home on
 * a big enterprise cloud vendor's site, rewrite it. The banned phrases are
 * pinned in lib/products.test.ts; the library is "connected", never "open";
 * and it is "made for East Africa", never "hosted in".
 */

export const ONE_LINER =
  "One platform for East African businesses and institutions, with AI built in.";

export const HERO = {
  headline: "Sell. Host. Gather. Teach.",
  subline: ONE_LINER,
} as const;

/**
 * The threads every page can return to. `ready` is false while a thread still
 * makes a claim the owner has not confirmed; a false thread must not render.
 */
export const THREADS = [
  {
    id: "one-platform",
    title: "One platform, not four tools.",
    body: "Shops, events, courses, and AI share infrastructure and customers.",
    ready: true,
  },
  {
    id: "made-for-east-africa",
    title: "Made for East Africa.",
    body: "Local billing, pricing in your currency, and a product shaped by how businesses and schools here work.",
    ready: true,
  },
  {
    id: "ai-you-own",
    title: "AI you can use or own.",
    body: "Open-source models hosted for you, fine-tuned models like Nuru, or bring your own and run it on MCloud.",
    ready: true,
  },
  {
    id: "clean-energy",
    title: "Clean energy underneath.",
    // MCloud runs on green infrastructure. That is also why hosting
    // in Kenya is on request: the local option has to meet the same bar.
    body: "Running on renewable energy is part of the infrastructure, not a footnote.",
    ready: true,
  },
  {
    // Was "No lock-in" with running on your own servers. That is not offered
    // (Nuru may support it after the preview), so the thread is the library alone.
    id: "your-data",
    title: "Your data, your call.",
    body: "Your connected library starts private. You choose what to share.",
    ready: true,
  },
] as const;
