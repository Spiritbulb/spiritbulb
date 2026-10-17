import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { PRODUCTS, STATUS_LABEL } from "@/lib/products";
import { PRODUCT_SLUGS } from "@/lib/product-hosts";
import { CONTACT_TOPICS, NAV, OFFERINGS } from "@/lib/site";

// The claims rules of docs/site-plan.md §1, pinned against the config.

describe("status config", () => {
  it("has one entry per product subdomain, in door order", () => {
    expect(PRODUCTS.map((p) => p.slug).sort()).toEqual([...PRODUCT_SLUGS].sort());
    expect(PRODUCTS.map((p) => p.verb)).toEqual(["Sell", "Host", "Gather", "Teach"]);
  });

  it("gives every status a badge label", () => {
    for (const p of PRODUCTS) expect(STATUS_LABEL[p.status]).toBeTruthy();
  });

  it("never gives a waitlist product a sign-up button", () => {
    for (const p of PRODUCTS.filter((p) => p.status === "waitlist")) {
      expect(p.primary.kind).toBe("waitlist");
    }
  });

  it("only lets live products sign people up, and only previews say preview", () => {
    for (const p of PRODUCTS) {
      if (p.primary.kind === "signup") expect(p.status).toBe("live");
      if (p.primary.kind === "preview") expect(p.status).toBe("preview");
    }
  });

  it("keeps offerings that are not self-serve pointed at a real contact topic", () => {
    const topics = CONTACT_TOPICS.map((t) => t.id) as string[];
    for (const o of Object.values(OFFERINGS)) expect(topics).toContain(o.topic);
  });

  it("links the navigation to every product", () => {
    const hrefs = NAV.map((n) => n.href) as string[];
    for (const slug of PRODUCT_SLUGS) expect(hrefs).toContain(`/${slug}`);
  });
});

/** Every source file a visitor's page can be built from. */
function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return sources(full);
    return /\.(tsx?|json)$/.test(name) && !name.endsWith(".test.ts") ? [full] : [];
  });
}

describe("banned phrases", () => {
  const root = path.resolve(__dirname, "..");
  const files = ["app", "components", "lib"].flatMap((d) => sources(path.join(root, d)));

  it.each([
    ["intelligent infrastructure", /intelligent infrastructure/i],
    ["open library", /open library/i],
    // Kenyan hosting is on request and only on the MCloud page and Contact (§1).
    ["hosted in Kenya", /hosted in kenya|infrastructure in kenya/i],
  ])("never says %s", (_, re) => {
    const hits = files.filter((f) => re.test(readFileSync(f, "utf8")));
    expect(hits.map((f) => path.relative(root, f))).toEqual([]);
  });
});
