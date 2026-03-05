import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

import type { Database } from './types'

// Stub for dev preview when Supabase credentials are not yet configured
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createStubClient = (): any => ({
    auth: { getUser: async () => ({ data: { user: null }, error: null }) },
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({ limit: () => ({ data: [], error: null }) }),
          single: () => ({ data: null, error: null }),
          data: [], error: null,
        }),
        single: () => ({ data: null, error: null }),
        data: [], error: null,
      }),
      insert: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }),
      update: () => ({ eq: () => ({ data: null, error: null }) }),
      upsert: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }), data: null, error: null }),
      delete: () => ({ eq: () => ({ data: null, error: null }) }),
    }),
})

export const createClient = async (): Promise<ReturnType<typeof createServerClient<Database>> | ReturnType<typeof createStubClient>> => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url?.startsWith('http') || !key) {
    return createStubClient()
  }

  const cookieStore = await cookies()

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Server component — cookies are read-only in RSC
        }
      },
    },
  })
}
