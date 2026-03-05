'use client'

import { useState, useEffect } from 'react'
import { useWizard } from '@/contexts/wizard-context'
import { WizardNavButtons } from './wizard-shell'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2, Camera, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Defect } from '@/lib/supabase/types'

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-100 border-red-300',
  major: 'bg-amber-50 border-amber-300',
  minor: 'bg-blue-50 border-blue-200',
}

const SEVERITY_LABELS: Record<string, string> = {
  critical: 'קריטי',
  major: 'מהותי',
  minor: 'קל',
}

const Step6Defects = (): React.JSX.Element => {
  const { inspectionId } = useWizard()
  const [defects, setDefects] = useState<Defect[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const loadDefects = async (): Promise<void> => {
      const { data } = await supabase
        .from('defects').select('*').eq('inspection_id', inspectionId).order('sort_order') as { data: Defect[] | null }
      if (data) setDefects(data)
      setLoading(false)
    }
    loadDefects()
  }, [inspectionId]) // eslint-disable-line react-hooks/exhaustive-deps

  const addDefect = async (): Promise<void> => {
    const { data } = await supabase
      .from('defects')
      .insert({ inspection_id: inspectionId, description: 'ליקוי חדש', severity: 'major', sort_order: defects.length })
      .select().single()
    if (data) setDefects((d) => [...d, data])
  }

  const updateDefect = async (id: string, updates: Partial<Defect>): Promise<void> => {
    setDefects((d) => d.map((defect) => defect.id === id ? { ...defect, ...updates } : defect))
    await supabase.from('defects').update(updates).eq('id', id)
  }

  const removeDefect = async (id: string): Promise<void> => {
    setDefects((d) => d.filter((defect) => defect.id !== id))
    await supabase.from('defects').delete().eq('id', id)
  }

  const handlePhoto = async (id: string, file: File): Promise<void> => {
    const path = `defects/${Date.now()}-${file.name}`
    const { data } = await supabase.storage.from('photos').upload(path, file)
    if (data) {
      const { data: url } = supabase.storage.from('photos').getPublicUrl(path)
      await updateDefect(id, { photo_url: url.publicUrl })
    }
  }

  if (loading) return <div className="py-12 text-center text-muted-foreground">טוען...</div>

  const criticalCount = defects.filter((d) => d.severity === 'critical').length
  const unresolvedCount = defects.filter((d) => !d.resolved).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">שלב 6: ליקויים</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {defects.length} ליקויים סה&quot;כ • {unresolvedCount} לא טופלו
            {criticalCount > 0 && ` • ${criticalCount} קריטיים`}
          </p>
        </div>
        <Button onClick={addDefect} size="sm" className="bg-blue-900 hover:bg-blue-800 gap-2">
          <Plus className="h-4 w-4" />
          הוסף ליקוי
        </Button>
      </div>

      {criticalCount > 0 && (
        <div className="flex items-center gap-2 rounded border border-red-300 bg-red-50 px-4 py-3 text-red-800 text-sm">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{criticalCount} ליקויים קריטיים מצריכים טיפול מיידי</span>
        </div>
      )}

      {defects.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
          <p>אין ליקויים. ליקויים נוצרים אוטומטית מבדיקה חזותית או ניתן להוסיף ידנית.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {defects.map((defect, idx) => (
            <div
              key={defect.id}
              className={cn(
                'rounded-lg border p-4 space-y-4 transition-opacity',
                SEVERITY_COLORS[defect.severity ?? 'major'],
                defect.resolved && 'opacity-60'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={defect.resolved}
                    onCheckedChange={(v) => updateDefect(defect.id, { resolved: Boolean(v) })}
                    id={`resolved-${defect.id}`}
                  />
                  <span className="font-medium text-sm">ליקוי {idx + 1}</span>
                  <Badge className={cn(
                    'text-xs',
                    defect.severity === 'critical' && 'bg-red-600',
                    defect.severity === 'major' && 'bg-amber-500',
                    defect.severity === 'minor' && 'bg-blue-600',
                  )}>
                    {SEVERITY_LABELS[defect.severity ?? 'major']}
                  </Badge>
                  {defect.resolved && <Badge variant="outline" className="text-xs">טופל</Badge>}
                </div>
                <Button
                  variant="ghost" size="sm"
                  onClick={() => removeDefect(defect.id)}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>תיאור הליקוי *</Label>
                  <Textarea
                    value={defect.description}
                    onChange={(e) => updateDefect(defect.id, { description: e.target.value })}
                    rows={2}
                    placeholder="תאר את הליקוי..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>חומרה</Label>
                  <Select
                    value={defect.severity ?? 'major'}
                    onValueChange={(v) => updateDefect(defect.id, { severity: v as Defect['severity'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">קריטי</SelectItem>
                      <SelectItem value="major">מהותי</SelectItem>
                      <SelectItem value="minor">קל</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>תאריך תיקון יעד</Label>
                  <Input
                    type="date"
                    value={defect.target_repair_date ?? ''}
                    onChange={(e) => updateDefect(defect.id, { target_repair_date: e.target.value })}
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="cursor-pointer">
                    <input
                      type="file" accept="image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhoto(defect.id, f) }}
                    />
                    <span className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
                      <Camera className="h-4 w-4" />
                      {defect.photo_url ? 'החלף תמונה' : 'צרף תמונה'}
                    </span>
                  </label>
                  {defect.photo_url && (
                    <div className="mt-2">
                      <img
                        src={defect.photo_url}
                        alt="תמונת ליקוי"
                        className="rounded border max-h-40 object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <WizardNavButtons />
    </div>
  )
}

export default Step6Defects
