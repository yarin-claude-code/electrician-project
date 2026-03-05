'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Copy, Trash2, Filter, X } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { formatDateHe, installationTypeLabel } from '@/lib/utils'
import { duplicateInspection, deleteInspection } from '@/app/(app)/inspections/actions'

import type { Inspection } from '@/lib/supabase/types'

interface DashboardInspectionListProps {
  inspections: Inspection[]
}

type StatusFilter = 'all' | 'draft' | 'in_progress' | 'completed' | 'submitted'
type TypeFilter = 'all' | 'residential' | 'commercial' | 'industrial' | 'other'

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'הכל' },
  { value: 'draft', label: 'טיוטה' },
  { value: 'in_progress', label: 'בתהליך' },
  { value: 'completed', label: 'הושלם' },
  { value: 'submitted', label: 'הוגש' },
]

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'כל הסוגים' },
  { value: 'residential', label: 'מגורים' },
  { value: 'commercial', label: 'מסחרי' },
  { value: 'industrial', label: 'תעשייתי' },
  { value: 'other', label: 'אחר' },
]

const DashboardInspectionList = ({
  inspections,
}: DashboardInspectionListProps): React.ReactNode => {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Inspection | null>(null)
  const [deleting, setDeleting] = useState(false)

  const hasActiveFilters = statusFilter !== 'all' || typeFilter !== 'all'

  const filtered = useMemo(() => {
    let result = inspections

    if (query.trim()) {
      result = result.filter((i) => i.client_name?.includes(query) || i.address?.includes(query))
    }

    if (statusFilter !== 'all') {
      result = result.filter((i) => i.status === statusFilter)
    }

    if (typeFilter !== 'all') {
      result = result.filter((i) => i.installation_type === typeFilter)
    }

    return result
  }, [inspections, query, statusFilter, typeFilter])

  const handleDuplicate = async (e: React.MouseEvent, inspection: Inspection) => {
    e.preventDefault()
    e.stopPropagation()
    toast.info('משכפל בדיקה...')
    await duplicateInspection(inspection.id)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteInspection(deleteTarget.id)
      toast.success('הבדיקה נמחקה בהצלחה')
      setDeleteTarget(null)
      router.refresh()
    } catch {
      toast.error('שגיאה במחיקת הבדיקה')
    } finally {
      setDeleting(false)
    }
  }

  const clearFilters = () => {
    setStatusFilter('all')
    setTypeFilter('all')
  }

  return (
    <div className="space-y-3">
      {/* Search + Filter toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="חיפוש לפי שם לקוח או כתובת..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-full border border-input bg-secondary/40 py-2 ps-4 pe-10 text-sm transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:bg-secondary/60 focus-visible:ring-[3px] focus-visible:ring-ring/30"
          />
        </div>
        <Button
          variant={hasActiveFilters ? 'default' : 'outline'}
          size="icon"
          className="shrink-0 rounded-full"
          onClick={() => setShowFilters(!showFilters)}
          aria-label="סינון"
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Filters row */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/30 p-3">
          <div className="flex flex-wrap gap-1.5">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  statusFilter === opt.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex flex-wrap gap-1.5">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTypeFilter(opt.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  typeFilter === opt.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="ms-auto flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-3 w-3" />
              נקה סינון
            </button>
          )}
        </div>
      )}

      {/* Results count when filtering */}
      {(hasActiveFilters || query.trim()) && (
        <p className="text-xs text-muted-foreground">
          {filtered.length} תוצאות מתוך {inspections.length}
        </p>
      )}

      {/* List */}
      <div className="divide-y">
        {filtered.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">לא נמצאו תוצאות</p>
        )}
        {filtered.map((inspection) => (
          <div
            key={inspection.id}
            className="group flex items-center justify-between rounded-lg px-2 py-3 transition-colors hover:bg-muted/60"
          >
            <Link href={`/inspections/${inspection.id}`} className="min-w-0 flex-1">
              <div className="space-y-0.5">
                <p className="truncate font-medium">{inspection.client_name || 'לקוח ללא שם'}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {inspection.address || 'כתובת לא צוינה'} •{' '}
                  {formatDateHe(inspection.inspection_date ?? inspection.created_at)}
                </p>
              </div>
            </Link>
            <div className="ms-3 flex flex-shrink-0 items-center gap-2">
              <InstallationBadge type={inspection.installation_type} />
              <StatusBadge status={inspection.status} approvalStatus={inspection.approval_status} />
              {/* Action buttons - visible on hover */}
              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-primary"
                  onClick={(e) => handleDuplicate(e, inspection)}
                  title="שכפל בדיקה"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setDeleteTarget(inspection)
                  }}
                  title="מחק בדיקה"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>מחיקת בדיקה</DialogTitle>
            <DialogDescription>
              האם למחוק את הבדיקה של <strong>{deleteTarget?.client_name || 'לקוח ללא שם'}</strong>?
              <br />
              פעולה זו לא ניתנת לביטול וכל הנתונים ימחקו לצמיתות.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              ביטול
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'מוחק...' : 'מחק'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default DashboardInspectionList

interface InstallationBadgeProps {
  type: string | null
}

const InstallationBadge = ({ type }: InstallationBadgeProps): React.ReactNode => {
  if (!type) return null
  return (
    <Badge variant="outline" className="hidden text-xs sm:flex">
      {installationTypeLabel(type)}
    </Badge>
  )
}

interface StatusBadgeProps {
  status: string
  approvalStatus: string | null
}

const StatusBadge = ({ status, approvalStatus }: StatusBadgeProps): React.ReactNode => {
  if (status === 'submitted' || status === 'completed') {
    if (approvalStatus === 'approved') return <Badge className="bg-green-600 text-xs">מאושר</Badge>
    if (approvalStatus === 'rejected')
      return (
        <Badge variant="destructive" className="text-xs">
          נדחה
        </Badge>
      )
    if (approvalStatus === 'approved_with_recommendations')
      return <Badge className="bg-amber-500 text-xs">עם המלצות</Badge>
    return <Badge className="bg-green-600 text-xs">הושלם</Badge>
  }
  if (status === 'in_progress')
    return (
      <Badge variant="secondary" className="text-xs">
        בתהליך
      </Badge>
    )
  return (
    <Badge variant="outline" className="text-xs">
      טיוטה
    </Badge>
  )
}
