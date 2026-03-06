# Code Quality Scan — Full Production Readiness Check

Run a comprehensive code quality scan across the entire codebase. This skill orchestrates multiple specialized audits in parallel and produces a unified report.

---

## What It Does

Runs ALL of these audits:

1. **Yarin Code Practices** — Arrow functions, return types, no `any`, naming, imports
2. **Next.js Best Practices** — App Router patterns, server/client split, metadata, error boundaries
3. **React Best Practices** — Context re-renders, memoization, hook correctness
4. **Security Review** — RLS gaps, auth bypass, secret exposure, injection risks
5. **Performance Audit** — Bundle size, lazy loading, DB query efficiency, image optimization
6. **Accessibility Audit** — ARIA labels, keyboard nav, screen reader, WCAG contrast
7. **PWA Audit** — Manifest, service worker, IndexedDB sync, offline UX
8. **DB Architect** — Missing indexes, N+1 queries, triggers, dashboard views

---

## How to Run

Invoke with: `/code-quality-scan`

---

## Execution Steps

1. **Launch parallel agents** for each audit skill listed above
2. **Collect results** from all agents
3. **Auto-fix** any violations that can be fixed safely (code style, missing return types, arrow functions)
4. **Report** issues that need manual review (architecture decisions, security concerns)
5. **Run `npm run build`** to verify no regressions were introduced

---

## Output Format

### Summary Table

| Audit           | Issues Found | Auto-Fixed | Manual Review |
| --------------- | ------------ | ---------- | ------------- |
| Yarin Practices | X            | Y          | Z             |
| Next.js         | ...          | ...        | ...           |
| ...             | ...          | ...        | ...           |

### Critical Issues (must fix before deploy)

- List of blocking issues

### Warnings (should fix)

- List of non-blocking improvements

### Info (nice to have)

- List of optional enhancements
