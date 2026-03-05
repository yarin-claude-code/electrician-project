import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const DEV_INSPECTION_ID = '00000000-0000-0000-0000-000000000001'

export default async function NewInspectionPage(): Promise<never> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url?.startsWith('http')) {
    // Dev preview — use a fixed demo ID
    redirect(`/inspections/${DEV_INSPECTION_ID}`)
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data } = await supabase
    .from('inspections')
    .insert({ inspector_id: user.id, status: 'draft' })
    .select('id')
    .single()

  if (!data) redirect('/dashboard')
  redirect(`/inspections/${(data as { id: string }).id}`)
}
