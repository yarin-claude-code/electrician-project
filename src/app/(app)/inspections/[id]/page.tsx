import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { WizardProvider } from '@/contexts/wizard-context'
import WizardShell from '@/components/wizard/wizard-shell'
import type { WizardState } from '@/contexts/wizard-context'
import type { Inspection } from '@/lib/supabase/types'

const DEV_INSPECTION_ID = '00000000-0000-0000-0000-000000000001'

export default async function InspectionPage({ params }: { params: Promise<{ id: string }> }): Promise<React.ReactElement> {
  const { id } = await params
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  // Dev preview mode — render wizard with empty initial data
  if (!supabaseUrl?.startsWith('http')) {
    return (
      <WizardProvider inspectionId={DEV_INSPECTION_ID} initialData={{}}>
        <WizardShell />
      </WizardProvider>
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: inspection } = await supabase
    .from('inspections')
    .select('*')
    .eq('id', id)
    .eq('inspector_id', user.id)
    .single() as { data: Inspection | null; error: unknown }
  if (!inspection) notFound()

  const initialData: Partial<WizardState> = {
    clientName: inspection.client_name ?? '',
    installationType: inspection.installation_type ?? '',
    address: inspection.address ?? '',
    connectionSizeAmps: inspection.connection_size_amps ? String(inspection.connection_size_amps) : '',
    ownerName: inspection.owner_name ?? '',
    ownerPhone: inspection.owner_phone ?? '',
    ownerEmail: inspection.owner_email ?? '',
    electricianName: inspection.electrician_name ?? '',
    electricianPhone: inspection.electrician_phone ?? '',
    electricianEmail: inspection.electrician_email ?? '',
    designerName: inspection.designer_name ?? '',
    designerPhone: inspection.designer_phone ?? '',
    designerEmail: inspection.designer_email ?? '',
    hasGenerator: inspection.has_generator ?? false,
    inspectionDate: inspection.inspection_date ?? new Date().toISOString().split('T')[0],
  }

  return (
    <WizardProvider inspectionId={id} initialData={initialData}>
      <WizardShell />
    </WizardProvider>
  )
}
