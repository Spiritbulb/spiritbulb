import { cn } from "@/lib/utils";
import { HERO, THREADS } from "@/lib/copy";
import { PRODUCTS, bySlug, type ProductStatus } from "@/lib/products";
import { OFFERINGS, contactHref } from "@/lib/site";
import LotusMark from "@/components/LotusMark";
import { Section } from "@/components/site/section";
import { DoorBand } from "@/components/site/door-band";
import { StatusBadge, type Status } from "@/components/site/status-badge";
import { ActionButton } from "@/components/site/action-button";

/*
 * The homepage, docs/site-plan.md §6.1, top to bottom. Every badge and button
 * comes from lib/products.ts or lib/site.ts. Local server hosting is an
 * MCloud-page and Contact topic only (§1); lib/products.test.ts enforces that.
 */

const reach = bySlug("reach");
const mcloud = bySlug("mcloud");
const nuru = bySlug("nuru");

function thread(id: (typeof THREADS)[number]["id"]) {
  const t = THREADS.find((t) => t.id === id)!;
  if (!t.ready) throw new Error(`Thread "${id}" is not confirmed and must not render.`);
  return t;
}

/** An outlined in-page link. Not an ActionButton: it goes nowhere but down the page. */
function AnchorLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="inline-flex h-12 items-center rounded-xl border border-border px-6 text-[15px] font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {children}
    </a>
  );
}

/* 1. Hero */

function Hero() {
  // Each verb carries its door's colour as an underline, in door order.
  const words = PRODUCTS.map((p) => ({ verb: p.verb, color: p.color }));

  return (
    <section className="w-full overflow-hidden">
      <div className="container mx-auto grid items-center gap-8 px-4 pb-14 pt-10 md:px-6 md:pb-20 md:pt-16 lg:grid-cols-[1.25fr_1fr] lg:gap-12 lg:px-8">
        {/* The lotus leads on every screen size; on phones it sits above the headline. */}
        <div className="flex justify-start lg:order-2 lg:justify-center">
          <LotusMark className="w-40 sm:w-52 lg:w-full lg:max-w-[460px]" />
        </div>
        <div className="space-y-7">
          <h1 className="font-display text-[clamp(3.25rem,11vw,6.5rem)] font-extrabold leading-[0.95] tracking-tight">
            {words.map(({ verb, color }) => (
              <span key={verb} className="mr-[0.22em] inline-block last:mr-0">
                <span
                  className="underline decoration-[0.11em] underline-offset-[0.12em]"
                  style={{ textDecorationColor: color }}
                >
                  {verb}
                </span>
                .
              </span>
            ))}
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            {HERO.subline}
          </p>
          <div className="flex flex-wrap items-start gap-3">
            <ActionButton action={mcloud.primary} size="lg" />
            <AnchorLink href="#one-platform">See how it fits together</AnchorLink>
          </div>
        </div>
      </div>
    </section>
  );
}

/* 2. The four doors */

function Doors() {
  return (
    <div id="doors">
      <Section eyebrow="Four doors" title="Pick the one you need today." bordered={false} className="pb-8 md:pb-10" />
      {/* Live doors are filled with their colour; early-access doors are tinted and outlined. */}
      {PRODUCTS.map((p) => (
        <DoorBand key={p.slug} product={p} />
      ))}
    </div>
  );
}

/* 3. One platform: anchored in what is live */

function Layer({
  name,
  status,
  color,
  children,
  className,
}: {
  name: string;
  status: Status;
  color: string;
  children: React.ReactNode;
  className?: string;
}) {
  const soon = status === "coming";
  return (
    <div
      className={cn(
        "relative rounded-xl border p-4",
        soon ? "border-dashed bg-transparent" : "bg-card",
        className
      )}
    >
      <span
        aria-hidden
        className="absolute inset-y-3 left-0 w-1 rounded-r-full"
        style={{ backgroundColor: color, opacity: soon ? 0.4 : 1 }}
      />
      <div className="flex items-center justify-between gap-3 pl-2">
        <p className={cn("font-semibold", soon && "text-muted-foreground")}>{name}</p>
        <StatusBadge status={status} />
      </div>
      <p className="mt-1 pl-2 text-sm text-muted-foreground">{children}</p>
    </div>
  );
}

function OnePlatform() {
  const t = thread("one-platform");
  return (
    <Section
      id="one-platform"
      eyebrow="How it fits together"
      title={t.title}
      intro="Open a Reach storefront and it runs on MCloud, with local billing built in. One sign-in gets you into both."
    >
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        {/* The live scenario on top, the thread underneath, and what is coming beside it. */}
        <figure aria-label="A Reach storefront running on MCloud" className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
            <Layer name="Reach storefront" status={reach.status} color={reach.color}>
              Your shop, on the marketplace. Customers pay with M-Pesa at checkout.
            </Layer>
            {/* "Coming" is the integration with a storefront, not the product's own status. */}
            <div className="grid gap-3">
              <Layer name="Tufike tickets" status="coming" color="var(--tufike)">
                Sell tickets
              </Layer>
              <Layer name="Nuru" status="coming" color="var(--nuru)">
                Bring in learning
              </Layer>
            </div>
          </div>
          <Layer name="MCloud" status={mcloud.status} color={mcloud.color}>
            Hosting and local billing underneath.
          </Layer>
        </figure>

        <div className="space-y-4 text-muted-foreground">
          <p className="leading-relaxed">{t.body}</p>
          <p className="leading-relaxed">
            <span className="font-medium text-foreground">Soon:</span> sell tickets with
            Tufike and bring in Nuru.
          </p>
        </div>
      </div>
    </Section>
  );
}

