import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home | Spiritbulb",
  robots: { index: false, follow: false },
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ app?: string }>;
}) {
  const { app } = await searchParams;
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md space-y-3 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Welcome to the hub</h1>
        <p className="text-sm text-muted-foreground">
          {app
            ? `You are signed in and headed to ${app}. The live experience lands here soon.`
            : "You are signed in. The ecosystem hub lands here soon."}
        </p>
      </div>
    </main>
  );
}
