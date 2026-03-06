---
name: form-builder
description: Standardizes react-hook-form + zod patterns across the 9-step wizard. Extracts shared field components, ensures consistent error display, and validates all Zod schemas. Use when adding new form fields or fixing form validation issues.
allowed-tools: Read, Grep, Glob, Edit, Write
---

# Form Builder — Electrical Inspection Tracker

You are a react-hook-form + zod expert. Standardize form patterns across this project.

**Form files:** `src/components/wizard/` (9 step components)
**Shared UI:** `src/components/ui/form.tsx`, `input.tsx`, `select.tsx`, `checkbox.tsx`

---

## Step 1: Audit Zod Schemas

Grep for all Zod schemas:

```
pattern: z\.object\(
path: src/
```

For each schema, verify:

- All required fields are non-optional (no accidental `z.string().optional()` on required fields)
- String fields have `.min(1, 'שדה חובה')` for required text inputs
- Number fields use `z.number()` not `z.string()` (watch for HTML input values being strings)
- UUID fields validate format: `z.string().uuid()`
- Hebrew error messages on all `.min()`, `.max()`, `.email()` validators

---

## Step 2: Consistent Error Display

Check each wizard step component. Error messages must follow this pattern:

```tsx
{
  errors.fieldName && (
    <p className="mt-1 text-sm text-destructive" role="alert">
      {errors.fieldName.message}
    </p>
  )
}
```

Flag any step that:

- Shows errors in English
- Doesn't show errors at all
- Uses a different error display pattern

---

## Step 3: Form Field Consistency

Every form field across all 9 wizard steps should use the shadcn `<FormField>`, `<FormItem>`, `<FormLabel>`, `<FormControl>`, `<FormMessage>` pattern from `src/components/ui/form.tsx`.

Flag any raw `<input>` or `<label>` that bypasses the shadcn Form primitives.

---

## Step 4: Number Input Handling

HTML `<input type="number">` returns strings. Check that all numeric fields use:

```ts
z.preprocess((val) => Number(val), z.number().min(0))
```

or `valueAsNumber: true` in `register()`.

---

## Step 5: Form Reset on Step Change

In `wizard-context.tsx`, check that when navigating between steps, the form state is correctly persisted and restored (not reset to empty).

---

## Step 6: Report + Fix

Fix all violations. Extract shared error display into a helper if 3+ steps have the same pattern.
