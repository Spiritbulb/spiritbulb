'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Sun, Moon, Menu, X } from 'lucide-react';

export default function Header() {
    const [darkMode, setDarkMode] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        setMounted(true);

        // Check localStorage first
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
            const isDark = storedTheme === 'dark';
            setDarkMode(isDark);
            // Set BOTH data-theme attribute AND class
            document.documentElement.setAttribute('data-theme', storedTheme);
            if (isDark) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setDarkMode(prefersDark);
            const theme = prefersDark ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', theme);
            if (prefersDark) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    }, []);

    const toggleDarkMode = () => {
        const newTheme = darkMode ? 'light' : 'dark';
        const newDarkMode = !darkMode;

        setDarkMode(newDarkMode);
        localStorage.setItem('theme', newTheme);

        // Update BOTH data-theme attribute AND class
        document.documentElement.setAttribute('data-theme', newTheme);
        if (newDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    // Prevent flash of incorrect theme
    if (!mounted) {
        return null;
    }

    return (
        <header className="header sticky top-0 z-50">
            <div className="header-content">
                <Link href="/" className="logo">
                    <img src={darkMode ? '/logo-w.png' : '/logo-sb.png'} alt="Logo" />
                </Link>

                {/* Desktop Navigation */}
                <nav className="nav-links">
                    <Link href="https://blog.spiritbulb.org/the-truth-about-a-student-network">Nuru</Link>
                    <Link href="https://blog.spiritbulb.org/the-easiest-social-marketplace-experience">Reach</Link>
                    <Link href="https://blog.spiritbulb.org/take-a-break-you-deserve-it">Tufike</Link>
                    <Link href="https://blog.spiritbulb.org/building-a-country-thats-more-connected">Menengai Cloud</Link>
                    <button onClick={toggleDarkMode} className="dark-mode-toggle">
                        {darkMode ? <Sun className='w-5 h-5' /> : <Moon className='w-5 h-5' />}
                    </button>
                </nav>

                {/* Mobile Menu Button */}
                <button
                    onClick={toggleMobileMenu}
                    className="mobile-menu-button"
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
                <Link href="https://blog.spiritbulb.org/the-truth-about-a-student-network" onClick={() => setMobileMenuOpen(false)}>
                    Nuru
                </Link>
                <Link href="https://blog.spiritbulb.org/the-easiest-social-marketplace-experience" onClick={() => setMobileMenuOpen(false)}>
                    Reach
                </Link>
                <Link href="https://blog.spiritbulb.org/take-a-break-you-deserve-it" onClick={() => setMobileMenuOpen(false)}>
                    Tufike
                </Link>
                <Link href="https://blog.spiritbulb.org/building-a-country-thats-more-connected" onClick={() => setMobileMenuOpen(false)}>
                    Menengai Cloud
                </Link>
                <button onClick={toggleDarkMode} className="dark-mode-toggle">
                    {darkMode ? (
                        <>
                            <Sun className='w-5 h-5' />
                            <span style={{ marginLeft: '0.5rem' }}>Light Mode</span>
                        </>
                    ) : (
                        <>
                            <Moon className='w-5 h-5' />
                            <span style={{ marginLeft: '0.5rem' }}>Dark Mode</span>
                        </>
                    )}
                </button>
            </div>
        </header>
    );
}