import type { Metadata } from "next";
import { Section } from "@/components/site/section";
import { Tbd } from "@/components/site/tbd";

// Placeholder for phase 5 of docs/site-plan.md. Not indexed until it has real content.
export const metadata: Metadata = {
  title: "Pricing",
  alternates: { canonical: "/pricing" },
  robots: { index: false, follow: true },
};

export default function PricingPage() {
  return (
    <main>
      <Section as="h1" title="Pricing" bordered={false}>
        <Tbd>Reach and MCloud plans and prices</Tbd>
      </Section>
    </main>
  );
}
