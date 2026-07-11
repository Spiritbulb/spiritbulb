# Spiritbulb Homepage Hook & Sign-in Funnel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reframe the spiritbulb homepage from four separate products into one ecosystem, and add a sign-in funnel that carries a visitor from the pitch to an authenticated `/home` hub, preserving a per-product "intent" so the visitor lands at the product they clicked.

**Architecture:** A Next.js 16 (App Router, React 19) marketing site. The homepage keeps its existing section skeleton and traction stats but is re-wrapped as one ecosystem, with the hero isolated as its own component for a future swap. Sign-in is an email + code flow: the browser talks only to same-origin `app/api/auth/*` routes, which proxy server-to-server to MCloud's existing auth API (never importing MCloud code). A session cookie set by the proxy gates `/home`; an `intent`/`next` param survives the round-trip so CTAs deep-link into the hub.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Tailwind 4, shadcn-style UI (`components/ui/*`, `cn()` from `@/lib/utils`), lucide-react icons. Vitest is introduced by Task 1 for the funnel logic (the repo currently has no test framework).

## Global Constraints

- **No em dashes or en dashes** in any user-facing copy. Use periods and commas. (Applies to every copy string in this plan verbatim.)
- **Canonical domain is `spiritb.uk`.** Never write `spiritbulb.org` into new code or links. `.org` survives only in legacy contact-email addresses, except `sales@spiritb.uk`.
- **Repo boundary:** the spiritbulb repo must NOT import MCloud code or reach into the mcloud-1 repo. MCloud is reached only over HTTP from server routes.
- **Do not reintroduce WorkOS** in front of this funnel. The MCloud API is used specifically because WorkOS does not reliably carry the intent/`next` param through its redirect.
- **Path alias:** `@/*` maps to repo root (e.g. `@/lib/utils`, `@/components/ui/button`).
- **Auth calls are server-to-server** from `app/api/auth/*`. The MCloud API base and any shared secret live in env vars, server-side only, never `NEXT_PUBLIC_*`.
- **Product section order:** MCloud, Nuru, Reach, Tufike.

---

## File Structure

- `vitest.config.ts` — test runner config (Task 1)
- `lib/auth/intent.ts` — parse/validate the `next` intent param, map product → `/home?app=<x>` (Task 2)
- `lib/auth/session.ts` — read/verify the session cookie, small helpers (Task 3)
- `lib/auth/mcloud-client.ts` — server-only fetch wrapper around MCloud's request-code / verify-code endpoints (Task 4)
- `app/api/auth/request-code/route.ts` — POST email → asks MCloud to send a code (Task 5)
- `app/api/auth/verify-code/route.ts` — POST email+code → verifies via MCloud, sets session cookie (Task 6)
- `app/login/page.tsx` + `app/login/login-client.tsx` — the two-step email/code form (Task 7)
- `app/home/page.tsx` — stubbed hub, gated by session, reads `?app=` (Task 8)
- `middleware.ts` — redirect unauthenticated `/home` to `/login?next=...` (Task 8)
- `components/Header.tsx` — add Sign in / Enter (Task 9)
- `components/EcosystemHero.tsx` — extracted, reframed hero (Task 10)
- `components/home-client.tsx` — reordered sections, reframed CTAs, use EcosystemHero (Task 10)
- `app/page.tsx` — SEO/JSON-LD `.org` → `.uk` cleanup (Task 11)

---

### Task 1: Introduce Vitest for funnel logic

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (add devDeps + `test` script)
- Test: `lib/auth/smoke.test.ts` (temporary, deleted at end of task)

**Interfaces:**
- Consumes: nothing.
- Produces: a working `npm test` command that runs `*.test.ts` files under `lib/`.

- [ ] **Step 1: Install Vitest**

Run:
```bash
npm install -D vitest@^3
```
Expected: adds `vitest` to devDependencies, no peer-dep errors.

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "app/**/*.test.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
```

- [ ] **Step 3: Add the test script to `package.json`**

In the `"scripts"` block add:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Write a smoke test to prove the runner works**

Create `lib/auth/smoke.test.ts`:
```ts
import { describe, it, expect } from "vitest";

