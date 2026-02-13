'use client';
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, Send } from "lucide-react";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'success'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Create mailto link with form data
        const mailtoLink = `mailto:hello@spiritbulb.org?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
            `From: ${formData.name} (${formData.email})\n\n${formData.message}`
        )}`;

        window.location.href = mailtoLink;
        setStatus('success');

        // Reset form after a delay
        setTimeout(() => {
            setFormData({ name: '', email: '', subject: '', message: '' });
            setStatus('idle');
        }, 2000);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    return (
        <main className="min-h-screen bg-background">
            <section className="w-full py-40">

                <div className="container mx-auto px-4 py-20 md:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl space-y-12">
                        {/* Header */}
                        <div className="space-y-4 text-center">
                            <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                                Let's talk
                            </h1>
                            <p className="text-lg text-muted-foreground md:text-xl">
                                Got questions? Ideas? Just want to say hi? We're all ears.
                                <br />
                                Drop us a message and we'll get back to you soon.
                            </p>
                        </div>

                        {/* Contact Form */}
                        <Card className="mx-auto max-w-2xl">
                            <CardContent className="p-8">
                                {status === 'success' ? (
                                    <div className="space-y-4 text-center py-8">
                                        <div className="flex justify-center">
                                            <div className="rounded-full p-3" style={{ backgroundColor: 'var(--success-bg)' }}>
                                                <Send className="h-6 w-6" style={{ color: 'var(--success-foreground)' }} />
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-semibold">Opening your mail app...</h3>
                                        <p className="text-muted-foreground">
                                            We've prepared an email for you. Just hit send!
                                        </p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <label htmlFor="name" className="text-sm font-medium">
                                                Name
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                placeholder="Your name"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="email" className="text-sm font-medium">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                placeholder="you@example.com"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="subject" className="text-sm font-medium">
                                                Subject
                                            </label>
                                            <input
                                                type="text"
                                                id="subject"
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                required
                                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                placeholder="What's this about?"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="message" className="text-sm font-medium">
                                                Message
                                            </label>
                                            <textarea
                                                id="message"
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                required
                                                rows={6}
                                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                                                placeholder="Tell us what's on your mind..."
                                            />
                                        </div>

                                        <Button type="submit" size="lg" className="w-full gap-2 cursor-pointer">
                                            Send message
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </form>
                                )}
                            </CardContent>
                        </Card>

                        {/* Direct Contact Info */}
                        <div className="text-center space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Or email us directly at
                            </p>
                            <a
                                href="mailto:hello@spiritbulb.org"
                                className="inline-flex items-center gap-2 text-lg font-medium hover:underline"
                            >
                                <Mail className="h-5 w-5" />
                                hello@spiritbulb.org
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}