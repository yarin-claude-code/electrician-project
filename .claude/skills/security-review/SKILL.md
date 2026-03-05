---
name: security-review
description: Security audit for this app. Checks RLS gaps, auth bypass risks, secret exposure, CSRF, injection in PDF generation, service worker cache leaks, and supply chain risks. Use before deploying or after adding new API routes.
allowed-tools: Read, Grep, Glob, Bash, Edit
---

# Security Review — Electrical Inspection Tracker

You are a security auditor. Perform a systematic security review of this Next.js + Supabase app.

---

## Step 1: Auth Route Protection

Read `src/middleware.ts` and `src/lib/supabase/middleware.ts`.

Check:
- Every route under `/(app)/` is protected (unauthenticated → redirect to login)
- The matcher pattern covers all app routes, not just some
- Session refresh happens correctly — is there a race condition where an expired session gets through?
- Can the middleware be bypassed by URL encoding tricks (e.g. `/%2Fdashboard`)?

---

## Step 2: API Route Auth

Grep for all API route files:
```
Glob: src/app/api/**/*.ts src/app/api/**/*.tsx
```

For each route handler, verify the FIRST thing it does is:
```ts
const { data: { user } } = await supabase.auth.getUser()
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
```

Flag any route that accesses the DB before checking auth.

---

## Step 3: RLS Policy Audit

Read `supabase/schema.sql`. For every table:
- Has RLS enabled?
- All operations (SELECT, INSERT, UPDATE, DELETE) have policies?
- Policies use `auth.uid()` correctly, not `current_user` or raw user input?
- No `USING (true)` (bypasses all RLS)?

---

## Step 4: Secret / Credential Exposure

Grep for hardcoded secrets:
```
pattern: (password|secret|key|token|api_key)\s*=\s*['"][^'"]{8,}
path: src/
```

Also check:
- `.env` files are in `.gitignore`
- No Supabase service role key used in client-side code
- `NEXT_PUBLIC_` prefixed vars are safe to expose (not private keys)

---

## Step 5: PDF Generation Injection

Read `src/app/api/reports/[id]/route.tsx` (or the PDF route).

Check:
- Does it validate the `id` param before DB lookup (UUID format check)?
- Does user-controlled text get sanitized before being placed in the PDF?
- Could an attacker inject SVG/HTML into PDF fields via inspection data?
- Is the generated PDF served with correct `Content-Type: application/pdf` (not `text/html`)?

---

## Step 6: Service Worker Cache Leaks

Read `src/sw.ts`.

Check:
- Are Supabase API responses (containing auth tokens or user data) cached?
- Is the cache keyed correctly so user A can't read user B's cached data?
- Are auth headers stripped before caching responses?

---

## Step 7: IndexedDB Security

Read `src/lib/idb.ts`.

Check:
- Is data stored in IndexedDB encrypted or is it plaintext?
- Could another tab/origin read inspection drafts?
- Is the pending upload queue properly validated before re-sending?

---

## Step 8: Input Validation

Grep for `zod` schemas:
```
pattern: z\.object\(
path: src/
```

Verify:
- All form inputs have Zod validation
- Server-side validation exists (not just client-side) for API routes
- No `z.any()` used for user input

---

## Step 9: Dependency Audit

```bash
npm audit --audit-level=moderate
```

Report any high/critical vulnerabilities found.

---

## Step 10: Report

Group findings by severity:
- 🔴 Critical — fix immediately (auth bypass, data exposure)
- 🟠 High — fix before deploy (injection, missing validation)
- 🟡 Medium — fix soon (cache leaks, missing sanitization)
- 🟢 Low — nice to fix (minor hardening)

Fix all Critical and High issues. For Medium/Low, list them with recommendations.