describe("vitest smoke", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run it**

Run: `npm test`
Expected: 1 passed.

- [ ] **Step 6: Delete the smoke test and commit**

```bash
rm lib/auth/smoke.test.ts
git add package.json package-lock.json vitest.config.ts
git commit -m "test: add vitest runner for funnel logic"
```

---

### Task 2: Intent parsing (`lib/auth/intent.ts`)

**Files:**
- Create: `lib/auth/intent.ts`
- Test: `lib/auth/intent.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `type Product = "nuru" | "reach" | "tufike"`
  - `productPath(product: Product): string` returns `/home?app=<product>`
  - `safeNext(raw: string | null | undefined): string` returns a safe internal path, defaulting to `/home`. Rejects anything not starting with a single `/` (blocks open redirects like `//evil.com` and `https://...`), always returns `/home` for those.

- [ ] **Step 1: Write the failing test**

`lib/auth/intent.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { productPath, safeNext } from "@/lib/auth/intent";

describe("productPath", () => {
  it("maps a product to its home deep link", () => {
    expect(productPath("nuru")).toBe("/home?app=nuru");
    expect(productPath("reach")).toBe("/home?app=reach");
  });
});

describe("safeNext", () => {
  it("passes through an internal path", () => {
    expect(safeNext("/home?app=nuru")).toBe("/home?app=nuru");
  });
  it("defaults empty/undefined to /home", () => {
    expect(safeNext(undefined)).toBe("/home");
    expect(safeNext("")).toBe("/home");
  });
  it("rejects protocol-relative and absolute URLs", () => {
    expect(safeNext("//evil.com")).toBe("/home");
    expect(safeNext("https://evil.com")).toBe("/home");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- intent`
Expected: FAIL, cannot find module `@/lib/auth/intent`.

- [ ] **Step 3: Write the implementation**

`lib/auth/intent.ts`:
```ts
export type Product = "nuru" | "reach" | "tufike";

export function productPath(product: Product): string {
  return `/home?app=${product}`;
}

export function safeNext(raw: string | null | undefined): string {
  if (!raw) return "/home";
  // Must be a single-slash-rooted internal path. Reject protocol-relative
  // ("//host") and absolute ("https://host") to avoid open redirects.
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/home";
  return raw;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- intent`
Expected: PASS (all cases).

- [ ] **Step 5: Commit**

```bash
git add lib/auth/intent.ts lib/auth/intent.test.ts
git commit -m "feat: intent parsing for sign-in deep links"
```

---

### Task 3: Session cookie helpers (`lib/auth/session.ts`)

**Files:**
- Create: `lib/auth/session.ts`
- Test: `lib/auth/session.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `const SESSION_COOKIE = "sb_session"`
  - `hasSession(cookieValue: string | undefined): boolean` — true when a non-empty session token is present. (Token validation against MCloud is out of scope for this spec; presence-gating is sufficient for the door. A later `/home` spec can deepen this.)

- [ ] **Step 1: Write the failing test**

`lib/auth/session.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { SESSION_COOKIE, hasSession } from "@/lib/auth/session";

describe("session", () => {
  it("names the cookie", () => {
    expect(SESSION_COOKIE).toBe("sb_session");
  });
  it("treats a non-empty value as a session", () => {
    expect(hasSession("abc.def.ghi")).toBe(true);
  });
  it("treats empty/undefined as no session", () => {
    expect(hasSession(undefined)).toBe(false);
    expect(hasSession("")).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- session`
Expected: FAIL, cannot find module.

- [ ] **Step 3: Write the implementation**

`lib/auth/session.ts`:
```ts
export const SESSION_COOKIE = "sb_session";

export function hasSession(cookieValue: string | undefined): boolean {
  return typeof cookieValue === "string" && cookieValue.length > 0;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- session`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/auth/session.ts lib/auth/session.test.ts
git commit -m "feat: session cookie helpers"
```

---

### Task 4: MCloud auth client (`lib/auth/mcloud-client.ts`)

**Files:**
- Create: `lib/auth/mcloud-client.ts`
- Test: `lib/auth/mcloud-client.test.ts`

**Interfaces:**
- Consumes: env `MCLOUD_AUTH_BASE`, optional `MCLOUD_AUTH_SECRET`.
- Produces:
  - `requestCode(email: string): Promise<{ ok: boolean; error?: string }>`
  - `verifyCode(email: string, code: string): Promise<{ ok: boolean; accessToken?: string; refreshToken?: string; expiresIn?: number; error?: string }>`
  - Both call MCloud over `fetch`, read the endpoint base from `process.env.MCLOUD_AUTH_BASE`, and attach `MCLOUD_AUTH_SECRET` as an `x-spiritbulb-secret` header when present. Server-only (throws if `MCLOUD_AUTH_BASE` is unset).

> **VERIFIED MCloud contract (mcloud-1, 2026-07-11) — use the MOBILE endpoints.** `MCLOUD_AUTH_BASE`
> points at `https://mcloud.co.ke/api/mobile/auth`. The two calls are:
> - `POST {base}/send-code {email}` → always `{ ok: true }` (200) even for unknown emails
>   (anti-enumeration); 429 on rate limit; 400 on malformed body. So `requestCode` only reports an
>   error on a non-2xx status, never on "email not found".
> - `POST {base}/verify {email, code}` → `{ accessToken, refreshToken, expiresIn }` (200) on success,
>   or 400 `{ error }` on invalid/expired code. There is NO `{ ok, token }` shape and NO `ok` field on
>   success — success is signalled by HTTP 200 + presence of `accessToken`.
>
> The WEB endpoints (`/api/auth/send-code`, `/api/auth/verify`) are deliberately NOT used: their verify
> sets MCloud's cookie server-side and is documented same-origin-only, unusable cross-origin from
> spiritb.uk. The `x-spiritbulb-secret` header is forward-compatible only: MCloud's mobile send-code/verify
> are currently unauthenticated (the code is the credential), so the header is ignored today but harmless.

- [ ] **Step 1: Write the failing test**

`lib/auth/mcloud-client.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { requestCode, verifyCode } from "@/lib/auth/mcloud-client";

const realFetch = global.fetch;

beforeEach(() => {
  process.env.MCLOUD_AUTH_BASE = "https://mcloud.co.ke/api/mobile/auth";
});
afterEach(() => {
  global.fetch = realFetch;
  vi.restoreAllMocks();
});

describe("requestCode", () => {
  it("returns ok on 200", async () => {
    global.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    ) as unknown as typeof fetch;
    const res = await requestCode("a@b.com");
    expect(res.ok).toBe(true);
  });

  it("calls the send-code endpoint", async () => {
    const spy = vi.fn(async () =>
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );
    global.fetch = spy as unknown as typeof fetch;
    await requestCode("a@b.com");
    expect(spy).toHaveBeenCalledWith(
      "https://mcloud.co.ke/api/mobile/auth/send-code",
      expect.anything()
    );
  });

  it("returns an error on non-200", async () => {
    global.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ error: "rate limited" }), { status: 429 })
    ) as unknown as typeof fetch;
    const res = await requestCode("a@b.com");
    expect(res.ok).toBe(false);
    expect(res.error).toBeTruthy();
  });
});

describe("verifyCode", () => {
  it("returns tokens on success (200 + accessToken)", async () => {
    global.fetch = vi.fn(async () =>
      new Response(
        JSON.stringify({ accessToken: "at_123", refreshToken: "rt_456", expiresIn: 3600 }),
        { status: 200 }
      )
    ) as unknown as typeof fetch;
    const res = await verifyCode("a@b.com", "000000");
    expect(res.ok).toBe(true);
    expect(res.accessToken).toBe("at_123");
    expect(res.refreshToken).toBe("rt_456");
    expect(res.expiresIn).toBe(3600);
  });

  it("calls the verify endpoint", async () => {
    const spy = vi.fn(async () =>
      new Response(JSON.stringify({ accessToken: "at_123" }), { status: 200 })
    );
    global.fetch = spy as unknown as typeof fetch;
    await verifyCode("a@b.com", "000000");
    expect(spy).toHaveBeenCalledWith(
      "https://mcloud.co.ke/api/mobile/auth/verify",
      expect.anything()
    );
  });

  it("fails a bad code (400)", async () => {
    global.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ error: "invalid code" }), { status: 400 })
    ) as unknown as typeof fetch;
    const res = await verifyCode("a@b.com", "999999");
    expect(res.ok).toBe(false);
    expect(res.accessToken).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- mcloud-client`
Expected: FAIL, cannot find module.

- [ ] **Step 3: Write the implementation**

`lib/auth/mcloud-client.ts`:
```ts
import "server-only";

function base(): string {
  const b = process.env.MCLOUD_AUTH_BASE;
  if (!b) throw new Error("MCLOUD_AUTH_BASE is not set");
  return b.replace(/\/$/, "");
}

function headers(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  const secret = process.env.MCLOUD_AUTH_SECRET;
  if (secret) h["x-spiritbulb-secret"] = secret;
  return h;
}

export async function requestCode(
  email: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    // MCloud mobile send-code: always 200 { ok: true } even for unknown emails
    // (anti-enumeration). Only a non-2xx (429 rate limit, 400 malformed) is an error.
    const res = await fetch(`${base()}/send-code`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => null);
      return { ok: false, error: d?.error ?? "Could not send a code. Please try again." };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}

export async function verifyCode(
  email: string,
  code: string
): Promise<{
  ok: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  error?: string;
}> {
  try {
    // MCloud mobile verify: 200 { accessToken, refreshToken, expiresIn } on success,
    // 400 { error } on bad/expired code. Success is HTTP 200 + an accessToken.
    const res = await fetch(`${base()}/verify`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ email, code }),
    });
    const d = await res.json().catch(() => null);
    if (!res.ok || !d?.accessToken) {
      return { ok: false, error: d?.error ?? "That code did not work. Please try again." };
    }
    return {
      ok: true,
      accessToken: d.accessToken,
      refreshToken: d.refreshToken,
      expiresIn: d.expiresIn,
    };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}
```

> Note: `import "server-only"` requires the `server-only` package. Install it in Step 3a.

- [ ] **Step 3a: Install `server-only`**

Run: `npm install server-only`

Because the test imports this module outside Next's bundler, add to `vitest.config.ts` `resolve.alias`:
```ts
"server-only": path.resolve(__dirname, "test/stubs/server-only.ts"),
```
Create `test/stubs/server-only.ts` with a single line: `export {};`

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- mcloud-client`
Expected: PASS (all four cases).

- [ ] **Step 5: Commit**

```bash
git add lib/auth/mcloud-client.ts lib/auth/mcloud-client.test.ts vitest.config.ts test/stubs/server-only.ts package.json package-lock.json
git commit -m "feat: server-side MCloud auth client (request/verify code)"
```

---

### Task 5: request-code API route

**Files:**
- Create: `app/api/auth/request-code/route.ts`
- Test: `app/api/auth/request-code/route.test.ts`

**Interfaces:**
- Consumes: `requestCode` from `@/lib/auth/mcloud-client`.
- Produces: `POST /api/auth/request-code` accepting `{ email }`, returning `{ success: true }` (200) or `{ error }` (400/502). Validates email with the same regex style as `app/api/contact/route.ts`.

- [ ] **Step 1: Write the failing test**

`app/api/auth/request-code/route.test.ts`:
```ts
import { describe, it, expect, vi, afterEach } from "vitest";

vi.mock("@/lib/auth/mcloud-client", () => ({
  requestCode: vi.fn(async () => ({ ok: true })),
}));

import { POST } from "@/app/api/auth/request-code/route";
import { requestCode } from "@/lib/auth/mcloud-client";

afterEach(() => vi.restoreAllMocks());

function req(body: unknown) {
  return new Request("http://localhost/api/auth/request-code", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("request-code route", () => {
  it("400s an invalid email", async () => {
    const res = await POST(req({ email: "nope" }) as never);
    expect(res.status).toBe(400);
  });

  it("200s a valid email", async () => {
    const res = await POST(req({ email: "a@b.com" }) as never);
    expect(res.status).toBe(200);
    expect(requestCode).toHaveBeenCalledWith("a@b.com");
  });

  it("502s when the client fails", async () => {
    (requestCode as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: false, error: "x" });
    const res = await POST(req({ email: "a@b.com" }) as never);
    expect(res.status).toBe(502);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- request-code`
Expected: FAIL, cannot find route module.

- [ ] **Step 3: Write the implementation**

`app/api/auth/request-code/route.ts`:
```ts
import { NextRequest, NextResponse } from "next/server";
import { requestCode } from "@/lib/auth/mcloud-client";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const email = body.email?.trim() ?? "";
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }
  const result = await requestCode(email);
  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "Could not send a code." }, { status: 502 });
  }
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- request-code`
Expected: PASS (all three cases).

- [ ] **Step 5: Commit**

```bash
git add app/api/auth/request-code/route.ts app/api/auth/request-code/route.test.ts
git commit -m "feat: request-code api route"
```

---

### Task 6: verify-code API route (sets session cookie)

**Files:**
- Create: `app/api/auth/verify-code/route.ts`
- Test: `app/api/auth/verify-code/route.test.ts`

**Interfaces:**
- Consumes: `verifyCode` from `@/lib/auth/mcloud-client`; `SESSION_COOKIE` from `@/lib/auth/session`.
- Produces: `POST /api/auth/verify-code` accepting `{ email, code }`. On success sets an httpOnly `sb_session` cookie to the returned **accessToken** and responds `{ success: true }`. On failure responds `{ error }` with 400/401.

- [ ] **Step 1: Write the failing test**

`app/api/auth/verify-code/route.test.ts`:
```ts
import { describe, it, expect, vi, afterEach } from "vitest";

vi.mock("@/lib/auth/mcloud-client", () => ({
  verifyCode: vi.fn(async () => ({ ok: true, accessToken: "at_abc", refreshToken: "rt_abc", expiresIn: 3600 })),
}));

import { POST } from "@/app/api/auth/verify-code/route";
import { verifyCode } from "@/lib/auth/mcloud-client";

afterEach(() => vi.restoreAllMocks());

function req(body: unknown) {
  return new Request("http://localhost/api/auth/verify-code", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("verify-code route", () => {
  it("sets the session cookie on success", async () => {
    const res = await POST(req({ email: "a@b.com", code: "000000" }) as never);
    expect(res.status).toBe(200);
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("sb_session=at_abc");
    expect(setCookie.toLowerCase()).toContain("httponly");
  });

  it("401s a bad code without setting a cookie", async () => {
    (verifyCode as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: false, error: "bad" });
    const res = await POST(req({ email: "a@b.com", code: "999999" }) as never);
    expect(res.status).toBe(401);
    expect(res.headers.get("set-cookie")).toBeNull();
  });

  it("400s missing code", async () => {
    const res = await POST(req({ email: "a@b.com" }) as never);
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- verify-code`
Expected: FAIL, cannot find route module.

- [ ] **Step 3: Write the implementation**

`app/api/auth/verify-code/route.ts`:
```ts
import { NextRequest, NextResponse } from "next/server";
import { verifyCode } from "@/lib/auth/mcloud-client";
import { SESSION_COOKIE } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  let body: { email?: string; code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const email = body.email?.trim() ?? "";
  const code = body.code?.trim() ?? "";
  if (!email || !code) {
    return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
  }
  const result = await verifyCode(email, code);
  if (!result.ok || !result.accessToken) {
    return NextResponse.json({ error: result.error ?? "That code did not work." }, { status: 401 });
  }
  const res = NextResponse.json({ success: true });
  res.cookies.set(SESSION_COOKIE, result.accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- verify-code`
Expected: PASS (all three cases).

- [ ] **Step 5: Commit**

```bash
git add app/api/auth/verify-code/route.ts app/api/auth/verify-code/route.test.ts
git commit -m "feat: verify-code api route sets session cookie"
```

---

### Task 7: `/login` page (email + code form)

**Files:**
- Create: `app/login/page.tsx`, `app/login/login-client.tsx`

**Interfaces:**
- Consumes: `/api/auth/request-code`, `/api/auth/verify-code`, `safeNext` from `@/lib/auth/intent`.
- Produces: a client form. Reads `?next=` from the URL, defaults via `safeNext`. Two steps: email → "Send code", then code → "Verify". On verify success, `window.location.assign(next)`.

This task is verified manually (UI). No unit test; the logic it depends on is already covered by Tasks 2, 5, 6.

- [ ] **Step 1: Create the server page**

`app/login/page.tsx`:
```tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import LoginClient from "./login-client";

export const metadata: Metadata = {
  title: "Sign in | Spiritbulb",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginClient />
    </Suspense>
  );
}
```

- [ ] **Step 2: Create the client form**

`app/login/login-client.tsx`:
```tsx
"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { safeNext } from "@/lib/auth/intent";

export default function LoginClient() {
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/request-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setBusy(false);
    if (!res.ok) {
      const d = await res.json().catch(() => null);
      setError(d?.error ?? "Could not send a code. Please try again.");
      return;
    }
    setStep("code");
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    setBusy(false);
    if (!res.ok) {
      const d = await res.json().catch(() => null);
      setError(d?.error ?? "That code did not work. Please try again.");
      return;
    }
    window.location.assign(next);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Sign in to Spiritbulb</h1>
          <p className="text-sm text-muted-foreground">
            One login opens all four products.
          </p>
        </div>

        {step === "email" ? (
          <form onSubmit={sendCode} className="space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? "Sending" : "Send code"}
            </Button>
          </form>
        ) : (
          <form onSubmit={verify} className="space-y-3">
            <input
              inputMode="numeric"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter the code we emailed"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? "Verifying" : "Verify"}
            </Button>
          </form>
        )}

        {error && <p className="text-sm text-destructive text-center">{error}</p>}
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Manual check**

Run: `npm run dev`. Set a temporary `MCLOUD_AUTH_BASE` to a mock, or expect the request-code call to 502 without it. Confirm: the email step renders, submitting advances to the code step (when request-code returns ok), and an error string renders on failure. Confirm `/login?next=/home?app=nuru` reads correctly (inspect `next` in devtools).

- [ ] **Step 4: Commit**

```bash
git add app/login/page.tsx app/login/login-client.tsx
git commit -m "feat: /login email + code form with next intent"
```

---

### Task 8: `/home` stub + session gate middleware

**Files:**
- Create: `app/home/page.tsx`, `middleware.ts`
- Test: `middleware.test.ts`

**Interfaces:**
- Consumes: `SESSION_COOKIE`, `hasSession` from `@/lib/auth/session`; `safeNext` not needed here.
- Produces: middleware that redirects unauthenticated `/home*` to `/login?next=<path+query>`; a stub `/home` page that reads `?app=` and shows which product you deep-linked into (proves the gate + intent survive).

- [ ] **Step 1: Write the failing middleware test**

`middleware.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";

function reqFor(url: string, cookie?: string) {
  const r = new NextRequest(new URL(url, "http://localhost"));
  if (cookie) r.cookies.set("sb_session", cookie);
  return r;
}

describe("home gate middleware", () => {
  it("redirects unauthenticated /home to /login with next", () => {
    const res = middleware(reqFor("http://localhost/home?app=nuru"));
    expect(res.status).toBe(307);
    const loc = res.headers.get("location")!;
    expect(loc).toContain("/login");
    expect(decodeURIComponent(loc)).toContain("next=/home?app=nuru");
  });

  it("lets an authenticated request through", () => {
    const res = middleware(reqFor("http://localhost/home?app=nuru", "tok_abc"));
    // NextResponse.next() has no redirect location
    expect(res.headers.get("location")).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- middleware`
Expected: FAIL, cannot find `@/middleware`.

- [ ] **Step 3: Write the middleware**

`middleware.ts`:
```ts
import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, hasSession } from "@/lib/auth/session";

export function middleware(req: NextRequest) {
  const session = req.cookies.get(SESSION_COOKIE)?.value;
  if (hasSession(session)) return NextResponse.next();

  const nextPath = req.nextUrl.pathname + req.nextUrl.search;
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = `?next=${nextPath}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/home/:path*", "/home"],
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- middleware`
Expected: PASS (both cases).

- [ ] **Step 5: Write the `/home` stub page**

`app/home/page.tsx`:
```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home | Spiritbulb",
  robots: { index: false, follow: false },
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ app?: string }>;
}) {
  const { app } = await searchParams;
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md space-y-3 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Welcome to the hub</h1>
        <p className="text-sm text-muted-foreground">
          {app
            ? `You are signed in and headed to ${app}. The live experience lands here soon.`
            : "You are signed in. The ecosystem hub lands here soon."}
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 6: Manual check**

Run: `npm run dev`. Visit `/home?app=nuru` with no cookie: confirm redirect to `/login?next=/home?app=nuru`. Manually set an `sb_session` cookie in devtools, reload `/home?app=nuru`: confirm the stub renders and reads "headed to nuru".

- [ ] **Step 7: Commit**

```bash
git add app/home/page.tsx middleware.ts middleware.test.ts
git commit -m "feat: /home stub gated by session middleware"
```

---

### Task 9: Header sign-in entry

**Files:**
- Modify: `components/Header.tsx`

**Interfaces:**
- Consumes: nothing new. Adds a link to `/login`.
- Produces: a "Sign in" link in the header. (Session-aware "Enter" label is deferred: the header is a client component and reading httpOnly cookies client-side is not possible without an extra endpoint. Keep it simple, always show "Sign in"; the middleware still routes a signed-in user straight through from `/home`. A later task can add an `/api/auth/me` check if desired.)

- [ ] **Step 1: Add the Sign in link**

In `components/Header.tsx`, add `import Link from "next/link"` is already present. Between the logo `<Link>` and the theme-toggle button, insert a right-aligned group. Replace the closing of the flex container so it holds both the Sign in link and the toggle:

```tsx
                {/* Right side: sign in + theme toggle */}
                <div className="flex items-center gap-2">
                    <Link
                        href="/login"
                        className="rounded-md px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                    >
                        Sign in
                    </Link>
                    <button
                        onClick={toggleDarkMode}
                        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                        {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </button>
                </div>
```
(Remove the old standalone theme-toggle button that this replaces, so the toggle is not rendered twice.)

- [ ] **Step 2: Manual check**

Run: `npm run dev`. Confirm the header shows "Sign in" left of the theme toggle, and it links to `/login`. Toggle still works.

- [ ] **Step 3: Commit**

```bash
git add components/Header.tsx
git commit -m "feat: header sign-in link"
```

---

### Task 10: Reframe homepage (EcosystemHero + reordered/reframed sections)

**Files:**
- Create: `components/EcosystemHero.tsx`
- Modify: `components/home-client.tsx`

**Interfaces:**
- Consumes: `Button` from `@/components/ui/button`.
- Produces: `<EcosystemHero />` (the Approach-B swap seam), and a reframed `home-client.tsx` with sections ordered MCloud, Nuru, Reach, Tufike and CTAs funneling to `/login`.

- [ ] **Step 1: Extract the hero into `EcosystemHero.tsx`**

`components/EcosystemHero.tsx`:
```tsx
"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Highlighter } from "@/components/ui/highlighter";

export default function EcosystemHero() {
  return (
    <section className="w-full overflow-hidden pt-12 md:pt-20 py-16 md:py-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div className="space-y-8 lg:order-1">
            <div className="space-y-4">
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">
                Four branches.{" "}
                <Highlighter action="underline" color="var(--highlight-spiritbulb)">
                  One ecosystem.
                </Highlighter>
              </h1>
              <p className="text-base text-muted-foreground md:text-lg leading-relaxed">
                Spiritbulb is one platform to build, sell, and engage. Four products, a single login. Come try the ones that are live.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" className="gap-2" asChild>
                <a href="/login">
                  Try it live <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="ghost" size="lg" asChild className="border">
                <a href="#menengai">See the ecosystem</a>
              </Button>
            </div>
          </div>
          <div className="relative lg:order-2 hidden lg:block">
            {/* Approach-B seam: the interactive five-leaf lotus replaces this image later. */}
            <img src="/future.svg" alt="That's the spirit" className="w-full h-auto" loading="eager" />
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Use the hero and reorder sections in `home-client.tsx`**

In `components/home-client.tsx`:
1. Add `import EcosystemHero from "@/components/EcosystemHero";`.
2. Replace the entire existing `{/* ── Hero ── */}` `<Section>` block with `<EcosystemHero />`.
3. Reorder the section blocks to: MCloud (`#menengai`), Nuru, Reach, Tufike. (Nuru moves up above Reach.)

- [ ] **Step 3: Reframe the CTAs**

- MCloud section: keep the existing outbound `a href="https://mcloud.co.ke"` "See MCloud" button (unchanged).
- Nuru section: add below its badges:
```tsx
                        <Button className="gap-2" asChild>
                            <a href="/login?next=/home?app=nuru">
                                Try Nuru live <ArrowRight className="h-4 w-4" />
                            </a>
                        </Button>
                        <p className="text-xs text-muted-foreground">live demo, 5 messages</p>
```
- Reach section: add below its badges:
```tsx
                        <Button className="gap-2" asChild>
                            <a href="/login?next=/home?app=reach">
                                Explore Reach <ArrowRight className="h-4 w-4" />
                            </a>
                        </Button>
                        <p className="text-xs text-muted-foreground">preview</p>
```
- Tufike section: add below its badges:
```tsx
                        <Button className="gap-2" asChild>
                            <a href="/login?next=/home?app=tufike">
                                Preview Tufike <ArrowRight className="h-4 w-4" />
                            </a>
                        </Button>
                        <p className="text-xs text-muted-foreground">coming soon</p>
```

- [ ] **Step 4: Reframe the final CTA section**

Replace the "Are you in?" CTA `<Section>` content with:
```tsx
                <div className="max-w-2xl space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold md:text-4xl tracking-tight">
                            One login. All four.
                        </h2>
                        <p className="text-muted-foreground text-sm leading-relaxed md:text-base">
                            The whole ecosystem opens with a single sign in. Start where you like.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Button size="lg" className="gap-2" asChild>
                            <a href="/login">
                                Get in <ArrowRight className="h-4 w-4" />
                            </a>
                        </Button>
                        <Button variant="outline" size="lg" onClick={() => router.push("/contact")}>
                            Talk to us
                        </Button>
                    </div>
                </div>
```

- [ ] **Step 5: Manual check**

Run: `npm run dev`. Confirm: new hero copy with no em dashes; section order is MCloud, Nuru, Reach, Tufike; each of Nuru/Reach/Tufike has a CTA linking to `/login?next=/home?app=<x>` with its small tag line; MCloud still links out; final CTA reads "One login. All four." Click "Try Nuru live" and confirm it reaches `/login` and (unauthenticated) the flow begins.

- [ ] **Step 6: Commit**

```bash
git add components/EcosystemHero.tsx components/home-client.tsx
git commit -m "feat: reframe homepage to one-ecosystem hook with sign-in funnel"
```

---

### Task 11: Domain cleanup in SEO/JSON-LD

**Files:**
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes/Produces: none (metadata only).

- [ ] **Step 1: Replace `.org` with `.uk` in `app/page.tsx`**

Change every `https://spiritbulb.org` to `https://spiritb.uk` (metadataBase, `openGraph.url`, JSON-LD `@id`/`url`/`sameAs` where it is the org's own domain, and the subdomain refs `nuru.spiritbulb.org` → `nuru.spiritb.uk`). Do NOT change third-party URLs (twitter.com, linkedin.com). Update the two `title`/`description` strings only if they contain the domain (they do not, leave copy as-is unless it has an em dash; it does not).

- [ ] **Step 2: Manual check**

Run: `npm run build` (or `npm run dev` and view source). Confirm no `spiritbulb.org` remains in `app/page.tsx`: `grep -n "spiritbulb.org" app/page.tsx` returns nothing.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "chore: canonical domain spiritb.uk in homepage metadata"
```

---

### Task 12: Env documentation + full green build

**Files:**
- Create: `.env.example` (append if exists)
- Modify: none

**Interfaces:** none.

- [ ] **Step 1: Document the new env vars**

Create/append `.env.example`:
```
# MCloud MOBILE auth API (server-to-server; do NOT prefix NEXT_PUBLIC).
# Mobile variant returns tokens in the body (usable cross-origin); the web
# variant sets a same-origin-only cookie and is NOT usable from spiritb.uk.
MCLOUD_AUTH_BASE=https://mcloud.co.ke/api/mobile/auth
MCLOUD_AUTH_SECRET=
```

- [ ] **Step 2: Full test + build**

Run: `npm test`
Expected: all suites pass.

Run: `npm run build`
Expected: build succeeds with no type errors.

- [ ] **Step 3: Commit**

```bash
git add .env.example
git commit -m "docs: document MCloud auth env vars"
```

---

## Self-Review

**Spec coverage:**
- Header sign-in → Task 9. Hero reframe (isolated for B) → Task 10 (EcosystemHero). Reordered/reframed sections + CTAs → Task 10. `/login` → Task 7. `app/api/auth/*` proxy → Tasks 4, 5, 6. `/home` gate + `?app=` deep-link → Task 8. Intent survival → Tasks 2, 7, 8. Copy (no em dashes) → Global Constraints + Tasks 7, 10. Domain `.uk` cleanup → Task 11. SEO/JSON-LD preserved → Task 11 (edited, not removed). Testing approach (funnel logic tested, marketing markup manual) → Tasks 2/3/4/5/6/8 test; 7/9/10/11 manual. External dependency (MCloud contract, CORS) → Task 4 note. `/home` interior deferred → Task 8 is a stub only. All spec sections covered.

**Placeholder scan:** No TBD/TODO. The one genuine unknown (MCloud endpoint contract) is a bounded, explicit planning-phase note on Task 4 with a named fallback, and the code assumes a concrete shape so the task is executable as written.

**Type consistency:** `SESSION_COOKIE`/`hasSession` (Task 3) used identically in Tasks 6 and 8. `requestCode`/`verifyCode` signatures (Task 4) match their consumers (Tasks 5, 6). `safeNext`/`productPath`/`Product` (Task 2) match usage in Task 7. Cookie name `sb_session` consistent across Tasks 3, 6, 8 tests. Route return shapes (`{ success: true }` / `{ error }`) consistent between routes and the login client's error reads.

**Note for executor:** Task 4 has a real external dependency (MCloud's endpoint contract). Confirm the actual request-code/verify-code paths and response shapes against the mcloud-1 repo before implementing Task 4; if they differ, adjust only Task 4's fetch calls and its test mocks. If MCloud cannot serve spiritbulb cross-origin at all, escalate: the fallback (self-contained auth) is a scope change worth a decision, not a silent pivot.

## Future Enhancement (not in this plan): Playwright happy-path E2E

Once the funnel is live, the highest-value follow-up test is a single Playwright E2E of the
real user flow: click "Try Nuru live" on the homepage, land on `/login` with the correct
`next`, submit email and code (against a mocked or test MCloud), and assert arrival at
`/home?app=nuru`. mcloud-1's `apps/web` already has `@playwright/test` installed but not yet
configured, so a shared Playwright setup could serve both repos. Deferred deliberately: the
Vitest coverage above already exercises the logic, and standing up a browser harness plus a
test-mode auth backend is its own scoped task, not a blocker for shipping the funnel.
