---
name: yarin-code-practices
description: Review code against Yarin's personal coding standards and automatically fix any violations. Use this after writing or modifying any TypeScript/React code in this project.
allowed-tools: Read, Edit, Grep, Glob
---

# Yarin Code Practices — Review & Fix

You are reviewing code against **Yarin's personal coding standards**. Scan the changed or specified files, identify every violation, and fix them directly without asking.

---

## The Rules

### 1. Functions — Arrow Functions Only

**Always** use arrow functions. **Never** use the `function` keyword (except for top-level `export default function Page()` required by Next.js — that's the only exception).

```ts
// ✅
const fetchUser = async (id: string): Promise<User> => {
  return await db.get(id)
}

// ❌ Fix this
async function fetchUser(id: string) {
  return await db.get(id)
}
```

### 2. Variable Declarations — const by Default

- Use `const` everywhere possible
- Use `let` **only** when the value must be reassigned — and only if there's truly no way to avoid it
- **Never** use `var`

### 3. Naming Conventions

| Thing                      | Style                | Example                             |
| -------------------------- | -------------------- | ----------------------------------- |
| Variables & functions      | camelCase            | `userId`, `fetchData`               |
| React components & classes | PascalCase           | `UserCard`, `WizardShell`           |
| Constants (module-level)   | SCREAMING_SNAKE_CASE | `MAX_RETRIES`, `API_BASE_URL`       |
| Files                      | kebab-case           | `user-card.tsx`, `wizard-shell.tsx` |

### 4. React — Functional Components Only

**Never** use class components. Always use functional components.

```tsx
// ✅
const UserCard = ({ id, name }: Props) => {
  return <div>{name}</div>
}

// ❌ Fix this
class UserCard extends React.Component { ... }
```

### 5. Props Interface — Defined Above the Component

Always declare a `Props` interface (or specifically named interface) directly above the component that uses it.

```tsx
// ✅
interface Props {
  id: string
  label: string
}

const MyCard = ({ id, label }: Props) => {
  return <div>{label}</div>
}
```

### 6. Destructure Props and Objects

Always destructure at the function signature or at the top of the block. Never reach into objects repeatedly.

```tsx
// ✅
const UserCard = ({ id, name, email }: Props) => { ... }

// ❌ Fix this
const UserCard = (props: Props) => {
  return <div>{props.name}</div>
}
```

### 7. Hooks Before Logic

In React components, all hook calls (`useState`, `useEffect`, `useQuery`, etc.) must come **before** any conditional logic or derived values.

```tsx
// ✅
const MyCard = ({ id }: Props) => {
  const [open, setOpen] = useState(false)
  const { data } = useQuery(id)

  if (!data) return null
  // ...
}
```

### 8. TypeScript — No `any`

**Never** use `any`. Use `unknown`, generics, or proper types. If the type is genuinely unknown, use `unknown` and narrow it.

```ts
// ✅
const parse = (data: unknown): User => userSchema.parse(data)

// ❌ Fix this
const parse = (data: any) => data as User
```

### 9. TypeScript — Explicit Return Types

Every function must have an explicit return type annotation.

```ts
// ✅
const getLabel = (type: string): string => labels[type] ?? type

// ❌ Fix this
const getLabel = (type: string) => labels[type] ?? type
```

### 10. TypeScript — Prefer Interfaces Over Type Aliases

Use `interface` for object shapes. Use `type` only for unions, intersections, or primitives.

```ts
// ✅
interface User {
  id: string
  name: string
}

// ❌ Fix this (for object shapes)
type User = {
  id: string
  name: string
}
```

### 11. Early Returns (Guard Clauses)

Handle invalid/edge conditions at the top and return early. Never nest happy-path logic inside `if` blocks.

```ts
// ✅
const getUser = (id: string): User | null => {
  if (!id) return null
  if (!isValid(id)) return null
  return db.find(id)
}

// ❌ Fix this
const getUser = (id: string) => {
  if (id) {
    if (isValid(id)) {
      return db.find(id)
    }
  }
}
```

### 12. No Inline Ternaries in JSX

Extract conditional values to a variable **before** the `return`. Never put ternaries inside JSX.

```tsx
// ✅
const label = isActive ? 'Active' : 'Inactive'
return <Badge>{label}</Badge>

// ❌ Fix this
return <Badge>{isActive ? 'Active' : 'Inactive'}</Badge>
```

### 13. No Magic Numbers or Strings

Any non-obvious literal value must be extracted to a named constant at the top of the file or in a constants file.

```ts
// ✅
const MAX_FILE_SIZE_MB = 5
if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) { ... }

// ❌ Fix this
if (file.size > 5242880) { ... }
```

### 14. Async/Await — Never `.then()` Chains

Always use `async/await`. Never use `.then()` or `.catch()` chains (use `try/catch` instead).

```ts
// ✅
const data = await fetchUser(id)

// ❌ Fix this
fetchUser(id).then(data => { ... })
```

### 15. Import Order — Grouped

Imports must be ordered in three groups, separated by a blank line:

1. External packages (`react`, `next`, npm libs)
2. Internal project paths (`@/components/...`, `@/lib/...`)
3. Type-only imports (`import type { ... }`)

```ts
// ✅
import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { User } from '@/lib/supabase/types'
```

### 16. No Commented-Out Code

Delete dead code entirely. If it needs to be recoverable, it belongs in git history — not in the file.

### 17. No `console.log`

Remove all `console.log` calls. Use proper error handling (`console.error` in edge cases only, ideally a logger).

### 18. File Size — Split at ~200 Lines

If a file exceeds ~200 lines, extract sub-components or utilities into separate files. One component per file.

### 19. Separate Data-Fetching from Display

- Server Components / data-fetching logic should not contain JSX rendering logic
- Client Components should receive data via props, not fetch it themselves (unless using a hook)
- Prefer a container/page component that fetches and passes data down

---

## How to Apply This Skill

1. **Identify the files to review** — either the files mentioned by the user, or recently modified files from `git diff --name-only HEAD`
2. **Read each file** using the Read tool
3. **List every violation** found with rule name, file, and line number
4. **Fix all violations** using the Edit tool — do not ask for permission, just fix them
5. **Report** what was fixed in a concise summary grouped by rule

If a file is clean, say so. Be direct — no filler text.
