'use client'

import { useState, useEffect } from 'react'
import { useWizard } from '@/contexts/wizard-context'
import { WizardNavButtons } from './wizard-shell'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Panel, CircuitMeasurement } from '@/lib/supabase/types'
import { fetchLookup, type LookupOption } from '@/lib/lookup'

const CIRCUITS = Array.from({ length: 12 }, (_, i) => i + 1)

const INS_ROWS_3PH = [
  { key: 'ins_1l_e', label: '1L-E', unit: 'MΩ' },
  { key: 'ins_2l_e', label: '2L-E', unit: 'MΩ' },
  { key: 'ins_3l_e', label: '3L-E', unit: 'MΩ' },
  { key: 'ins_n_e', label: 'N-E', unit: 'MΩ' },
  { key: 'ins_1l_n', label: '1L-N', unit: 'MΩ' },
  { key: 'ins_2l_n', label: '2L-N', unit: 'MΩ' },
  { key: 'ins_3l_n', label: '3L-N', unit: 'MΩ' },
  { key: 'ins_1l_2l', label: '1L-2L', unit: 'MΩ' },
  { key: 'ins_3l_2l', label: '3L-2L', unit: 'MΩ' },
  { key: 'ins_3l_1l', label: '3L-1L', unit: 'MΩ' },
]

const INS_ROWS_1PH = [
  { key: 'ins_1l_e', label: '1L-E', unit: 'MΩ' },
  { key: 'ins_n_e', label: 'N-E', unit: 'MΩ' },
  { key: 'ins_1l_n', label: '1L-N', unit: 'MΩ' },
]

const OTHER_ROWS = [
  { key: 'grounding_continuity', label: 'רציפות הארקה', unit: 'Ω', type: 'number' as const },
  { key: 'fault_loop_impedance', label: 'עכבת לולאת תקלה', unit: 'Ω', type: 'number' as const },
  { key: 'overcurrent_protection', label: 'הגנת יתר זרם', unit: '', type: 'pf' as const },
  { key: 'phase_sequence', label: 'רצף פאזות', unit: '', type: 'pf' as const },
]

const VOLTAGE_ROWS_3PH = [
  { key: 'voltage_1l_e', label: '1L-E', unit: 'V' },
  { key: 'voltage_2l_e', label: '2L-E', unit: 'V' },
  { key: 'voltage_3l_e', label: '3L-E', unit: 'V' },
  { key: 'voltage_1l_n', label: '1L-N', unit: 'V' },
]

const VOLTAGE_ROWS_1PH = [
  { key: 'voltage_1l_e', label: '1L-E', unit: 'V' },
  { key: 'voltage_1l_n', label: '1L-N', unit: 'V' },
]

const INSULATION_FAIL_THRESHOLD = 0.5
const INSULATION_WARN_THRESHOLD = 1.0
const VOLTAGE_MIN = 200
const VOLTAGE_MAX = 253

const getInsulationColor = (val: number | null): string => {
  if (val === null) return ''
  if (val < INSULATION_FAIL_THRESHOLD) return 'bg-red-100 text-red-800'
  if (val < INSULATION_WARN_THRESHOLD) return 'bg-amber-100 text-amber-800'
  return ''
}

const getVoltageColor = (val: number | null): string => {
  if (val === null) return ''
  if (val < VOLTAGE_MIN || val > VOLTAGE_MAX) return 'bg-red-100 text-red-800'
  return ''
}

