"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Marquee } from "@/components/ui/marquee";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Highlighter } from "@/components/ui/highlighter";
import { useRouter } from "next/navigation";

const reachSrc = "/reach-w.png";
const tufikeSrc = "/tufike-w.png";
const nuruSrc = "/nuru-l-tp.png";

const testimonials = [
    {
        name: "Wanjiru M.",
        role: "Computer Science, UoN",
        content:
            "Honestly didn't expect to find my coursemates here. We've been planning group projects through Nuru and it just... works? No one's getting left out of the WhatsApp group anymore.",
        platform: nuruSrc,
    },
    {
        name: "Kevin O.",
        role: "Small business owner, Nakuru",
        content:
            "My shop's been here 8 years. Reach got me online in 2 days. Now people from Pipeline are ordering stuff they'd usually walk past. That's wild.",
        platform: reachSrc,
    },
    {
        name: "Akinyi J.",
        role: "Engineering student, JKUAT",
        content:
            "There's this space on Nuru for Mech students where we share notes and complain about exams. It's stupid how much it helps. Like, why didn't this exist before?",
        platform: nuruSrc,
    },
    {
        name: "Faith N.",
        role: "Fashion vendor, Nakuru",
        content:
            "I was skeptical. Another platform? But my neighbor showed me her sales on Reach and I signed up same day. Already made back what I spent on photos.",
        platform: reachSrc,
    },
    {
        name: "Daniel M.",
        role: "Business student, Strathmore",
        content:
            "We use Nuru to coordinate our startup team. Six of us across three campuses. Beats Slack for our budget and actually built for how we work here.",
        platform: nuruSrc,
    },
    {
        name: "Mercy W.",
        role: "Salon owner, Nakuru CBD",
        content:
            "My customers kept asking if I had an online shop. Reach made it so easy I felt dumb for waiting. Listed 50 products in one afternoon.",
        platform: reachSrc,
    },
    {
        name: "Ian K.",
        role: "CS student, KU",
        content:
            "Met three guys in my Nuru space who are working on similar projects. We're literally in the same building but never talked before. Now we hack together every week.",
        platform: nuruSrc,
    },
];

// ── Testimonial Card ──────────────────────────────────────────────────────────
function TestimonialCard({ testimonial }: { testimonial: (typeof testimonials)[0] }) {
    const isNuru = testimonial.platform === nuruSrc;
    const platformName = isNuru ? "Nuru" : "Reach";

    return (
        <article className="w-[320px] shrink-0" aria-label={`Testimonial from ${testimonial.name}`}>
            <Card className="h-full">
                <CardContent className="p-5 flex flex-col gap-3">
                    <blockquote className="text-sm leading-relaxed text-muted-foreground flex-1">
                        "{testimonial.content}"
                    </blockquote>
                    <div className="flex items-center justify-between pt-1 border-t border-border">
                        <div>
                            <p className="text-xs font-medium">{testimonial.name}</p>
                            <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                        </div>
                        <Highlighter
                            action="highlight"
                            color={isNuru ? "var(--highlight-transparent)" : "var(--highlight-reach)"}
                        >
                            <img src={testimonial.platform} alt={`${platformName} logo`} className="h-6 w-auto" loading="lazy" />
                        </Highlighter>
                    </div>
                </CardContent>
            </Card>
        </article>
    );
}

// ── Chess skeleton ────────────────────────────────────────────────────────────
function ChessSkeleton() {
    return <div className="w-full max-w-xl aspect-square rounded-lg bg-muted animate-pulse" aria-hidden="true" />;
}

// ── Section wrapper for consistent padding ────────────────────────────────────
function Section({
    children,
    id,
    className = "",
    bordered = true,
}: {
    children: React.ReactNode;
    id?: string;
    className?: string;
    bordered?: boolean;
}) {
    return (
        <section
            id={id}
            className={`w-full overflow-hidden py-16 md:py-20 ${bordered ? "border-b" : ""} ${className}`}
        >
            <div className="container mx-auto px-4 md:px-6 lg:px-8">{children}</div>
        </section>
    );
}