/* 4. AI, plainly */

function AiPlainly() {
  const t = thread("ai-you-own");
  const rows: { label: string; status: Status; href: string; cta: string }[] = [
    {
      label: OFFERINGS.hostedModels.label,
      status: OFFERINGS.hostedModels.status,
      href: contactHref(OFFERINGS.hostedModels.topic),
      cta: "Talk to us",
    },
    {
      label: "Fine-tuned models like Nuru",
      status: nuru.status,
      href: "/nuru",
      cta: "Meet Nuru",
    },
    {
      label: OFFERINGS.byoModel.label,
      status: OFFERINGS.byoModel.status,
      href: contactHref(OFFERINGS.byoModel.topic),
      cta: "Talk to us",
    },
  ];

  return (
    <Section id="ai" eyebrow="AI, plainly" title={t.title}>
      <ul className="divide-y rounded-2xl border">
        {rows.map((r) => (
          <li
            key={r.label}
            className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between md:p-6"
          >
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-lg font-medium">{r.label}</p>
              <StatusBadge status={r.status} />
            </div>
            <a
              href={r.href}
              className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              {r.cta}
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/* 5. Made for East Africa */

function MadeFor() {
  const t = thread("made-for-east-africa");
  const points = [
    {
      title: "Billing that works here.",
      body: "Plans priced in local currency and paid the local way.",
    },
    {
      title: "A checkout your customers know.",
      body: "Storefronts take M-Pesa, so nobody hunts for a card.",
    },
    {
      title: "Shaped by who uses it.",
      body: "Built alongside shops and schools here, not in a boardroom.",
    },
  ];

  // A warm band in the brand gold. Statements, not cards.
  return (
    <div style={{ backgroundColor: "color-mix(in oklch, var(--brand) 14%, var(--background))" }}>
      <Section id="made-for" eyebrow="Made for East Africa" title={t.title} intro={t.body} bordered={false}>
        <ul className="grid gap-8 md:grid-cols-3 md:gap-10">
          {points.map((p) => (
            <li key={p.title} className="space-y-2 border-t-2 border-brand pt-5">
              <p className="font-display text-2xl font-bold leading-tight tracking-tight">{p.title}</p>
              <p className="leading-relaxed text-muted-foreground">{p.body}</p>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

/* 6. Your infrastructure, your terms */

function YourTerms() {
  const energy = thread("clean-energy");
  const yourData = thread("your-data");

  // Inverted: the page's own foreground as the background, in both modes.
  return (
    <section id="your-terms" aria-label="Your infrastructure, your terms" className="bg-foreground text-background">
      <div className="container mx-auto grid gap-10 px-4 py-16 md:grid-cols-2 md:px-6 md:py-20 lg:px-8">
        <div className="space-y-3">
          <p className="font-display text-3xl font-bold tracking-tight md:text-4xl">{energy.title}</p>
          <p className="max-w-md leading-relaxed opacity-75">
            MCloud runs on green infrastructure. {energy.body}
          </p>
        </div>
        <div className="space-y-3">
          <p className="font-display text-3xl font-bold tracking-tight md:text-4xl">{yourData.title}</p>
          <p className="max-w-md leading-relaxed opacity-75">{yourData.body}</p>
          <div className="flex flex-wrap items-center gap-2 pt-1 text-sm opacity-90">
            <span>The connected library is part of Nuru:</span>
            <StatusBadge status={nuru.status} tone="inverse" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* 7. Closing call to action */

const STATUS_PHRASE: Record<ProductStatus, [string, string]> = {
  live: ["is live", "are live"],
  preview: ["is in preview", "are in preview"],
  waitlist: ["has a waitlist", "have waitlists"],
};

/** "Reach and MCloud are live. Nuru is in preview. Tufike has a waitlist." From config, so it stays true. */
function statusSentence() {
  return (Object.keys(STATUS_PHRASE) as ProductStatus[])
    .map((status) => {
      const names = PRODUCTS.filter((p) => p.status === status).map((p) => p.name);
      if (!names.length) return null;
      const list =
        names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
      return `${list} ${STATUS_PHRASE[status][names.length === 1 ? 0 : 1]}.`;
    })
    .filter(Boolean)
    .join(" ");
}

function Closing() {
  return (
    <Section id="start" bordered={false} className="py-20 md:py-28">
      <div className="max-w-2xl space-y-6">
        <h2 className="font-display text-[clamp(2.75rem,8vw,5rem)] font-extrabold leading-[0.95] tracking-tight">
          Open a door today.
        </h2>
        <p className="text-lg leading-relaxed text-muted-foreground">
          {statusSentence()}
        </p>
        <div className="flex flex-wrap items-start gap-3">
          <ActionButton action={reach.primary} size="lg" />
          <ActionButton action={mcloud.primary} size="lg" />
          <ActionButton
            action={{ label: "Talk to us", href: contactHref("general"), kind: "contact" }}
            size="lg"
          />
        </div>
      </div>
    </Section>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <Doors />
      <OnePlatform />
      <AiPlainly />
      <MadeFor />
      <YourTerms />
      <Closing />
    </main>
  );
}
