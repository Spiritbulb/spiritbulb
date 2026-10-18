import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

// The door colours' jobs, pinned against app/globals.css. See the SITE TOKENS
// comment there for what each role is for.

const css = readFileSync(path.resolve(__dirname, "../app/globals.css"), "utf8");

/** The value of `--name` in the first block that defines it as a hex colour. */
function token(name: string) {
  const m = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})\\s*;`));
  if (!m) throw new Error(`--${name} is not a hex token in globals.css`);
  return m[1];
}

const hexRgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const toLin = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
function luminance(rgb: number[]) {
  const [r, g, b] = rgb.map(toLin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a: number[], b: number[]) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}
/** sRGB from OKLCH, for the page backgrounds, which globals.css writes as oklch(). */
function oklch(L: number, C: number, h: number) {
  const a = C * Math.cos((h * Math.PI) / 180), b = C * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const fromLin = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((v) => Math.min(1, Math.max(0, fromLin(v))));
}

const LIGHT_BG = oklch(0.985, 0.003, 74); // :root --background
const DARK_BG = oklch(0.13, 0.004, 74); // .dark --background
const INK = hexRgb(token("ink"));
const DOORS = ["reach", "mcloud", "tufike", "nuru"];

describe("door colours", () => {
  it.each(DOORS)("%s takes black body text as a solid band", (door) => {
    expect(contrast(INK, hexRgb(token(door)))).toBeGreaterThanOrEqual(4.5);
  });

  it.each(DOORS)("%s has a text shade that reads on the light page", (door) => {
    expect(contrast(hexRgb(token(`${door}-text`)), LIGHT_BG)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(DOORS)("%s reads as text on the dark page as it is", (door) => {
    expect(contrast(hexRgb(token(door)), DARK_BG)).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps Reach apart from the logo gold", () => {
    // Euclidean sRGB distance; amber (#e0a030) was 0.15 and read as the same colour in the lotus.
    const d = Math.hypot(
      ...hexRgb(token("reach")).map((v, i) => v - hexRgb(token("brand"))[i]),
    );
    expect(d).toBeGreaterThan(0.25);
  });
});
