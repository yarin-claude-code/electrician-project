'use client'

import { useState, useEffect } from 'react'
import { useWizard } from '@/contexts/wizard-context'
import { WizardNavButtons } from './wizard-shell'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2, AlertTriangle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fetchLookup, type LookupOption } from '@/lib/lookup'
import { toast } from 'sonner'
import type { Instrument } from '@/lib/supabase/types'

const MAX_INSTRUMENTS = 6

const getCalibrationStatus = (dateStr: string | null): 'ok' | 'warn' | 'expired' => {
  if (!dateStr) return 'ok'
  const months = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24 * 30)
  if (months > 12) return 'expired'
  if (months > 10) return 'warn'
  return 'ok'
}

const Step3Instruments = (): React.JSX.Element => {
  const { inspectionId } = useWizard()
  const [instruments, setInstruments] = useState<Instrument[]>([])
  const [loading, setLoading] = useState(true)
  const [instrumentTypes, setInstrumentTypes] = useState<LookupOption[]>([])
  const supabase = createClient()

  useEffect(() => {
    const loadLookup = async (): Promise<void> => {
      const types = await fetchLookup('instrument_type')
      setInstrumentTypes(types)
    }
    loadLookup()
    const loadInstruments = async (): Promise<void> => {
      const { data } = await supabase
        .from('instruments')
        .select('*')
        .eq('inspection_id', inspectionId)
        .order('sort_order')
      if (data) setInstruments(data as Instrument[])
      setLoading(false)
    }
    loadInstruments()
  }, [inspectionId]) // eslint-disable-line react-hooks/exhaustive-deps

  const addInstrument = async (): Promise<void> => {
    if (instruments.length >= MAX_INSTRUMENTS) {
      toast.error('ניתן להוסיף עד 6 מכשירים')
      return
    }
    const { data } = await supabase
      .from('instruments')
      .insert({ inspection_id: inspectionId, sort_order: instruments.length })
      .select()
      .single()
    if (data) setInstruments((prev) => [...prev, data])
  }

  const updateInstrument = async (id: string, updates: Partial<Instrument>): Promise<void> => {
    setInstruments((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)))
    await supabase.from('instruments').update(updates).eq('id', id)
  }

  const removeInstrument = async (id: string): Promise<void> => {
    setInstruments((prev) => prev.filter((i) => i.id !== id))
    await supabase.from('instruments').delete().eq('id', id)
  }

  if (loading) return <div className="py-12 text-center text-muted-foreground">טוען...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">שלב 3: מכשירי מדידה</h2>
        <Button
          onClick={addInstrument}
          size="sm"
          className="bg-blue-900 hover:bg-blue-800 gap-2"
          disabled={instruments.length >= MAX_INSTRUMENTS}
        >
          <Plus className="h-4 w-4" />
          הוסף מכשיר
        </Button>
      </div>

      {instruments.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
          <p>אין מכשירים. לחץ &quot;הוסף מכשיר&quot; להוסיף.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {instruments.map((instrument, idx) => {
            const status = getCalibrationStatus(instrument.calibration_date)
            return (
              <div
                key={instrument.id}
                className={cn(
                  'rounded-lg border p-4 space-y-4',
                  status === 'warn' && 'border-amber-300 bg-amber-50',
                  status === 'expired' && 'border-red-300 bg-red-50'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">מכשיר {idx + 1}</span>
                  <div className="flex items-center gap-2">
                    {status === 'warn' && (
                      <Badge className="bg-amber-500 gap-1 text-xs">
                        <AlertTriangle className="h-3 w-3" />
                        כיול מתקרב לפקיעה
                      </Badge>
                    )}
                    {status === 'expired' && (
                      <Badge variant="destructive" className="gap-1 text-xs">
                        <XCircle className="h-3 w-3" />
                        כיול פג תוקף
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeInstrument(instrument.id)}
                      className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <Label>סוג מכשיר</Label>
                    <Select
                      value={instrument.name ?? ''}
                      onValueChange={(val) => updateInstrument(instrument.id, { name: val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="בחר סוג מכשיר..." />
                      </SelectTrigger>
                      <SelectContent>
                        {instrumentTypes.map((t) => (
                          <SelectItem key={t.key} value={t.label_he}>{t.label_he}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>דגם</Label>
                    <Input
                      value={instrument.model ?? ''}
                      onChange={(e) => updateInstrument(instrument.id, { model: e.target.value })}
                      placeholder="דגם"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>מספר סידורי</Label>
                    <Input
                      value={instrument.serial_number ?? ''}
                      onChange={(e) => updateInstrument(instrument.id, { serial_number: e.target.value })}
                      placeholder="S/N"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>תאריך כיול</Label>
                    <Input
                      type="date"
                      value={instrument.calibration_date ?? ''}
                      onChange={(e) => updateInstrument(instrument.id, { calibration_date: e.target.value })}
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <WizardNavButtons />
    </div>
  )
}

export default Step3Instruments
