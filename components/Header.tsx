'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function Header() {
    const [darkMode, setDarkMode] = useState(false);

    // Sync with system/localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = stored ? stored === 'dark' : prefersDark;
        setDarkMode(isDark);
        document.documentElement.classList.toggle('dark', isDark);
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }, []);

    const toggleDarkMode = () => {
        const next = !darkMode;
        setDarkMode(next);
        const theme = next ? 'dark' : 'light';
        localStorage.setItem('theme', theme);
        document.documentElement.classList.toggle('dark', next);
        document.documentElement.setAttribute('data-theme', theme);
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
            <div className="container mx-auto flex h-14 items-center justify-between px-4 md:px-6">

                {/* Logo */}
                <Link href="/" className="flex items-center">
                    <img
                        src={darkMode ? '/logo-w.png' : '/logo-sb.png'}
                        alt="Spiritbulb"
                        className="h-7 w-auto"
                    />
                </Link>

                {/* Theme toggle */}
                <button
                    onClick={toggleDarkMode}
                    aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                    {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>

            </div>
        </header>
    );
}