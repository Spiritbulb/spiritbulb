import Image from 'next/image';
import { Twitter, Github, Mail, Linkedin } from 'lucide-react';
import { PRODUCTS } from '@/lib/products';
import { NAV, ORG } from '@/lib/site';
import { StatusBadge } from '@/components/site/status-badge';

const productHrefs = new Set(PRODUCTS.map((p) => `/${p.slug}`));
const company = NAV.filter((n) => !productHrefs.has(n.href));

const social = [
    { href: ORG.social.twitter, Icon: Twitter, label: 'Twitter' },
    { href: ORG.social.github, Icon: Github, label: 'GitHub' },
    { href: ORG.social.linkedin, Icon: Linkedin, label: 'LinkedIn' },
    { href: `mailto:${ORG.email}`, Icon: Mail, label: 'Email' },
];

const linkCls = 'text-sm text-muted-foreground transition-colors hover:text-foreground';

// Plain <a> throughout: product paths redirect to their subdomains.
export default function Footer() {
    return (
        <footer className="w-full border-t">
            <div className="container mx-auto grid gap-10 px-4 py-12 sm:grid-cols-2 md:px-6 lg:grid-cols-[2fr_1fr_1fr] lg:px-8">
                <div className="space-y-3">
                    <Image src="/logo.svg" alt="" width={49} height={32} className="h-8 w-auto" />
                    <p className="max-w-xs text-sm text-muted-foreground">Sell. Host. Gather. Teach.</p>
                    <div className="flex items-center gap-3 pt-1">
                        {social.map(({ href, Icon, label }) => (
                            <a
                                key={label}
                                href={href}
                                aria-label={label}
                                target={href.startsWith('mailto') ? undefined : '_blank'}
                                rel={href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                                className="text-muted-foreground transition-colors hover:text-foreground"
                            >
                                <Icon className="h-4 w-4" />
                            </a>
                        ))}
                    </div>
                </div>

                <nav aria-label="Products" className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Products</p>
                    <ul className="space-y-2">
                        {PRODUCTS.map((p) => (
                            <li key={p.slug} className="flex items-center gap-2">
                                <a href={`/${p.slug}`} className={linkCls}>
                                    {p.name}
                                </a>
                                {p.status !== 'live' && <StatusBadge status={p.status} className="px-2 py-0 text-[11px]" />}
                            </li>
                        ))}
                    </ul>
                </nav>

                <nav aria-label="Company" className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Spiritbulb</p>
                    <ul className="space-y-2">
                        {company.map((n) => (
                            <li key={n.href}>
                                <a href={n.href} className={linkCls}>
                                    {n.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>

            <div className="border-t">
                <div className="container mx-auto flex flex-col gap-3 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between md:px-6 lg:px-8">
                    <p>© {new Date().getFullYear()} {ORG.name}</p>
                    <div className="flex items-center gap-5">
                        <a href="/privacy" className="transition-colors hover:text-foreground">
                            Privacy
                        </a>
                        <a href="/terms" className="transition-colors hover:text-foreground">
                            Terms
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
