# CLAUDE.md — Electrical Inspection Tracker

## Task Execution Strategy

When receiving a large or multi-part user request, **split it into small independent tasks and execute them in parallel** using the Agent tool or parallel tool calls. Do not process large requests sequentially when sub-tasks have no dependencies on each other.

## Project Overview

Hebrew-language (RTL) professional electrical installation inspection management system for licensed electricians in Israel. Built as a PWA with offline support.

## Tech Stack

- **Framework:** Next.js 16.1.6 (Turbopack), React 19, TypeScript 5 (strict)
- **Styling:** Tailwind CSS v4, OKLCH color variables, dark mode via `next-themes`
- **UI:** shadcn/ui (new-york style, Radix primitives, lucide icons), Recharts for charts
- **Backend/DB:** Supabase (PostgreSQL + Auth + Storage), `@supabase/ssr` for cookie-based SSR auth
- **Forms:** react-hook-form + zod validation
- **PDF:** @react-pdf/renderer (server-side, Hebrew Heebo font)
- **PWA:** Serwist (@serwist/next), service worker at `src/sw.ts`
- **Offline:** IndexedDB via `idb` library (`src/lib/idb.ts`)
- **Signatures:** react-signature-canvas

## Commands

```bash
npm run dev    # Start dev server (Turbopack)
npm run build  # Production build
npm run lint   # ESLint
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root: RTL, lang="he", Toaster, SwRegister
│   ├── page.tsx                # Redirect → /dashboard or /auth/login
│   ├── (app)/                  # Authenticated route group
│   │   ├── layout.tsx          # AppNav + main wrapper
│   │   ├── dashboard/page.tsx  # KPI cards + charts + inspection list
│   │   └── inspections/
│   │       ├── new/page.tsx    # Creates DB record → redirect to [id]
│   │       └── [id]/page.tsx   # WizardProvider + WizardShell
│   ├── auth/                   # login + register pages
│   └── api/reports/[id]/route.tsx  # PDF generation endpoint
├── components/
│   ├── ui/                     # shadcn/ui primitives
│   ├── wizard/                 # 9 wizard step components (step1–step9)
│   ├── app-nav.tsx             # Navigation bar
│   └── dashboard-charts.tsx    # Recharts components
├── contexts/wizard-context.tsx # WizardProvider + useWizard hook
├── hooks/use-online-status.ts  # Online/offline detector
├── lib/
│   ├── supabase/               # client.ts, server.ts, middleware.ts, types.ts
│   ├── idb.ts                  # IndexedDB draft + photo upload queue
│   ├── utils.ts                # cn(), formatDateHe(), installationTypeLabel()
│   └── visual-check-items.ts   # Check categories + generator items
├── middleware.ts               # Auth guard → lib/supabase/middleware.ts
└── sw.ts                       # Service worker (Serwist)
supabase/schema.sql             # Full DB schema + RLS policies + triggers
```

## Key Architecture Patterns

### Authentication

- Supabase email/password auth with SSR cookie sessions
- Middleware refreshes session + redirects unauthenticated users to `/auth/login`
- All DB tables have RLS enforcing `inspector_id = auth.uid()`

### Dev/Preview Mode

When `NEXT_PUBLIC_SUPABASE_URL` is missing or invalid, stub clients return empty data so UI renders without a live Supabase instance. This pattern is used in client.ts, server.ts, middleware.ts, and page components.

### Wizard (Core Feature)

9-step inspection wizard managed by `WizardContext`:

1. General Info 2. Visual Checks 3. Instruments 4. Panels
2. Fault Loop 6. Defects 7. Recommendations 8. Generator (optional) 9. Review & Sign

- Auto-saves on step navigation + debounced 10s auto-save
- Dual persistence: IndexedDB (always) + Supabase (when online)

### Offline Support

- Service worker caches static assets, Next.js resources, and Supabase API responses
- IndexedDB stores drafts (`drafts` store) and queues photo uploads (`pendingUploads` store)

## Conventions

- **Files:** kebab-case (`wizard-shell.tsx`)
- **Components:** PascalCase exports (`WizardShell`)
- **Hooks:** `use` prefix, camelCase (`useWizard`)
- **Constants:** SCREAMING_SNAKE_CASE (`VISUAL_CHECK_CATEGORIES`)
- **Imports:** Always use `@/` alias (maps to `src/`)
- **Language:** UI strings in Hebrew, code identifiers in English
- **Visual check items** have both `label` (English) and `labelHe` (Hebrew)

## Database Tables

`profiles`, `inspections`, `visual_checks`, `instruments`, `panels`, `circuit_measurements`, `fault_loop`, `defects`, `recommendations`, `generator_certificates`, `generator_doc_reviews`, `generator_visual_checks`

Full schema with RLS policies in `supabase/schema.sql`. Types in `src/lib/supabase/types.ts`.

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous key

## Git Workflow

- **Branching:** For every big task, create a feature branch off `main` (e.g., `feat/add-pdf-export`, `fix/wizard-validation`).
- **Small commits:** Commit after each completed sub-task with a clear message describing what was done.
- **PR when done:** When the task is complete, push the branch and create a Pull Request targeting `main`.
- **Self-review:** Before requesting review, read through the PR diff, fix any issues (code quality, bugs, missing edge cases), and push fixes as additional commits.
- **CI must pass:** Ensure the CI pipeline (lint, type-check, format, build) passes before merging.

## Frontend Design Rules

See [.claude/FRONTEND_DESIGN.md](./.claude/FRONTEND_DESIGN.md) — must be followed for all UI work.
