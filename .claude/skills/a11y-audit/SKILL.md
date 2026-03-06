---
name: a11y-audit
description: Accessibility audit for this Hebrew RTL app. Checks ARIA labels in Hebrew, wizard step navigation roles, keyboard accessibility, screen reader announcements for form errors, and WCAG AA color contrast in dark mode. Use before releases or after major UI changes.
allowed-tools: Read, Grep, Glob, Edit, mcp__playwright__*
---

# Accessibility Audit — Electrical Inspection Tracker

You are an accessibility expert specializing in Hebrew RTL web applications. Audit this app for WCAG 2.1 AA compliance.

---

## Step 1: HTML Structure

Read `src/app/layout.tsx`.

Verify:

- `<html lang="he" dir="rtl">` is set
- `<main>` landmark exists in `src/app/(app)/layout.tsx`
- Page has a single `<h1>` per route
- Navigation uses `<nav>` with `aria-label` in Hebrew

---

## Step 2: Wizard Navigation Accessibility

Read `src/components/wizard/wizard-shell.tsx`.

Check:

- Step list should use `role="tablist"` or `role="list"` with `aria-label="שלבי הבדיקה"`
- Current step should have `aria-current="step"`
- Completed steps should have visual + aria indication
- "הבא" / "הקודם" buttons should have descriptive `aria-label` including the destination step name
- Progress bar should use `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`

---

## Step 3: Form Field Accessibility

Grep for `<input`, `<select`, `<textarea` in `src/components/wizard/`:

- Every input must have an associated `<label>` (via `htmlFor` + `id`, or `aria-label`)
- Labels must be in Hebrew
- Error messages must use `aria-describedby` pointing to the error element
- Required fields must have `aria-required="true"` or `required`

---

## Step 4: Form Error Announcements

Check how react-hook-form errors are rendered:

- Error messages should be in a container with `role="alert"` or `aria-live="polite"`
- Errors should be in Hebrew
- Error container should not disappear instantly (give screen readers time)

---

## Step 5: Signature Canvas

Read the signature canvas usage in `src/components/wizard/review.tsx`.

The canvas is completely inaccessible by default. Add:

- `role="img"` on the canvas with `aria-label="אזור חתימה"`
- A keyboard-accessible "clear signature" button
- An accessible alternative: text input for typed signature name as fallback
- `aria-required="true"` if signature is mandatory

---

## Step 6: Color Contrast

Read `src/app/globals.css`.

For each OKLCH color variable:

- Text on background must be ≥ 4.5:1 contrast ratio (WCAG AA)
- Large text (18pt+) must be ≥ 3:1
- UI components (buttons, inputs) must be ≥ 3:1

Check both light and dark mode values. Flag any that may fail (OKLCH lightness < 0.4 on white background, etc.).

---

## Step 7: Keyboard Navigation

Using Playwright MCP, navigate the login page with keyboard only:

1. `Tab` through fields
2. `Enter` to submit
3. Verify focus trap does NOT exist (unless in a modal dialog)
4. Verify focus is visible (not just outline: none)

---

## Step 8: Focus Management

In the wizard:

- When advancing to next step, focus should move to the top of the new step (h2 or first input)
- When an error occurs, focus should move to the first errored field

Check `wizard-shell.tsx` for focus management after step transitions.

---

## Step 9: Report + Fix

List all issues with:

- WCAG criterion violated (e.g. 1.3.1 Info and Relationships)
- Severity (Critical / Major / Minor)
- File + line number

Fix all Critical and Major issues directly. List Minor issues as recommendations.
