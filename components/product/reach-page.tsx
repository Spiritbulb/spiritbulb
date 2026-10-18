import { bySlug } from "@/lib/products";
import { STORE_PLANS, formatLimit, formatPrice } from "@/lib/plans";
import { ProductHero } from "@/components/product/product-hero";
import { Section } from "@/components/site/section";
import { StatusBadge } from "@/components/site/status-badge";
import { ActionButton } from "@/components/site/action-button";

/*
 * The Reach page, docs/site-plan.md §6.2: lead with what a seller does in the
 * first session, then the marketplace, then plans, then MCloud underneath.
 * Facts come from the owner and from mcloud's code: plans and prices mirror
 * packages/merchant/src/plans.ts (via lib/plans.ts); listing needs a delivery
 * area and an approval, and a rejection comes with a reason
 * (packages/merchant/src/reach-approval.ts).
 */

const reach = bySlug("reach");

/** What a new seller does, in the order they do it. The numbers are the order. */
const FIRST_SESSION = [
  { title: "Add your products", body: "Upload photos, prices and descriptions." },
  { title: "Set up payments", body: "Turn on M-Pesa so customers pay the way they already do." },
  { title: "Make it yours", body: "Start from a theme, then change the colours, sections and pages." },
  { title: "Share your link", body: "Send your store to customers on WhatsApp, Instagram, anywhere." },
  { title: "Handle orders", body: "Orders land in your dashboard as they come in." },
];

function FirstSession() {
  return (
    <Section
      id="first-session"
      eyebrow="Your first session"
      title="Open shop in one sitting."
      intro="Everything a new seller does on day one, in the order they do it."
    >
      <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
        {FIRST_SESSION.map((step, i) => (
          <li key={step.title} className="space-y-2 border-t-2 pt-4" style={{ borderColor: reach.color }}>
            <p
              aria-hidden
              className="font-display text-4xl font-extrabold leading-none"
              style={{ color: reach.textColor }}
            >
              {i + 1}
            </p>
            <p className="font-display text-xl font-bold tracking-tight">{step.title}</p>
            <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

const GET_LISTED = [
  {
    title: "Be on a paid plan",
    body: "The marketplace is for businesses ready to sell and deliver, so it starts at Hobby.",
  },
  {
    title: "Request a listing",
    body: "From your store dashboard, choose the area you deliver from and ask to be listed.",
  },
  {
    title: "We review it",
    body: "Requests are reviewed on a rolling basis. Approval isn't guaranteed. If we say no, we tell you why, so you can fix it and ask again.",
  },
];

function Marketplace() {
  return (
    <div style={{ backgroundColor: `color-mix(in srgb, ${reach.color} 14%, var(--background))` }}>
      <Section
        id="marketplace"
        eyebrow={
          <span className="inline-flex items-center gap-3">
            The Reach marketplace <StatusBadge status="by-approval" />
          </span>
        }
        title="Then get found by buyers near you."
        intro="List your products on the Reach marketplace, and Reach puts your store in front of more people in your delivery zone. You keep track of orders and deliveries in one place."
        bordered={false}
      >
        <div className="grid gap-10 md:grid-cols-2">
          <ul className="space-y-4">
            {[
              ["Listed locally", "Your products show to buyers in the area you deliver to."],
              ["Traffic, handled", "Reach brings the shoppers. You get on with the selling."],
              ["Orders and deliveries together", "Track every marketplace order through to delivery."],
            ].map(([title, body]) => (
              <li key={title} className="border-l-2 pl-4" style={{ borderColor: reach.color }}>
                <p className="font-semibold">{title}</p>
                <p className="text-sm leading-relaxed text-foreground/75">{body}</p>
              </li>
            ))}
          </ul>

          <div className="space-y-4">
            <p className="font-display text-2xl font-bold tracking-tight">How to get listed</p>
            <ol className="space-y-4">
              {GET_LISTED.map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <span
                    aria-hidden
                    className="font-display text-2xl font-extrabold leading-none"
                    style={{ color: reach.textColor }}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold">{step.title}</p>
                    <p className="text-sm leading-relaxed text-foreground/75">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Section>
    </div>
  );
}

function Plans() {
  const rows: { label: string; value: (p: (typeof STORE_PLANS)[number]) => string }[] = [
    { label: "Products", value: (p) => formatLimit(p.products) },
    { label: "Orders a month", value: (p) => formatLimit(p.monthlyOrders) },
    { label: "Team members", value: (p) => formatLimit(p.members) },
    { label: "Your own domain", value: (p) => (p.customDomain ? "Yes" : "No") },
    { label: "Reach marketplace", value: (p) => (p.marketplace ? "Can apply" : "No") },
  ];

  return (
    <Section
      id="plans"
      eyebrow="Plans"
      title="Start free. Upgrade when you're serious."
      intro="Try the storefront on the free plan and see what you get. Paid plans are billed monthly in shillings from your MCloud wallet."
    >
      <div className="overflow-x-auto rounded-2xl border">
        <table className="w-full min-w-[560px] border-collapse text-left text-sm tabular-nums">
          <caption className="sr-only">Store plans compared</caption>
          <thead>
            <tr className="border-b">
              <th scope="col" className="p-4 font-medium text-muted-foreground">
                <span className="sr-only">Feature</span>
              </th>
              {STORE_PLANS.map((p) => (
                <th key={p.id} scope="col" className="p-4 align-bottom">
                  <span className="block font-display text-xl font-bold">{p.name}</span>
                  <span className="mt-1 block text-base font-semibold">
                    {/* The name already says "Free", so the price cell shows the number. */}
                    {p.priceKes === null ? "KES 0" : formatPrice(p)}
                    <span className="text-sm font-normal text-muted-foreground"> a month</span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-b last:border-0">
                <th scope="row" className="p-4 font-medium">{r.label}</th>
                {STORE_PLANS.map((p) => (
                  <td key={p.id} className="p-4 text-muted-foreground">{r.value(p)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        Pro also removes the &ldquo;Powered by Menengai Cloud&rdquo; line from your store and gets priority support. Upgrade any time from Billing.
      </p>
    </Section>
  );
}

function OnMcloud() {
  return (
    <Section id="on-mcloud" bordered={false} className="py-12 md:py-16">
      <div className="flex flex-col gap-4 rounded-2xl border p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div className="space-y-1">
          <p className="font-display text-2xl font-bold tracking-tight">Runs on MCloud.</p>
          <p className="text-muted-foreground">
            Your store is hosted on MCloud and billed from your MCloud wallet. Nothing to set up.
          </p>
        </div>
        <a
          href="/mcloud"
          className="text-sm font-medium underline-offset-4 hover:underline"
          style={{ color: bySlug("mcloud").textColor }}
        >
          About MCloud
        </a>
      </div>
    </Section>
  );
}

function Closing() {
  return (
    <section className="w-full text-ink" style={{ backgroundColor: reach.color }}>
      <div className="container mx-auto space-y-6 px-4 py-16 md:px-6 md:py-24 lg:px-8">
        <h2 className="font-display text-[clamp(2.5rem,7vw,4.5rem)] font-extrabold leading-[0.95] tracking-tight">
          Your shop, open today.
        </h2>
        <ActionButton action={reach.primary} size="lg" tone="ink" />
      </div>
    </section>
  );
}

export default function ReachPage() {
  return (
    <main className="min-h-screen bg-background">
      <ProductHero product={reach} />
      <FirstSession />
      <Marketplace />
      <Plans />
      <OnMcloud />
      <Closing />
    </main>
  );
}
