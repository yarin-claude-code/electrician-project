'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react'
import { saveDraft, loadDraft } from '@/lib/idb'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export type InstallationType = 'residential' | 'commercial' | 'industrial' | 'other'

export interface WizardState {
  // Step 1
  clientName: string
  installationType: InstallationType | ''
  address: string
  connectionSizeAmps: string
  ownerName: string
  ownerPhone: string
  ownerEmail: string
  electricianName: string
  electricianPhone: string
  electricianEmail: string
  designerName: string
  designerPhone: string
  designerEmail: string
  hasGenerator: boolean
  inspectionDate: string
}

const defaultState: WizardState = {
  clientName: '',
  installationType: '',
  address: '',
  connectionSizeAmps: '',
  ownerName: '',
  ownerPhone: '',
  ownerEmail: '',
  electricianName: '',
  electricianPhone: '',
  electricianEmail: '',
  designerName: '',
  designerPhone: '',
  designerEmail: '',
  hasGenerator: false,
  inspectionDate: new Date().toISOString().split('T')[0],
}

interface WizardContextType {
  inspectionId: string
  currentStep: number
  setCurrentStep: (step: number) => void
  state: WizardState
  updateState: (updates: Partial<WizardState>) => void
  isSaving: boolean
  isOnline: boolean
  totalSteps: number
  completionPercent: number
  goNext: () => Promise<void>
  goPrev: () => void
}

const WizardContext = createContext<WizardContextType | null>(null)

export const useWizard = (): WizardContextType => {
  const ctx = useContext(WizardContext)
  if (!ctx) throw new Error('useWizard must be used inside WizardProvider')
  return ctx
}

interface WizardProviderProps {
  inspectionId: string
  initialData?: Partial<WizardState>
  children: ReactNode
}

export const WizardProvider = ({
  inspectionId,
  initialData,
  children,
}: WizardProviderProps): React.ReactNode => {
  const [currentStep, setCurrentStep] = useState(1)
  const [state, setState] = useState<WizardState>({ ...defaultState, ...initialData })
  const [isSaving, setIsSaving] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isOnlineRef = useRef(true)

  const totalSteps = state.hasGenerator ? 9 : 8

  // Compute completion %
  const completionPercent = Math.round(((currentStep - 1) / totalSteps) * 100)

  // Online status
  useEffect(() => {
    setIsOnline(navigator.onLine)
    isOnlineRef.current = navigator.onLine
    const on = () => {
      setIsOnline(true)
      isOnlineRef.current = true
    }
    const off = () => {
      setIsOnline(false)
      isOnlineRef.current = false
    }
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  // Load draft on mount
  useEffect(() => {
    const load = async (): Promise<void> => {
      const draft = await loadDraft(inspectionId)
      if (draft) {
        setState((prev) => ({ ...prev, ...(draft as Partial<WizardState>) }))
      }
    }
    void load()
  }, [inspectionId])

  const persistState = useCallback(
    async (newState: WizardState) => {
      setIsSaving(true)
      // Always save to IndexedDB
      await saveDraft(inspectionId, newState as unknown as Record<string, unknown>)

      // Sync to Supabase if online (use ref to avoid stale closure)
      if (isOnlineRef.current) {
        const supabase = createClient()
        await supabase
          .from('inspections')
          .update({
            client_name: newState.clientName || null,
            installation_type: newState.installationType || null,
            address: newState.address || null,
            connection_size_amps: newState.connectionSizeAmps
              ? parseInt(newState.connectionSizeAmps)
              : null,
            owner_name: newState.ownerName || null,
            owner_phone: newState.ownerPhone || null,
            owner_email: newState.ownerEmail || null,
            electrician_name: newState.electricianName || null,
            electrician_phone: newState.electricianPhone || null,
            electrician_email: newState.electricianEmail || null,
            designer_name: newState.designerName || null,
            designer_phone: newState.designerPhone || null,
            designer_email: newState.designerEmail || null,
            has_generator: newState.hasGenerator,
            inspection_date: newState.inspectionDate || null,
            status: 'in_progress',
          })
          .eq('id', inspectionId)
      }
      setIsSaving(false)
    },
    [inspectionId]
  )

  const updateState = useCallback(
    (updates: Partial<WizardState>) => {
      setState((prev) => {
        const next = { ...prev, ...updates }
        // Debounce auto-save every 10 seconds
        if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
        autoSaveTimer.current = setTimeout(() => {
          const save = async (): Promise<void> => {
            try {
              await persistState(next)
            } catch {
              toast.error('שגיאה בשמירה אוטומטית')
            }
          }
          void save()
        }, 10000)
        return next
      })
    },
    [persistState]
  )

  const goNext = useCallback(async (): Promise<void> => {
    try {
      await persistState(state)
    } catch {
      toast.error('שגיאה בשמירה')
    }
    setCurrentStep((s) => Math.min(s + 1, totalSteps))
  }, [state, totalSteps, persistState])

  const goPrev = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 1))
  }, [])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    }
  }, [])

  const contextValue = useMemo(
    () => ({
      inspectionId,
      currentStep,
      setCurrentStep,
      state,
      updateState,
      isSaving,
      isOnline,
      totalSteps,
      completionPercent,
      goNext,
      goPrev,
    }),
    [
      inspectionId,
      currentStep,
      state,
      updateState,
      isSaving,
      isOnline,
      totalSteps,
      completionPercent,
      goNext,
      goPrev,
    ]
  )

  return <WizardContext.Provider value={contextValue}>{children}</WizardContext.Provider>
}
