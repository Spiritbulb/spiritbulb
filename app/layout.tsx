import "./globals.css";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SESSION_COOKIE, getSession } from "@/lib/auth/session";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Smarter systems for Kenya | Spiritbulb",
    template: "%s | Spiritbulb"
  },
  description: "A Kenyan tech enterprise building the future of commerce, community, and education through Reach, Tufike, Nuru, and Menengai Cloud - transforming Kenya by 2040.",
  keywords: "Kenya tech, e-commerce Kenya, education Kenya, community events Kenya, digital transformation Africa, Kenyan marketplace, MPESA integration, Kenyan education platform, Spiritbulb, Tufike, Reach, Nuru, Menengai Cloud",
  authors: [{ name: "Spiritbulb" }],
  creator: "Spiritbulb",
  publisher: "Spiritbulb",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://spiritb.uk'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_KE',
    url: 'https://spiritb.uk',
    siteName: 'Spiritbulb',
    title: "Smarter systems for Kenya | Spiritbulb",
    description: "Kenyan tech enterprise building the future of commerce, community, and education through Reach, Tufike, Nuru, and Menengai Cloud.",
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Spiritbulb',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Smarter systems for Kenya | Spiritbulb",
    description: "Kenyan tech enterprise building the future of commerce, community, and education.",
    images: ['/twitter-image.jpg'],
    creator: '@spiritbulb',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'technology',
};

// JSON-LD structured data for better SEO
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Spiritbulb',
  alternateName: 'Spiritbulb Kenya',
  url: 'https://spiritb.uk',
  logo: 'https://spiritb.uk/logo-sb.png',
  sameAs: [
    'https://twitter.com/spiritbulb',
    'https://www.facebook.com/spiritbulb',
    'https://www.instagram.com/spiritbulb',
    'https://www.linkedin.com/company/spiritbulb',
  ],
  contactPoint: [{
    '@type': 'ContactPoint',
    telephone: '+254-707-098-169',
    contactType: 'Executive',
    areaServed: 'KE',
    availableLanguage: ['en', 'sw'],
  }],
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Kenyatta Avenue',
    addressLocality: 'Nakuru',
    postalCode: '20100',
    addressCountry: 'KE',
  },
  description: 'Spiritbulb is a Kenyan-born technology enterprise with a bold vision: to transform how people in Kenya connect, learn, and thrive by 2040.',
  foundingDate: '2023',
  founders: [{
    '@type': 'Person',
    name: 'Bentley Busienei',
  }, {
    '@type': 'Person',
    name: 'Stephanie Kanji',
  }],
  numberOfEmployees: '10-50',
  // The four products of the ecosystem. Menengai Cloud carries its own site so
  // Google connects the two entities (its Organization JSON-LD names Spiritbulb
  // as parentOrganization; this is the reciprocal link).
  subOrganization: [
    { '@type': 'Organization', name: 'Menengai Cloud', url: 'https://mcloud.co.ke' },
    { '@type': 'Organization', name: 'Nuru' },
    { '@type': 'Organization', name: 'Reach' },
    { '@type': 'Organization', name: 'Tufike' },
  ],
  slogan: '#ThatsTheSpirit',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Verified session (decrypt + refresh-if-lapsed), so the nav agrees with the
  // /home gate. We only need the boolean here; the /home route handles reseal.
  const signedIn = (await getSession((await cookies()).get(SESSION_COOKIE)?.value)) !== null;
  return (
    // suppressHydrationWarning: the script below sets data-theme/class on <html>
    // before React hydrates, which is deliberate and is what this prop is for.
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="me" href="https://mastodon.social/@benalldaway" />
        {/* Runs before first paint, so the page never flashes the wrong theme. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme'),d=window.matchMedia('(prefers-color-scheme: dark)').matches,dark=t?t==='dark':d;document.documentElement.setAttribute('data-theme',dark?'dark':'light');if(dark)document.documentElement.classList.add('dark');})();`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        
        {children}
        <Footer />
      </body>
    </html>
  );
}
