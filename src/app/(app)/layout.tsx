import { createClient } from '@/lib/supabase/server'
import AppNav from '@/components/app-nav'
import { ErrorBoundary } from '@/components/error-boundary'
import type { User } from '@supabase/supabase-js'

const DEV_USER: User = {
  id: 'dev-user',
  email: 'dev@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '',
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  let user: User | null = null

  if (supabaseUrl?.startsWith('http')) {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user
  } else {
    // Dev preview mode — use a placeholder user so we can see the UI
    user = DEV_USER
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNav user={user ?? DEV_USER} />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
    </div>
  )
}
