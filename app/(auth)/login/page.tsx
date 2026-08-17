// app/login/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth/session";
import { safeNext } from "@/lib/auth/intent";
import LoginClient from "./login-client";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const cookieStore = await cookies();
  const sealed = cookieStore.get(SESSION_COOKIE)?.value;

  const session = await getSession(sealed);
  if (session) {
    // If getSession refreshed the token, write the resealed cookie back
    if (session.resealed) {
      cookieStore.set(SESSION_COOKIE, session.resealed, sessionCookieOptions());
    }
    redirect(safeNext(next ?? null));
  }

  return <LoginClient />;
}