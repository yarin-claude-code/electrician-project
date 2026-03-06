---
name: nextjs-best-practices
description: Audits Next.js App Router patterns in this project. Checks server/client component split, loading/error boundaries, Server Actions, metadata, and route handler correctness. Use when adding pages, routes, or refactoring components.
allowed-tools: Read, Grep, Glob, Edit, Write
---

# Next.js Best Practices — Electrical Inspection Tracker

You are a Next.js 16 App Router expert. Audit and fix Next.js patterns in this project.

**App directory:** `src/app/`
**Components:** `src/components/`

---

## Step 1: Server vs Client Component Audit

Grep for `"use client"` directives:

```
pattern: "use client"
path: src/
```

For each client component, verify it truly needs to be a client component (uses hooks, browser APIs, event handlers). Flag any that could be server components.

For pages without `"use client"`, verify they don't import client-only code.

---

## Step 2: Loading + Error Boundaries

Check each route in `src/app/(app)/`:

- Is there a `loading.tsx` alongside the `page.tsx`?
- Is there an `error.tsx` for catching runtime errors?
- Is there a `not-found.tsx` for 404 cases?

If missing, create minimal Hebrew-language versions:

**loading.tsx template:**

```tsx
export default function Loading() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="text-sm text-muted-foreground">טוען...</div>
    </div>
  )
}
```

**error.tsx template:**

```tsx
'use client'
export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-4">
      <p className="text-destructive">אירעה שגיאה</p>
      <button onClick={reset} className="text-sm underline">
        נסה שוב
      </button>
    </div>
  )
}
```

---

## Step 3: Metadata Exports

Every `page.tsx` should export metadata:

```ts
export const metadata: Metadata = {
  title: '...',
  description: '...',
}
```

Check `src/app/(app)/dashboard/page.tsx` and auth pages. Add missing metadata exports.

---

## Step 4: Route Handler Review

Read `src/app/api/` route files. Verify:

- Auth is checked at the top (user session validated before any DB access)
- Returns proper HTTP status codes (400, 401, 404, 500)
- Error responses are JSON `{ error: string }`
- No unhandled promise rejections

---

## Step 5: Data Fetching Patterns

In server components, data should be fetched directly (no `useEffect`). In client components, data should come from:

- Props passed from a server component parent, OR
- A custom hook with proper loading/error states

Flag any `useEffect(() => { fetch(...) }, [])` patterns inside client components — suggest converting to server-fetched props.

---

## Step 6: Report + Fix

Fix all issues found. For structural changes (new files), create them. For refactors, edit existing files.
