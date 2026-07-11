# Spiritbulb Homepage Hook & Sign-in Funnel — Design

**Date:** 2026-07-11
**Repo:** `spiritbulb` (standalone, deploys to `spiritb.uk` on Vercel)
**Status:** Design approved, pending spec review

## Context

Spiritbulb is consolidating its go-to-market from four separately-pitched products
(MCloud, Nuru, Reach, Tufike) into one ecosystem: "four branches, one ecosystem."
This spec covers the **public homepage reframe and the sign-in funnel** that carries a
visitor from the pitch to the authenticated hub at `/home`.

The existing homepage (`app/page.tsx` + `components/home-client.tsx`) already presents the
four products with real traction stats, but pitches them separately, has no sign-in, and
no path to `/home`. We reframe it as one ecosystem and add the funnel.

**Out of scope (separate specs):** the `/home` hub interior and its live demos (Nuru RAG,
Reach mock, Tufike waitlist); cross-subdomain SSO; the interactive five-leaf lotus hero.

## The Hook

The reason to sign in is **"try the real thing."** The homepage teases; `/home` is where you
actually use the products. Nuru's live RAG demo is the sharpest proof. This is market-first
substance; investor appeal is a byproduct of showing real product working, not a separate
"investor mode." There is one `/home` for everyone.

Honesty at the edges is a feature: each demo is upfront about its limits (Nuru caps at 5
messages, Reach is a preview, Tufike is coming soon), so caps feel like an invitation's edge,
not a bait-and-switch.

## Approach

**Approach A: reframe and wrap.** Keep the existing section skeleton and all traction stats;
change the frame (one ecosystem), the CTAs (funnel into sign-in), and add the auth pieces.
The hero is isolated as its own component so the future interactive-lotus hero (Approach B)
can be swapped in without touching the funnel. Nothing is architected so tightly that a
different direction is blocked.

## Funnel Architecture

```
Homepage (public, discovery)
   Sign in (header)          ─┐
   Try it live (hero CTA)    ─┼─► /login ─► email ─► code ─► session cookie ─► /home
   Try Nuru live (section)   ─┘     (verify via MCloud auth API, server-to-server)   │
   ...per-product CTAs carry an intent                                               │
                                                          intent lands you at /home?app=<x>
```

### Components / pieces

1. **`/login` route** — small page in this repo. Email field → "Send code" → code field →
   verify. On success sets the session cookie and redirects to `next` (default `/home`).

2. **`app/api/auth/*` server routes** — proxy to MCloud's existing auth API
   (request-code, verify-code). Calls are **server-to-server** so the MCloud API base and any
   shared secret stay server-side and never reach the browser. Spiritbulb never imports MCloud
   code (respects the repo boundary).

3. **`intent` param** — per-product CTAs pass `?next=/home?app=nuru` through login so the
   visitor lands at that product in the hub, not a generic dashboard. This deep-link is the
   reason MCloud's API is used instead of WorkOS: WorkOS's hosted flow does not reliably carry
   a `next`/intent param through its redirect, which would break the hook. Calling MCloud's
   endpoints directly means spiritbulb owns the redirect and the intent survives.
   **Do not reintroduce WorkOS in front of this funnel.**

4. **Session gate** — helper/middleware: unauthenticated request to `/home` bounces to
   `/login?next=<original>`. An authenticated visitor to `/` still sees the public homepage,
   but the header CTA reads "Enter" instead of "Sign in."

### Non-goals (YAGNI)

- No password or account-management UI.
- No cross-subdomain SSO yet (separate future spec).
- Just: email → code → cookie → hub.

## Homepage Structure (the reframe)

Top to bottom:

1. **Header** (`components/Header.tsx`) — keep logo + theme toggle; add "Sign in" (reads
   "Enter" when a session exists).

2. **`<EcosystemHero>`** — new isolated component (the Approach-B swap seam). Keeps the
   existing right-slot image (`/future.svg`) for now; that slot is where the lotus goes later.

3. **Four product sections** — keep existing layout and **every traction stat**. Reordered to
   **MCloud → Nuru → Reach → Tufike** (engine first for credibility, then the one live demo,
   then the in-dev two; also descends by fidelity). Only the CTA per section changes:
   - MCloud → outbound "See MCloud" to `https://mcloud.co.ke` (the mature one, stands apart)
   - Nuru → "Try Nuru live" → `/login?next=/home?app=nuru` (tag: "live demo, 5 messages")
   - Reach → "Explore Reach" → `/login?next=/home?app=reach` (tag: "preview")
   - Tufike → "Preview Tufike" → `/login?next=/home?app=tufike` (tag: "coming soon")

4. **Final CTA** — reframed to funnel; keep a quieter "Talk to us" → `/contact` secondary.

### Preserve unchanged
The SEO/JSON-LD block (valid; only needs a `.org` → `.uk` domain cleanup), and the existing
`/careers`, `/contribute`, `/contact`, `/nuru`, and chess routes.

## Copy

No em dashes or en dashes anywhere (an AI tell the user avoids on credibility-sensitive
surfaces). Rhythm comes from periods and commas.

**Hero**
- Headline: "Four branches. One ecosystem."
- Sub: "Spiritbulb is one platform to build, sell, and engage. Four products, a single login.
  Come try the ones that are live."
- Primary CTA: "Try it live" · Secondary: "See the ecosystem"

**Section CTAs** (stats and descriptions stay as-is)
- MCloud: "See MCloud" (outbound)
- Nuru: "Try Nuru live" (tag: "live demo, 5 messages")
- Reach: "Explore Reach" (tag: "preview")
- Tufike: "Preview Tufike" (tag: "coming soon")

**Final CTA**
- Headline: "One login. All four."
- Sub: "The whole ecosystem opens with a single sign in. Start where you like."
- Primary: "Get in" · Secondary: "Talk to us" (→ `/contact`)

Voice matches the current page: warm and plainspoken, not corporate.

## Testing

- **Funnel logic (worth testing, mock the proxy):** session gate redirects unauthenticated
  `/home` to `/login`; `next` / `app` intent survives the login round-trip; auth proxy handles
  success, bad-code, and expired-code paths.
- **Auth proxy contract:** one integration check against MCloud's real endpoints during
  implementation (resolves the external dependency below).
- **Homepage reframe (copy, order, CTAs):** visual/manual, verified by running the app. No unit
  tests for static marketing markup.

## Scope Boundary: this spec builds the door and the funnel to it

`/home` is stubbed as a placeholder that only proves the session gate and the `?app=` deep-link
work. The hub interior and the live demos are a separate spec.

## External Dependencies / Known Risks

1. **MCloud auth API accepts spiritbulb.** MCloud's auth API must expose request-code /
   verify-code endpoints and accept server-to-server calls from spiritbulb's origin. The exact
   endpoint contract and any shared-secret/allowlist requirement are confirmed in the planning
   phase against the mcloud-1 repo. **Fallback** if unavailable: a fresh minimal email-code +
   cookie auth self-contained in the spiritbulb repo.

2. **CORS on MCloud's side.** The auth hop is server-to-server, so the browser same-origin rule
   does not apply to it and there is no CORS on that call. What still needs fixing eventually is
   whatever MCloud enforces on **incoming requests from a new origin** (allowlisting spiritb.uk's
   server, plus any secret/allowlist check). Treated as a known implementation-phase task, not a
   design-time free lunch.
