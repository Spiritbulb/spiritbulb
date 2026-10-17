// Product subdomains (nuru.spiritb.uk, ...) as declarative routing rules.
// These live in next.config rather than proxy.ts on purpose: rules are applied by
// Vercel's routing layer, so a page view costs no function invocation. A proxy that
// matches every path would run a function for every view of an otherwise static page.

import { SITE_PATHS } from "./site";

/** Products served from their own subdomain. Keep in step with lib/products.ts. */
export const PRODUCT_SLUGS = ["nuru", "reach", "tufike", "mcloud"] as const;

export const ROOT_HOST = "spiritb.uk";

type HostCondition = { type: "host"; value: string };

const subdomainOf = (slug: string): HostCondition[] => [
  // nuru.spiritb.uk, and nuru.localhost so the rewrite can be exercised in development.
  { type: "host", value: `${slug}\\..+` },
];

const rootDomain: HostCondition[] = [
  { type: "host", value: "(www\\.)?spiritb\\.uk" },
];

/** On a product subdomain the root serves that product's page, URL unchanged. */
export function productRewrites() {
  return PRODUCT_SLUGS.map((slug) => ({
    source: "/",
    has: subdomainOf(slug),
    destination: `/${slug}`,
  }));
}

/**
 * Any product subdomain in production. Deliberately not localhost: following
 * these in development would leave the dev server for the live site.
 */
const anyProductSubdomain: HostCondition[] = [
  { type: "host", value: `(${PRODUCT_SLUGS.join("|")})\\.spiritb\\.uk` },
];

/** One page, one indexable URL: the path form always goes to the subdomain form. */
export function productRedirects() {
  const own = PRODUCT_SLUGS.flatMap((slug) => [
    // nuru.spiritb.uk/nuru would be the same page at a second URL. Send it home.
    { source: `/${slug}`, has: subdomainOf(slug), destination: "/", permanent: true },
    {
      source: `/${slug}`,
      has: rootDomain,
      destination: `https://${slug}.${ROOT_HOST}/`,
      permanent: true,
    },
  ]);

  // The site navigation uses path links. From nuru.spiritb.uk, /reach is
  // Reach's subdomain and /pricing is the root domain's page.
  const fromSubdomains = [
    ...PRODUCT_SLUGS.map((slug) => ({
      source: `/${slug}`,
      has: anyProductSubdomain,
      destination: `https://${slug}.${ROOT_HOST}/`,
      permanent: true,
    })),
    ...SITE_PATHS.map((path) => ({
      source: path,
      has: anyProductSubdomain,
      destination: `https://${ROOT_HOST}${path}`,
      permanent: true,
    })),
  ];

  // Own-subdomain rules first: Vercel applies the first redirect that matches.
  return [...own, ...fromSubdomains];
}
