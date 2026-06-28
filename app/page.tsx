// app/page.tsx  –  drop-in replacement for your homepage
// Add this to your layout.tsx or as a Next.js 13+ Metadata export from this file.
// The `metadata` export below is for Next.js App Router; move to layout if you prefer.

import type { Metadata } from "next";
import HomePage from "@/components/home-client";

export const metadata: Metadata = {
  // ── Core ──────────────────────────────────────────────────────────────────
  title: "Spiritbulb | Build, sell, and engage your audience",
  description:
    "Spiritbulb provides an ecosystem to build, sell, and engage your audience. MCloud, Reach, Nuru, and Tufike, running on Spiritbulb's own infrastructure in Kenya.",

  // ── Canonical & robots ────────────────────────────────────────────────────
  metadataBase: new URL("https://spiritbulb.org"),
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },

  // ── Open Graph (Facebook, WhatsApp, LinkedIn) ─────────────────────────────
  openGraph: {
    type: "website",
    url: "https://spiritbulb.org",
    siteName: "Spiritbulb",
    title: "Spiritbulb | Build, sell, and engage your audience",
    description:
      "Spiritbulb provides an ecosystem to build, sell, and engage your audience. MCloud, Reach, Nuru, and Tufike run on Spiritbulb's own infrastructure.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Spiritbulb | Nuru, Reach, Menengai Cloud, Tufike",
      },
    ],
    locale: "en_KE",
  },

  // ── Twitter / X Card ──────────────────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    site: "@spiritbulb",
    title: "Spiritbulb | Build, sell, and engage your audience",
    description:
      "MCloud, Reach, Nuru, and Tufike, the Spiritbulb ecosystem, built in Kenya.",
    images: ["/og-image.png"],
  },

  // ── Keywords (minor signal but still useful) ──────────────────────────────
  keywords: [
    "Spiritbulb",
    "Nuru student network Kenya",
    "Reach e-commerce Nakuru",
    "Menengai Cloud",
    "Tufike events Kenya",
    "Kenyan tech startup",
    "African cloud infrastructure",
    "local marketplace Kenya",
  ],
};

// ── JSON-LD Structured Data ───────────────────────────────────────────────────
// Inline it as a <script> in the page so crawlers and rich-result tools see it.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://spiritbulb.org/#org",
      name: "Spiritbulb",
      url: "https://spiritbulb.org",
      logo: {
        "@type": "ImageObject",
        url: "https://spiritbulb.org/spiritbulb-logo.png",
      },
      sameAs: [
        "https://twitter.com/spiritbulb",  // update
        "https://linkedin.com/company/spiritbulb",
      ],
      description:
        "Spiritbulb provides an ecosystem to build, sell, and engage your audience. Runs on its own infrastructure in Kenya.",
      foundingLocation: {
        "@type": "Place",
        name: "Kenya",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://spiritbulb.org/#website",
      url: "https://spiritbulb.org",
      name: "Spiritbulb",
      publisher: { "@id": "https://spiritbulb.org/#org" },
    },
    // Product entries (SoftwareApplication schema)
    {
      "@type": "SoftwareApplication",
      name: "Nuru",
      applicationCategory: "SocialNetworkingApplication",
      operatingSystem: "Web",
      url: "https://nuru.spiritbulb.org",
      description:
        "Nuru manages educational content for institutions in Kenya.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "KES" },
    },
    {
      "@type": "SoftwareApplication",
      name: "Reach",
      applicationCategory: "ShoppingApplication",
      operatingSystem: "Web",
      description:
        "Reach manages social media and fulfillment integrations for merchants and NGOs in Kenya.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "KES" },
    },
    {
      "@type": "SoftwareApplication",
      name: "Menengai Cloud",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description:
        "MCloud manages apps and cloud services for merchants, brokers, and NGOs in Kenya.",
    },
    {
      "@type": "SoftwareApplication",
      name: "Tufike",
      applicationCategory: "EventsApplication",
      operatingSystem: "Web",
      description:
        "Tufike manages brand exposure and venues in Kenya.",
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomePage />
    </>
  );
}