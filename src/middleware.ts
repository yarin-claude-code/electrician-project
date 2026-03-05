import { updateSession } from '@/lib/supabase/middleware'

import type { NextRequest } from 'next/server'

export const middleware = async (request: NextRequest): ReturnType<typeof updateSession> => {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
