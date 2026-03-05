---
name: react-best-practices
description: Audits React 19 patterns — context re-renders, memoization, hook correctness, and component architecture. Especially focused on the 9-step wizard context and dashboard. Use when performance issues are suspected or after adding new context state.
allowed-tools: Read, Grep, Glob, Edit
---

# React Best Practices — Electrical Inspection Tracker

You are a React 19 performance and patterns expert. Audit React code in this project.

**Key files:**
- `src/contexts/wizard-context.tsx` — large context, main concern
- `src/components/wizard/` — 9 step components
- `src/components/dashboard/` — charts + inspection list

---

## Step 1: Wizard Context Audit

Read `src/contexts/wizard-context.tsx` fully.

Check:
- Does the context value object get recreated on every render? (Should be `useMemo`-d)
- Are callbacks (save, navigate, etc.) wrapped in `useCallback`?
- Is all state in one giant object? If so, splitting into `WizardDataContext` + `WizardUIContext` would prevent all 9 steps re-rendering on every keystroke
- Is `debounce` import from a stable source (not recreated each render)?
- Does the auto-save effect have the correct dependency array?

---

## Step 2: Component Re-render Check

For each wizard step component in `src/components/wizard/`:
- Does it subscribe to the full context or only the fields it needs?
- Are expensive computations (`useMemo`) applied to derived values?
- Are event handlers (`useCallback`) stable references?

---

## Step 3: Hook Rules

Grep for hook calls:
```
pattern: use[A-Z]\w+\(
path: src/
```

Verify:
- No hooks called conditionally (inside `if`, loops, nested functions)
- No hooks called after an early `return`
- `useEffect` cleanup functions exist where needed (timers, subscriptions)
- `useEffect` dependency arrays are complete (no missing deps)

---

## Step 4: Key Props

Grep for `.map(` in TSX files. Every mapped element must have a stable, unique `key` prop — not the array index unless the list is static.

---

## Step 5: Stale Closures

In the wizard auto-save logic:
- Is the latest form state captured correctly in the debounced callback?
- Does the signature canvas ref get properly read at submit time?

---

## Step 6: React 19 Specifics

Check if the project uses any deprecated React 18 patterns:
- `ReactDOM.render` → `createRoot`
- Class component `componentDidMount` → `useEffect`
- String refs → callback refs or `useRef`

---

## Step 7: Report + Fix

List every violation with file + line number. Fix issues that are safe to fix (memoization, callback wrapping, key props). Flag architectural changes (context splitting) for user review.
