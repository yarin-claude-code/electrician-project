'use client'

import {
  CheckCircle2,
  CircleDot,
  Circle,
  Save,
  Wifi,
  WifiOff,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'

import dynamic from 'next/dynamic'
import { useWizard } from '@/contexts/wizard-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const StepLoader = () => <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>

const Step1GeneralInfo    = dynamic(() => import('./general-info'),      { loading: StepLoader })
const Step2VisualChecks   = dynamic(() => import('./visual-checks'),     { loading: StepLoader })
const Step3Instruments    = dynamic(() => import('./instruments'),       { loading: StepLoader })
const Step4Panels         = dynamic(() => import('./panels'),            { loading: StepLoader })
const Step5FaultLoop      = dynamic(() => import('./fault-loop'),        { loading: StepLoader })
const Step6Defects        = dynamic(() => import('./defects'),           { loading: StepLoader })
const Step7Recommendations = dynamic(() => import('./recommendations'),  { loading: StepLoader })
const Step8Generator      = dynamic(() => import('./generator'),         { loading: StepLoader })
const Step9Review         = dynamic(() => import('./review'),            { loading: StepLoader })

const ALL_STEP_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const
const STEP_NUMBERS_WITHOUT_GENERATOR = [1, 2, 3, 4, 5, 6, 7, 9] as const

const STEP_LABELS = [
  'מידע כללי',
  'בדיקה חזותית',
  'מכשירי מדידה',
  'מדידות לוח',
  'לולאת תקלה',
  'ליקויים',
  'המלצות',
  'גנרטור',
  'סיכום וחתימה',
]

const WizardShell = (): React.ReactNode => {
  const { currentStep, setCurrentStep, isSaving, isOnline, totalSteps, completionPercent, state } =
    useWizard()

  const steps = state.hasGenerator
    ? STEP_LABELS
    : STEP_LABELS.filter((_, i) => i !== 7) // Remove generator step

  const stepNumbers = state.hasGenerator
    ? ALL_STEP_NUMBERS
    : STEP_NUMBERS_WITHOUT_GENERATOR // Skip step 8 if no generator (internally map to step 9)

  const currentInternalStep = state.hasGenerator
    ? currentStep
    : currentStep <= 7 ? currentStep : 9

  const statusVariant = isOnline ? 'secondary' : 'destructive'
  const StatusIcon = isOnline ? Wifi : WifiOff
  const statusLabel = isOnline ? 'מחובר' : 'לא מחובר'

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div className="rounded-2xl border border-border bg-card shadow-[0_2px_16px_0px_oklch(0.52_0.26_268/0.10)] overflow-hidden">
        {/* Top gradient bar */}
        <div className="h-1.5 bg-gradient-to-l from-primary via-primary/70 to-secondary" />

        <div className="px-5 pt-4 pb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              {/* Step badge */}
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-sm">
                {currentStep}
              </span>
              <div>
                <p className="text-[11px] text-muted-foreground leading-none mb-0.5">שלב {currentStep} מתוך {totalSteps}</p>
                <h2 className="font-bold text-foreground text-base leading-none">
                  {steps[currentStep - 1]}
                </h2>
              </div>
              {isSaving && (
                <Badge variant="secondary" className="gap-1 text-[10px] px-2 py-0.5 animate-pulse">
                  <Save className="h-2.5 w-2.5" />
                  שומר...
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{completionPercent}%</span>
              <Badge
                variant={statusVariant}
                className="gap-1 text-[10px] px-2 py-0.5"
              >
                <StatusIcon className="h-2.5 w-2.5" />
                {statusLabel}
              </Badge>
            </div>
          </div>

          {/* Progress */}
          <div
            role="progressbar"
            aria-valuenow={completionPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`התקדמות הבדיקה: ${completionPercent}%`}
            className="relative h-2 rounded-full bg-muted overflow-hidden"
          >
            <div
              className="absolute inset-y-0 right-0 rounded-full bg-primary transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        {/* Step dots — matches stepper-style.png: circles connected by lines */}
        <div role="list" aria-label="שלבי הבדיקה" className="flex items-start justify-between px-4 pb-3 overflow-x-auto gap-1">
          {steps.map((label, idx) => {
            const step = idx + 1
            const isDone = step < currentStep
            const isCurrent = step === currentStep
            const stepIcon = isDone
              ? <CheckCircle2 className="h-4 w-4 text-primary" />
              : isCurrent
                ? <CircleDot className="h-4 w-4 text-primary-foreground" />
                : <Circle className="h-3 w-3 text-muted-foreground" />
            return (
              <button
                key={step}
                role="listitem"
                onClick={() => step < currentStep && setCurrentStep(step)}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`שלב ${step}: ${label}${isDone ? ' — הושלם' : isCurrent ? ' — נוכחי' : ''}`}
                className={cn(
                  'flex flex-col items-center gap-1 min-w-[52px] text-[10px] transition-all px-1',
                  isDone && 'cursor-pointer text-primary hover:text-primary/80',
                  isCurrent && 'text-primary font-semibold scale-105',
                  !isDone && !isCurrent && 'text-muted-foreground cursor-default'
                )}
                disabled={step >= currentStep}
              >
                <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center transition-all',
                  isDone && 'bg-secondary border border-primary/30',
                  isCurrent && 'bg-primary shadow-[0_2px_8px_0px_oklch(0.52_0.26_268/0.4)]',
                  !isDone && !isCurrent && 'bg-muted border border-border',
                )}>
                  {stepIcon}
                </div>
                <span className="hidden sm:block text-center leading-tight">{label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_2px_16px_0px_oklch(0.52_0.26_268/0.08)]">
        <StepContent internalStep={currentInternalStep} />
      </div>
    </div>
  )
}

export default WizardShell

interface StepContentProps {
  internalStep: number
}

const StepContent = ({ internalStep }: StepContentProps): React.ReactNode => {
  switch (internalStep) {
    case 1: return <Step1GeneralInfo />
    case 2: return <Step2VisualChecks />
    case 3: return <Step3Instruments />
    case 4: return <Step4Panels />
    case 5: return <Step5FaultLoop />
    case 6: return <Step6Defects />
    case 7: return <Step7Recommendations />
    case 8: return <Step8Generator />
    case 9: return <Step9Review />
    default: return null
  }
}

interface WizardNavButtonsProps {
  onNext?: () => void
  onPrev?: () => void
  nextLabel?: string
  prevLabel?: string
  nextDisabled?: boolean
  isLastStep?: boolean
}

export const WizardNavButtons = ({
  onNext,
  onPrev,
  nextLabel = 'הבא',
  prevLabel = 'הקודם',
  nextDisabled = false,
  isLastStep = false,
}: WizardNavButtonsProps): React.ReactNode => {
  const { goNext, goPrev, currentStep } = useWizard()

  return (
    <div className="flex items-center justify-between pt-6 border-t mt-6">
      <Button
        variant="outline"
        onClick={onPrev ?? goPrev}
        disabled={currentStep === 1}
        className="gap-2"
      >
        <ChevronRight className="h-4 w-4" />
        {prevLabel}
      </Button>
      {!isLastStep && (
        <Button
          onClick={onNext ?? goNext}
          disabled={nextDisabled}
          className="gap-2"
        >
          {nextLabel}
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
