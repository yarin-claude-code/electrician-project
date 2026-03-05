# Project Summary — Electrical Inspection Tracker

## What Is This?

A Hebrew-language (RTL) Progressive Web App for licensed electricians in Israel to conduct, manage, and report on electrical installation inspections. Think of it as a **digital inspection clipboard** that works offline in basements and syncs to the cloud when connected.

## Core Workflow

1. Electrician logs in (Supabase email/password auth)
2. Creates a new inspection from the dashboard
3. Walks through a **9-step wizard** filling in inspection data on-site
4. Signs digitally, generates a PDF report, and submits
5. Dashboard shows KPIs, charts, and inspection history

## Tech Stack

| Layer      | Technology                                                |
| ---------- | --------------------------------------------------------- |
| Framework  | Next.js 16.1.6 (Turbopack), React 19, TypeScript 5        |
| Styling    | Tailwind CSS v4, OKLCH variables, dark mode (next-themes) |
| UI         | shadcn/ui (Radix), lucide icons, Recharts                 |
| Backend    | Supabase (PostgreSQL + Auth + Storage)                    |
| Forms      | react-hook-form + zod                                     |
| PDF        | @react-pdf/renderer (Hebrew Heebo font)                   |
| PWA        | Serwist service worker                                    |
| Offline    | IndexedDB via `idb` library                               |
| Signatures | react-signature-canvas                                    |

## The 9-Step Wizard

| Step | Name            | DB Table(s)                                            | Key Data                                            |
| ---- | --------------- | ------------------------------------------------------ | --------------------------------------------------- |
| 1    | General Info    | inspections                                            | Client, address, contacts, installation type        |
| 2    | Visual Checks   | visual_checks                                          | 40+ items across 8 categories (pass/fail/na)        |
| 3    | Instruments     | instruments                                            | Up to 6 instruments with calibration tracking       |
| 4    | Panels          | panels, circuit_measurements                           | Circuit matrices: insulation, voltage, grounding    |
| 5    | Fault Loop      | fault_loop                                             | Impedance measurements, auto-calculated Isc         |
| 6    | Defects         | defects                                                | Severity (critical/major/minor), photos, resolution |
| 7    | Recommendations | recommendations                                        | Text + electrician/designer responses               |
| 8    | Generator\*     | generator_certificates, \_doc_reviews, \_visual_checks | Certificate, doc review, visual checks              |
| 9    | Review & Sign   | inspections                                            | Summary, signature capture, PDF generation          |

\*Step 8 only appears when `hasGenerator=true` in Step 1.

## Key Architecture Patterns

### Dual Persistence

- **IndexedDB**: Always saves (offline-first) — drafts store for Step 1 data
- **Supabase**: Saves when online — all steps persist to their respective tables
- **Auto-save**: 10-second debounce + save on step navigation

### Offline Support

- Service worker caches static assets + API responses
- Photo uploads queued in IndexedDB when offline, drained when reconnected
- Online/offline status shown in nav bar and wizard header

### Auth & Security

- Supabase email/password with SSR cookie sessions
- Middleware redirects unauthenticated users to /auth/login
- All 12 DB tables have Row-Level Security: `inspector_id = auth.uid()`

### Dev/Preview Mode

- When `NEXT_PUBLIC_SUPABASE_URL` is missing: stub clients return empty data
- Dashboard shows demo data, wizard renders without backend

## Database Schema (12 tables)

`profiles`, `inspections`, `visual_checks`, `instruments`, `panels`, `circuit_measurements`, `fault_loop`, `defects`, `recommendations`, `generator_certificates`, `generator_doc_reviews`, `generator_visual_checks`

Full schema with RLS policies: `supabase/schema.sql`

## File Structure

```
src/
  app/              — Pages (dashboard, wizard, auth, API routes)
  components/       — UI primitives (shadcn), wizard steps, nav, charts
  contexts/         — WizardContext (state + auto-save)
  hooks/            — useOnlineStatus
  lib/              — Supabase clients, IndexedDB, utilities, lookups
  middleware.ts     — Auth guard
  sw.ts             — Service worker
```

## Current Feature Set

- Multi-step inspection wizard with progress tracking
- Real-time online/offline indicators
- Auto-save with debouncing (IndexedDB + Supabase)
- Digital signature capture (canvas-based)
- PDF report generation (Hebrew, professional layout)
- Instrument calibration status tracking
- Auto-defect creation from failed visual checks
- Photo uploads per check item and defect
- Dashboard with KPI cards + 4 chart types
- Searchable inspection list with status badges
- Dark mode support
- Full RTL Hebrew interface
