'use client';
import { useSyncExternalStore } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV } from '@/lib/site';
import { PRODUCTS } from '@/lib/products';

// Mirrors SESSION_HINT_COOKIE in lib/auth/session.ts (not imported: that file is server-side).
const HINT_COOKIE = 'sb_li';

function readHint(): boolean {
    return document.cookie.split('; ').some((c) => c === `${HINT_COOKIE}=1`);
}

/**
 * Where the logo goes. On a product subdomain (nuru.spiritb.uk) "/" is that
 * product's page, so home is the same host with the product label dropped.
 * Works for nuru.localhost in development too.
 */
function readHome(): string {
    const { protocol, host } = window.location;
    const [first, ...rest] = host.split('.');
    return PRODUCTS.some((p) => p.slug === first) && rest.length
        ? `${protocol}//${rest.join('.')}/`
        : '/';
}

// Cookies and the host don't notify, so there is nothing to subscribe to; values are read on mount.
const subscribe = () => () => {};

export default function Header() {
    // False on the server and first paint, then the hint cookie once hydrated. The pages are
    // static, so the server cannot know; a signed-in visitor sees "Sign in" for a moment.
    const signedIn = useSyncExternalStore(subscribe, readHint, () => false);
    const home = useSyncExternalStore(subscribe, readHome, () => '/');
    const pathname = usePathname();

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

    const linkCls = (href: string) =>
        cn(
            'rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-foreground lg:py-1.5',
            pathname === href ? 'text-foreground' : 'text-muted-foreground'
        );

    // Plain <a>: product paths redirect to their subdomains, which next/link cannot follow client-side.
    const links = NAV.map(({ label, href }) => (
        <a
            key={href}
            href={href}
            aria-current={pathname === href ? 'page' : undefined}
            className={linkCls(href)}
        >
            {label}
        </a>
    ));

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background">
            <div className="container mx-auto flex h-14 items-center justify-between gap-4 px-4 md:px-6">

                <a href={home} className="flex shrink-0 items-center gap-2" aria-label="Spiritbulb home">
                    <Image src="/logo.svg" alt="" width={43} height={28} priority className="h-7 w-auto" />
                    <span className="text-[15px] font-semibold tracking-tight">Spiritbulb</span>
                </a>

                <nav aria-label="Main" className="hidden items-center gap-0.5 lg:flex">
                    {links}
                </nav>

                {/* Right side: auth actions + theme toggle. Signed-in shows Home +
                    Sign out; signed-out shows Sign in. `signedIn` comes from a
                    non-secret hint cookie, so this only reflects session state,
                    it does not enforce it. */}
                <div className="flex items-center gap-1">
                    {signedIn ? (
                        <>
                            <a href="/home" className={linkCls('/home')}>
                                Home
                            </a>
                            {/* POST so a prefetch/crawler can't sign the user out. */}
                            <form action="/api/auth/logout" method="post" className="hidden sm:block">
                                <button type="submit" className={linkCls('')}>
                                    Sign out
                                </button>
                            </form>
                        </>
                    ) : (
                        <a href="/login" className={cn(linkCls('/login'), 'text-foreground')}>
                            Sign in
                        </a>
                    )}
                    <button
                        onClick={toggleDarkMode}
                        aria-label="Switch theme"
                        className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:h-8 lg:w-8"
                    >
                        {/* Both icons render; CSS shows the one for the current theme. */}
                        <Moon className="logo-light h-4 w-4" />
                        <Sun className="logo-dark h-4 w-4" />
                    </button>

                    {/* The phone menu is a native <details>, so it opens before any
                        JavaScript has loaded: on a slow connection, and when the dev
                        server is opened from another device. Links are full page
                        loads, which close it. */}
                    <details className="group lg:hidden">
                        <summary
                            aria-label="Menu"
                            className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground [&::-webkit-details-marker]:hidden"
                        >
                            <Menu className="h-5 w-5 group-open:hidden" />
                            <X className="hidden h-5 w-5 group-open:block" />
                        </summary>
                        <nav
                            aria-label="Main"
                            className="absolute inset-x-0 top-full border-b border-border/50 bg-background px-4 pb-4 pt-2 shadow-sm"
                        >
                            <div className="flex flex-col">
                                {links}
                                {signedIn && (
                                    <form action="/api/auth/logout" method="post" className="sm:hidden">
                                        <button type="submit" className={cn(linkCls(''), 'w-full text-left')}>
                                            Sign out
                                        </button>
                                    </form>
                                )}
                            </div>
                        </nav>
                    </details>
                </div>
            </div>
        </header>
    );
}
