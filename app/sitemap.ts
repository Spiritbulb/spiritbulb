import type { MetadataRoute } from "next";
import { PRODUCTS } from "@/lib/products";
import { SITE } from "@/lib/site";

/**
 * Products are listed at their subdomain, because that is the canonical URL the
 * product pages declare. Listing the spiritb.uk/<slug> path here instead would
 * point search engines at a URL that redirects.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const marketing = ["", "/contact", "/careers", "/contribute"].map((path) => ({
    url: `${SITE}${path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.6,
  }));

  const legal = ["/privacy", "/terms"].map((path) => ({
    url: `${SITE}${path}`,
    lastModified: now,
    changeFrequency: "yearly" as const,
    priority: 0.3,
  }));

  const products = PRODUCTS.map((p) => ({
    url: p.canonical,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...marketing, ...products, ...legal];
}
