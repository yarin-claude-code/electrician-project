'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWizard } from '@/contexts/wizard-context'
import { WizardNavButtons } from './wizard-shell'
import { createClient } from '@/lib/supabase/client'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  VISUAL_CHECK_CATEGORIES,
  type VisualCheckItem,
  type VisualCheckCategory,
} from '@/lib/visual-check-items'
import type { VisualCheck } from '@/lib/supabase/types'
import { fetchVisualCheckCategories } from '@/lib/lookup'
import { CheckCircle, XCircle, MinusCircle, Camera, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

type CheckResult = 'pass' | 'fail' | 'na' | null

interface LocalCheck {
  result: CheckResult
  notes: string
  photo_url: string | null
  id?: string
}

const Step2VisualChecks = (): React.JSX.Element => {
  const { inspectionId } = useWizard()
  const [checks, setChecks] = useState<Record<string, LocalCheck>>({})
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<VisualCheckCategory[]>(VISUAL_CHECK_CATEGORIES)
  const supabase = createClient()

  useEffect(() => {
    const loadCategories = async (): Promise<void> => {
      const cats = await fetchVisualCheckCategories()
      setCategories(cats)
    }
    loadCategories()
    async function loadChecks() {
      const { data } = await supabase
        .from('visual_checks')
        .select('*')
        .eq('inspection_id', inspectionId)
      if (data) {
        const map: Record<string, LocalCheck> = {}
        data.forEach((c: VisualCheck) => {
          map[c.item_key] = {
            result: c.result as CheckResult,
            notes: c.notes ?? '',
            photo_url: c.photo_url,
            id: c.id,
          }
        })
        setChecks(map)
      }
      setLoading(false)
    }
    loadChecks()
  }, [inspectionId]) // eslint-disable-line react-hooks/exhaustive-deps

  const updateCheck = useCallback(
    async (category: string, item: VisualCheckItem, updates: Partial<LocalCheck>) => {
      const prev = checks[item.key] ?? { result: null, notes: '', photo_url: null }
      const next: LocalCheck = { ...prev, ...updates }
      setChecks((c) => ({ ...c, [item.key]: next }))

      // Upsert to Supabase
      const { data, error } = await supabase
        .from('visual_checks')
        .upsert(
          {
            id: prev.id,
            inspection_id: inspectionId,
            category,
            item_key: item.key,
            item_label: item.label,
            result: next.result,
            notes: next.notes || null,
            photo_url: next.photo_url,
          },
          { onConflict: 'inspection_id,item_key' }
        )
        .select('id')
        .single()

      if (!error && data) {
        setChecks((c) => ({ ...c, [item.key]: { ...next, id: data.id } }))
      }

      // Auto-create defect if failed
      if (updates.result === 'fail' && prev.result !== 'fail') {
        await supabase.from('defects').insert({
          inspection_id: inspectionId,
          visual_check_id: data?.id ?? prev.id,
          description: item.label,
          severity: 'major',
        })
        toast.warning(`ליקוי נוצר אוטומטית: ${item.labelHe}`)
      }
    },
    [checks, inspectionId, supabase]
  )

  const passCount = Object.values(checks).filter((c) => c.result === 'pass').length
  const failCount = Object.values(checks).filter((c) => c.result === 'fail').length
  const naCount = Object.values(checks).filter((c) => c.result === 'na').length
  const totalItems = categories.reduce((acc, cat) => acc + cat.items.length, 0)

  if (loading) {
    return <div className="py-12 text-center text-muted-foreground">טוען...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">שלב 2: בדיקה חזותית של לוח</h2>
        <div className="flex gap-2">
          <Badge className="gap-1 bg-green-600">
            <CheckCircle className="h-3 w-3" />
            {passCount}
          </Badge>
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            {failCount}
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <MinusCircle className="h-3 w-3" />
            {naCount}
          </Badge>
          <Badge variant="outline">
            {passCount + failCount + naCount}/{totalItems}
          </Badge>
        </div>
      </div>

      {failCount > 0 && (
        <div className="flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{failCount} ליקויים זוהו ונוצרו אוטומטית בשלב 6</span>
        </div>
      )}

      <Accordion type="multiple" defaultValue={['general']}>
        {categories.map((category) => {
          const catPass = category.items.filter((i) => checks[i.key]?.result === 'pass').length
          const catFail = category.items.filter((i) => checks[i.key]?.result === 'fail').length
          return (
            <AccordionItem key={category.id} value={category.id}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3 text-right">
                  <span className="font-medium">{category.labelHe}</span>
                  <span className="text-xs text-muted-foreground">({category.label})</span>
                  {catFail > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {catFail} ליקויים
                    </Badge>
                  )}
                  {catFail === 0 && catPass > 0 && (
                    <Badge className="bg-green-600 text-xs">
                      {catPass}/{category.items.length}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  {category.items.map((item) => {
                    const check = checks[item.key] ?? { result: null, notes: '', photo_url: null }
                    return (
                      <CheckItem
                        key={item.key}
                        item={item}
                        check={check}
                        onResultChange={(result) => updateCheck(category.id, item, { result })}
                        onNotesChange={(notes) => updateCheck(category.id, item, { notes })}
                        onPhotoChange={(photo_url) => updateCheck(category.id, item, { photo_url })}
                      />
                    )
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>

      <WizardNavButtons />
    </div>
  )
}

export default Step2VisualChecks

interface CheckItemProps {
  item: VisualCheckItem
  check: LocalCheck
  onResultChange: (r: CheckResult) => void
  onNotesChange: (n: string) => void
  onPhotoChange: (url: string | null) => void
}

const CheckItem = ({
  item,
  check,
  onResultChange,
  onNotesChange,
  onPhotoChange,
}: CheckItemProps): React.ReactNode => {
  const [showNotes, setShowNotes] = useState(Boolean(check.notes))

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0]
    if (!file) return
    const supabase = createClient()
    const path = `visual-checks/${Date.now()}-${file.name}`
    const { data, error } = await supabase.storage.from('photos').upload(path, file)
    if (data) {
      const { data: url } = supabase.storage.from('photos').getPublicUrl(path)
      onPhotoChange(url.publicUrl || URL.createObjectURL(file))
    } else if (error || !data) {
      // Demo mode or upload failed — use local object URL for preview
      onPhotoChange(URL.createObjectURL(file))
      toast.success('תמונה נוספה (מצב תצוגה)')
    }
  }

  return (
    <div
      className={cn(
        'rounded-lg border p-4 transition-colors',
        check.result === 'pass' && 'border-green-200 bg-green-50',
        check.result === 'fail' && 'border-red-200 bg-red-50',
        check.result === 'na' && 'border-slate-200 bg-slate-50',
        !check.result && 'border-slate-200'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm font-medium">{item.labelHe}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{item.label}</p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-1">
          <Button
            size="sm"
            variant={check.result === 'pass' ? 'default' : 'outline'}
            className={cn(
              'h-8 gap-1 px-2',
              check.result === 'pass' && 'border-green-600 bg-green-600 hover:bg-green-700'
            )}
            onClick={() => onResultChange(check.result === 'pass' ? null : 'pass')}
          >
            <CheckCircle className="h-4 w-4" />
            <span className="hidden text-xs sm:inline">תקין</span>
          </Button>
          <Button
            size="sm"
            variant={check.result === 'fail' ? 'destructive' : 'outline'}
            className="h-8 gap-1 px-2"
            onClick={() => onResultChange(check.result === 'fail' ? null : 'fail')}
          >
            <XCircle className="h-4 w-4" />
            <span className="hidden text-xs sm:inline">ליקוי</span>
          </Button>
          <Button
            size="sm"
            variant={check.result === 'na' ? 'secondary' : 'outline'}
            className="h-8 gap-1 px-2"
            onClick={() => onResultChange(check.result === 'na' ? null : 'na')}
          >
            <MinusCircle className="h-4 w-4" />
            <span className="hidden text-xs sm:inline">לא רלוונטי</span>
          </Button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 text-xs text-muted-foreground"
          onClick={() => setShowNotes(!showNotes)}
        >
          {showNotes ? 'הסתר הערה' : '+ הוסף הערה'}
        </Button>
        <label className="cursor-pointer">
          <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          <span className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
            <Camera className="h-3 w-3" />
            {check.photo_url ? 'החלף תמונה' : 'צרף תמונה'}
          </span>
        </label>
      </div>
      {check.photo_url && (
        <div className="mt-2">
          <img
            src={check.photo_url}
            alt="תמונה מצורפת"
            className="max-h-32 rounded border object-contain"
          />
        </div>
      )}
      {showNotes && (
        <Textarea
          className="mt-2 text-sm"
          placeholder="הערות..."
          value={check.notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={2}
        />
      )}
    </div>
  )
}
