/**
 * Site-wide facts: the organisation, the navigation, the contact topics, and
 * the offerings that are not self-serve.
 *
 * Products and their status live in lib/products.ts. Everything a badge or a
 * button says comes from one of these two files, so a status change is one
 * edit. See docs/site-plan.md §1 for the claims rules these encode.
 */

export const SITE = "https://spiritb.uk";

export const ORG = {
  name: "Spiritbulb",
  url: SITE,
  logo: `${SITE}/logo.svg`,
  email: "hello@spiritbulb.org",
  /** The year Spiritbulb was registered. */
  founded: "2024",
  founders: ["Bentley Busienei", "Stephanie Kanji", "Nelly Miano"],
  slogan: "#ThatsTheSpirit",
  social: {
    twitter: "https://twitter.com/spiritbulb",
    github: "https://github.com/spiritbulb",
    linkedin: "https://www.linkedin.com/company/spiritbulb",
    facebook: "https://www.facebook.com/spiritbulb",
    instagram: "https://www.instagram.com/spiritbulb",
  },
  phone: "+254-707-098-169",
  address: {
    street: "Kenyatta Avenue",
    locality: "Nakuru",
    postalCode: "20100",
    country: "KE",
  },
} as const;

/**
 * Statuses for things that are not products: offerings sold by conversation,
 * and features that are announced but not built. Products use ProductStatus.
 */
export type OfferingStatus = "on-request" | "coming" | "by-approval";

export type ContactTopic = { id: string; label: string };

/** The Contact form's topic selector, and the `?topic=` values links may use. */
export const CONTACT_TOPICS = [
  { id: "general", label: "General" },
  { id: "kenyan-hosting", label: "Kenyan hosting" },
  { id: "institution", label: "Institution / school" },
  { id: "partnership", label: "Partnership" },
] as const satisfies readonly ContactTopic[];

export type ContactTopicId = (typeof CONTACT_TOPICS)[number]["id"];

export const contactHref = (topic: ContactTopicId) => `/contact?topic=${topic}`;

/**
 * Offerings that exist but are arranged by talking to us, not from a
 * dashboard. Pages must label them "On request" and link to Contact, never to
 * a sign-up.
 */
export const OFFERINGS = {
  hostedModels: {
    label: "Open-source models, hosted for you",
    status: "on-request",
    topic: "partnership",
  },
  byoModel: {
    label: "Bring your own model and run it on MCloud",
    status: "on-request",
    topic: "partnership",
  },
  ownServers: {
    label: "Run on your own servers",
    status: "on-request",
    topic: "general",
  },
  /** Only ever shown on the MCloud page and in the Contact flow. */
  kenyanHosting: {
    label: "Hosting in Kenya",
    status: "on-request",
    topic: "kenyan-hosting",
  },
} as const satisfies Record<
  string,
  { label: string; status: OfferingStatus; topic: ContactTopicId }
>;

/** The top navigation, in the order of the site map. */
export const NAV = [
  { label: "Reach", href: "/reach" },
  { label: "MCloud", href: "/mcloud" },
  { label: "Tufike", href: "/tufike" },
  { label: "Nuru", href: "/nuru" },
  { label: "Models", href: "/models" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

/** Site pages, as opposed to product pages. Product subdomains send these to the root domain. */
export const SITE_PATHS = [
  "/models",
  "/pricing",
  "/about",
  "/contact",
  "/careers",
  "/contribute",
  "/privacy",
  "/terms",
] as const;

/** schema.org Organization for the root layout. Only facts the owner has confirmed. */
export function orgJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE}/#org`,
    name: ORG.name,
    url: ORG.url,
    logo: ORG.logo,
    email: ORG.email,
    sameAs: Object.values(ORG.social),
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: ORG.phone,
        contactType: "Executive",
        availableLanguage: ["en", "sw"],
      },
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: ORG.address.street,
      addressLocality: ORG.address.locality,
      postalCode: ORG.address.postalCode,
      addressCountry: ORG.address.country,
    },
    foundingDate: ORG.founded,
    founders: ORG.founders.map((name) => ({ "@type": "Person", name })),
    slogan: ORG.slogan,
  };
}
