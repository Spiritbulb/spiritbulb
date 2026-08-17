// POST /api/waitlist  { email, wantsUpdates? }
// Tufike's own route. Keeps MCLOUD_PARTNER_SECRET server-side and proxies to
// MCloud's partner waitlist endpoint, tagged as product "tufike".
import { NextResponse, type NextRequest } from 'next/server'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MCLOUD_BASE = process.env.MCLOUD_BASE! // e.g. https://mcloud.co.ke/api/partner
const MCLOUD_PARTNER_SECRET = process.env.PARTNER_AUTH_SECRET!

export async function POST(req: NextRequest) {
    let body: { email?: unknown; wantsUpdates?: unknown }
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    if (!EMAIL_RE.test(email)) {
        return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }

    const wantsUpdates = body.wantsUpdates !== false

    let upstream: Response
    try {
        upstream = await fetch(`${MCLOUD_BASE}/waitlist`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-partner-secret': MCLOUD_PARTNER_SECRET,
            },
            body: JSON.stringify({ email, product: 'tufike', wantsUpdates }),
        })
    } catch {
        return NextResponse.json({ error: 'Could not reach the waitlist. Please try again.' }, { status: 502 })
    }

    if (!upstream.ok) {
        return NextResponse.json({ error: 'Could not join the waitlist. Please try again.' }, { status: 502 })
    }

    return NextResponse.json({ success: true })
}