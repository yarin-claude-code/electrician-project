'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { formatDateHe, installationTypeLabel } from '@/lib/utils'

import type { Inspection } from '@/lib/supabase/types'

interface DashboardInspectionListProps {
  inspections: Inspection[]
}

const DashboardInspectionList = ({ inspections }: DashboardInspectionListProps): React.ReactNode => {
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? inspections.filter(
        (i) =>
          i.client_name?.includes(query) ||
          i.address?.includes(query)
      )
    : inspections

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="search"
          placeholder="חיפוש לפי מספר פנייה..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-full border border-input bg-secondary/40 pe-10 ps-4 py-2 text-sm placeholder:text-muted-foreground outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30 focus-visible:bg-secondary/60"
        />
      </div>

      {/* List */}
      <div className="divide-y">
        {filtered.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">לא נמצאו תוצאות</p>
        )}
        {filtered.map((inspection) => (
          <Link
            key={inspection.id}
            href={`/inspections/${inspection.id}`}
            className="flex items-center justify-between py-3 px-2 hover:bg-muted/60 rounded-lg transition-colors"
          >
            <div className="space-y-0.5 min-w-0">
              <p className="font-medium truncate">{inspection.client_name || 'לקוח ללא שם'}</p>
              <p className="text-sm text-muted-foreground truncate">
                {inspection.address || 'כתובת לא צוינה'} •{' '}
                {formatDateHe(inspection.inspection_date ?? inspection.created_at)}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ms-3">
              <InstallationBadge type={inspection.installation_type} />
              <StatusBadge status={inspection.status} approvalStatus={inspection.approval_status} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default DashboardInspectionList

interface InstallationBadgeProps {
  type: string | null
}

const InstallationBadge = ({ type }: InstallationBadgeProps): React.ReactNode => {
  if (!type) return null
  return <Badge variant="outline" className="text-xs hidden sm:flex">{installationTypeLabel(type)}</Badge>
}

interface StatusBadgeProps {
  status: string
  approvalStatus: string | null
}

const StatusBadge = ({ status, approvalStatus }: StatusBadgeProps): React.ReactNode => {
  if (status === 'submitted' || status === 'completed') {
    if (approvalStatus === 'approved') return <Badge className="bg-green-600 text-xs">מאושר</Badge>
    if (approvalStatus === 'rejected') return <Badge variant="destructive" className="text-xs">נדחה</Badge>
    if (approvalStatus === 'approved_with_recommendations') return <Badge className="bg-amber-500 text-xs">עם המלצות</Badge>
    return <Badge className="bg-green-600 text-xs">הושלם</Badge>
  }
  if (status === 'in_progress') return <Badge variant="secondary" className="text-xs">בתהליך</Badge>
  return <Badge variant="outline" className="text-xs">טיוטה</Badge>
}
