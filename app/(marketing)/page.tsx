import type { Metadata } from "next";
import HomePage from "@/components/home/home-page";
import { HERO, ONE_LINER } from "@/lib/copy";
import { PRODUCTS, productJsonLd } from "@/lib/products";
import { ORG, SITE } from "@/lib/site";

const title = `${ORG.name}: ${HERO.headline}`;

export const metadata: Metadata = {
  title: { absolute: title },
  description: ONE_LINER,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE,
    siteName: ORG.name,
    title,
    description: ONE_LINER,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: `${ORG.name}: Reach, MCloud, Tufike, Nuru` }],
    locale: "en_KE",
  },
  twitter: {
    card: "summary_large_image",
    site: "@spiritbulb",
    title,
    description: ONE_LINER,
    images: ["/og-image.png"],
  },
};

// The Organization lives in the root layout. Here: the site, and the four products,
// each described by the same config as its own page.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE}/#website`,
      url: SITE,
      name: ORG.name,
      publisher: { "@id": `${SITE}/#org` },
    },
    // Inside a @graph the entries share the outer @context.
    ...PRODUCTS.map((p) =>
      Object.fromEntries(
        Object.entries(productJsonLd(p)).filter(([key]) => key !== "@context")
      )
    ),
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
