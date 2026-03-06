import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import ProfileForm from '@/components/settings/profile-form'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'הגדרות פרופיל | בדיקת חשמל',
  description: 'ניהול פרטי חשמלאי, רישיון ופרטי חברה',
}

export default async function SettingsPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  let profile = { full_name: '', phone: '', license_number: '' }
  let email = ''

  if (supabaseUrl?.startsWith('http')) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')
    email = user.email ?? ''
    const { data } = await supabase
      .from('profiles')
      .select('full_name, phone, license_number')
      .eq('id', user.id)
      .single()
    if (data) {
      profile = {
        full_name: data.full_name ?? '',
        phone: data.phone ?? '',
        license_number: data.license_number ?? '',
      }
    }
  } else {
    email = 'dev@example.com'
    profile = { full_name: 'חשמלאי דמו', phone: '050-1234567', license_number: '12345' }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">הגדרות פרופיל</h1>
        <p className="mt-1 text-sm text-muted-foreground">עדכון פרטי החשמלאי, רישיון ופרטי קשר</p>
      </div>
      <ProfileForm initialProfile={profile} email={email} />
    </div>
  )
}
