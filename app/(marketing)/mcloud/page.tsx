import type { Metadata } from "next";
import McloudPage from "@/components/product/mcloud-page";
import { bySlug, productJsonLd, productMetadata } from "@/lib/products";

const product = bySlug("mcloud");

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
      <McloudPage />
    </>
  );
}
