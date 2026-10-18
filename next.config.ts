import type { NextConfig } from "next";
import { productRedirects, productRewrites } from "./lib/product-hosts";

const nextConfig: NextConfig = {
  // Dev only: lets a phone on the same network load the dev server's scripts.
  // Without it Next blocks them for any origin but localhost, so the page
  // renders but never hydrates (links work, buttons do nothing).
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*", "*.local"],
  async redirects() {
    return productRedirects();
  },
  async rewrites() {
    // beforeFiles: the subdomain root must win over app/page.tsx.
    return { beforeFiles: productRewrites(), afterFiles: [], fallback: [] };
  },
};

export default nextConfig;
