// app/page.tsx  –  drop-in replacement for your homepage
// Add this to your layout.tsx or as a Next.js 13+ Metadata export from this file.
// The `metadata` export below is for Next.js App Router; move to layout if you prefer.

import type { Metadata } from "next";
import HomePage from "@/components/home-client";

export const metadata: Metadata = {
  // ── Core ──────────────────────────────────────────────────────────────────
  title: "Spiritbulb | Nuru, Reach, Menengai Cloud & Tufike",
  description:
    "Spiritbulb is a Kenyan tech company building four products: Nuru (student network), Reach (local e-commerce), Menengai Cloud (African infra), and Tufike (community events).",

  // ── Canonical & robots ────────────────────────────────────────────────────
  metadataBase: new URL("https://spiritbulb.org"),
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },

  // ── Open Graph (Facebook, WhatsApp, LinkedIn) ─────────────────────────────
  openGraph: {
    type: "website",
    url: "https://spiritbulb.org",
    siteName: "Spiritbulb",
    title: "Spiritbulb | Building Kenya's Digital Ecosystem",
    description:
      "Four products, one engine: Nuru connects students, Reach powers local merchants, Menengai Cloud is African infrastructure, and Tufike brings communities offline.",
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
    title: "Spiritbulb | Building Kenya's Digital Ecosystem",
    description:
      "Four products, one engine: Nuru, Reach, Menengai Cloud, and Tufike.",
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
        "Kenyan tech company building Nuru, Reach, Menengai Cloud, and Tufike.",
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
        "The official student network for Kenyan university students — verified campuses, shared spaces, and collaborative tools.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "KES" },
    },
    {
      "@type": "SoftwareApplication",
      name: "Reach",
      applicationCategory: "ShoppingApplication",
      operatingSystem: "Web",
      description:
        "Local e-commerce marketplace for Kenyan merchants. 13 merchants and KSH 250k+ in products listed in Nakuru within a month.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "KES" },
    },
    {
      "@type": "SoftwareApplication",
      name: "Menengai Cloud",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description:
        "Cloud infrastructure designed for Kenyan and African businesses — optimised for local latency, pricing, and reliability.",
    },
    {
      "@type": "SoftwareApplication",
      name: "Tufike",
      applicationCategory: "EventsApplication",
      operatingSystem: "Web",
      description:
        "Community events and meetup layer connecting students and builders in Kenya.",
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