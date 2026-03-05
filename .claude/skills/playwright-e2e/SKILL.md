---
name: playwright-e2e
description: Writes and runs Playwright E2E tests for this app. Covers auth flow, dashboard, and the 9-step wizard. Use when adding new features, before releases, or when the tests/ directory needs to be populated.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, mcp__playwright__*
---

# Playwright E2E — Electrical Inspection Tracker

You are a Playwright testing expert. Write and run E2E tests for this Hebrew RTL app.

**Test files go in:** `tests/`
**Config:** `playwright.config.ts`
**Scenarios reference:** `.claude/playwright-scenarios/`

---

## Step 1: Read Existing Config + Scenarios

Read `playwright.config.ts` and all files in `.claude/playwright-scenarios/` to understand the expected flows.

---

## Step 2: Check Existing Tests

```
Glob: tests/**/*.spec.ts
```

List what exists. Identify gaps.

---

## Step 3: Write Tests

### Auth Tests (`tests/auth.spec.ts`)
```ts
import { test, expect } from '@playwright/test'

test('redirects unauthenticated user to login', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/auth\/login/)
})

test('login page is RTL', async ({ page }) => {
  await page.goto('/auth/login')
  const html = page.locator('html')
  await expect(html).toHaveAttribute('dir', 'rtl')
  await expect(html).toHaveAttribute('lang', 'he')
})

test('shows error on invalid credentials', async ({ page }) => {
  await page.goto('/auth/login')
  await page.getByRole('textbox', { name: /אימייל/ }).fill('bad@example.com')
  await page.getByRole('textbox', { name: /סיסמה/ }).fill('wrongpassword')
  await page.getByRole('button', { name: /כניסה/ }).click()
  await expect(page.getByRole('alert')).toBeVisible()
})
```

### Dashboard Tests (`tests/dashboard.spec.ts`)
Write tests for:
- KPI cards visible after login (mock auth state)
- Charts render without blank canvas
- Inspection list shows rows
- AppNav Hebrew labels visible

### Wizard Tests (`tests/wizard.spec.ts`)
Write tests for:
- Creating a new inspection navigates to wizard
- Step 1 form fields accept input
- "הבא" (Next) button advances to step 2
- Progress bar updates
- Step 8 (generator) hidden when `has_generator=false`
- Step 9 review shows summary

---

## Step 4: Run Tests

```bash
npx playwright test --reporter=list
```

If tests fail, read the error and fix them. Do not retry the same failing command — diagnose first.

---

## Step 5: RTL-Specific Assertions

For every page test, assert:
```ts
await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
```

For forms, verify labels appear to the right of inputs (RTL layout).

---

## Step 6: Report

List:
- Tests written (count + file)
- Tests passing / failing
- Any issues found in the app (not the test) during testing
