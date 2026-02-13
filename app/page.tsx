'use client';
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Marquee } from "@/components/ui/marquee";
import { ArrowRight, Users, Store, Cloud, Calendar } from "lucide-react";
import BackgroundMeteors from "@/components/ui/backgroundmeteors";
import { MotionGrid } from "@/components/ui/motion-grid";
import { HeroTerminal } from "@/components/HeroTerminal";
import { Highlighter } from "@/components/ui/highlighter";
import ChessGame from "@/components/Chess";
import LogoLoop from "@/components/LogoLoop";
import { useRouter } from "next/navigation";

const reachSrc = '/reach-w.png';
const tufikeSrc = '/tufike-w.png';
const menengaiSrc = '/menengai.ico';
const nuruSrc = '/nuru-l-tp.png';

const testimonials = [
  {
    name: "Wanjiru M.",
    role: "Computer Science, UoN",
    content: "Honestly didn't expect to find my coursemates here. We've been planning group projects through Nuru and it just... works? No one's getting left out of the WhatsApp group anymore.",
    platform: nuruSrc
  },
  {
    name: "Kevin O.",
    role: "Small business owner, Nakuru",
    content: "My shop's been here 8 years. Reach got me online in 2 days. Now people from Pipeline are ordering stuff they'd usually walk past. That's wild.",
    platform: reachSrc
  },
  {
    name: "Akinyi J.",
    role: "Engineering student, JKUAT",
    content: "There's this space on Nuru for Mech students where we share notes and complain about exams. It's stupid how much it helps. Like, why didn't this exist before?",
    platform: nuruSrc
  },
  {
    name: "Faith N.",
    role: "Fashion vendor, Nakuru",
    content: "I was skeptical. Another platform? But my neighbor showed me her sales on Reach and I signed up same day. Already made back what I spent on photos.",
    platform: reachSrc
  },
  {
    name: "Daniel M.",
    role: "Business student, Strathmore",
    content: "We use Nuru to coordinate our startup team. Six of us across three campuses. Beats Slack for our budget and actually built for how we work here.",
    platform: nuruSrc
  },
  {
    name: "Mercy W.",
    role: "Salon owner, Nakuru CBD",
    content: "My customers kept asking if I had an online shop. Reach made it so easy I felt dumb for waiting. Listed 50 products in one afternoon.",
    platform: reachSrc
  },
  {
    name: "Ian K.",
    role: "CS student, KU",
    content: "Met three guys in my Nuru space who are working on similar projects. We're literally in the same building but never talked before. Now we hack together every week.",
    platform: nuruSrc
  }
];

