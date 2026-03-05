---
name: ui-verify
description: Use Playwright MCP to visually verify frontend changes in the electrical inspection app. Use after modifying React components, pages, or styles to confirm the UI renders and behaves correctly in Hebrew RTL layout.
allowed-tools: mcp__playwright__*, Bash(npm run dev)
---

## Verify Frontend — Electrical Inspection Tracker

Use the Playwright MCP browser to visually inspect and interact with the running frontend.

### Prerequisites
Make sure the dev server is running:
```bash
cd "C:/Users/Yarin David/Desktop/claude-projects/electrician-tracker/electrical-inspection" && npm run dev
```
App runs on **http://localhost:3000**

---

### Step 1: Navigate to the app
Use `mcp__playwright__browser_navigate` to open `http://localhost:3000`

### Step 2: Screenshot the current state
Use `mcp__playwright__browser_screenshot` to capture the current render.

Confirm:
- Redirect to `/auth/login` (unauthenticated)
- RTL layout (Hebrew text right-aligned, dir="rtl")
- Dark/light theme loads correctly

### Step 3: Verify the changed feature
Based on what was modified, verify the relevant area:

#### Auth Pages (`/auth/login`, `/auth/register`)
- Email + password fields render in RTL
- Submit button labeled in Hebrew
- Error messages appear below fields

#### Dashboard (`/dashboard`)
- KPI cards visible (total inspections, recent, etc.)
- Recharts charts render (no blank canvas)
- Inspection list shows rows with status badges
- AppNav bar visible at top with Hebrew labels

#### Wizard (`/inspections/[id]`)
Use `mcp__playwright__browser_click` and `mcp__playwright__browser_type` to step through:

| Step | Hebrew label | Check |
|------|-------------|-------|
| 1 | מידע כללי | Form fields, installation type dropdown, has_generator switch |
| 2 | בדיקה חזותית | Check categories, pass/fail/na toggle buttons |
| 3 | מכשירי מדידה | "הוסף מכשיר" button, instrument type dropdown |
| 4 | מדידות לוח | "הוסף לוח" button, circuit measurement table |
| 5 | לולאת תקלה | Z_s input fields, auto-calculated Isc |
| 6 | ליקויים | Defect list, severity selector |
| 7 | המלצות | Recommendations textarea |
| 8 | גנרטור | Step appears only if has_generator=true |
| 9 | סיכום וחתימה | Summary table, signature canvas |

- Click "הבא" (Next) to advance, "הקודם" (Prev) to go back
- Verify progress bar advances and completed steps show ✓

#### PDF Report
- Navigate to `/api/inspections/[id]/report`
- Verify PDF is served (no 500 error)

---

### Step 4: Check for console errors
Use `mcp__playwright__browser_console_messages` to surface JS errors.

Look specifically for:
- Supabase auth/fetch errors
- React hydration mismatches
- IndexedDB / idb errors
- Service worker registration failures

### Step 5: RTL & Dark Mode checks
- Confirm text flows right-to-left
- Toggle dark mode (if accessible) and screenshot again
- Confirm no colors are hardcoded (only OKLCH theme variables)

### Step 6: Report findings
Summarize each area:
- ✅ Working correctly
- ⚠️ Minor issue (describe)
- ❌ Broken (describe and fix)

### Step 7: Cleanup
- If all checks passed: delete any `.png` screenshots saved locally
- If something failed: fix the issue, then re-run from Step 1

---

### When to run this skill
Run `/verify-frontend` whenever:
- A wizard step component was modified (`src/components/wizard/step*.tsx`)
- `wizard-context.tsx` was changed (auto-save, step logic)
- Dashboard or auth pages were updated
- Global CSS (`globals.css`) or theme variables changed
- `app-nav.tsx` or `wizard-shell.tsx` modified

Do **not** run on: Supabase schema changes, `idb.ts` changes, API route (`/api/`) changes (backend-only).
