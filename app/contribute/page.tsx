'use client';
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Github } from "lucide-react";

type Project = {
    name: string;
    icon: string;
    description: string;
    badges: string[];
    github: string;
    beta: string;
    featured?: boolean;
};

const projects: Project[] = [
    {
        name: "MCloud",
        icon: "/menengai.ico",
        description:
            "MCloud manages apps and cloud services for merchants, brokers, and NGOs in Kenya. Your app is live in 60 seconds, SSL, backups, and uptime monitoring included. Read the code, or join the beta and tell us what to build next.",
        badges: ["Open beta", "Cloud services", "Free to start"],
        github: "https://github.com/Spiritbulb/mcloud",
        beta: "https://mcloud.co.ke/beta",
        featured: true,
    },
];

export default function ContributePage() {
    const featured = projects.find((p) => p.featured);

    return (
        <main className="bg-background">
            <section className="w-full py-40">
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl space-y-12">
                        {/* Header */}
                        <div className="space-y-4 text-center">
                            <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                                Build with us
                            </h1>
                            <p className="text-lg text-muted-foreground md:text-xl">
                                This is where open Spiritbulb projects live.
                                <br />
                                Read the code, join a beta, and help shape what we build next.
                            </p>
                        </div>

                        {/* Featured project */}
                        {featured && (
                            <Card className="mx-auto max-w-2xl">
                                <CardContent className="space-y-6 p-8">
                                    <img
                                        src={featured.icon}
                                        alt={featured.name}
                                        className="h-10 w-10"
                                        width={40}
                                        height={40}
                                        loading="lazy"
                                    />
                                    <div className="space-y-3">
                                        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                                            {featured.name}
                                        </h2>
                                        <p className="text-sm leading-relaxed text-muted-foreground">
                                            {featured.description}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {featured.badges.map((b) => (
                                            <Badge key={b} variant="secondary">
                                                {b}
                                            </Badge>
                                        ))}
                                    </div>
                                    <div className="flex flex-wrap gap-3 pt-2">
                                        <Button className="gap-2" asChild>
                                            <a
                                                href={featured.beta}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Join the beta <ExternalLink className="h-4 w-4" />
                                            </a>
                                        </Button>
                                        <Button variant="outline" className="gap-2" asChild>
                                            <a
                                                href={featured.github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Github className="h-4 w-4" /> See on GitHub
                                            </a>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* More coming soon */}
                        <div className="space-y-2 text-center">
                            <p className="text-sm font-medium text-muted-foreground">
                                More coming soon
                            </p>
                            <p className="mx-auto max-w-md text-sm text-muted-foreground">
                                As we open up more of what we're building, Reach, Nuru, Tufike and
                                beyond, they'll show up right here. Check back.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
