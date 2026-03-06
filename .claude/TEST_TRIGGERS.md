# Test Triggers — When to Run What

## Quick reference

```bash
npx playwright test <file>        # run one file
npx playwright test               # run all tests
```

---

## Trigger Map

| Changed files                                                               | Run                                             |
| --------------------------------------------------------------------------- | ----------------------------------------------- |
| `src/app/auth/`                                                             | `tests/e2e/rtl-a11y.spec.ts`                    |
| `src/app/(app)/layout.tsx`, `src/components/app-nav.tsx`                    | `tests/e2e/rtl-a11y.spec.ts`                    |
| `src/app/(app)/dashboard/` , `src/components/dashboard-charts.tsx`          | `tests/e2e/rtl-a11y.spec.ts`                    |
| `src/contexts/wizard-context.tsx`, `src/components/wizard/wizard-shell.tsx` | `tests/e2e/rtl-a11y.spec.ts`                    |
| `src/components/wizard/step1-general-info.tsx`                              | `tests/e2e/e2e-test.spec.ts`                    |
| `src/components/wizard/step2-visual-checks.tsx`                             | `tests/e2e/wizard-steps.spec.ts` — S6 tests     |
| `src/components/wizard/step3-instruments.tsx`                               | `tests/e2e/wizard-steps.spec.ts` — S7 tests     |
| `src/components/wizard/step4-panels.tsx`                                    | `tests/e2e/wizard-steps.spec.ts` — S8a tests    |
| `src/components/wizard/step5-fault-loop.tsx`                                | `tests/e2e/wizard-steps.spec.ts` — S8b tests    |
| `src/components/wizard/step6-defects.tsx`                                   | `tests/e2e/wizard-steps.spec.ts` — S8c tests    |
| `src/components/wizard/step7-recommendations.tsx`                           | `tests/e2e/wizard-steps.spec.ts` — S8d tests    |
| `src/components/wizard/step9-review.tsx`                                    | `tests/e2e/wizard-steps.spec.ts` — S10 tests    |
| `src/app/globals.css`, `src/components/ui/button.tsx`, any theme/color file | `tests/e2e/theme-error-pdf.spec.ts` — S11 tests |
| `src/app/not-found.tsx`, error boundaries                                   | `tests/e2e/theme-error-pdf.spec.ts` — S12 tests |
| `src/app/api/inspections/[id]/report/route.tsx`                             | `tests/e2e/theme-error-pdf.spec.ts` — S13 tests |
| **Major feature / before merge / release**                                  | `npx playwright test` (all files)               |

---

## Smoke test (any change)

```bash
npx playwright test tests/e2e/rtl-a11y.spec.ts
```

Covers: RTL layout, Hebrew headings, dashboard KPI cards, wizard renders, no console errors.
