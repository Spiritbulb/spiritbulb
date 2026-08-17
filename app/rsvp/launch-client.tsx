"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

/**
 * A wordmark that only exists as separate light and dark PNGs. Both are
 * rendered and CSS reveals the right one, so the server and the client always
 * agree and the logo never flashes the wrong variant.
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

const PRODUCTS = [
    { name: "MCloud", color: "#3B82F6" },
    { name: "Reach", color: "#D4A72C" },
    { name: "Tufike", color: "#DC2626" },
    { name: "Nuru", color: "#14B8A6" },
];



export default function TufikeLaunchPage() {
    const [email, setEmail] = React.useState("");
    const [wantsUpdates, setWantsUpdates] = React.useState(true);
    const [submitted, setSubmitted] = React.useState(false);

    async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, wantsUpdates }),
    });
    if (!res.ok) {
        // handle error state — you don't have one in the UI yet, worth adding
        return;
    }
    setSubmitted(true);
}

    return (
        <main className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="w-full max-w-md py-16 space-y-8 text-center">

                {/* Product dots — the ecosystem tease */}
                <div className="flex items-center justify-center gap-2">
                    {PRODUCTS.map((p) => (
                        <span
                            key={p.name}
                            title={p.name}
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: p.color }}
                        />
                    ))}
                </div>

                <div className="space-y-3">
                    <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                        Spiritbulb is coming.
                    </h1>
                    <p className="text-muted-foreground text-sm md:text-base">
                        A suite of products to build, sell and engage with your audience.
                    </p>
                </div>

                {submitted ? (
                    <div className="rounded-lg border bg-card p-6 space-y-1">
                        <p className="font-medium">You're on the list.</p>
                        <p className="text-sm text-muted-foreground">We'll let you know when there's something to see.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="email"
                                required
                                placeholder="you@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex h-11 w-full rounded-md border border-input bg-background px-3.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            />
                            <Button type="submit" className="h-11 gap-2 shrink-0 px-6">
                                Notify me <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                        <label className="flex items-center justify-center gap-2 text-xs text-muted-foreground cursor-pointer">
                            <input
                                type="checkbox"
                                checked={wantsUpdates}
                                onChange={(e) => setWantsUpdates(e.target.checked)}
                                className="h-3.5 w-3.5 rounded border-input"
                            />
                            Also send early product updates
                        </label>
                    </form>
                )}

                <p className="text-xs text-muted-foreground/70">By signing up, you agree to our Privacy Policy and Terms of Service.</p>
            </div>
        </main>
    );
}