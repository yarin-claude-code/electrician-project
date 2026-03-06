import Link from 'next/link'
import { Plus, FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import DashboardCharts from '@/components/dashboard/charts'
import DashboardInspectionList from '@/components/dashboard/inspection-list'
import {
  DEMO_INSPECTIONS,
  DEMO_STATUS,
  DEMO_CATEGORY,
  DEMO_MONTHLY,
  DEMO_DEFECTS,
  buildStatusData,
} from '@/lib/dashboard-data'

import type { Metadata } from 'next'
import type { Inspection } from '@/lib/supabase/types'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'לוח בקרה | בדיקת חשמל',
  description: 'סקירת כל הבדיקות, סטטיסטיקות וגרפים',
}

const INSPECTION_LIST_LIMIT = 50

export default async function DashboardPage(): Promise<React.ReactElement> {
  let inspections: Inspection[] = DEMO_INSPECTIONS
  let statusData = DEMO_STATUS

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (supabaseUrl?.startsWith('http')) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const { data: raw } = await supabase
      .from('inspections')
      .select('*')
      .eq('inspector_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(INSPECTION_LIST_LIMIT)
    inspections = (raw as Inspection[]) ?? []
    statusData = buildStatusData(inspections)
  }

  const total = inspections.length
  const completed = inspections.filter(
    (i) => i.status === 'completed' || i.status === 'submitted'
  ).length
  const drafts = inspections.filter(
    (i) => i.status === 'draft' || i.status === 'in_progress'
  ).length
  const rejected = inspections.filter((i) => i.approval_status === 'rejected').length
  const isDemo = !supabaseUrl?.startsWith('http')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">לוח בקרה</h1>
          {isDemo && (
            <p className="mt-1 flex items-center gap-1 text-xs text-amber-600">
              <AlertTriangle className="h-3 w-3" />
              מצב תצוגה — נתוני דמו. חבר Supabase לנתונים אמיתיים.
            </p>
          )}
        </div>
        <Link href="/inspections/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            בדיקה חדשה
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard
          label='סה"כ בדיקות'
          value={total}
          icon={<FileText className="h-5 w-5 text-primary" />}
        />
        <KpiCard
          label="הושלמו"
          value={completed}
          icon={<CheckCircle className="h-5 w-5 text-emerald-600" />}
          valueColor="text-emerald-600"
        />
        <KpiCard
          label="טיוטות"
          value={drafts}
          icon={<Clock className="h-5 w-5 text-amber-500" />}
          valueColor="text-amber-500"
        />
        <KpiCard
          label="נדחו"
          value={rejected}
          icon={<AlertTriangle className="h-5 w-5 text-destructive" />}
          valueColor="text-destructive"
        />
      </div>

      {/* Charts */}
      <DashboardCharts
        statusData={statusData}
        categoryData={DEMO_CATEGORY}
        monthlyData={DEMO_MONTHLY}
        topDefects={DEMO_DEFECTS}
      />

      {/* Recent inspections list */}
      <Card>
        <CardHeader>
          <CardTitle>בדיקות אחרונות</CardTitle>
        </CardHeader>
        <CardContent>
          <DashboardInspectionList inspections={inspections} />
        </CardContent>
      </Card>
    </div>
  )
}

interface KpiCardProps {
  label: string
  value: number
  icon: ReactNode
  valueColor?: string
}

const KpiCard = ({
  label,
  value,
  icon,
  valueColor = 'text-foreground',
}: KpiCardProps): ReactNode => (
  <Card>
    <CardContent className="p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs leading-tight text-muted-foreground">{label}</p>
        {icon}
      </div>
      <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
    </CardContent>
  </Card>
)