const Step4Panels = (): React.JSX.Element => {
  const { inspectionId, state } = useWizard()
  const [panels, setPanels] = useState<Panel[]>([])
  const [measurements, setMeasurements] = useState<
    Record<string, Record<number, Partial<CircuitMeasurement>>>
  >({})
  const [loading, setLoading] = useState(true)
  const [panelTypes, setPanelTypes] = useState<LookupOption[]>([])
  const supabase = createClient()
  const is3ph = state.installationType !== 'residential'
  const insRows = is3ph ? INS_ROWS_3PH : INS_ROWS_1PH
  const voltageRows = is3ph ? VOLTAGE_ROWS_3PH : VOLTAGE_ROWS_1PH

  useEffect(() => {
    fetchLookup('panel_type').then(setPanelTypes)
    async function load() {
      const { data: panelData } = await supabase
        .from('panels')
        .select('*, circuit_measurements(*)')
        .eq('inspection_id', inspectionId)
        .order('sort_order')
      if (panelData) {
        const allMeasurements: Record<string, Record<number, Partial<CircuitMeasurement>>> = {}
        const panelsOnly = panelData.map(
          ({
            circuit_measurements: cms,
            ...p
          }: {
            circuit_measurements: CircuitMeasurement[]
            [key: string]: unknown
          }) => {
            allMeasurements[p.id as string] = {}
            ;(cms as CircuitMeasurement[])?.forEach((m) => {
              allMeasurements[p.id as string][m.circuit_number] = m
            })
            return p
          }
        )
        setPanels(panelsOnly)
        setMeasurements(allMeasurements)
      }
      setLoading(false)
    }
    load()
  }, [inspectionId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function addPanel() {
    const defaultName =
      panels.length === 0
        ? 'לוח ראשי'
        : panels.length === 1
          ? 'לוח משנה'
          : `לוח ${panels.length + 1}`
    const { data } = await supabase
      .from('panels')
      .insert({ inspection_id: inspectionId, sort_order: panels.length, panel_name: defaultName })
      .select()
      .single()
    if (data) {
      setPanels((p) => [...p, data])
      setMeasurements((m) => ({ ...m, [data.id]: {} }))
    }
  }

  async function removePanel(id: string) {
    setPanels((p) => p.filter((panel) => panel.id !== id))
    setMeasurements((m) => {
      const next = { ...m }
      delete next[id]
      return next
    })
    await supabase.from('panels').delete().eq('id', id)
  }

  async function updatePanelName(id: string, name: string) {
    setPanels((p) => p.map((panel) => (panel.id === id ? { ...panel, panel_name: name } : panel)))
    await supabase.from('panels').update({ panel_name: name }).eq('id', id)
  }

  async function setCellValue(
    panelId: string,
    circuit: number,
    field: string,
    value: string | null
  ) {
    const parsed =
      value === '' || value === null
        ? null
        : field === 'overcurrent_protection' || field === 'phase_sequence'
          ? value
          : parseFloat(value)
    setMeasurements((m) => ({
      ...m,
      [panelId]: {
        ...m[panelId],
        [circuit]: { ...(m[panelId]?.[circuit] ?? {}), [field]: parsed },
      },
    }))
    const existing = measurements[panelId]?.[circuit]
    if (existing?.id) {
      await supabase
        .from('circuit_measurements')
        .update({ [field]: parsed })
        .eq('id', existing.id)
    } else {
      const { data } = await supabase
        .from('circuit_measurements')
        .upsert(
          { panel_id: panelId, circuit_number: circuit, [field]: parsed },
          { onConflict: 'panel_id,circuit_number' }
        )
        .select('id')
        .single()
      if (data) {
        setMeasurements((m) => ({
          ...m,
          [panelId]: {
            ...m[panelId],
            [circuit]: { ...(m[panelId]?.[circuit] ?? {}), id: data.id, [field]: parsed },
          },
        }))
      }
    }
  }

  if (loading) return <div className="py-12 text-center text-muted-foreground">טוען...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">שלב 4: מדידות לוח</h2>
        <Button onClick={addPanel} size="sm" className="gap-2 bg-blue-900 hover:bg-blue-800">
          <Plus className="h-4 w-4" />
          הוסף לוח
        </Button>
      </div>

      {panels.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed py-12 text-center text-muted-foreground">
          <p>לחץ &quot;הוסף לוח&quot; להוסיף לוח חשמל</p>
        </div>
      ) : (
        panels.map((panel) => (
          <PanelMatrix
            key={panel.id}
            panel={panel}
            data={measurements[panel.id] ?? {}}
            insRows={insRows}
            voltageRows={voltageRows}
            is3ph={is3ph}
            panelTypes={panelTypes}
            onNameChange={(name) => updatePanelName(panel.id, name)}
            onRemove={() => removePanel(panel.id)}
            onCellChange={(circuit, field, value) => setCellValue(panel.id, circuit, field, value)}
          />
        ))
      )}

      <WizardNavButtons />
    </div>
  )
}

