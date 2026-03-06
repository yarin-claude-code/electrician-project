---
name: electrician-e2e
description: Full E2E test suite for the electrical inspection app using Playwright MCP. Tests auth flow, dashboard, all 9 wizard steps with mock data, DB verification, and PDF generation. Use before releases or after major changes.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, mcp__playwright__*
---

# Electrician E2E Test Suite

Comprehensive end-to-end testing of the electrical inspection tracker app using Playwright MCP tools.

## Prerequisites

- Dev server running on http://localhost:3000
- App runs in demo/preview mode (no Supabase URL needed — stub clients return mock data)

## Test Plan

### 1. Auth Flow

- Navigate to `/` — verify redirect to `/auth/login`
- Verify login page renders RTL (`dir="rtl"`, `lang="he"`)
- Verify Hebrew labels: "אימייל", "סיסמה", "כניסה"
- Test invalid login shows error alert
- Verify "הרשמה" link navigates to `/auth/register`

### 2. Dashboard (Demo Mode)

- Navigate to `/dashboard` — verify KPI cards render
- Check Hebrew title "לוח בקרה" visible
- Verify demo mode banner shows "מצב תצוגה"
- Check "בדיקה חדשה" button exists
- Verify charts section renders (DashboardCharts component)
- Verify "בדיקות אחרונות" section visible

### 3. Wizard — Full 9-Step Flow

Navigate to `/inspections/new` (redirects to `/inspections/00000000-0000-0000-0000-000000000001` in demo mode).

#### Step 1: General Info (מידע כללי)

- Fill "שם לקוח" with "ישראל ישראלי"
- Select "סוג מתקן" → "מגורים" (residential)
- Fill "כתובת" with "רחוב הרצל 10, תל אביב"
- Fill "גודל חיבור" with "100"
- Set "תאריך בדיקה"
- Toggle "כולל גנרטור" ON (to test step 8)
- Fill owner/electrician/designer person cards
- Click "הבא" to advance

#### Step 2: Visual Checks (בדיקה חזותית)

- Verify accordion categories render
- Click pass/fail/na buttons on several items
- Verify badge counters update
- Click "הבא"

#### Step 3: Instruments (מכשירי מדידה)

- Click "הוסף מכשיר"
- Fill instrument type, model, serial number, calibration date
- Verify calibration status badge
- Click "הבא"

#### Step 4: Panels (מדידות לוח)

- Click "הוסף לוח"
- Verify measurement matrix renders with circuits 1-12
- Fill a few insulation/voltage values
- Verify color-coded thresholds (red for < 0.5 MΩ)
- Click "הבא"

#### Step 5: Fault Loop (לולאת תקלה)

- Fill Z values for phases
- Verify Isc calculations appear
- Click "הבא"

#### Step 6: Defects (ליקויים)

- Click "הוסף ליקוי"
- Fill description, set severity
- Verify severity badge and colors
- Toggle "resolved" checkbox
- Click "הבא"

#### Step 7: Recommendations (המלצות)

- Click "הוסף המלצה"
- Fill recommendation text
- Click "הבא"

#### Step 8: Generator (גנרטור) — only if hasGenerator=true

- Fill generator certificate fields (manufacturer, model, etc.)
- Check doc review items (pass/fail)
- Check visual check items
- Click "הבא"

#### Step 9: Review & Sign (סיכום וחתימה)

- Verify summary cards show counts
- Verify approval status selector
- Check signature canvas renders
- Test "צור דוח PDF" button click
- Test "הגש בדיקה" button state

### 4. PDF Generation

- Call `/api/reports/{inspectionId}` via POST
- Verify response is a PDF blob (content-type: application/pdf)
- In demo mode, verify the endpoint responds (may return error without real data — that's expected)

### 5. DB Verification (Demo Mode)

- In demo mode, all DB operations go through stub client
- Verify stub client returns fake IDs for inserts
- Verify no actual DB errors appear in console

### 6. RTL & Accessibility Checks (Every Page)

- `html[dir="rtl"]` and `html[lang="he"]` on every page
- Form labels in Hebrew
- Buttons have Hebrew text
- ARIA attributes present on wizard progress bar

## Reporting

After all tests, summarize:

- Total tests run
- Pass / Fail count
- Any app bugs discovered
- Screenshots of key states