function TestimonialCard({ testimonial }: { testimonial: typeof testimonials[0] }) {
  return (
    <Card className="w-[350px] shrink-0">
      <CardContent className="p-6">
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            "{testimonial.content}"
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{testimonial.role}</p>
            </div>
            <Highlighter action="highlight" color={testimonial.platform === reachSrc ? "var(--highlight-reach)" : "var(--highlight-transparent)"}>
              <div className="flex items-center gap-2">
                <img src={testimonial.platform} alt="Platform logo" className="h-8 w-auto" />
              </div>
            </Highlighter>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    let isScrolling = false;

    const smoothScroll = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY * 0.5;

      window.scrollBy({
        top: delta,
        behavior: 'auto'
      });
    };

    window.addEventListener('wheel', smoothScroll, { passive: false });

    return () => {
      window.removeEventListener('wheel', smoothScroll);
    };
  }, []);

  useEffect(() => {
    setMounted(true);

    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      document.documentElement.setAttribute('data-theme', storedTheme);
      if (storedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = prefersDark ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="w-full overflow-hidden py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Chess Game */}
            <div className="w-full flex justify-center lg:justify-end order-2 lg:order-1">
              <div className="w-full max-w-xl">
                <ChessGame />
              </div>
            </div>

            {/* Text Content */}
            <div className="w-full flex items-center order-1 lg:order-2">
              <div className="w-full space-y-8">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                    Hey there!
                  </h1>
                  <p className="text-lg text-muted-foreground md:text-xl">
                    We've put a very confident chess player on the other side of this board. Can you beat them?
                    <br /><br />
                    Hi, we're <Highlighter action="underline" color="var(--highlight-spiritbulb)">Spiritbulb</Highlighter>, a young Kenyan company building an engine with four
                    pistons: Nuru, Reach, Menengai Cloud, and Tufike.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <Button size="lg" className="gap-2 cursor-pointer" onClick={() => router.push("https://nuru.spiritbulb.org")}>
                    See Nuru
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="lg" className="cursor-pointer" onClick={() => router.push("/careers")}>
                    Join the team →
                  </Button>
                </div>

                <div className="flex flex-wrap gap-8 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span>While you're here, try and</span>
                    <span className="text-sm font-semibold text-foreground">beat us </span>
                    <span>at chess!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nuru Section with Testimonials */}
      <section className="w-full border-b overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: Brand Info */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <img src="/nuru-l-tp.png" alt="Nuru" className="h-8 w-8" />
                </div>
                <h2 className="text-3xl font-bold md:text-4xl">
                  Getting the vibe right
                </h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Nuru is the official student network we're starting at the top
                    with. Over 50+ students registered and 5+ spaces already created,
                    just from a quiet MVP (<a href="https://stridecampus.com" target="_blank" rel="noopener noreferrer" className="underline">Stride Campus</a>).
                  </p>
                  <p>
                    Students built the community. We mostly stayed out of the way and
                    listened.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary">50+ students</Badge>
                <Badge variant="secondary">5+ spaces</Badge>
                <Badge variant="secondary">Verified campuses</Badge>
              </div>

              <Button className="gap-2 cursor-pointer" onClick={() => router.push("https://nuru.spiritbulb.org")}>
                Visit Nuru
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Right: Testimonials Marquee */}
            <div className="flex items-center overflow-hidden">
              <div className="w-full space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  What people are saying
                </h3>
                <div className="relative">
                  <Marquee pauseOnHover className="[--duration:60s]">
                    {testimonials
                      .filter((t) => t.platform === nuruSrc)
                      .map((testimonial, i) => (
                        <TestimonialCard key={i} testimonial={testimonial} />
                      ))}
                  </Marquee>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reach Section with Testimonials */}
      <section className="w-full border-b overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: Brand Info */}
            <div className="space-y-6">
              <div className="space-y-4">
                <Highlighter action="highlight" color="var(--highlight-reach)">
                  <div className="flex items-center gap-2">
                    <img src={reachSrc} alt="Reach" className="h-8 w-auto" />
                  </div>
                </Highlighter>
                <h2 className="text-3xl font-bold md:text-4xl">
                  Nakuru already answered
                </h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    MVP in Nakuru: 13 merchants and over KSH 250k worth of products
                    listed in under a month. No billboards. Just "tell your friends".
                  </p>
                  <p>
                    We didn't invent local e‑commerce. We just made it less painful
                    for the people actually doing the selling.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary">13 merchants</Badge>
                <Badge variant="secondary">KSH 250k+ listed</Badge>
                <Badge variant="secondary">Nakuru</Badge>
              </div>

              <Button className="gap-2 cursor-pointer" onClick={() => router.push('https://blog.spiritbulb.org/the-easiest-social-marketplace-experience')}>
                Learn more about Reach
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Right: Testimonials Marquee */}
            <div className="flex items-center overflow-hidden">
              <div className="w-full space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  From local merchants
                </h3>
                <div className="relative">
                  <Marquee pauseOnHover reverse className="[--duration:50s]">
                    {testimonials
                      .filter((t) => t.platform === reachSrc)
                      .map((testimonial, i) => (
                        <TestimonialCard key={i} testimonial={testimonial} />
                      ))}
                  </Marquee>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menengai Cloud Section */}
      <section className="w-full border-b overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <img src='/menengai.ico' alt="Menengai" className="h-8 w-8" />
              </div>
              <h2 className="text-3xl font-bold md:text-4xl">
                The quiet engine
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  While Nuru and Reach prove the demand on the surface, Menengai
                  Cloud is the infrastructure layer we're building underneath.
                </p>
                <p>
                  Think "cloud, but opinionated for Kenyan problems" — latency,
                  pricing, and reliability that make sense on this side of the
                  world.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Badge variant="secondary">Backend & data</Badge>
              <Badge variant="secondary">In development</Badge>
              <Badge variant="secondary">Target 2026</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Tufike Section */}
      <section className="w-full border-b overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl space-y-8">
            <div className="space-y-4">
              <Highlighter action="highlight" color="var(--highlight-reach)">
                <div className="flex items-center gap-2">
                  <img src={tufikeSrc} alt="Tufike" className="h-8 w-auto" />
                </div>
              </Highlighter>
              <h2 className="text-3xl font-bold md:text-4xl">
                Where you'd actually show up
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  Tufike is our events and community layer — the part where you
                  leave the screen and actually meet the people you've been
                  building with.
                </p>
                <p>
                  Still early, but the demand is loud: students and young builders
                  keep asking for rooms, not just links.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Badge variant="secondary">Community events</Badge>
              <Badge variant="secondary">Early stage</Badge>
              <Badge variant="secondary">Pop‑up style</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* All Testimonials Marquee */}
      <section className="w-full border-b overflow-hidden">
        <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold">
                Real feedback from real people
              </h3>
              <p className="mt-2 text-muted-foreground">
                No marketing speak. Just what users actually said.
              </p>
            </div>
            <div className="relative">
              <Marquee pauseOnHover className="[--duration:80s]">
                {testimonials.map((testimonial, i) => (
                  <TestimonialCard key={i} testimonial={testimonial} />
                ))}
              </Marquee>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full overflow-hidden">
        <div className="container mx-auto px-4 py-20 md:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl space-y-8 text-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold md:text-4xl">
                It's cool, a little challenging, and worth it.
              </h2>
              <p className="text-lg text-muted-foreground">
                We're still early. The brands are proving themselves in the wild,
                and we're welding everything together into one ecosystem as we go.
                If you care about students, local merchants, or African infra, this
                is your kind of chaos.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" className="gap-2 cursor-pointer" onClick={() => router.push('/contact')}>
                Talk to Spiritbulb
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="cursor-pointer" size="lg" onClick={() => router.push("https://nuru.spiritbulb.org")}>
                See what Nuru is doing →
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main >
  );
}