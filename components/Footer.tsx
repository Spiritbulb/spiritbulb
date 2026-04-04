'use client';
import Link from 'next/link';
import { Twitter, Github, Mail, Linkedin } from 'lucide-react';
import { footer, label } from 'framer-motion/client';

export default function Footer() {
    return (
        <footer className="w-full border-t border-neutral-200 dark:border-neutral-800">
            <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">

                {/* Copyright */}
                <p className="text-xs text-neutral-400 dark:text-neutral-500 tracking-wide">
                    © {new Date().getFullYear()} Spiritbulb
                </p>

                {/* Legal links */}
                <div className="flex items-center gap-5 text-xs text-neutral-400 dark:text-neutral-500">
                    <Link
                        href="/privacy"
                        className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                    >
                        Privacy
                    </Link>
                    <span className="text-neutral-300 dark:text-neutral-700 select-none">·</span>
                    <Link
                        href="/terms"
                        className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                    >
                        Terms
                    </Link>
                </div>

                {/* Social icons */}
                <div className="flex items-center gap-3">
                    {[
                        { href: 'https://twitter.com/spiritbulb', Icon: Twitter, label: 'Twitter' },
                        { href: 'https://github.com/spiritbulb', Icon: Github, label: 'GitHub' },
                        { href: 'https://linkedin.com/company/spiritbulb', Icon: Linkedin, label: 'LinkedIn' },
                        { href: 'mailto:hello@spiritbulb.org', Icon: Mail, label: 'Email' },
                    ].map(({ href, Icon, label }) => (
                        <a
                            key={label}
                            href={href}
                            aria-label={label}
                            target={href.startsWith('mailto') ? undefined : '_blank'}
                            rel={href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                            className="text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                        >
                            <Icon className="w-4 h-4" />
                        </a>
                    ))}
                </div>

            </div>
        </footer >
    );
}