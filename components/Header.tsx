'use client';
import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { Sun, Moon } from 'lucide-react';

// Mirrors SESSION_HINT_COOKIE in lib/auth/session.ts (not imported: that file is server-side).
const HINT_COOKIE = 'sb_li';

function readHint(): boolean {
    return document.cookie.split('; ').some((c) => c === `${HINT_COOKIE}=1`);
}

// Cookies don't notify, so there is nothing to subscribe to; the value is read on mount.
const subscribe = () => () => {};

export default function Header() {
    // False on the server and first paint, then the hint cookie once hydrated. The pages are
    // static, so the server cannot know; a signed-in visitor sees "Sign in" for a moment.
    const signedIn = useSyncExternalStore(subscribe, readHint, () => false);

    // The theme is already applied to <html> by the pre-hydration script in the
    // layout, and which icon/logo shows is decided in CSS. So nothing here reads
    // the theme during render, which is what used to cause the hydration
    // mismatch. The toggle just reads the live DOM and flips it.
    const toggleDarkMode = () => {
        const next = !document.documentElement.classList.contains('dark');
        localStorage.setItem('theme', next ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', next);
        document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background">
            <div className="container mx-auto flex h-14 items-center justify-between px-4 md:px-6">

                {/* Logo. Both variants render and CSS reveals the right one, so the
                    server and client agree and it never flashes the wrong mark. */}
                <Link href="/" className="flex items-center" aria-label="Spiritbulb">
                    <img src="/logo-sb.png" alt="" className="logo-light h-7 w-auto" />
                    <img src="/logo-w.png" alt="" className="logo-dark h-7 w-auto" />
                </Link>

                {/* Right side: auth actions + theme toggle. Signed-in shows Home +
                    Sign out; signed-out shows Sign in. `signedIn` comes from a
                    non-secret hint cookie, so this only reflects session state,
                    it does not enforce it. */}
                <div className="flex items-center gap-2">
                    {signedIn ? (
                        <>
                            <Link
                                href="/home"
                                className="rounded-md px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                            >
                                Home
                            </Link>
                            {/* POST so a prefetch/crawler can't sign the user out. */}
                            <form action="/api/auth/logout" method="post">
                                <button
                                    type="submit"
                                    className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                                >
                                    Sign out
                                </button>
                            </form>
                        </>
                    ) : (
                        <Link
                            href="/login"
                            className="rounded-md px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                        >
                            Sign in
                        </Link>
                    )}
                    <button
                        onClick={toggleDarkMode}
                        aria-label="Switch theme"
                        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                        {/* Both icons render; CSS shows the one for the current theme. */}
                        <Moon className="logo-light h-4 w-4" />
                        <Sun className="logo-dark h-4 w-4" />
                    </button>
                </div>

            </div>
        </header>
    );
}