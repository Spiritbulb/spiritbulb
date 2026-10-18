/**
 * The four products, in one place: the four doors of docs/site-plan.md.
 *
 * This is the status config. Badges, buttons, the lotus, the hub and the
 * sitemap all read from here, so when a product's status changes, change it
 * here and nowhere else.
 *
 * Each product is a page in this app that is also served from its own
 * subdomain. The subdomain is the canonical URL, so `canonical` here is what
 * every product page reports to search engines and what the path form
 * (spiritb.uk/nuru) redirects to.
 *
 * `color` is a design token (app/globals.css), so pages and graphics follow
 * light and dark mode from one place.
 */

import { SITE, contactHref } from "@/lib/site";

export type ProductStatus = "live" | "preview" | "waitlist";

/**
 * What pressing a button does. Only `signup` and `preview` may look like a
 * sign-up button; `waitlist` and `contact` are always styled as secondary,
 * because they do not get you into a product.
 */
export type ActionKind = "signup" | "preview" | "waitlist" | "contact";

export type Action = {
  label: string;
  href: string;
  kind: ActionKind;
  /** Small print under the button. */
  note?: string;
  /**
   * Set while the destination is unknown. The button then renders with a
   * visible {{TBD}} marker instead of pretending to work.
   */
  tbd?: string;
};

export const STATUS_LABEL: Record<ProductStatus, string> = {
  live: "Live",
  preview: "Preview",
  waitlist: "Waitlist",
};

export type Product = {
  slug: "nuru" | "reach" | "tufike" | "mcloud";
  name: string;
  /** The door this product is. */
  verb: "Sell" | "Host" | "Gather" | "Teach";
  /** The door card line on the homepage. */
  door: string;
  /** Fill: bands, petals, marks. A design token, the same in both themes. */
  color: string;
  /** The same hue, readable as text on the page in either theme. */
  textColor: string;
  status: ProductStatus;
  primary: Action;
  secondary?: Action;
  /** The subdomain this product is served from. Canonical. */
  canonical: string;
  // The fields below feed the current product pages and are rewritten in
  // phase 4 of the site plan.
  /** One line, for the page's <title> and search snippets. */
  tagline: string;
  /** The meta description. Says what it does and who it is for. */
  description: string;
  /** The h1. */
  heading: string;
  /** The paragraph under the h1. */
  intro: string;
  /** schema.org applicationCategory. */
  category: string;
};

export const PRODUCTS: Product[] = [
  {
    slug: "reach",
    name: "Reach",
    verb: "Sell",
    door: "Build a storefront and sell on the marketplace.",
    color: "var(--reach)",
    textColor: "var(--reach-text)",
    status: "live",
    // Storefronts are built in the MCloud store app until Reach has its own web app.
    primary: {
      label: "Start selling",
      href: "https://app.mcloud.co.ke",
      kind: "signup",
      note: "Free plan to start.",
    },
    canonical: "https://reach.spiritb.uk",
    tagline: "Build a storefront and sell on the marketplace",
    description:
      "Open a themed storefront, take M-Pesa and share your link today. On a paid plan, apply to the Reach marketplace and get in front of buyers in your delivery zone.",
    heading: "Build a storefront. Sell on the marketplace.",
    intro:
      "Open a themed storefront, take M-Pesa and share your link today. When you're ready, apply to the Reach marketplace and get in front of buyers in your delivery zone.",
    category: "ShoppingApplication",
  },
  {
    slug: "mcloud",
    name: "MCloud",
    verb: "Host",
    door: "Managed infrastructure with local billing, running on clean energy.",
    color: "var(--mcloud)",
    textColor: "var(--mcloud-text)",
    status: "live",
    primary: { label: "Get started", href: "/go/mcloud?to=/", kind: "signup" },
    canonical: "https://mcloud.spiritb.uk",
    tagline: "Managed infrastructure with local billing, on clean energy",
    description:
      "MCloud is managed infrastructure with easy local billing, running on green infrastructure, for East African businesses and institutions. Hosted AI models and your own servers are available on request.",
    heading: "Managed infrastructure, billed the local way.",
    intro:
      "MCloud runs your shop with easy local billing. Need AI models hosted, or want to run on your own servers? Talk to us.",
    category: "BusinessApplication",
  },
  {
    slug: "tufike",
    name: "Tufike",
    verb: "Gather",
    door: "Ticketing plus the before and after that keeps your audience hooked.",
    color: "var(--tufike)",
    textColor: "var(--tufike-text)",
    status: "waitlist",
    primary: {
      label: "Join the waitlist",
      href: "/tufike#waitlist",
      kind: "waitlist",
      note: "Waitlist members hear first.",
    },
    canonical: "https://tufike.spiritb.uk",
    tagline: "Ticketing and events people keep talking about",
    description:
      "Tufike is seamless ticketing plus the pre-event and post-event experiences that keep an audience hooked. Join the waitlist.",
    heading: "Throw events people keep talking about.",
    intro:
      "Seamless ticketing, plus the before and after that keeps your audience hooked. For organizers who want more than a head count.",
    category: "EntertainmentApplication",
  },
  {
    slug: "nuru",
    name: "Nuru",
    verb: "Teach",
    door: "AI built for learning. Upload what you study, get notes and questions, and keep a library you control.",
    color: "var(--nuru)",
    textColor: "var(--nuru-text)",
    status: "preview",
    primary: {
      label: "Try the preview",
      // The preview is built into the Nuru page itself, on MCloud's Nuru partner APIs.
      href: "/nuru#preview",
      tbd: "Nuru web preview, built on the Nuru page",
      kind: "preview",
      note: "Free daily messages, so you can try Nuru on real work.",
    },
    secondary: { label: "Talk to us", href: contactHref("institution"), kind: "contact" },
    canonical: "https://nuru.spiritb.uk",
    tagline: "AI built for learning",
    description:
      "Upload what you're learning. Nuru turns it into notes, questions, and a library that's yours. Free preview on the web.",
    heading: "Upload what you're learning. Nuru turns it into notes, questions, and a library that's yours.",
    intro:
      "Chat with Nuru, share what you make, and let anyone you choose ask Nuru about it.",
    category: "EducationalApplication",
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
    operatingSystem: "Web",
    url: p.canonical,
    description: p.description,
    inLanguage: "en-KE",
    areaServed: { "@type": "Country", name: "Kenya" },
    publisher: { "@type": "Organization", name: "Spiritbulb", url: SITE },
  };
}
