'use client'

import { useState, useEffect, useRef } from 'react'
import { useWizard } from '@/contexts/wizard-context'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import SignatureCanvas from 'react-signature-canvas'
import { CheckCircle2, XCircle, AlertTriangle, FileText, Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { WizardNavButtons } from './wizard-shell'

type ApprovalStatus = 'approved' | 'approved_with_recommendations' | 'rejected'

const Step9Review = (): React.JSX.Element => {
  const { inspectionId, state, isOnline } = useWizard()
  const [defectCount, setDefectCount] = useState(0)
  const [failCount, setFailCount] = useState(0)
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>('approved')
  const [signatureDate, setSignatureDate] = useState(new Date().toISOString().split('T')[0])
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const sigCanvasRef = useRef<SignatureCanvas>(null)
  const supabase = createClient()

  useEffect(() => {
    async function loadSummary() {
      const [defectsRes, failsRes, inspectionRes] = await Promise.all([
        supabase
          .from('defects')
          .select('id', { count: 'exact', head: true })
          .eq('inspection_id', inspectionId)
          .eq('resolved', false),
        supabase
          .from('visual_checks')
          .select('id', { count: 'exact', head: true })
          .eq('inspection_id', inspectionId)
          .eq('result', 'fail'),
        supabase
          .from('inspections')
          .select('approval_status, inspector_signature, status')
          .eq('id', inspectionId)
          .single(),
      ])
      setDefectCount(defectsRes.count ?? 0)
      setFailCount(failsRes.count ?? 0)
      if (inspectionRes.data?.approval_status) {
        setApprovalStatus(inspectionRes.data.approval_status as ApprovalStatus)
      }
      if (inspectionRes.data?.status === 'submitted') {
        setSubmitted(true)
      }
    }
    loadSummary()
  }, [inspectionId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-compute approval when counts change
  useEffect(() => {
    if (defectCount === 0 && failCount === 0) {
      setApprovalStatus('approved')
    } else if (defectCount > 0 || failCount > 0) {
      setApprovalStatus('approved_with_recommendations')
    }
  }, [defectCount, failCount])

  const handleGeneratePDF = async (): Promise<void> => {
    setGeneratingPdf(true)
    try {
      const res = await fetch(`/api/reports/${inspectionId}`, { method: 'POST' })
      if (!res.ok) {
        toast.error('שגיאה ביצירת הדוח')
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `inspection-${inspectionId}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('הדוח הורד בהצלחה')
    } catch {
      toast.error('שגיאה ביצירת הדוח')
    }
    setGeneratingPdf(false)
  }

  const handleSubmit = async (): Promise<void> => {
    setSubmitting(true)
    let signatureData: string | null = null
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      signatureData = sigCanvasRef.current.toDataURL('image/png')
    }

    const { error } = await supabase
      .from('inspections')
      .update({
        approval_status: approvalStatus,
        inspector_signature: signatureData,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        completion_percentage: 100,
      })
      .eq('id', inspectionId)

    if (error) {
      toast.error('שגיאה בשמירה')
    } else {
      setSubmitted(true)
      toast.success('הבדיקה הוגשה בהצלחה!')
    }
    setSubmitting(false)
  }

  const installationTypeLabel =
    state.installationType === 'residential'
      ? 'מגורים'
      : state.installationType === 'commercial'
        ? 'מסחרי'
        : 'תעשייתי'

  const generatorLabel = state.hasGenerator ? 'כן' : 'לא'

  const pdfButtonIcon = generatingPdf ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : (
    <FileText className="h-4 w-4" />
  )
  const pdfButtonLabel = generatingPdf ? 'מייצר דוח...' : 'צור דוח PDF'
  const submitButtonIcon = submitting ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : (
    <CheckCircle2 className="h-4 w-4" />
  )
  const submitButtonLabel = submitted ? 'הוגש ✓' : submitting ? 'מגיש...' : 'הגש בדיקה'

  const approvalConfig = {
    approved: { label: 'מאושר', color: 'bg-green-600', icon: <CheckCircle2 className="h-5 w-5" /> },
    approved_with_recommendations: {
      label: 'מאושר עם המלצות',
      color: 'bg-amber-500',
      icon: <AlertTriangle className="h-5 w-5" />,
    },
    rejected: { label: 'נדחה', color: 'bg-red-600', icon: <XCircle className="h-5 w-5" /> },
  }

  const current = approvalConfig[approvalStatus]

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">
        שלב {state.hasGenerator ? 9 : 8}: סיכום וחתימה
      </h2>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryCard
          label="ליקויים פתוחים"
          value={defectCount}
          color={defectCount > 0 ? 'text-red-600' : 'text-green-600'}
        />
        <SummaryCard
          label="כשלים בבדיקה חזותית"
          value={failCount}
          color={failCount > 0 ? 'text-red-600' : 'text-green-600'}
        />
        <SummaryCard label="מותקן ב" value={installationTypeLabel} color="text-slate-700" />
        <SummaryCard label="גנרטור" value={generatorLabel} color="text-slate-700" />
      </div>

      {/* Approval status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">סטטוס אישור</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            value={approvalStatus}
            onValueChange={(v) => setApprovalStatus(v as ApprovalStatus)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="approved">מאושר</SelectItem>
              <SelectItem value="approved_with_recommendations">מאושר עם המלצות</SelectItem>
              <SelectItem value="rejected">נדחה</SelectItem>
            </SelectContent>
          </Select>
          <div className={`flex items-center gap-3 rounded-lg p-4 text-white ${current.color}`}>
            {current.icon}
            <span className="text-lg font-semibold">{current.label}</span>
          </div>
        </CardContent>
      </Card>

      {/* Signature */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">חתימה דיגיטלית</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>תאריך</Label>
            <Input
              type="date"
              value={signatureDate}
              onChange={(e) => setSignatureDate(e.target.value)}
              className="max-w-xs"
              dir="ltr"
            />
          </div>
          <div className="rounded border-2 border-dashed border-slate-300 bg-white">
            <SignatureCanvas
              ref={sigCanvasRef}
              penColor="navy"
              canvasProps={{
                width: 600,
                height: 200,
                className: 'w-full touch-none rounded',
                role: 'img',
                'aria-label': 'אזור חתימה דיגיטלית — צייר את חתימתך כאן',
                tabIndex: 0,
              }}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => sigCanvasRef.current?.clear()}
            aria-label="נקה את החתימה הדיגיטלית"
          >
            נקה חתימה
          </Button>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={handleGeneratePDF}
          disabled={generatingPdf}
          className="gap-2"
        >
          {pdfButtonIcon}
          {pdfButtonLabel}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={submitting || submitted || !isOnline}
          title={!isOnline ? 'לא ניתן להגיש במצב לא מקוון' : undefined}
          className="gap-2 bg-blue-900 hover:bg-blue-800"
        >
          {submitButtonIcon}
          {submitButtonLabel}
        </Button>
      </div>

      <WizardNavButtons isLastStep />
    </div>
  )
}

export default Step9Review

interface SummaryCardProps {
  label: string
  value: string | number
  color: string
}

const SummaryCard = ({ label, value, color }: SummaryCardProps): React.ReactNode => (
  <Card>
    <CardContent className="pt-4 pb-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
    </CardContent>
  </Card>
)
