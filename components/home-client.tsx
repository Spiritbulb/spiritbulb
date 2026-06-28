"use client";
import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Highlighter } from "@/components/ui/highlighter";
import { useRouter } from "next/navigation";

function useDarkMode() {
    const [dark, setDark] = useState(() =>
        typeof document !== "undefined" && document.documentElement.classList.contains("dark")
    );
    useEffect(() => {
        const check = () => setDark(document.documentElement.classList.contains("dark"));
        const observer = new MutationObserver(check);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        return () => observer.disconnect();
    }, []);
    return dark;
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
    const dark = useDarkMode();
    const reachSrc = dark ? "/reach-w.png" : "/reach.png";
    const tufikeSrc = dark ? "/tufike-w.png" : "/tufike.png";

    return (
        <main className="min-h-screen bg-background">

            {/* ── Hero ── */}
            <Section bordered={false} className="pt-12 md:pt-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
                    <div className="space-y-8 lg:order-1">
                        <div className="space-y-4">
                            <h1 className="text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">
                                Kenya's apps are being built here.
                            </h1>
                            <p className="text-base text-muted-foreground md:text-lg leading-relaxed">
                                <Highlighter action="underline" color="var(--highlight-spiritbulb)">
                                    Spiritbulb
                                </Highlighter>{" "}
                                provides an ecosystem to build, sell, and engage your audience. Our apps run on our own infrastructure.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <Button size="lg" className="gap-2" asChild>
                                <a href="https://mcloud.co.ke" target="_blank" rel="noopener noreferrer">
                                    See MCloud <ArrowRight className="h-4 w-4" />
                                </a>
                            </Button>
                            <Button variant="ghost" size="lg" onClick={() => router.push("/contribute")} className="border">
                                Contribute
                            </Button>
                        </div>
                    </div>
                    <div className="relative lg:order-2 hidden lg:block">
                        <img
                            src="/future.svg"
                            alt="That's the spirit"
                            className="w-full h-auto"
                            loading="eager"
                        />
                    </div>
                </div>
            </Section>

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
                            <p>MCloud manages apps and cloud services for merchants, brokers, and NGOs in Kenya. SSL, backups, and uptime monitoring are included. Free to start.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {["🆕 Just launched", "Cloud services", "Free to start"].map((b) => (
                                <Badge key={b} variant="secondary">{b}</Badge>
                            ))}
                        </div>
                        <Button className="gap-2" asChild>
                            <a href="https://mcloud.co.ke" target="_blank" rel="noopener noreferrer">
                                Claim your free app <ExternalLink className="h-4 w-4" />
                            </a>
                        </Button>
                    </div>
                    <div className="hidden lg:block">
                        <img src="/mcloud.svg" alt="MCloud" className="w-full h-auto" loading="eager" />
                    </div>
                </div>
            </Section>

            {/* ── Reach ── */}
            <Section id="reach" aria-labelledby="reach-heading">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-start">
                    <div className="space-y-6">
                        <img src={reachSrc} alt="Reach" className="h-8 w-auto" loading="lazy" />
                        <h2 id="reach-heading" className="text-2xl font-bold md:text-4xl tracking-tight">
                            Reach
                        </h2>
                        <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">
                            <p>13 merchants. Over KSH 250k listed in under a month. No billboards, just word of mouth.</p>
                            <p>Reach manages social media and fulfillment integrations for merchants and NGOs across Kenya.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {["13 merchants", "KSH 250k+ listed", "Nakuru"].map((b) => (
                                <Badge key={b} variant="secondary">{b}</Badge>
                            ))}
                        </div>
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
                            <p>50+ students across 5 spaces, grown from a quiet MVP. Students built the community and we mostly stayed out of the way.</p>
                            <p>Nuru manages educational content for institutions in Kenya.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {["50+ students", "5+ spaces", "Verified campuses"].map((b) => (
                                <Badge key={b} variant="secondary">{b}</Badge>
                            ))}
                        </div>
                    </div>
                    <div className="hidden lg:block" />
                </div>
            </Section>

            {/* ── Tufike ── */}
            <Section id="tufike" aria-labelledby="tufike-heading">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-start">
                    <div className="hidden lg:block">
                        <img src="/tufike.svg" alt="Tufike" className="w-full h-auto" loading="eager" />
                    </div>
                    <div className="space-y-6">
                        <img src={tufikeSrc} alt="Tufike" className="h-8 w-auto" loading="lazy" />
                        <h2 id="tufike-heading" className="text-2xl font-bold md:text-4xl tracking-tight">
                            Tufike
                        </h2>
                        <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">
                            <p>Still early, and the demand is already loud. Community events, pop-up style, places you'd actually show up.</p>
                            <p>Tufike manages brand exposure and venues, done differently.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {["Community events", "Early stage", "Pop-up style"].map((b) => (
                                <Badge key={b} variant="secondary">{b}</Badge>
                            ))}
                        </div>
                    </div>
                </div>
            </Section>

            {/* ── CTA ── */}
            <Section bordered={false} aria-label="Call to action" className="py-20 md:py-28">
                <div className="max-w-2xl space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold md:text-4xl tracking-tight">
                            Are you in?
                        </h2>
                        <p className="text-muted-foreground text-sm leading-relaxed md:text-base">
                            We're still early. If you care about merchants, institutions, or building something real in Kenya, we'd love to hear from you.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Button size="lg" className="gap-2" onClick={() => router.push("/contact")}>
                            Talk to Spiritbulb <ArrowRight className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="lg" asChild>
                            <a href="https://mcloud.co.ke" target="_blank" rel="noopener noreferrer">
                                See MCloud →
                            </a>
                        </Button>
                    </div>
                </div>
            </Section>

        </main>
    );
}
