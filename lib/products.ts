/**
 * The four products, in one place.
 *
 * Each one is a page in this app that the proxy also serves from its own
 * subdomain. The subdomain is the canonical URL, so `canonical` here is what
 * every product page reports to search engines and what the path form
 * (spiritb.uk/nuru) redirects to.
 *
 * Colours match the lotus petals in components/LotusNav.tsx.
 */

export const SITE = "https://spiritb.uk";

export type ProductStatus = "live" | "beta" | "building" | "waitlist";

export type Product = {
  slug: "nuru" | "reach" | "tufike" | "mcloud";
  name: string;
  color: string;
  /** The subdomain this product is served from. Canonical. */
  canonical: string;
  /** One line, for the page's <title> and search snippets. */
  tagline: string;
  /** The meta description. Says what it does and who it is for. */
  description: string;
  /** The h1. */
  heading: string;
  /** The paragraph under the h1. */
  intro: string;
  status: ProductStatus;
  /** What a visitor can actually do today. Honest, not aspirational. */
  statusLine: string;
  /** schema.org applicationCategory. */
  category: string;
  /** Proof points. Real numbers only. */
  facts: string[];
  /** Where the real product lives, if anywhere. */
  external?: { label: string; href: string };
};

export const PRODUCTS: Product[] = [
  {
    slug: "nuru",
    name: "Nuru",
    color: "#14B8A6",
    canonical: "https://nuru.spiritb.uk",
    tagline: "The study companion that chats with your notes",
    description:
      "Nuru is a study companion for Kenyan students. Upload your notes, ask questions, and get answers drawn from your own material. In closed Android beta.",
    heading: "Study with your own notes.",
    intro:
      "Nuru reads the material you already have and answers questions from it. No generic textbook answers, just your notes, your course, your words.",
    status: "beta",
    statusLine: "In closed beta with students on five campuses.",
    category: "EducationalApplication",
    facts: ["50+ students", "5 campuses", "Closed Android beta"],
  },
  {
    slug: "reach",
    name: "Reach",
    color: "#E0A030",
    canonical: "https://reach.spiritb.uk",
    tagline: "Storefronts and fulfilment for Kenyan merchants",
    description:
      "Reach gives Kenyan merchants a storefront, social selling, and fulfilment in one place. Live with merchants in Nakuru.",
    heading: "Sell where your customers already are.",
    intro:
      "Reach puts your catalogue online, keeps it in step with the channels you already sell on, and handles fulfilment. Built with merchants in Nakuru, not for a boardroom.",
    status: "live",
    statusLine:
      "Live with merchants in Nakuru. The web version is still being built.",
    category: "BusinessApplication",
    facts: ["13 merchants", "KSH 250k+ listed", "Nakuru"],
  },
  {
    slug: "tufike",
    name: "Tufike",
    color: "#D6453D",
    canonical: "https://tufike.spiritb.uk",
    tagline: "Community events and venues in Kenya",
    description:
      "Tufike is a home for community events and the venues that host them, pop-up style. Early, and being built in the open.",
    heading: "Events worth showing up to.",
    intro:
      "Tufike connects the people running community events with the venues that can host them. Small, local, and pop-up by nature.",
    status: "building",
    statusLine: "Still being built. Leave your email and we will tell you when it opens.",
    category: "EntertainmentApplication",
    facts: ["Community events", "Pop-up venues", "Early stage"],
  },
  {
    slug: "mcloud",
    name: "MCloud",
    color: "#38B6FF",
    canonical: "https://mcloud.spiritb.uk",
    tagline: "Apps and cloud services for Kenyan businesses",
    description:
      "MCloud runs apps and cloud services for merchants, brokers, and NGOs in Kenya. SSL, backups, and uptime monitoring included. Free to start.",
    heading: "Your app is live in 60 seconds.",
    intro:
      "MCloud runs the apps and cloud services behind Kenyan merchants, brokers, and NGOs. SSL, backups, and uptime monitoring come as standard.",
    status: "live",
    statusLine: "Live, and running on its own site.",
    category: "BusinessApplication",
    facts: ["Free to start", "SSL and backups included", "Uptime monitoring"],
    external: { label: "Go to mcloud.co.ke", href: "https://mcloud.co.ke" },
  },
];

export const bySlug = (slug: Product["slug"]) =>
  PRODUCTS.find((p) => p.slug === slug)!;

/** The metadata every product page shares, with the subdomain as canonical. */
export function productMetadata(p: Product) {
  const title = `${p.name} — ${p.tagline}`;
  return {
    title,
    description: p.description,
    alternates: { canonical: p.canonical },
    openGraph: {
      type: "website" as const,
      url: p.canonical,
      siteName: "Spiritbulb",
      title,
      description: p.description,
      locale: "en_KE",
      images: ["/og-image.png"],
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description: p.description,
      images: ["/og-image.png"],
    },
  };
}

/**
 * schema.org SoftwareApplication for a product page. Only claims what is true:
 * no fake ratings, no invented prices.
 */
export function productJsonLd(p: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: p.name,
    applicationCategory: p.category,
    operatingSystem: p.slug === "nuru" ? "Android" : "Web",
    url: p.canonical,
    description: p.description,
    inLanguage: "en-KE",
    areaServed: { "@type": "Country", name: "Kenya" },
    publisher: { "@type": "Organization", name: "Spiritbulb", url: SITE },
  };
}
