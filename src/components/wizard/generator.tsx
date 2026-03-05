'use client'

import { useState, useEffect } from 'react'
import { useWizard } from '@/contexts/wizard-context'
import { WizardNavButtons } from './wizard-shell'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, XCircle, MinusCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GENERATOR_DOC_REVIEW_ITEMS, GENERATOR_VISUAL_ITEMS, type VisualCheckItem } from '@/lib/visual-check-items'
import type { GeneratorDocReview, GeneratorVisualCheck } from '@/lib/supabase/types'
import { fetchGeneratorDocItems, fetchGeneratorVisualItems } from '@/lib/lookup'
import { toast } from 'sonner'

type CheckResult = 'pass' | 'fail' | 'na' | null

interface CertData {
  id?: string
  manufacturer: string; model: string; serial_number: string
  power_rating: string; installation_location: string; panel_location: string
  supplier: string; permit_number: string
}

const defaultCert: CertData = {
  manufacturer: '', model: '', serial_number: '',
  power_rating: '', installation_location: '', panel_location: '',
  supplier: '', permit_number: '',
}

const Step8Generator = (): React.JSX.Element => {
  const { inspectionId } = useWizard()
  const [cert, setCert] = useState<CertData>(defaultCert)
  const [docChecks, setDocChecks] = useState<Record<string, { result: CheckResult; notes: string }>>({})
  const [visChecks, setVisChecks] = useState<Record<string, { result: CheckResult; notes: string }>>({})
  const [docItems, setDocItems] = useState<VisualCheckItem[]>(GENERATOR_DOC_REVIEW_ITEMS)
  const [visItems, setVisItems] = useState<VisualCheckItem[]>(GENERATOR_VISUAL_ITEMS)
  const supabase = createClient()

  useEffect(() => {
    const loadDocItems = async (): Promise<void> => {
      const items = await fetchGeneratorDocItems()
      setDocItems(items)
    }
    loadDocItems()
    const loadVisItems = async (): Promise<void> => {
      const items = await fetchGeneratorVisualItems()
      setVisItems(items)
    }
    loadVisItems()
    async function load() {
      const { data: certData } = await supabase
        .from('generator_certificates')
        .select('*').eq('inspection_id', inspectionId).single()
      if (certData) {
        setCert({
          id: certData.id,
          manufacturer: certData.manufacturer ?? '',
          model: certData.model ?? '',
          serial_number: certData.serial_number ?? '',
          power_rating: certData.power_rating ?? '',
          installation_location: certData.installation_location ?? '',
          panel_location: certData.panel_location ?? '',
          supplier: certData.supplier ?? '',
          permit_number: certData.permit_number ?? '',
        })
        // Load doc reviews
        const { data: docs } = await supabase.from('generator_doc_reviews').select('*').eq('certificate_id', certData.id)
        const docMap: Record<string, { result: CheckResult; notes: string }> = {}
        docs?.forEach((d: GeneratorDocReview) => { docMap[d.item_key] = { result: d.result as CheckResult, notes: d.notes ?? '' } })
        setDocChecks(docMap)
        // Load visual checks
        const { data: vis } = await supabase.from('generator_visual_checks').select('*').eq('certificate_id', certData.id)
        const visMap: Record<string, { result: CheckResult; notes: string }> = {}
        vis?.forEach((v: GeneratorVisualCheck) => { visMap[v.item_key] = { result: v.result as CheckResult, notes: v.notes ?? '' } })
        setVisChecks(visMap)
      }
    }
    load()
  }, [inspectionId]) // eslint-disable-line react-hooks/exhaustive-deps

  const ensureCert = async (): Promise<string> => {
    if (cert.id) return cert.id
    const { data } = await supabase
      .from('generator_certificates')
      .upsert({ inspection_id: inspectionId }, { onConflict: 'inspection_id' })
      .select('id').single()
    if (data) { setCert((c) => ({ ...c, id: data.id })); return data.id }
    throw new Error('Failed to create certificate')
  }

  const updateCertField = async (field: keyof CertData, value: string): Promise<void> => {
    setCert((c) => ({ ...c, [field]: value }))
    const certId = await ensureCert()
    await supabase.from('generator_certificates').update({ [field]: value || null }).eq('id', certId)
  }

  const updateDocCheck = async (key: string, label: string, result?: CheckResult, notes?: string): Promise<void> => {
    const prev = docChecks[key] ?? { result: null, notes: '' }
    const next = { result: result !== undefined ? result : prev.result, notes: notes !== undefined ? notes : prev.notes }
    setDocChecks((c) => ({ ...c, [key]: next }))
    const certId = await ensureCert()
    await supabase.from('generator_doc_reviews').upsert(
      { certificate_id: certId, item_key: key, item_label: label, result: next.result, notes: next.notes || null },
      { onConflict: 'certificate_id,item_key' }
    )
  }

  const updateVisCheck = async (key: string, label: string, result?: CheckResult, notes?: string): Promise<void> => {
    const prev = visChecks[key] ?? { result: null, notes: '' }
    const next = { result: result !== undefined ? result : prev.result, notes: notes !== undefined ? notes : prev.notes }
    setVisChecks((c) => ({ ...c, [key]: next }))
    const certId = await ensureCert()
    await supabase.from('generator_visual_checks').upsert(
      { certificate_id: certId, item_key: key, item_label: label, result: next.result, notes: next.notes || null },
      { onConflict: 'certificate_id,item_key' }
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">שלב 8: תעודת גנרטור</h2>

      <Card>
        <CardHeader><CardTitle className="text-base">פרטי גנרטור</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {([
            ['manufacturer', 'יצרן'],
            ['model', 'דגם'],
            ['serial_number', 'מספר סידורי'],
            ['power_rating', 'הספק'],
            ['installation_location', 'מיקום התקנה'],
            ['panel_location', 'מיקום לוח'],
            ['supplier', 'ספק'],
            ['permit_number', 'מספר היתר'],
          ] as [keyof CertData, string][]).map(([field, label]) => (
            <div key={field} className="space-y-2">
              <Label>{label}</Label>
              <Input
                value={cert[field] as string}
                onChange={(e) => updateCertField(field, e.target.value)}
                dir={['manufacturer', 'installation_location', 'panel_location', 'supplier'].includes(field) ? 'rtl' : 'ltr'}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <CheckTable
        title="טבלה 1 — בדיקת מסמכים"
        items={docItems}
        checks={docChecks}
        onUpdate={(key, label, result, notes) => updateDocCheck(key, label, result, notes)}
      />

      <CheckTable
        title="טבלה 2 — בדיקה חזותית"
        items={visItems}
        checks={visChecks}
        onUpdate={(key, label, result, notes) => updateVisCheck(key, label, result, notes)}
      />

      <WizardNavButtons />
    </div>
  )
}

export default Step8Generator

interface CheckTableProps {
  title: string
  items: { key: string; label: string; labelHe: string }[]
  checks: Record<string, { result: CheckResult; notes: string }>
  onUpdate: (key: string, label: string, result?: CheckResult, notes?: string) => void
}

const CheckTable = ({
  title,
  items,
  checks,
  onUpdate,
}: CheckTableProps): React.ReactNode => {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => {
          const check = checks[item.key] ?? { result: null, notes: '' }
          return (
            <div
              key={item.key}
              className={cn(
                'rounded border p-3 space-y-2 transition-colors',
                check.result === 'pass' && 'border-green-200 bg-green-50',
                check.result === 'fail' && 'border-red-200 bg-red-50',
                check.result === 'na' && 'border-slate-200 bg-slate-50',
                !check.result && 'border-slate-200'
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-sm">{item.labelHe}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
                <div className="flex gap-1">
                  {(['pass', 'fail', 'na'] as CheckResult[]).map((r) => {
                    const buttonIcon =
                      r === 'pass' ? <CheckCircle className="h-3.5 w-3.5" /> :
                      r === 'fail' ? <XCircle className="h-3.5 w-3.5" /> :
                      <MinusCircle className="h-3.5 w-3.5" />
                    return (
                      <Button
                        key={r}
                        size="sm"
                        variant={check.result === r ? 'default' : 'outline'}
                        className={cn(
                          'h-7 w-7 p-0',
                          r === 'pass' && check.result === 'pass' && 'bg-green-600 border-green-600',
                          r === 'fail' && check.result === 'fail' && 'bg-red-600 border-red-600',
                        )}
                        onClick={() => onUpdate(item.key, item.label, check.result === r ? null : r)}
                      >
                        {buttonIcon}
                      </Button>
                    )
                  })}
                </div>
              </div>
              <Textarea
                placeholder="הערות..."
                value={check.notes}
                onChange={(e) => onUpdate(item.key, item.label, undefined, e.target.value)}
                rows={1}
                className="text-sm resize-none"
              />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
