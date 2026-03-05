'use client'

import { useState } from 'react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useWizard } from '@/contexts/wizard-context'
import { WizardNavButtons } from './wizard-shell'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { WizardState } from '@/contexts/wizard-context'

interface Step1Errors {
  clientName?: string
  installationType?: string
  address?: string
}

const validate = (state: WizardState): Step1Errors => {
  const errors: Step1Errors = {}
  if (!state.clientName.trim()) errors.clientName = 'שדה חובה'
  if (!state.installationType) errors.installationType = 'יש לבחור סוג מתקן'
  if (!state.address.trim()) errors.address = 'שדה חובה'
  return errors
}

const Step1GeneralInfo = (): React.JSX.Element => {
  const { state, updateState, goNext } = useWizard()
  const [errors, setErrors] = useState<Step1Errors>({})

  const handleNext = async (): Promise<void> => {
    const errs = validate(state)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    await goNext()
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">שלב 1: מידע כללי</h2>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">פרטי מתקן</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="clientName">שם לקוח *</Label>
            <Input
              id="clientName"
              value={state.clientName}
              onChange={(e) => { updateState({ clientName: e.target.value }); setErrors((prev) => ({ ...prev, clientName: undefined })) }}
              placeholder="שם מלא"
              aria-invalid={!!errors.clientName}
            />
            {errors.clientName && <p className="text-sm text-destructive mt-1" role="alert">{errors.clientName}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="installationType">סוג מתקן *</Label>
            <Select
              value={state.installationType}
              onValueChange={(v) => { updateState({ installationType: v as WizardState['installationType'] }); setErrors((prev) => ({ ...prev, installationType: undefined })) }}
            >
              <SelectTrigger id="installationType" aria-invalid={!!errors.installationType}>
                <SelectValue placeholder="בחר סוג מתקן" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="residential">מגורים</SelectItem>
                <SelectItem value="commercial">מסחרי</SelectItem>
                <SelectItem value="industrial">תעשייתי</SelectItem>
                <SelectItem value="other">אחר</SelectItem>
              </SelectContent>
            </Select>
            {errors.installationType && <p className="text-sm text-destructive mt-1" role="alert">{errors.installationType}</p>}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">כתובת *</Label>
            <Input
              id="address"
              value={state.address}
              onChange={(e) => { updateState({ address: e.target.value }); setErrors((prev) => ({ ...prev, address: undefined })) }}
              placeholder="רחוב, עיר"
              aria-invalid={!!errors.address}
            />
            {errors.address && <p className="text-sm text-destructive mt-1" role="alert">{errors.address}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="connectionSizeAmps">גודל חיבור (אמפר)</Label>
            <Input
              id="connectionSizeAmps"
              type="number"
              min={6}
              max={2000}
              value={state.connectionSizeAmps}
              onChange={(e) => updateState({ connectionSizeAmps: e.target.value })}
              placeholder="לדוגמה: 100"
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inspectionDate">תאריך בדיקה</Label>
            <Input
              id="inspectionDate"
              type="date"
              value={state.inspectionDate}
              onChange={(e) => updateState({ inspectionDate: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              dir="ltr"
            />
          </div>
          <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-4 py-3 sm:col-span-2">
            <Switch
              id="hasGenerator"
              checked={state.hasGenerator}
              onCheckedChange={(v) => updateState({ hasGenerator: v })}
            />
            <Label htmlFor="hasGenerator" className="cursor-pointer text-sm font-medium flex-1">
              כולל גנרטור (יוסיף שלב 8)
            </Label>
          </div>
        </CardContent>
      </Card>

      <PersonCard
        title="פרטי בעל המתקן"
        nameKey="ownerName"
        phoneKey="ownerPhone"
        emailKey="ownerEmail"
        state={state}
        updateState={updateState}
      />
      <PersonCard
        title="פרטי חשמלאי מבצע"
        nameKey="electricianName"
        phoneKey="electricianPhone"
        emailKey="electricianEmail"
        state={state}
        updateState={updateState}
      />
      <PersonCard
        title="פרטי מתכנן"
        nameKey="designerName"
        phoneKey="designerPhone"
        emailKey="designerEmail"
        state={state}
        updateState={updateState}
      />

      <WizardNavButtons onNext={handleNext} />
    </div>
  )
}

export default Step1GeneralInfo

interface PersonCardProps {
  title: string
  nameKey: keyof WizardState
  phoneKey: keyof WizardState
  emailKey: keyof WizardState
  state: WizardState
  updateState: (u: Partial<WizardState>) => void
}

const PersonCard = ({
  title,
  nameKey,
  phoneKey,
  emailKey,
  state,
  updateState,
}: PersonCardProps): React.ReactNode => (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor={nameKey}>שם</Label>
          <Input
            id={nameKey}
            value={state[nameKey] as string}
            onChange={(e) => updateState({ [nameKey]: e.target.value })}
            placeholder="שם מלא"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={phoneKey}>טלפון</Label>
          <Input
            id={phoneKey}
            value={state[phoneKey] as string}
            onChange={(e) => updateState({ [phoneKey]: e.target.value })}
            placeholder="05X-XXXXXXX"
            dir="ltr"
            type="tel"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={emailKey}>אימייל</Label>
          <Input
            id={emailKey}
            value={state[emailKey] as string}
            onChange={(e) => updateState({ [emailKey]: e.target.value })}
            placeholder="example@email.com"
            dir="ltr"
            type="email"
          />
        </div>
      </CardContent>
    </Card>
)
