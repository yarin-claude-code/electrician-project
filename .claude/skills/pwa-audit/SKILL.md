---
name: pwa-audit
description: PWA audit for this offline-capable app. Checks manifest completeness, service worker caching strategy, IndexedDB sync queue reliability, and offline UX. Use when updating sw.ts, idb.ts, or manifest.json.
allowed-tools: Read, Grep, Glob, Edit, Bash
---

# PWA Audit — Electrical Inspection Tracker

You are a PWA expert specializing in offline-first apps. Audit this Serwist-powered PWA.

**Key files:**

- `src/sw.ts` — Service worker
- `src/lib/idb.ts` — IndexedDB drafts + upload queue
- `public/manifest.json` — PWA manifest
- `src/hooks/use-online-status.ts` — Online detector
- `src/components/sw-register.tsx` — SW registration

---

## Step 1: Manifest Completeness

Read `public/manifest.json`. Required fields for installability:

- `name` and `short_name`
- `start_url`
- `display: "standalone"` or `"fullscreen"`
- `background_color` and `theme_color`
- Icons at 192x192 and 512x512 (check `public/icons/`)
- `lang: "he"` and `dir: "rtl"`

Fix any missing fields.

---

## Step 2: Service Worker Caching

Read `src/sw.ts`. Check:

- Static assets cached with `CacheFirst` strategy
- Next.js chunks cached with `StaleWhileRevalidate`
- Supabase API calls: should NOT be cached (contains auth-sensitive data)
- Font files cached with `CacheFirst` + long expiry
- Does offline fallback page exist for navigation requests?

---

## Step 3: IndexedDB Draft Persistence

Read `src/lib/idb.ts`. Check:

- Draft save is called on every step navigation (verify in wizard-context)
- Draft restore on page load populates the wizard correctly
- Draft is cleared after successful Supabase sync
- `pendingUploads` queue: is there a retry mechanism with backoff?
- Is there a max retry count to prevent infinite loops?

---

## Step 4: Online/Offline Sync

Read `src/hooks/use-online-status.ts`. Check:

- Uses `navigator.onLine` + `online`/`offline` event listeners
- Is there a "came back online" trigger that flushes the pending upload queue?
- Does the wizard auto-save trigger a Supabase sync when back online?

---

## Step 5: SW Registration

Read `src/components/sw-register.tsx`. Check:

- SW registered after page load (not blocking render)
- Update available notification shown to user
- Registration errors handled gracefully (no silent failures)

---

## Step 6: Offline UX

Check if the app shows a Hebrew offline indicator when `isOnline === false`:

- Toast or banner: "אתה במצב לא מקוון — הנתונים נשמרים מקומית"
- Save button should still work (saves to IndexedDB)
- Submit/finalize should be disabled with explanation

---

## Step 7: Report + Fix

Fix manifest issues, SW caching misconfigurations, and missing retry logic. Flag structural issues for user review.
