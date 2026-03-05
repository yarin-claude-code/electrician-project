import { createBrowserClient } from '@supabase/ssr'

import type { Database } from './types'

const fakeId = (): string => 'dev-' + Math.random().toString(36).slice(2, 10)

const createStubClient = (): any => {
  const chain = (pendingInsert: any = null): any => {
    const result = pendingInsert
      ? {
          data: {
            id: fakeId(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...pendingInsert,
          },
          error: null,
          count: null,
        }
      : { data: null, error: null, count: null }

    return {
      select: () => chain(pendingInsert),
      insert: (row: unknown) => chain(Array.isArray(row) ? row[0] : row),
      update: () => chain(null),
      delete: () => chain(null),
      upsert: (row: unknown) => chain(Array.isArray(row) ? row[0] : row),
      eq: () => chain(pendingInsert),
      neq: () => chain(pendingInsert),
      order: () => chain(pendingInsert),
      limit: () => chain(pendingInsert),
      head: () => chain(pendingInsert),

      single: () => {
        const r: any = { ...result }
        r.then = (resolve: (v: unknown) => void) => Promise.resolve(resolve(result))
        return r
      },

      maybeSingle: () => {
        const r: any = { ...result }
        r.then = (resolve: (v: unknown) => void) => Promise.resolve(resolve(result))
        return r
      },
      then: (resolve: (v: unknown) => void) =>
        resolve(
          pendingInsert
            ? { data: [result.data], error: null, count: 1 }
            : { data: [], error: null, count: 0 }
        ),
    }
  }

  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signOut: async () => ({ error: null }),
    },
    from: () => chain(),
    storage: {
      from: () => ({
        upload: () => ({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
  }
}

export const createClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url?.startsWith('http') || !key) return createStubClient()
  return createBrowserClient<Database>(url, key)
}
