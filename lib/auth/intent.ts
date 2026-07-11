export type Product = "nuru" | "reach" | "tufike";

export function productPath(product: Product): string {
  return `/home?app=${product}`;
}

export function safeNext(raw: string | null | undefined): string {
  if (!raw) return "/home";
  // Must be a single-slash-rooted internal path. Reject protocol-relative
  // ("//host") and absolute ("https://host") to avoid open redirects.
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/home";
  return raw;
}
