'use client';
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Mail, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CareersPage() {
    const router = useRouter();

    return (
        <main className="min-h-screen bg-background">
            <section className="w-full py-40">
                <div className="container mx-auto px-4 py-20 md:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl space-y-12">
                        {/* Header */}
                        <div className="space-y-4 text-center">
                            <Badge variant="secondary" className="mb-4">
                                Coming Soon
                            </Badge>
                            <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                                We're not hiring yet
                            </h1>
                            <p className="text-lg text-muted-foreground md:text-xl">
                                But we will be. Soon.
                                <br />
                                Right now, we're heads down building, testing, and proving
                                that what we're doing actually works.
                            </p>
                        </div>

                        {/* Main Content Card */}
                        <Card className="mx-auto max-w-3xl">
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-bold">
                                        What we're looking for (when we start)
                                    </h2>
                                    <p className="text-muted-foreground">
                                        When hiring opens up, we'll be looking for people who get
                                        it, the kind who care about building things that matter,
                                        not just padding a resume. Engineers who can ship.
                                        Designers who understand users. Operators who don't need
                                        hand-holding.
                                    </p>
                                    <p className="text-muted-foreground">
                                        If you're the type who'd rather build in Nairobi than
                                        chase Silicon Valley clout, you're our kind of person.
                                    </p>
                                </div>

                                <div className="space-y-4 pt-4 border-t">
                                    <h3 className="text-lg font-semibold">
                                        Want to be first to know?
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Drop us a note at{" "}
                                        <a
                                            href="mailto:hello@spiritbulb.org"
                                            className="font-medium hover:underline text-foreground"
                                        >
                                            hello@spiritbulb.org
                                        </a>{" "}
                                        with "Careers" in the subject. Tell us who you are, what
                                        you do, and why you care. No formal cover letters. Just
                                        be real.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Timeline Section */}
                        <div className="mx-auto max-w-2xl space-y-6 text-center">
                            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                <Calendar className="h-5 w-5" />
                                <span className="text-sm font-medium">
                                    Expected hiring timeline: Mid-2026
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                We're focused on getting Nuru and Reach stable, proving
                                Menengai Cloud, and making sure we're building something
                                worth joining. Once we hit those milestones, we'll open the
                                doors.
                            </p>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap items-center justify-center gap-4 pt-8">
                            <Button
                                size="lg"
                                className="gap-2 cursor-pointer"
                                onClick={() => router.push("/contact")}
                            >
                                Get in touch
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="gap-2 cursor-pointer"
                                onClick={() => router.push("/")}
                            >
                                Back to home
                            </Button>
                        </div>
                    </div>
                </div>

            </section>
        </main>
    );
}