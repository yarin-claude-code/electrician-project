'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Zap, LayoutDashboard, Plus, Wifi, WifiOff, Settings } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useOnlineStatus } from '@/hooks/use-online-status'

import type { User } from '@supabase/supabase-js'

interface AppNavProps {
  user: User
}

const AppNav = ({ user }: AppNavProps): React.ReactNode => {
  const router = useRouter()
  const isOnline = useOnlineStatus()

  const signOut = async (): Promise<void> => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const statusVariant = isOnline ? 'secondary' : 'destructive'
  const StatusIcon = isOnline ? Wifi : WifiOff
  const statusText = isOnline ? 'מחובר' : 'לא מחובר'

  return (
    <nav
      aria-label="ניווט ראשי"
      className="border-b bg-primary text-primary-foreground shadow-[0_2px_12px_0px_oklch(0.52_0.26_268/0.25)]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2 text-lg font-bold">
              <Zap className="h-5 w-5 text-yellow-300" />
              <span>בדיקת חשמל</span>
            </Link>
            <div className="hidden items-center gap-1 md:flex">
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-primary-foreground shadow-none hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  לוח בקרה
                </Button>
              </Link>
              <Link href="/inspections/new">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-primary-foreground shadow-none hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <Plus className="h-4 w-4" />
                  בדיקה חדשה
                </Button>
              </Link>
              <Link href="/settings">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-primary-foreground shadow-none hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <Settings className="h-4 w-4" />
                  הגדרות
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={statusVariant} className="hidden gap-1 text-xs sm:flex">
              <StatusIcon className="h-3 w-3" />
              {statusText}
            </Badge>
            <span className="hidden text-sm text-primary-foreground/70 md:block">{user.email}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-primary-foreground shadow-none hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              יציאה
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default AppNav
