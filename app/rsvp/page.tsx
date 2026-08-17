import type { Metadata } from "next";
import TufikeLaunchPage from "./launch-client";

export const metadata: Metadata = {
  title: "In 3... 2... 1...",
  robots: { index: false, follow: false },
};

export default async function LaunchPage({
}: {
  
}) {
  
  return <TufikeLaunchPage />;
}
