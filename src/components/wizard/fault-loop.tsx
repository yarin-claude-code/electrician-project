'use client'

import { useState, useEffect } from 'react'
import { useWizard } from '@/contexts/wizard-context'
import { WizardNavButtons } from './wizard-shell'
import { createClient } from '@/lib/supabase/client'
import type { FaultLoop } from '@/lib/supabase/types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface FaultLoopData {
  id?: string
  zph1_n: string; zph1_e: string
  zph2_n: string; zph2_e: string
  zph3_n: string; zph3_e: string
  z_1ph_2ph: string
}

const defaultData: FaultLoopData = {
  zph1_n: '', zph1_e: '',
  zph2_n: '', zph2_e: '',
  zph3_n: '', zph3_e: '',
  z_1ph_2ph: '',
}

const NOMINAL_VOLTAGE_V = 230
const THREE_PHASE_FACTOR = 1.55

const calcIsc = (zStr: string): { isc2ph: string; isc3ph: string } => {
  const z = parseFloat(zStr)
  if (!z || z <= 0) return { isc2ph: '-', isc3ph: '-' }
  const isc2ph = NOMINAL_VOLTAGE_V / z
  const isc3ph = THREE_PHASE_FACTOR * isc2ph
  return {
    isc2ph: isc2ph.toFixed(1) + ' A',
    isc3ph: isc3ph.toFixed(1) + ' A',
  }
}

const Step5FaultLoop = (): React.JSX.Element => {
  const { inspectionId, state } = useWizard()
  const [data, setData] = useState<FaultLoopData>(defaultData)
  const supabase = createClient()
  const is3ph = state.installationType !== 'residential'

  useEffect(() => {
    const loadFaultLoop = async (): Promise<void> => {
      const { data: row } = await supabase
        .from('fault_loop')
        .select('*')
        .eq('inspection_id', inspectionId)
        .single() as { data: FaultLoop | null }
      if (row) {
        setData({
          id: row.id,
          zph1_n: row.zph1_n !== null ? String(row.zph1_n) : '',
          zph1_e: row.zph1_e !== null ? String(row.zph1_e) : '',
          zph2_n: row.zph2_n !== null ? String(row.zph2_n) : '',
          zph2_e: row.zph2_e !== null ? String(row.zph2_e) : '',
          zph3_n: row.zph3_n !== null ? String(row.zph3_n) : '',
          zph3_e: row.zph3_e !== null ? String(row.zph3_e) : '',
          z_1ph_2ph: row.z_1ph_2ph !== null ? String(row.z_1ph_2ph) : '',
        })
      }
    }
    loadFaultLoop()
  }, [inspectionId]) // eslint-disable-line react-hooks/exhaustive-deps

  const updateField = async (field: keyof FaultLoopData, value: string): Promise<void> => {
    const next = { ...data, [field]: value }
    setData(next)

    const dbData = {
      inspection_id: inspectionId,
      zph1_n: next.zph1_n ? parseFloat(next.zph1_n) : null,
      zph1_e: next.zph1_e ? parseFloat(next.zph1_e) : null,
      zph2_n: next.zph2_n ? parseFloat(next.zph2_n) : null,
      zph2_e: next.zph2_e ? parseFloat(next.zph2_e) : null,
      zph3_n: next.zph3_n ? parseFloat(next.zph3_n) : null,
      zph3_e: next.zph3_e ? parseFloat(next.zph3_e) : null,
      z_1ph_2ph: next.z_1ph_2ph ? parseFloat(next.z_1ph_2ph) : null,
    }

    // Pre-calculate
    const ph1n = calcIsc(next.zph1_n); const ph1e = calcIsc(next.zph1_e)
    const ph2n = calcIsc(next.zph2_n); const ph2e = calcIsc(next.zph2_e)
    const ph3n = calcIsc(next.zph3_n); const ph3e = calcIsc(next.zph3_e)

    const saveData = {
      ...dbData,
      isc2ph_1: ph1n.isc2ph !== '-' ? parseFloat(ph1n.isc2ph) : null,
      isc3ph_1: ph1n.isc3ph !== '-' ? parseFloat(ph1n.isc3ph) : null,
      isc2ph_2: ph2n.isc2ph !== '-' ? parseFloat(ph2n.isc2ph) : null,
      isc3ph_2: ph2n.isc3ph !== '-' ? parseFloat(ph2n.isc3ph) : null,
      isc2ph_3: ph3n.isc2ph !== '-' ? parseFloat(ph3n.isc2ph) : null,
      isc3ph_3: ph3n.isc3ph !== '-' ? parseFloat(ph3n.isc3ph) : null,
    }

    await supabase.from('fault_loop').upsert(
      { id: data.id, ...saveData },
      { onConflict: 'inspection_id' }
    )
  }

  const phases = is3ph
    ? [
        { label: 'פאזה 1', nKey: 'zph1_n' as const, eKey: 'zph1_e' as const },
        { label: 'פאזה 2', nKey: 'zph2_n' as const, eKey: 'zph2_e' as const },
        { label: 'פאזה 3', nKey: 'zph3_n' as const, eKey: 'zph3_e' as const },
      ]
    : [{ label: 'פאזה', nKey: 'zph1_n' as const, eKey: 'zph1_e' as const }]

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">שלב 5: לולאת תקלה וקצר</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {phases.map((phase) => {
          const nCalc = calcIsc(data[phase.nKey])
          const eCalc = calcIsc(data[phase.eKey])
          return (
            <Card key={phase.label}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{phase.label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Z<sub>ph-N</sub> (Ω)</Label>
                    <Input
                      type="number"
                      step="0.001"
                      value={data[phase.nKey]}
                      onChange={(e) => updateField(phase.nKey, e.target.value)}
                      placeholder="0.000"
                      dir="ltr"
                      className="text-sm"
                    />
                    <div className="rounded bg-blue-50 p-2 text-xs space-y-1">
                      <p>Isc2ph: <strong>{nCalc.isc2ph}</strong></p>
                      <p>Isc3ph: <strong>{nCalc.isc3ph}</strong></p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Z<sub>ph-E</sub> (Ω)</Label>
                    <Input
                      type="number"
                      step="0.001"
                      value={data[phase.eKey]}
                      onChange={(e) => updateField(phase.eKey, e.target.value)}
                      placeholder="0.000"
                      dir="ltr"
                      className="text-sm"
                    />
                    <div className="rounded bg-blue-50 p-2 text-xs space-y-1">
                      <p>Isc2ph: <strong>{eCalc.isc2ph}</strong></p>
                      <p>Isc3ph: <strong>{eCalc.isc3ph}</strong></p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {is3ph && (
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-2 max-w-xs">
              <Label>Z<sub>1ph-2ph</sub> (Ω)</Label>
              <Input
                type="number"
                step="0.001"
                value={data.z_1ph_2ph}
                onChange={(e) => updateField('z_1ph_2ph', e.target.value)}
                placeholder="0.000"
                dir="ltr"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-4">
          <p className="text-sm font-medium text-blue-900 mb-2">נוסחאות חישוב:</p>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• Isc<sub>2ph</sub> = 230 / Z</p>
            <p>• Isc<sub>3ph</sub> = 1.55 × Isc<sub>2ph</sub></p>
          </div>
        </CardContent>
      </Card>

      <WizardNavButtons />
    </div>
  )
}

export default Step5FaultLoop
