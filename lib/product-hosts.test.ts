import { describe, it, expect } from "vitest";
import { PRODUCT_SLUGS, productRedirects, productRewrites } from "@/lib/product-hosts";

type Rule = { source: string; has: { value: string }[]; destination: string };

/** What Vercel's router does: path equals source and the host matches the regex. */
function match(rules: Rule[], host: string, path: string) {
  return rules.find(
    (r) => r.source === path && r.has.every((h) => new RegExp(`^${h.value}$`).test(host)),
  );
}

describe("product subdomains", () => {
  const rewrites = productRewrites();
  const redirects = productRedirects();

  it("serves each product page at the root of its subdomain", () => {
    for (const slug of PRODUCT_SLUGS) {
      expect(match(rewrites, `${slug}.spiritb.uk`, "/")?.destination).toBe(`/${slug}`);
      expect(match(rewrites, `${slug}.localhost`, "/")?.destination).toBe(`/${slug}`);
    }
  });

  it("redirects the path form to the subdomain, so there is one indexable URL", () => {
    for (const slug of PRODUCT_SLUGS) {
      for (const host of ["spiritb.uk", "www.spiritb.uk"]) {
        expect(match(redirects, host, `/${slug}`)?.destination).toBe(`https://${slug}.spiritb.uk/`);
      }
    }
  });

  it("does not leave the same page reachable at two URLs on one subdomain", () => {
    expect(match(redirects, "nuru.spiritb.uk", "/nuru")?.destination).toBe("/");
  });

  it("sends nav links on one product subdomain to the right canonical URL", () => {
    expect(match(redirects, "nuru.spiritb.uk", "/reach")?.destination).toBe(
      "https://reach.spiritb.uk/",
    );
    expect(match(redirects, "tufike.spiritb.uk", "/pricing")?.destination).toBe(
      "https://spiritb.uk/pricing",
    );
    expect(match(redirects, "mcloud.spiritb.uk", "/contact")?.destination).toBe(
      "https://spiritb.uk/contact",
    );
  });

  it("never sends development hosts to the live site", () => {
    expect(match(redirects, "nuru.localhost", "/pricing")).toBeUndefined();
    expect(match(redirects, "nuru.localhost", "/reach")).toBeUndefined();
  });

  it("leaves non-product paths and hosts alone", () => {
    expect(match(rewrites, "spiritb.uk", "/")).toBeUndefined();
    expect(match(redirects, "spiritb.uk", "/contact")).toBeUndefined();
    expect(match(rewrites, "blog.spiritb.uk", "/")).toBeUndefined();
    expect(match(redirects, "preview-abc.vercel.app", "/nuru")).toBeUndefined();
  });
});
