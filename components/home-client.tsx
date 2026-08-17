"use client";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import EcosystemHero from "@/components/EcosystemHero";

/**
 * A wordmark that only exists as separate light and dark PNGs. Both are
 * rendered and CSS reveals the right one, so the server and the client always
 * agree and the logo never flashes the wrong variant.
 *
 * Decorative: each section already carries the product name in its heading, so
 * announcing the logo too would just say the name twice.
 */
function ThemedLogo({
    light,
    dark,
    className = "",
}: {
    light: string;
    dark: string;
    className?: string;
}) {
    return (
        <span aria-hidden className="block">
            <img src={light} alt="" className={`logo-light ${className}`} loading="lazy" />
            <img src={dark} alt="" className={`logo-dark ${className}`} loading="lazy" />
        </span>
    );
}

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

export default function HomePage() {
    const router = useRouter();

    return (
        <main className="min-h-screen bg-background">

            {/* ── Hero ── */}
            <EcosystemHero />

            {/* ── MCloud ── */}
            <Section id="menengai" aria-labelledby="menengai-heading">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-start">
                    <div className="space-y-6">
                        <img src="/menengai.ico" alt="MCloud" className="h-8 w-8" width={32} height={32} loading="lazy" />
                        <h2 id="menengai-heading" className="text-2xl font-bold md:text-4xl tracking-tight">
                            MCloud
                        </h2>
                        <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">
                            <p>Your app is live in 60 seconds.</p>
                            <p>MCloud manages apps and cloud services for businesses in Kenya. SSL, backups, and uptime monitoring are included. Free to start.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {["🆕 Early Access", "Cloud services", "Free to start"].map((b) => (
                                <Badge key={b} variant="secondary">{b}</Badge>
                            ))}
                        </div>
                        <Button className="gap-2" asChild>
                            <a href="/go/mcloud" target="_blank" rel="noopener noreferrer">
                                Claim your free app <ExternalLink className="h-4 w-4" />
                            </a>
                        </Button>
                    </div>
                    <div className="hidden lg:block">
                        <img src="/mcloud.svg" alt="MCloud" className="w-full h-auto" loading="eager" />
                    </div>
                </div>
            </Section>

            {/* ── Nuru ── */}
            <Section id="nuru" aria-labelledby="nuru-heading">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-start">
                    <div className="space-y-6">
                        <img src="/nuru-l-tp.png" alt="Nuru" className="h-8 w-8" width={32} height={32} loading="lazy" />
                        <h2 id="nuru-heading" className="text-2xl font-bold md:text-4xl tracking-tight">
                            Nuru
                        </h2>
                        <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">
                            <p>50+ students across 5 spaces, grown from a quiet demo. Students built the community and we mostly stayed out of the way.</p>
                            <p>Nuru manages educational content for institutions in Kenya.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {["50+ students", "5+ spaces", "Verified campuses"].map((b) => (
                                <Badge key={b} variant="secondary">{b}</Badge>
                            ))}
                        </div>
                        <Button className="gap-2" asChild>
                            <a href="/login?next=/home?app=nuru">
                                Try Nuru live <ArrowRight className="h-4 w-4" />
                            </a>
                        </Button>
                        <p className="text-xs text-muted-foreground">live demo, 5 messages</p>
                    </div>
                    <div className="hidden lg:block" />
                </div>
            </Section>

            {/* ── Reach ── */}
            <Section id="reach" aria-labelledby="reach-heading">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-start">
                    <div className="space-y-6">
                        {/* The wordmark is the heading. The h2 stays for the heading
                            outline and for screen readers, which cannot read a logo. */}
                        <div>
                            <h2 id="reach-heading" className="sr-only">Reach</h2>
                            <ThemedLogo light="/reach.png" dark="/reach-w.png" className="h-11 w-auto" />
                        </div>
                        <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">
                            <p>13 merchants. Over KSH 250k listed in under a month. No billboards, just word of mouth.</p>
                            <p>Reach manages social media and fulfillment integrations for merchants and NGOs across Kenya.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {["13 merchants", "KSH 250k+ listed", "Nakuru"].map((b) => (
                                <Badge key={b} variant="secondary">{b}</Badge>
                            ))}
                        </div>
                        <Button className="gap-2" asChild>
                            <a href="/login?next=/home?app=reach">
                                Explore Reach <ArrowRight className="h-4 w-4" />
                            </a>
                        </Button>
                        <p className="text-xs text-muted-foreground">preview</p>
                    </div>
                </div>
            </Section>

            {/* ── Tufike ── */}
            <Section id="tufike" aria-labelledby="tufike-heading">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-start">
                    <div className="hidden lg:block">
                        <img src="/tufike.svg" alt="Tufike" className="w-full h-auto" loading="eager" />
                    </div>
                    <div className="space-y-6">
                        <div>
                            <h2 id="tufike-heading" className="sr-only">Tufike</h2>
                            <ThemedLogo light="/tufike.png" dark="/tufike-w.png" className="h-11 w-auto" />
                        </div>
                        <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">
                            <p>Still early, and the demand is already loud. Community events, pop-up style, places you'd actually show up.</p>
                            <p>Tufike manages brand exposure and venues, done differently.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {["Community events", "Early stage", "Pop-up style"].map((b) => (
                                <Badge key={b} variant="secondary">{b}</Badge>
                            ))}
                        </div>
                        <Button className="gap-2" asChild>
                            <a href="/login?next=/home?app=tufike">
                                Preview Tufike <ArrowRight className="h-4 w-4" />
                            </a>
                        </Button>
                        <p className="text-xs text-muted-foreground">coming soon</p>
                    </div>
                </div>
            </Section>

            {/* ── CTA ── */}
            <Section bordered={false} aria-label="Call to action" className="py-20 md:py-28">
                <div className="max-w-2xl space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold md:text-4xl tracking-tight">
                            Convinced? It's easy to get started
                        </h2>
                        <p className="text-muted-foreground text-sm leading-relaxed md:text-base">
                            The whole ecosystem opens with a single sign in. Start where you like.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Button size="lg" className="gap-2" asChild>
                            <a href="/login">
                                Get in <ArrowRight className="h-4 w-4" />
                            </a>
                        </Button>
                        <Button variant="outline" size="lg" onClick={() => router.push("/contact")}>
                            Talk to us
                        </Button>
                    </div>
                </div>
            </Section>

        </main>
    );
}
