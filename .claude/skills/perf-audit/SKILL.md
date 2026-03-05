---
name: perf-audit
description: Performance audit for this Next.js app. Checks bundle size, lazy loading, DB query efficiency, PDF timeout risks, and image optimization. Use before releases or when the app feels slow.
allowed-tools: Read, Grep, Glob, Edit, Bash
---

# Performance Audit — Electrical Inspection Tracker

You are a web performance expert. Audit this Next.js 16 app for speed and bundle size issues.

---

## Step 1: Bundle Analysis

Run:
```bash
cd "C:/Users/Yarin David/Desktop/claude-projects/electrician-tracker/electrical-inspection"
npm run build 2>&1 | tail -50
```

Look for:
- Any page bundle > 200KB (first load JS)
- Chunks that should be dynamically imported
- `@react-pdf/renderer` included in client bundle (should be server-only)

---

## Step 2: Heavy Imports — Dynamic Loading

Grep for heavy library imports:
```
pattern: from 'recharts'
path: src/
```
```
pattern: from '@react-pdf'
path: src/
```

`recharts` in the dashboard should be dynamically imported:
```tsx
const DashboardCharts = dynamic(() => import('@/components/dashboard/charts'), {
  loading: () => <div>טוען גרפים...</div>,
  ssr: false,
})
```

Check if this is done. If not, add it.

---

## Step 3: Wizard Lazy Loading

The wizard has 9 step components. Check if they are all imported statically in `wizard-shell.tsx`. If so, convert to `dynamic()` imports — only the current step needs to load.

---

## Step 4: PDF Route Timeout Risk

Read `src/app/api/reports/[id]/route.tsx`.

Check:
- Is the PDF generated synchronously? (Risk of Vercel 10s timeout on large inspections)
- Is the full inspection fetched with all relations in one query, or multiple round trips?
- Should response be streamed with `new ReadableStream()`?

---

## Step 5: Dashboard Data Fetching

Read `src/lib/dashboard-data.ts` and `src/app/(app)/dashboard/page.tsx`.

Check:
- Is data fetched in a server component (good) or client component with useEffect (bad)?
- Are KPIs computed in SQL or JavaScript?
- Is the inspection list paginated or does it fetch all rows?

If fetching all rows, add pagination:
```ts
.from('inspections')
.select('*')
.range(0, 19) // first 20
.order('created_at', { ascending: false })
```

---

## Step 6: Image Optimization

Grep for `<img` tags:
```
pattern: <img\s
path: src/
```

Any `<img>` should be replaced with Next.js `<Image>` from `next/image` for automatic optimization.

---

## Step 7: Font Loading

Read `src/app/layout.tsx`. Check:
- Fonts loaded with `next/font` (optimal) or raw `<link>` tags (suboptimal)?
- Hebrew Heebo font subsetted to Hebrew characters only?
- `font-display: swap` set?

---

## Step 8: Report + Fix

Fix: dynamic imports, Image component replacements, pagination.
Flag for user review: PDF streaming refactor, dashboard query restructuring.
