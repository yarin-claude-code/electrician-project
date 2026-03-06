# Tasks — Electrical Inspection Tracker

Active work items, bugs, and backlog. Updated as work progresses.

---

## In Progress

- [ ] Obsidian integration — `docs/` directory setup (architecture, roadmap, decisions, tasks)

---

## Bugs

- [x] PDF route path mismatch — fixed in CLAUDE.md (DOCBUG-001)
- [x] Wizard step numbering in CLAUDE.md — fixed (DOCBUG-002)
- [x] Dashboard charts hardcoded to demo data — fixed (BUG-001)
- [x] Non-null assertion on `user` in dashboard — fixed (BUG-002)
- [x] New inspection failure silently redirects — fixed (BUG-003)
- [x] `completionPercent` off by one — fixed (BUG-005)
- [x] `persistState` uses `navigator.onLine` directly — fixed (BUG-006)
- [x] Login button stays disabled on success — fixed (BUG-007)
- [x] `idb.ts` server-side guard missing — fixed (BUG-008)
- [ ] BUG-004: Wizard only persists Step 1 data in IndexedDB; steps 2–9 not in draft

---

## Testing

- [ ] Add Vitest + React Testing Library
  - [ ] `WizardContext` — step navigation, auto-save trigger, dual-write logic
  - [ ] `src/lib/utils.ts` — `cn()`, `formatDateHe()`, `installationTypeLabel()`
  - [ ] Zod schemas used in each wizard step
  - [ ] `src/lib/idb.ts` — draft read/write, pending upload queue
- [ ] Add Playwright E2E tests
  - [ ] Auth flow: register, login, logout
  - [ ] Create inspection → redirect to wizard
  - [ ] Complete all 9 wizard steps with mock data
  - [ ] Verify DB record created (via Supabase)
  - [ ] Download PDF report
  - [ ] Offline mode: fill wizard offline, verify IndexedDB draft, sync on reconnect

---

## DX / Tooling

- [ ] Add Prettier config (`.prettierrc`) and `npm run format` script
- [ ] Add Husky pre-commit hook: run ESLint + TypeScript check on staged files
- [ ] Add `lint-staged` config alongside Husky
- [ ] Add `.env.example` file documenting all required environment variables

---

## UI / UX

- [ ] Add error boundary components for wizard steps (prevent one step crash from killing the whole wizard)
- [ ] Add error boundary for dashboard charts
- [ ] Offline sync indicator — show badge/banner when `pendingUploads` queue is non-empty
- [ ] Inspection list filters on dashboard — filter by status, date range, installation type
- [ ] Empty state illustrations for dashboard (no inspections yet)
- [ ] Loading skeleton for dashboard KPI cards and charts
- [ ] Confirm dialog before leaving wizard with unsaved changes

---

## PDF

- [ ] Include all wizard sections in PDF output (currently incomplete)
- [ ] Better Hebrew typography — verify Heebo font renders all glyphs at all sizes
- [ ] Add inspector license number and signature to PDF header
- [ ] Handle large inspections (many photos) — investigate serverless timeout risk, consider streaming or background generation
- [ ] Add QR code to PDF linking to online report verification

---

## PWA / Offline

- [ ] Add visible PWA install prompt (A2HS) for mobile users
- [ ] Push notifications for sync completion when returning online
- [ ] Photo compression before upload — client-side canvas resize to reduce payload size
- [ ] Test service worker cache invalidation on new deployments

---

## Backend / Database

- [ ] Audit all RLS policies against `supabase/schema.sql` — confirm no missing policies on new tables
- [ ] Add DB indexes for common query patterns (inspector_id + created_at on inspections)
- [ ] Add `updated_at` trigger to all tables that are missing it
- [ ] Consider a `submitted_at` index for dashboard date-range queries

---

## Features — Planned

- [ ] Inspection templates — save common check configurations as reusable starting points
- [ ] Client portal — read-only shareable link for a completed inspection report
- [ ] Excel export — structured data export of inspection results
- [ ] Multi-tenant admin dashboard — aggregate stats across multiple inspectors
- [ ] Arabic language support alongside Hebrew

---

## Completed

- [x] Supabase auth (email/password, SSR cookie sessions)
- [x] 9-step inspection wizard with auto-save
- [x] Visual checks with pass/fail/N.A. + notes + photo upload (step 2)
- [x] Instruments, panels, circuit measurements, fault loop (steps 3–5)
- [x] Defects and recommendations (steps 6–7)
- [x] Generator section, conditional on `has_generator` (step 8)
- [x] Review & sign with inspector signature capture (step 9)
- [x] Dashboard with KPI cards and Recharts charts
- [x] PDF report generation (server-side, Heebo Hebrew font)
- [x] PWA — Serwist service worker + offline caching
- [x] IndexedDB dual persistence (drafts + pending uploads)
- [x] Hebrew RTL UI throughout (`dir="rtl"`, `lang="he"`)
- [x] Dark mode (semantic OKLCH color variables)
- [x] Settings page (user profile — name, phone, license number)
- [x] GitHub Actions CI (lint, type-check, build, Docker build & push on merge to main)
- [x] Claude Code integration (CLAUDE.md, skills, Playwright MCP, `.claude/` config)
- [x] `docs/` directory — architecture, roadmap, decisions, tasks
