import type { Metadata } from "next";
import { Section } from "@/components/site/section";
import { Tbd } from "@/components/site/tbd";

// Placeholder for phase 5 of docs/site-plan.md. Not indexed until it has real content.
export const metadata: Metadata = {
  title: "Models",
  alternates: { canonical: "/models" },
  robots: { index: false, follow: true },
};

export default function ModelsPage() {
  return (
    <main>
      <Section as="h1" title="Models" bordered={false}>
        <Tbd>model catalog, names, access method</Tbd>
      </Section>
    </main>
  );
}
