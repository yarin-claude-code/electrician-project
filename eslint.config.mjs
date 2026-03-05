import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Service worker uses @ts-nocheck intentionally (Serwist/Workbox globals)
    'src/sw.ts',
  ]),
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      // warn (not error) so pre-existing unused imports don't block commits
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  // Stub clients legitimately use `any` for the dev-preview fallback pattern
  {
    files: ['src/lib/supabase/client.ts', 'src/lib/supabase/server.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  // Wizard files & context use @ts-nocheck while being incrementally typed
  {
    files: [
      'src/components/wizard/step*.tsx',
      'src/components/wizard/review.tsx',
      'src/contexts/wizard-context.tsx',
      'src/hooks/use-online-status.ts',
    ],
    rules: {
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      // TODO: refactor these to use useEffect-safe patterns (pre-existing)
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
])

export default eslintConfig
