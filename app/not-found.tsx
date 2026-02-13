'use client';
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Home } from "lucide-react";
import BackgroundMeteors from "@/components/ui/backgroundmeteors";
import { useRouter } from "next/navigation";

export default function NotFound() {
    const router = useRouter();

    return (
        <main className="min-h-screen bg-background">
            <BackgroundMeteors>
                <section className="w-full py-20">
                    <div className="container mx-auto px-4 py-20 md:px-6 lg:px-8">
                        <div className="mx-auto max-w-3xl space-y-12 text-center">
                            {/* 404 Display */}
                            <div className="space-y-4">
                                <h1 className="text-8xl md:text-9xl font-bold tracking-tight opacity-20">
                                    404
                                </h1>
                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                                    Page not found
                                </h2>
                                <p className="text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto">
                                    Looks like you've wandered off the map. This page doesn't
                                    exist, or maybe it never did. Either way, let's get you back
                                    on track.
                                </p>
                            </div>

                            {/* Suggestions */}
                            <div className="space-y-4 pt-8">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Here's where you might want to go:
                                </p>
                                <div className="flex flex-wrap items-center justify-center gap-4">
                                    <Button
                                        size="lg"
                                        className="gap-2 cursor-pointer"
                                        onClick={() => router.push("/")}
                                    >
                                        <Home className="h-4 w-4" />
                                        Back to home
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="cursor-pointer"
                                        onClick={() => router.push("https://nuru.spiritbulb.org")}
                                    >
                                        Check out Nuru →
                                    </Button>
                                </div>
                            </div>

                            {/* Additional help */}
                            <div className="pt-8 border-t max-w-xl mx-auto">
                                <p className="text-sm text-muted-foreground">
                                    If you think this page should exist, or if something's
                                    broken,{" "}
                                    <button
                                        onClick={() => router.push("/contact")}
                                        className="font-medium hover:underline text-foreground cursor-pointer"
                                    >
                                        let us know
                                    </button>
                                    . We're still building, so we appreciate the heads up.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </BackgroundMeteors>
        </main>
    );
}