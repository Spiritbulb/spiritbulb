'use client'

import { useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

// mcloud exposes the beta-join API (adds the email to the shared
// beta@spiritbulb.org Google Group wired to Play closed testing) and returns
// the Nuru Play opt-in URL. Only members of that group can install the beta.
const JOIN_API = 'https://www.mcloud.co.ke/api/beta/join'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function FadeIn({ children, className, delay = 0 }: {
    children: React.ReactNode
    className?: string
    delay?: number
}) {
    const ref = useRef(null)
    const inView = useInView(ref, { once: true, margin: '-40px' })
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

const inputCls = cn(
    'w-full h-11 rounded-xl px-4 text-[14px] text-foreground placeholder:text-muted-foreground/60',
    'bg-foreground/5 border border-border',
    'focus:outline-none focus:border-foreground/30 focus:bg-foreground/[0.08]',
    'transition-all duration-150'
)

function NuruSignupForm() {
    const [email, setEmail] = useState('')
    const [optInUrl, setOptInUrl] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isPending, start] = useTransition()

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        const trimmed = email.trim()
        if (!EMAIL_RE.test(trimmed)) {
            setError('Please enter a valid email address.')
            return
        }
        setError(null)
        start(async () => {
            try {
                const res = await fetch(JOIN_API, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: trimmed, source: 'spiritbulb-nuru' }),
                })
                const data = (await res.json()) as { ok?: boolean; optInUrl?: string | null; error?: string }
                if (res.ok && data.ok) setOptInUrl(data.optInUrl ?? '')
                else setError(data.error ?? 'Something went wrong. Please try again.')
            } catch {
                setError('Could not reach the server. Please try again.')
            }
        })
    }

    return (
        <div>
            <AnimatePresence mode="wait">
                {optInUrl !== null ? (
                    <motion.div
                        key="done"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl border border-border bg-foreground/5 px-4 py-4 space-y-3"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-lg">🎉</span>
                            <p className="text-[14px] text-foreground">You&apos;re on the list.</p>
                        </div>
                        {optInUrl && (
                            <a
                                href={optInUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-[13px] font-medium text-background hover:opacity-90 transition-opacity"
                            >
                                Opt in to the Android beta →
                            </a>
                        )}
                        <p className="text-[12px] text-muted-foreground">
                            Open this on the Android device you&apos;ll test with, signed in to the Google account on this email.
                        </p>
                    </motion.div>
                ) : (
                    <motion.form
                        key="form"
                        onSubmit={submit}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col gap-2 sm:flex-row"
                    >
                        <div className="flex-1">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); if (error) setError(null) }}
                                placeholder="you@gmail.com"
                                aria-label="Email address"
                                className={inputCls}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isPending}
                            className={cn(
                                'h-11 shrink-0 rounded-xl px-6 text-[14px] font-medium transition-all duration-150',
                                'bg-foreground text-background hover:opacity-90 disabled:opacity-60'
                            )}
                        >
                            {isPending ? 'Joining…' : 'Join the beta'}
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>
            {error && <p className="mt-2 text-[13px] text-red-500">{error}</p>}
        </div>
    )
}

export default function NuruClient() {
    return (
        <div className="min-h-[100dvh] bg-background text-foreground">

            {/* Glow — Nuru amber */}
            <div className="pointer-events-none fixed inset-0">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#FF9800]/15 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 container mx-auto px-6 md:px-12 max-w-2xl py-28 md:py-36">
                <FadeIn className="space-y-5">
                    <Image src="/nuru-l-tp.png" alt="Nuru" width={56} height={56} className="mb-2" priority />
                    <p className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                        Closed beta
                    </p>
                    <h1 className="text-[2.8rem] md:text-[3.5rem] font-bold leading-[1.04] tracking-tight">
                        Get early access<br />
                        <span className="text-muted-foreground/60">to Nuru.</span>
                    </h1>
                    <p className="text-[15px] text-muted-foreground/70 leading-relaxed max-w-lg">
                        Nuru is a study companion that chats with your notes. We&apos;re onboarding a
                        first group of students. Drop your email and we&apos;ll add you to the beta.
                    </p>
                </FadeIn>

                <FadeIn delay={0.1} className="mt-10">
                    <NuruSignupForm />
                    <p className="mt-3 text-[12px] text-muted-foreground/50">
                        Use a Google account (Gmail) — the Android beta installs through Google
                        Play, so we can only invite Google accounts. No spam.
                    </p>
                </FadeIn>
            </div>
        </div>
    )
}
