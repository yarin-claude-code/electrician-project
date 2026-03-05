'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function duplicateInspection(inspectionId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Fetch the source inspection
  const { data: source } = await supabase
    .from('inspections')
    .select('*')
    .eq('id', inspectionId)
    .single()

  if (!source) redirect('/dashboard')

  // Create new inspection with copied general info
  const { data: newInspection } = await supabase
    .from('inspections')
    .insert({
      inspector_id: user.id,
      status: 'draft',
      client_name: source.client_name,
      installation_type: source.installation_type,
      address: source.address,
      connection_size_amps: source.connection_size_amps,
      owner_name: source.owner_name,
      owner_phone: source.owner_phone,
      owner_email: source.owner_email,
      electrician_name: source.electrician_name,
      electrician_phone: source.electrician_phone,
      electrician_email: source.electrician_email,
      designer_name: source.designer_name,
      designer_phone: source.designer_phone,
      designer_email: source.designer_email,
      has_generator: source.has_generator,
    })
    .select('id')
    .single()

  if (!newInspection) redirect('/dashboard')
  redirect(`/inspections/${(newInspection as { id: string }).id}`)
}

export async function deleteInspection(inspectionId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // CASCADE delete handles all related tables
  await supabase.from('inspections').delete().eq('id', inspectionId).eq('inspector_id', user.id)

  revalidatePath('/dashboard')
}
