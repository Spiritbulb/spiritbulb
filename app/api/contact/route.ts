// app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';

// HubSpot form (same IDs the embed used)
const PORTAL_ID = '148621871';
const FORM_ID = '37d76ab7-f00a-4bed-8888-8b0fe0f5215d';
const REGION = 'eu1';

const SUBMIT_URL = `https://api-${REGION}.hsforms.com/submissions/v3/integration/submit/${PORTAL_ID}/${FORM_ID}`;

interface ContactBody {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
    turnstileToken?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

async function verifyTurnstile(token: string, remoteip: string | null): Promise<boolean> {
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
        console.error('TURNSTILE_SECRET_KEY is not set');
        return false;
    }

    const form = new URLSearchParams();
    form.append('secret', secret);
    form.append('response', token);
    if (remoteip) form.append('remoteip', remoteip);

    try {
        const res = await fetch(TURNSTILE_VERIFY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: form,
        });
        const data = (await res.json()) as { success?: boolean };
        return data.success === true;
    } catch (err) {
        console.error('Turnstile verification error:', err);
        return false;
    }
}

export async function POST(req: NextRequest) {
    let body: ContactBody;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const name = body.name?.trim() ?? '';
    const email = body.email?.trim() ?? '';
    const subject = body.subject?.trim() ?? '';
    const message = body.message?.trim() ?? '';
    const turnstileToken = body.turnstileToken?.trim() ?? '';

    if (!name || !email || !message) {
        return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
        return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    // Verify the Turnstile challenge before doing anything else.
    if (!turnstileToken) {
        return NextResponse.json({ error: 'Please complete the verification challenge.' }, { status: 400 });
    }
    const remoteip = req.headers.get('cf-connecting-ip') ?? req.headers.get('x-forwarded-for');
    const humanVerified = await verifyTurnstile(turnstileToken, remoteip);
    if (!humanVerified) {
        return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 403 });
    }

    // Split name into first/last for HubSpot's default contact properties.
    const [firstname, ...rest] = name.split(/\s+/);
    const lastname = rest.join(' ');

    // Fold the subject into the message — HubSpot form has no "subject" field.
    const fullMessage = subject ? `Subject: ${subject}\n\n${message}` : message;

    const fields = [
        { name: 'email', value: email },
        { name: 'firstname', value: firstname },
        ...(lastname ? [{ name: 'lastname', value: lastname }] : []),
        { name: 'message', value: fullMessage },
    ];

    try {
        const hsRes = await fetch(SUBMIT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fields,
                context: {
                    pageUri: req.headers.get('referer') ?? 'https://spiritbulb.org/contact',
                    pageName: 'Contact',
                },
            }),
        });

        if (!hsRes.ok) {
            const detail = await hsRes.json().catch(() => null);
            // Surface HubSpot's field-level validation (e.g. an unknown "subject"/"message" field)
            const firstErr = detail?.errors?.[0]?.message as string | undefined;
            console.error('HubSpot submission failed:', hsRes.status, detail);
            return NextResponse.json(
                { error: firstErr ?? 'Could not submit the form. Please try again.' },
                { status: 502 },
            );
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Contact route error:', err);
        return NextResponse.json({ error: 'Server error. Please try again later.' }, { status: 500 });
    }
}
