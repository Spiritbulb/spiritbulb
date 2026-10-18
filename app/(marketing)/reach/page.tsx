import type { Metadata } from "next";
import ReachPage from "@/components/product/reach-page";
import { bySlug, productJsonLd, productMetadata } from "@/lib/products";

const product = bySlug("reach");

export const metadata: Metadata = productMetadata(product);

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd(product)),
        }}
      />
      <ReachPage />
    </>
  );
}
