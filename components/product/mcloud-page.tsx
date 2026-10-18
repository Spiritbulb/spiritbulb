import { bySlug } from "@/lib/products";
import { OFFERINGS, contactHref } from "@/lib/site";
import { ProductHero } from "@/components/product/product-hero";
import { Section } from "@/components/site/section";
import { StatusBadge } from "@/components/site/status-badge";
import { ActionButton } from "@/components/site/action-button";

/*
 * The MCloud page, docs/site-plan.md §6.3: what you can run (storefronts and
 * servers), how billing works, clean energy, AI models on request, and the
 * separate Kenyan hosting block. This is the one page besides Contact where
 * Kenyan hosting may appear (§1, enforced in lib/products.test.ts).
 *
 * Servers follow mcloud's server and wallet code: Linux on green
 * infrastructure, a choice of locations, an SSH key MCloud generates, charged by the
 * hour from a prepaid wallet topped up with M-Pesa (minimum KES 20). Prices
 * move with the euro rate, so the page says "from about".
 */

const mcloud = bySlug("mcloud");
const reach = bySlug("reach");

function WhatYouRun() {
  return (
    <Section id="run" eyebrow="What you can run" title="Your shop, your servers, one bill.">
      <div className="grid gap-4 md:grid-cols-2">
        <a
          href="/reach"
          className="group space-y-3 rounded-2xl border p-6 transition-colors hover:bg-accent md:p-8"
        >
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: reach.textColor }}>
            Storefronts
          </p>
          <p className="font-display text-2xl font-bold tracking-tight">A themed online shop, ready to sell.</p>
          <p className="leading-relaxed text-muted-foreground">
            Add products, take M-Pesa, share your link. Free to start, with Hobby and Pro plans when you grow.
          </p>
          <p className="text-sm font-medium underline-offset-4 group-hover:underline">See Reach</p>
        </a>
        <div className="space-y-3 rounded-2xl border p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: mcloud.textColor }}>
            Cloud servers
          </p>
          <p className="font-display text-2xl font-bold tracking-tight">A Linux server for whatever you build.</p>
          <p className="leading-relaxed text-muted-foreground">
            Sites, APIs, bots and databases. Starter sizes for getting going, Premium for production. From about
            KES 700 a month, charged by the hour.
          </p>
        </div>
      </div>
    </Section>
  );
}

/** Creating a server, in the order the form asks. The numbers are the order. */
const NEW_SERVER = [
  { title: "Top up with M-Pesa", body: "Add credit to your MCloud wallet from KES 20." },
  { title: "Pick a size and a place", body: "Starter or Premium, in Europe, North America or Asia-Pacific. Green locations come first." },
  { title: "Choose your Linux", body: "Ubuntu, Debian, Fedora, Rocky Linux or AlmaLinux." },
  { title: "Log in", body: "MCloud makes your SSH key and shows it once. Save it, then ssh in as root." },
];

function NewServer() {
  return (
    <Section id="servers" eyebrow="Cloud servers" title="A server in four steps." intro="No card, no dollars, no contract.">
      <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {NEW_SERVER.map((step, i) => (
          <li key={step.title} className="space-y-2 border-t-2 pt-4" style={{ borderColor: mcloud.color }}>
            <p aria-hidden className="font-display text-4xl font-extrabold leading-none" style={{ color: mcloud.textColor }}>
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

function Billing() {
  const points = [
    ["Shillings, not dollars.", "Every price is in KES, worked out for you."],
    ["Top up with M-Pesa.", "From KES 20. Anyone in your organisation can add credit."],
    ["Pay by the hour.", "Servers draw from the wallet hour by hour. Delete one and it stops costing you."],
    ["One wallet, everything.", "The same balance pays for servers and your store plan."],
  ];
  return (
    <div style={{ backgroundColor: `color-mix(in srgb, ${mcloud.color} 12%, var(--background))` }}>
      <Section
        id="billing"
        eyebrow="Billing"
        title="Billed the local way."
        intro="A prepaid MCloud wallet, in shillings, topped up from your phone."
        bordered={false}
      >
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {points.map(([title, body]) => (
            <li key={title} className="space-y-2 border-t-2 pt-4" style={{ borderColor: mcloud.color }}>
              <p className="font-display text-xl font-bold leading-tight tracking-tight">{title}</p>
              <p className="text-sm leading-relaxed text-foreground/75">{body}</p>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function CleanEnergy() {
  return (
    <section aria-labelledby="energy-heading" className="bg-foreground text-background">
      <div className="container mx-auto grid gap-6 px-4 py-16 md:grid-cols-[1fr_1.2fr] md:items-end md:px-6 md:py-20 lg:px-8">
        <h2 id="energy-heading" className="font-display text-[clamp(2.25rem,5vw,3.5rem)] font-extrabold leading-[0.95] tracking-tight">
          Clean energy underneath.
        </h2>
        <p className="max-w-xl text-lg leading-relaxed opacity-75">
          MCloud runs on green infrastructure. When you pick a location, the ones running on
          renewable energy are listed first.
        </p>
      </div>
    </section>
  );
}

function AiModels() {
  const rows = [OFFERINGS.hostedModels, OFFERINGS.byoModel];
  return (
    <Section id="ai" eyebrow="AI models" title="Run models on MCloud." intro="Set up with you, not from the dashboard.">
      <ul className="divide-y rounded-2xl border">
        {rows.map((r) => (
          <li key={r.label} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-lg font-medium">{r.label}</p>
              <StatusBadge status={r.status} />
            </div>
            <a
              href={contactHref(r.topic)}
              className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Talk to us
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/** Plan §6.3: a clearly separate block, linking to Contact, never implied to be self-serve. */
function KenyanHosting() {
  const k = OFFERINGS.kenyanHosting;
  return (
    <Section id="kenya" bordered={false} className="py-12 md:py-16">
      <div className="flex flex-col gap-5 rounded-2xl border-2 border-dashed p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-display text-2xl font-bold tracking-tight">Need your data hosted in Kenya?</p>
            <StatusBadge status={k.status} />
          </div>
          <p className="max-w-2xl leading-relaxed text-muted-foreground">
            Talk to us. We arrange it with you while we build a local option that meets the same green standard
            as the rest of MCloud.
          </p>
        </div>
        <ActionButton action={{ label: "Talk to us", href: contactHref(k.topic), kind: "contact" }} />
      </div>
    </Section>
  );
}

function Closing() {
  return (
    <section className="w-full text-ink" style={{ backgroundColor: mcloud.color }}>
      <div className="container mx-auto space-y-6 px-4 py-16 md:px-6 md:py-24 lg:px-8">
        <h2 className="font-display text-[clamp(2.5rem,7vw,4.5rem)] font-extrabold leading-[0.95] tracking-tight">
          Give your work a place to run.
        </h2>
        <ActionButton action={mcloud.primary} size="lg" tone="ink" />
      </div>
    </section>
  );
}

export default function McloudPage() {
  return (
    <main className="min-h-screen bg-background">
      <ProductHero product={mcloud} />
      <WhatYouRun />
      <NewServer />
      <Billing />
      <CleanEnergy />
      <AiModels />
      <KenyanHosting />
      <Closing />
    </main>
  );
}
