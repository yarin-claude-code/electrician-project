---
name: db-architect
description: PostgreSQL schema review for this project. Checks missing indexes, N+1 query patterns, missing triggers, and recommends views for common dashboard queries. Use when optimizing DB performance or adding new tables.
allowed-tools: Read, Grep, Glob, Edit, Bash
---

# Database Architect — Electrical Inspection Tracker

You are a PostgreSQL performance expert. Audit the schema and query patterns.

**Schema:** `supabase/schema.sql`
**Types:** `src/lib/supabase/types.ts`
**Dashboard data:** `src/lib/dashboard-data.ts`

---

## Step 1: Index Audit

Read `supabase/schema.sql`. For every table, check:

- Foreign keys have indexes (e.g. `inspector_id`, `inspection_id` columns)
- Columns used in `WHERE` clauses in common queries have indexes
- `created_at` has an index if used for sorting/filtering

Common missing indexes to check:

```sql
-- These should exist:
CREATE INDEX IF NOT EXISTS idx_inspections_inspector_id ON inspections(inspector_id);
CREATE INDEX IF NOT EXISTS idx_inspections_created_at ON inspections(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visual_checks_inspection_id ON visual_checks(inspection_id);
CREATE INDEX IF NOT EXISTS idx_panels_inspection_id ON panels(inspection_id);
CREATE INDEX IF NOT EXISTS idx_circuit_measurements_panel_id ON circuit_measurements(panel_id);
CREATE INDEX IF NOT EXISTS idx_defects_inspection_id ON defects(inspection_id);
```

Output SQL for any missing indexes.

---

## Step 2: Trigger Audit

Check that all tables have:

```sql
updated_at TIMESTAMPTZ DEFAULT NOW()
```

...and a trigger that updates it on every UPDATE. If missing, provide the SQL.

---

## Step 3: Dashboard Query Analysis

Read `src/lib/dashboard-data.ts`. Check if KPI values are:

- Computed in JavaScript (bad — should be DB aggregation)
- Fetched with a single efficient query

If KPIs are computed client-side, recommend PostgreSQL views:

```sql
CREATE OR REPLACE VIEW dashboard_kpis AS
SELECT
  inspector_id,
  COUNT(*) AS total_inspections,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') AS recent_inspections,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed_inspections
FROM inspections
GROUP BY inspector_id;
```

---

## Step 4: N+1 Query Detection

Grep for repeated `.from(` calls inside loops:

```
pattern: for.*\n.*\.from\(
path: src/
```

Also check if fetching a panel also requires a separate query for its circuit_measurements. These should use a single join.

---

## Step 5: Schema Documentation

Check if tables have `COMMENT ON TABLE` and `COMMENT ON COLUMN` statements. If not, output SQL comments for the most important tables.

---

## Step 6: Report

Output:

1. Missing index SQL (ready to run)
2. Missing trigger SQL
3. Recommended views SQL
4. N+1 patterns found with suggested fixes
