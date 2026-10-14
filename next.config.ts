import type { NextConfig } from "next";
import { productRedirects, productRewrites } from "./lib/product-hosts";

const nextConfig: NextConfig = {
  async redirects() {
    return productRedirects();
  },
  async rewrites() {
    // beforeFiles: the subdomain root must win over app/page.tsx.
    return { beforeFiles: productRewrites(), afterFiles: [], fallback: [] };
  },
};

export default nextConfig;
