import type { MetadataRoute } from "next";
import { SITE } from "@/lib/products";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /home is the signed-in hub and /login is a form. Neither is worth
      // indexing, and /home already sends noindex in its own metadata.
      disallow: ["/home", "/login", "/api/"],
    },
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