// ── Product section (Nuru / Reach) ────────────────────────────────────────────
function ProductSection({
    logo,
    logoAlt,
    highlight,
    heading,
    headingId,
    children,
    badges,
    cta,
    marqueeTestimonials,
    marqueeLabel,
    reverse = false,
}: {
    logo: React.ReactNode;
    logoAlt?: string;
    highlight?: string;
    heading: string;
    headingId: string;
    children: React.ReactNode;
    badges: string[];
    cta: React.ReactNode;
    marqueeTestimonials: (typeof testimonials)[number][];
    marqueeLabel: string;
    reverse?: boolean;
}) {
    return (
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-start">
            {/* Copy side */}
            <div className={`space-y-6 ${reverse ? "lg:order-2" : ""}`}>
                <div className="space-y-4">
                    <div className="flex items-center gap-2">{logo}</div>
                    <h2 id={headingId} className="text-2xl font-bold md:text-4xl tracking-tight">
                        {heading}
                    </h2>
                    <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">{children}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {badges.map((b) => (
                        <Badge key={b} variant="secondary">{b}</Badge>
                    ))}
                </div>
                {cta}
            </div>

            {/* Testimonials side */}
            <div className={`space-y-4 overflow-hidden ${reverse ? "lg:order-1" : ""}`}>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {marqueeLabel}
                </p>
                <Marquee pauseOnHover reverse={reverse} className="[--duration:55s]">
                    {marqueeTestimonials.map((t, i) => (
                        <TestimonialCard key={i} testimonial={t} />
                    ))}
                </Marquee>
            </div>
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
    const router = useRouter();

    return (
        <main className="min-h-screen bg-background">

            {/* ── Hero ────────────────────────────────────────────────────────────── */}
            <Section bordered={false} className="pt-12 md:pt-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
                    {/* Copy */}
                    <div className="space-y-8 lg:order-1">
                        <div className="space-y-4">
                            <h1 className="text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">
                                The Kenyan digital ecosystem
                            </h1>
                            <p className="text-base text-muted-foreground md:text-lg leading-relaxed">
                                Hi, we're{" "}
                                <Highlighter action="underline" color="var(--highlight-spiritbulb)">
                                    Spiritbulb
                                </Highlighter>
                                . A Kenyan-born tech company with a bold vision: transform how people connect and learn by 2040.
                            </p>
                            <p className="text-base text-muted-foreground md:text-lg leading-relaxed">
                                We're building tools that connect people, ideas, and opportunities that are built here,
                                for here.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <Button size="lg" className="gap-2" asChild>
                                <a href="https://menengai.cloud" target="_blank" rel="noopener noreferrer">
                                    See MCloud <ArrowRight className="h-4 w-4" />
                                </a>
                            </Button>
                            <Button variant="ghost" size="lg" onClick={() => router.push("/careers")}>
                                Join the team →
                            </Button>
                        </div>
                    </div>

                    {/* Image */}
                    <div className="relative lg:order-2 hidden lg:block">
                        <div className="relative">
                            <img
                                src="/future.svg"
                                alt="That's the spirit"
                                className="w-full h-auto"
                                loading="eager"
                            />
                        </div>
                    </div>
                </div>
            </Section>

            {/* ── Nuru ──────────────────────────────────────────────────────────────── */}
            <Section id="nuru" aria-labelledby="nuru-heading">
                <ProductSection
                    logo={
                        <img src={nuruSrc} alt="Nuru" className="h-8 w-8" width={32} height={32} loading="eager" />
                    }
                    headingId="nuru-heading"
                    heading="Getting the vibe right"
                    badges={["50+ students", "5+ spaces", "Verified campuses"]}
                    cta={
                        <Button className="gap-2" asChild>
                            <a href="https://nuru.spiritbulb.org" target="_blank" rel="noopener noreferrer">
                                Visit Nuru <ArrowRight className="h-4 w-4" />
                            </a>
                        </Button>
                    }
                    marqueeTestimonials={testimonials.filter((t) => t.platform === nuruSrc)}
                    marqueeLabel="What students are saying"
                >
                    <p>
                        Nuru is the official student network — 50+ students and 5+ spaces from a quiet MVP (
                        <a href="https://stridecampus.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                            Stride Campus
                        </a>
                        ).
                    </p>
                    <p>Students built the community. We mostly stayed out of the way and listened.</p>
                </ProductSection>
            </Section>

            {/* ── Reach ─────────────────────────────────────────────────────────────── */}
            <Section id="reach" aria-labelledby="reach-heading">
                <ProductSection
                    logo={
                        <Highlighter action="highlight" color="var(--highlight-reach)">
                            <img src={reachSrc} alt="Reach" className="h-8 w-auto" loading="lazy" />
                        </Highlighter>
                    }
                    headingId="reach-heading"
                    heading="Nakuru already answered"
                    badges={["13 merchants", "KSH 250k+ listed", "Nakuru"]}
                    cta={
                        <Button className="gap-2" asChild>
                            <a href="/contact">
                                Partner with us <ArrowRight className="h-4 w-4" />
                            </a>
                        </Button>
                    }
                    marqueeTestimonials={testimonials.filter((t) => t.platform === reachSrc)}
                    marqueeLabel="From local merchants on Reach"
                    reverse
                >
                    <p>MVP in Nakuru: 13 merchants and over KSH 250k worth of products listed in under a month. No billboards. Just "tell your friends".</p>
                    <p>We didn't invent local e-commerce. We just made it less painful for the people actually doing the selling.</p>
                </ProductSection>
            </Section>

            {/* ── Menengai Cloud ────────────────────────────────────────────────────── */}
            <Section id="menengai" aria-labelledby="menengai-heading">
                <div className="grid grid-cols-2 gap-2">
                    <div className="relative max-w-2xl space-y-6 order-1 lg:order-2">
                        <img src="/menengai.ico" alt="Menengai Cloud" className="h-8 w-8" width={32} height={32} loading="lazy" />
                        <h2 id="menengai-heading" className="text-2xl font-bold md:text-4xl tracking-tight">
                            Your store in 2 minutes
                        </h2>
                        <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">
                            <p>Stop waiting on agencies. Claim your link, verify your email, you're live. SSL, backups, and uptime monitoring included.</p>
                            <p>Your content, your audience, your money — we just keep the lights on.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {["🆕 Just launched", "Stores & creator tools", "Free to start", "99.9% uptime"].map((b) => (
                                <Badge key={b} variant="secondary">{b}</Badge>
                            ))}
                        </div>
                        <Button className="gap-2" asChild>
                            <a href="https://menengai.cloud" target="_blank" rel="noopener noreferrer">
                                Claim your free store <ExternalLink className="h-4 w-4" />
                            </a>
                        </Button>
                    </div>
                    <div className="relative lg:order-1">
                        <img
                            src="/mcloud.svg"
                            alt="3 easy steps"
                            className="w-full h-auto"
                            loading="eager"
                        />
                    </div>
                </div>
            </Section>

            {/* ── Tufike ────────────────────────────────────────────────────────────── */}
            <Section id="tufike" aria-labelledby="tufike-heading">
                <div className="grid grid-cols-2 gap-2">
                    <div className="max-w-2xl space-y-6">
                        <Highlighter action="highlight" color="var(--highlight-reach)">
                            <img src={tufikeSrc} alt="Tufike" className="h-8 w-auto" loading="lazy" />
                        </Highlighter>
                        <h2 id="tufike-heading" className="text-2xl font-bold md:text-4xl tracking-tight">
                            Where you'd actually show up
                        </h2>
                        <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">
                            <p>Tufike is the part where you leave the screen and actually meet the people.</p>
                            <p>Still early, but the demand is loud: students and young builders keep asking for rooms, not just links.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {["Community events", "Early stage", "Pop-up style"].map((b) => (
                                <Badge key={b} variant="secondary">{b}</Badge>
                            ))}
                        </div>
                    </div>
                    <div className="relative lg:order-1">
                        <img
                            src="/tufike.svg"
                            alt="3 easy steps"
                            className="w-full h-auto"
                            loading="eager"
                        />
                    </div>
                </div>
            </Section>

            {/* ── All testimonials ──────────────────────────────────────────────────── */}
            <Section aria-label="Customer testimonials">
                <div className="space-y-6">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold tracking-tight">Real feedback from real people</h2>
                        <p className="text-sm text-muted-foreground">No marketing speak. Just what users actually said.</p>
                    </div>
                    <Marquee pauseOnHover className="[--duration:80s]">
                        {testimonials.map((t, i) => (
                            <TestimonialCard key={i} testimonial={t} />
                        ))}
                    </Marquee>
                </div>
            </Section>

            {/* ── CTA ───────────────────────────────────────────────────────────────── */}
            <Section bordered={false} aria-label="Call to action" className="py-20 md:py-28">
                <div className="max-w-2xl space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold md:text-4xl tracking-tight">
                            Are you in?
                        </h2>
                        <p className="text-muted-foreground text-sm leading-relaxed md:text-base">
                            We're still early. The brands are proving themselves in the wild, and we're welding
                            everything together into one ecosystem as we go. If you care about students, local
                            merchants, or African infrastructure, we'd love to hear from you.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Button size="lg" className="gap-2" onClick={() => router.push("/contact")}>
                            Talk to Spiritbulb <ArrowRight className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="lg" asChild>
                            <a href="https://menengai.cloud" target="_blank" rel="noopener noreferrer">
                                See what Menengai Cloud is doing →
                            </a>
                        </Button>
                    </div>
                </div>
            </Section>

        </main>
    );
}