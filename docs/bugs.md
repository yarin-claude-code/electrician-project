# Bug Tracker — Electrical Inspection Tracker

Known bugs, code issues, and design gaps found during codebase review.
Severity: **Critical** | **High** | **Medium** | **Low**

---

## Open Bugs

---

### BUG-004 — Wizard only persists Step 1 data; steps 2–9 are not in draft

**Severity:** High
**File:** `src/contexts/wizard-context.tsx`

`WizardState` and `persistState` only cover Step 1 (general info) fields. Steps 2–9 (visual checks, instruments, panels, fault loop, defects, recommendations, generator, sign) each write directly to Supabase but are **not** included in the IndexedDB draft.

Consequence: If a user fills in steps 2–8 while online and then loses connectivity, only step 1 data is available in the draft. All other step data is lost if the browser tab is closed before reconnecting.

**Fix:** Either extend `WizardState` to include all steps' data and include it in `persistState`, or add per-step IndexedDB saves in each step component.

---

---

## Fixed

### BUG-001 — Dashboard charts hardcoded to demo data even when Supabase is live

**Fix:** Added `buildCategoryData`, `buildMonthlyData`, `buildDefectsData` functions in `dashboard-data.ts`. Dashboard now uses real data when Supabase is connected. Note: defects chart still requires a separate DB query (returns empty for now).

### BUG-002 — Non-null assertion on `user` can throw at runtime

**Fix:** Added null guard `if (!user) redirect('/auth/login')` before the inspections query in `dashboard/page.tsx`.

### BUG-003 — New inspection failure silently redirects to dashboard

**Fix:** Destructured `error` from insert response and passed error message as query param to dashboard redirect.

### BUG-005 — `completionPercent` formula is off by one step

**Fix:** Changed formula to `((currentStep - 1) / totalSteps) * 100`.

### BUG-006 — `persistState` reads `navigator.onLine` directly, bypasses `isOnline` state

**Fix:** Added `isOnlineRef` that mirrors the `isOnline` state. `persistState` now reads from the ref.

### BUG-007 — Login button stays disabled / shows "מתחבר..." on success

**Fix:** Added `setLoading(false)` before navigation in the success branch.

### BUG-008 — `idb.ts` marked `'use client'` but is also imported in server contexts

**Fix:** Added `typeof window === 'undefined'` guard in `getDB()`.

### DOCBUG-001 — PDF route path in CLAUDE.md does not match actual file

**Fix:** Updated CLAUDE.md to `api/reports/[id]/route.tsx`.

### DOCBUG-002 — Wizard step list in CLAUDE.md has a typo (step 5 labeled "2.")

**Fix:** Changed `2.` to `5.` on the second line of the step list.

---

## How to Report a New Bug

Add a new entry following this template:

```markdown
### BUG-XXX — Short description

**Severity:** Critical | High | Medium | Low
**File:** `path/to/file.tsx:line`

Description of the bug with code snippet if relevant.

**Fix:** Proposed fix.
```
