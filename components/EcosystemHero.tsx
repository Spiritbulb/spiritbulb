"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Highlighter } from "@/components/ui/highlighter";
import LotusMark from "@/components/LotusMark";

export default function EcosystemHero() {
  return (
    <section className="w-full overflow-hidden pt-12 md:pt-20 py-16 md:py-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="space-y-8 lg:order-1">
            <div className="space-y-4">
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">
                Four branches.{" "}
                <Highlighter action="underline" color="var(--highlight-spiritbulb)">
                  One ecosystem.
                </Highlighter>
              </h1>
              <p className="text-base text-muted-foreground md:text-lg leading-relaxed">
                Spiritbulb is one platform to build, sell, and engage. Four products, a single login. Come try the ones that are live.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" className="gap-2" asChild>
                <a href="/login">
                  Try it live <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="ghost" size="lg" asChild className="border">
                <a href="#menengai">See the ecosystem</a>
              </Button>
            </div>
          </div>
          <div className="relative lg:order-2 hidden lg:flex justify-center">
            <LotusMark className="w-full max-w-[380px]" />
          </div>
        </div>
      </div>
    </section>
  );
}
