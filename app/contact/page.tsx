'use client';
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Send, Loader2, CheckCircle2 } from "lucide-react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

type Status = 'idle' | 'submitting' | 'success' | 'error';

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState<Status>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [token, setToken] = useState('');
    const turnstileRef = useRef<TurnstileInstance>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            setErrorMsg('Please complete the verification challenge.');
            setStatus('error');
            return;
        }

        setStatus('submitting');
        setErrorMsg('');

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, turnstileToken: token }),
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setErrorMsg(data.error ?? 'Something went wrong. Please try again.');
                setStatus('error');
                // Token is single-use — reset the widget so the user can retry.
                turnstileRef.current?.reset();
                setToken('');
                return;
            }

            setStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' });
            turnstileRef.current?.reset();
            setToken('');
        } catch {
            setErrorMsg('Network error. Please check your connection and try again.');
            setStatus('error');
            turnstileRef.current?.reset();
            setToken('');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
        if (status === 'error') setStatus('idle');
    };

    const inputClass =
        "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:opacity-50";

    return (
        <main className="min-h-screen bg-background">
            <section className="mx-auto w-full max-w-xl px-4 py-20">
                <div className="mb-8 flex items-center gap-3">
                    <Mail className="size-6 text-primary" />
                    <h1 className="text-2xl font-semibold tracking-tight">Get in touch</h1>
                </div>
                
                {status === 'success' ? (
                    <div className="flex flex-col items-center gap-3 rounded-lg border border-input bg-muted/30 p-10 text-center">
                        <CheckCircle2 className="size-10 text-primary" />
                        <p className="text-lg font-medium">Thanks for reaching out!</p>
                        <p className="text-sm text-muted-foreground">
                            We&apos;ve received your message and will get back to you soon.
                        </p>
                        <Button
                            variant="outline"
                            className="mt-2"
                            onClick={() => setStatus('idle')}
                        >
                            Send another message
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="name" className="text-sm font-medium">Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                disabled={status === 'submitting'}
                                className={inputClass}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="email" className="text-sm font-medium">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                disabled={status === 'submitting'}
                                className={inputClass}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                            <input
                                id="subject"
                                name="subject"
                                type="text"
                                value={formData.subject}
                                onChange={handleChange}
                                disabled={status === 'submitting'}
                                className={inputClass}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="message" className="text-sm font-medium">Message</label>
                            <textarea
                                id="message"
                                name="message"
                                required
                                rows={5}
                                value={formData.message}
                                onChange={handleChange}
                                disabled={status === 'submitting'}
                                className={`${inputClass} resize-y`}
                            />
                        </div>

                        {SITE_KEY && (
                            <Turnstile
                                ref={turnstileRef}
                                siteKey={SITE_KEY}
                                onSuccess={(t) => {
                                    setToken(t);
                                    if (status === 'error') setStatus('idle');
                                }}
                                onExpire={() => setToken('')}
                                onError={() => setToken('')}
                                options={{ theme: 'auto' }}
                            />
                        )}

                        {status === 'error' && (
                            <p className="text-sm text-destructive">{errorMsg}</p>
                        )}

                        <Button
                            type="submit"
                            disabled={status === 'submitting' || (!!SITE_KEY && !token)}
                            className="mt-2"
                        >
                            {status === 'submitting' ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="size-4" />
                                    Send message
                                </>
                            )}
                        </Button>
                    </form>
                )}
            </section>
        </main>
    );
}
