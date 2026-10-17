import type { Metadata } from "next";
import { Section } from "@/components/site/section";
import { Tbd } from "@/components/site/tbd";

// Placeholder for phase 5 of docs/site-plan.md. Not indexed until it has real content.
export const metadata: Metadata = {
  title: "About",
  alternates: { canonical: "/about" },
  robots: { index: false, follow: true },
};

export default function AboutPage() {
  return (
    <main>
      <Section as="h1" title="About" bordered={false}>
        <Tbd>founder story</Tbd>
      </Section>
    </main>
  );
}
