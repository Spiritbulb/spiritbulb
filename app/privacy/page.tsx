import fs from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import styles from "../styles/docs.module.css";

export const metadata = {
    title: "Privacy Policy | Spiritbulb",
    description: "How Spiritbulb collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
    const filePath = path.join(process.cwd(), "docs", "privacy-policy.md");
    const markdown = fs.readFileSync(filePath, "utf-8");

    return (
        <main className="min-h-screen bg-background">

            {/* Hero */}
            <div className="border-b">
                <div className="flex justify-center mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
                    <div className="max-w-4xl space-y-4">
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">Legal</Badge>
                            <Badge variant="secondary">Last updated: April 2026</Badge>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight md:text-4xl">
                            Privacy Policy
                        </h1>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="flex justify-center mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
                <div className="max-w-4xl">
                    <div className={styles.markdown}>
                        <ReactMarkdown>{markdown}</ReactMarkdown>
                    </div>

                    <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                        <p className="text-xs text-muted-foreground">
                            Questions about your data? Just email us.
                        </p>
                        <div className="flex gap-3">
                            <Button size="sm" variant="outline" asChild>
                                <a href="mailto:privacy@spiritbulb.org">Contact Privacy Team</a>
                            </Button>
                            <Button size="sm" variant="ghost" asChild>
                                <Link href="/terms">Read Terms →</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

        </main>
    );
}