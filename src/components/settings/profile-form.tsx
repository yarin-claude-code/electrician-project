'use client'

import { useState } from 'react'
import { User, Phone, FileText, Mail, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ProfileFormProps {
  initialProfile: {
    full_name: string
    phone: string
    license_number: string
  }
  email: string
}

const ProfileForm = ({ initialProfile, email }: ProfileFormProps) => {
  const [profile, setProfile] = useState(initialProfile)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        toast.error('לא מחובר')
        return
      }
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name || null,
          phone: profile.phone || null,
          license_number: profile.license_number || null,
        })
        .eq('id', user.id)
      if (error) throw error
      toast.success('הפרופיל עודכן בהצלחה')
    } catch {
      toast.error('שגיאה בעדכון הפרופיל')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-primary" />
            פרטים אישיים
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              דוא&quot;ל
            </Label>
            <Input id="email" value={email} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">לא ניתן לשנות את כתובת הדוא&quot;ל</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="full_name" className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              שם מלא
            </Label>
            <Input
              id="full_name"
              value={profile.full_name}
              onChange={(e) => setProfile((prev) => ({ ...prev, full_name: e.target.value }))}
              placeholder="ישראל ישראלי"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              טלפון
            </Label>
            <Input
              id="phone"
              type="tel"
              dir="ltr"
              value={profile.phone}
              onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="050-1234567"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            פרטי רישיון
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="license_number" className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              מספר רישיון חשמלאי
            </Label>
            <Input
              id="license_number"
              dir="ltr"
              value={profile.license_number}
              onChange={(e) => setProfile((prev) => ({ ...prev, license_number: e.target.value }))}
              placeholder="12345"
            />
            <p className="text-xs text-muted-foreground">מספר הרישיון יופיע בדוחות PDF</p>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="gap-2">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        שמור שינויים
      </Button>
    </div>
  )
}

export default ProfileForm
