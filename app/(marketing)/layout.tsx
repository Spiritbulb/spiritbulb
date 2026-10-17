import Header from "@/components/Header";

// Site metadata and the Organization JSON-LD live in the root layout, once.
export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The header reads a client-side hint cookie for signed-in state (see Header), so this
  // layout stays static. Reading cookies() here would make every marketing page dynamic.
  return (
    <>
      <Header />
      {children}
    </>
  );
}
