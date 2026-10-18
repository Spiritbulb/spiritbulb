import "./globals.css";
import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import { ORG, SITE, orgJsonLd } from "@/lib/site";
import { HERO, ONE_LINER } from "@/lib/copy";
import Footer from "@/components/Footer";
import { ServiceWorkerRegistrar } from './sw-register';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Headlines only (`font-display`). Body text stays Geist.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${ORG.name}: ${HERO.headline}`,
    template: "%s | Spiritbulb",
  },
  description: ONE_LINER,
  authors: [{ name: ORG.name }],
  creator: ORG.name,
  publisher: ORG.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(SITE),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: SITE,
    siteName: ORG.name,
    title: `${ORG.name}: ${HERO.headline}`,
    description: ONE_LINER,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: ORG.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${ORG.name}: ${HERO.headline}`,
    description: ONE_LINER,
    images: ["/og-image.png"],
    creator: "@spiritbulb",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
};

// Rendered once, here, for every page. Built from the confirmed facts in lib/site.ts.
const jsonLd = { ...orgJsonLd(), description: ONE_LINER };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // No cookies()/session read here: it was unused, and reading request data in the root
  // layout makes every page dynamic (a function run per view, plus a WorkOS call when
  // a token had lapsed). Keep this layout static.

  return (
    // suppressHydrationWarning: the script below sets data-theme/class on <html>
    // before React hydrates, which is deliberate and is what this prop is for.
    // The font variables go on <html>, not <body>: Tailwind defines --font-sans on
    // :root as var(--font-geist-sans), which only resolves if the variable exists there.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable}`}
    >
      <head>
        {/* Runs before first paint, so the page never flashes the wrong theme. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme'),d=window.matchMedia('(prefers-color-scheme: dark)').matches,dark=t?t==='dark':d;document.documentElement.setAttribute('data-theme',dark?'dark':'light');if(dark)document.documentElement.classList.add('dark');})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className="antialiased"
      >
        {children}
        <ServiceWorkerRegistrar />
        <Footer />
      </body>
    </html>
  );
}
