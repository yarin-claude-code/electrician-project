# Contributing Guide

## Project Structure

```
src/
├── app/(app)/dashboard/page.tsx     # Dashboard page (imports from lib/dashboard-data)
├── components/
│   ├── dashboard/
│   │   ├── charts.tsx               # Recharts dashboard charts
│   │   └── inspection-list.tsx      # Recent inspections table
│   └── wizard/
│       ├── wizard-shell.tsx         # Step navigation + layout
│       ├── general-info.tsx         # Step 1
│       ├── visual-checks.tsx        # Step 2
│       ├── instruments.tsx          # Step 3
│       ├── panels.tsx               # Step 4
│       ├── fault-loop.tsx           # Step 5
│       ├── defects.tsx              # Step 6
│       ├── recommendations.tsx      # Step 7
│       ├── generator.tsx            # Step 8 (optional)
│       └── review.tsx               # Step 9
└── lib/
    └── dashboard-data.ts            # DEMO_ constants + buildStatusData()
tests/
└── e2e/
    ├── e2e-test.spec.ts             # S5 – Full wizard flow
    ├── e2e-s1-auth.spec.ts          # S1 – Auth flow (screenshots)
    ├── e2e-s1-login-direct.spec.ts  # S1 – Direct login
    └── e2e-nav-color.spec.ts        # Nav colour regression
```

## Running Tests

```bash
# All e2e tests
npx playwright test

# Single file
npx playwright test tests/e2e/e2e-test.spec.ts

# With UI
npx playwright test --ui
```

## Testing Scenarios

When you change a source file, run the corresponding test(s):

| Changed file                                   | Test to run                                                              | Scenario              |
| ---------------------------------------------- | ------------------------------------------------------------------------ | --------------------- |
| `src/components/wizard/general-info.tsx`       | `tests/e2e/e2e-test.spec.ts`                                             | S5 – Wizard flow      |
| `src/components/wizard/visual-checks.tsx`      | `tests/e2e/e2e-test.spec.ts`                                             | S5 – Wizard flow      |
| `src/components/wizard/instruments.tsx`        | `tests/e2e/e2e-test.spec.ts`                                             | S5 – Wizard flow      |
| `src/components/wizard/panels.tsx`             | `tests/e2e/e2e-test.spec.ts`                                             | S5 – Wizard flow      |
| `src/components/wizard/fault-loop.tsx`         | `tests/e2e/e2e-test.spec.ts`                                             | S5 – Wizard flow      |
| `src/components/wizard/defects.tsx`            | `tests/e2e/e2e-test.spec.ts`                                             | S5 – Wizard flow      |
| `src/components/wizard/recommendations.tsx`    | `tests/e2e/e2e-test.spec.ts`                                             | S5 – Wizard flow      |
| `src/components/wizard/generator.tsx`          | `tests/e2e/e2e-test.spec.ts`                                             | S5 – Wizard flow      |
| `src/components/wizard/review.tsx`             | `tests/e2e/e2e-test.spec.ts`                                             | S5 – Wizard flow      |
| `src/components/wizard/wizard-shell.tsx`       | `tests/e2e/e2e-test.spec.ts`                                             | S5 – Wizard flow      |
| `src/app/auth/login/page.tsx`                  | `tests/e2e/e2e-s1-auth.spec.ts`, `tests/e2e/e2e-s1-login-direct.spec.ts` | S1 – Auth             |
| `src/components/app-nav.tsx`                   | `tests/e2e/e2e-nav-color.spec.ts`                                        | Nav colour regression |
| `src/app/(app)/dashboard/page.tsx`             | `tests/e2e/e2e-test.spec.ts`                                             | S5 – Dashboard        |
| `src/components/dashboard/charts.tsx`          | `tests/e2e/e2e-test.spec.ts`                                             | S5 – Dashboard        |
| `src/components/dashboard/inspection-list.tsx` | `tests/e2e/e2e-test.spec.ts`                                             | S5 – Dashboard        |
| `src/lib/dashboard-data.ts`                    | `tests/e2e/e2e-test.spec.ts`                                             | S5 – Dashboard        |

## Development

```bash
npm run dev    # Start dev server on http://localhost:3000
npm run build  # Production build (verify imports)
npm run lint   # ESLint
```

Always run `npm run build` after renaming or moving files to catch broken imports early.