function PanelMatrix({
  panel,
  data,
  insRows,
  voltageRows,
  is3ph,
  panelTypes,
  onNameChange,
  onRemove,
  onCellChange,
}: {
  panel: Panel
  data: Record<number, Partial<CircuitMeasurement>>
  insRows: { key: string; label: string; unit: string }[]
  voltageRows: { key: string; label: string; unit: string }[]
  is3ph: boolean
  panelTypes: LookupOption[]
  onNameChange: (name: string) => void
  onRemove: () => void
  onCellChange: (circuit: number, field: string, value: string | null) => void
}) {
  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b bg-slate-50 px-4 py-3">
        <Select
          value={panelTypes.some((t) => t.label_he === panel.panel_name) ? panel.panel_name : 'אחר'}
          onValueChange={(val) => onNameChange(val === 'אחר' ? panel.panel_name : val)}
        >
          <SelectTrigger className="h-8 w-48 text-sm font-medium">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {panelTypes.map((t) => (
              <SelectItem key={t.key} value={t.label_he}>
                {t.label_he}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b bg-slate-100">
              <th className="sticky right-0 z-10 min-w-[120px] bg-slate-100 px-3 py-2 text-right font-medium">
                פרמטר
              </th>
              <th className="min-w-[40px] px-2 py-2 text-right font-medium text-muted-foreground">
                יחידה
              </th>
              {CIRCUITS.map((c) => (
                <th key={c} className="min-w-[70px] px-2 py-2 text-center font-medium">
                  מעגל {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Insulation rows */}
            <tr className="bg-blue-50">
              <td colSpan={14} className="px-3 py-1.5 font-semibold text-blue-900">
                התנגדות בידוד
              </td>
            </tr>
            {insRows.map((row) => (
              <MeasurementRow
                key={row.key}
                label={row.label}
                unit={row.unit}
                data={data}
                field={row.key}
                type="ins"
                onCellChange={onCellChange}
              />
            ))}
            {/* Other rows */}
            <tr className="bg-slate-50">
              <td colSpan={14} className="px-3 py-1.5 font-semibold text-slate-700">
                מדידות נוספות
              </td>
            </tr>
            {OTHER_ROWS.map((row) => (
              <MeasurementRow
                key={row.key}
                label={row.label}
                unit={row.unit}
                data={data}
                field={row.key}
                type={row.type}
                onCellChange={onCellChange}
              />
            ))}
            {/* Voltage rows */}
            <tr className="bg-yellow-50">
              <td colSpan={14} className="px-3 py-1.5 font-semibold text-yellow-800">
                מתח
              </td>
            </tr>
            {voltageRows.map((row) => (
              <MeasurementRow
                key={row.key}
                label={row.label}
                unit={row.unit}
                data={data}
                field={row.key}
                type="voltage"
                onCellChange={onCellChange}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function MeasurementRow({
  label,
  unit,
  data,
  field,
  type,
  onCellChange,
}: {
  label: string
  unit: string
  data: Record<number, Partial<CircuitMeasurement>>
  field: string
  type: 'ins' | 'voltage' | 'number' | 'pf'
  onCellChange: (circuit: number, field: string, value: string | null) => void
}) {
  return (
    <tr className="border-b transition-colors hover:bg-slate-50">
      <td className="sticky right-0 bg-white px-3 py-1.5 font-medium">{label}</td>
      <td className="px-2 py-1.5 text-muted-foreground">{unit}</td>
      {CIRCUITS.map((c) => {
        const val = data[c]?.[field as keyof CircuitMeasurement] as
          | number
          | string
          | null
          | undefined
        const numVal = typeof val === 'number' ? val : null
        const strVal = typeof val === 'string' ? val : ''
        const insColor = type === 'ins' ? getInsulationColor(numVal) : ''
        const voltColor = type === 'voltage' ? getVoltageColor(numVal) : ''
        return (
          <td key={c} className="px-1 py-1">
            {type === 'pf' ? (
              <Select value={strVal || ''} onValueChange={(v) => onCellChange(c, field, v)}>
                <SelectTrigger className="h-7 w-20 text-xs">
                  <SelectValue placeholder="-" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pass">תקין</SelectItem>
                  <SelectItem value="fail">ליקוי</SelectItem>
                  <SelectItem value="na">לא רלוונטי</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input
                type="number"
                step="0.01"
                className={cn('h-7 w-16 text-center text-xs', insColor, voltColor)}
                value={numVal !== null ? String(numVal) : ''}
                onChange={(e) => onCellChange(c, field, e.target.value)}
                dir="ltr"
              />
            )}
            {type === 'ins' && numVal !== null && numVal < 0.5 && (
              <AlertTriangle className="mx-auto h-3 w-3 text-red-500" />
            )}
          </td>
        )
      })}
    </tr>
  )
}

export default Step4Panels
