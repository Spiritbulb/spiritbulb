import type { Metadata } from "next";
import HubClient from "@/components/HubClient";

export const metadata: Metadata = {
  title: "Home",
  robots: { index: false, follow: false },
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ app?: string }>;
}) {
  const { app } = await searchParams;
  return <HubClient initialApp={app} />;
}
