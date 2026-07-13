import type { Metadata } from "next";
import ProductPage from "@/components/ProductPage";
import { bySlug, productJsonLd, productMetadata } from "@/lib/products";

const product = bySlug("nuru");

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
      <ProductPage product={product} />
    </>
  );
}
