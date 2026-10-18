// app/(auth)/layout.tsx
import "../globals.css";
import type { Metadata } from "next";

// Fonts come from the root layout.

export const metadata: Metadata = {
  title: {
    default: "Sign in | Spiritbulb",
    template: "%s | Spiritbulb",
  },
  description: "Sign in or create your Spiritbulb account.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
<>
        {children}
    </>
  );
}