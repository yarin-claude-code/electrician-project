'use client'

import { useState, useEffect } from 'react'
import { useWizard } from '@/contexts/wizard-context'
import { WizardNavButtons } from './wizard-shell'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Plus, Trash2 } from 'lucide-react'
import type { Recommendation } from '@/lib/supabase/types'

const Step7Recommendations = (): React.JSX.Element => {
  const { inspectionId } = useWizard()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const loadRecommendations = async (): Promise<void> => {
      const { data } = await supabase
        .from('recommendations').select('*').eq('inspection_id', inspectionId).order('sort_order') as { data: Recommendation[] | null }
      if (data) setRecommendations(data)
      setLoading(false)
    }
    loadRecommendations()
  }, [inspectionId]) // eslint-disable-line react-hooks/exhaustive-deps

  const add = async (): Promise<void> => {
    const { data } = await supabase
      .from('recommendations')
      .insert({ inspection_id: inspectionId, text: 'המלצה חדשה', sort_order: recommendations.length })
      .select().single()
    if (data) setRecommendations((r) => [...r, data])
  }

  const update = async (id: string, updates: Partial<Recommendation>): Promise<void> => {
    setRecommendations((r) => r.map((rec) => rec.id === id ? { ...rec, ...updates } : rec))
    await supabase.from('recommendations').update(updates).eq('id', id)
  }

  const remove = async (id: string): Promise<void> => {
    setRecommendations((r) => r.filter((rec) => rec.id !== id))
    await supabase.from('recommendations').delete().eq('id', id)
  }

  if (loading) return <div className="py-12 text-center text-muted-foreground">טוען...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">שלב 7: המלצות</h2>
        <Button onClick={add} size="sm" className="bg-blue-900 hover:bg-blue-800 gap-2">
          <Plus className="h-4 w-4" />
          הוסף המלצה
        </Button>
      </div>

      {recommendations.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
          <p>אין המלצות. לחץ &quot;הוסף המלצה&quot; להוסיף.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec, idx) => (
            <div key={rec.id} className="rounded-lg border bg-white p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">המלצה {idx + 1}</span>
                <Button
                  variant="ghost" size="sm"
                  onClick={() => remove(rec.id)}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <Label>טקסט המלצה *</Label>
                <Textarea
                  value={rec.text}
                  onChange={(e) => update(rec.id, { text: e.target.value })}
                  rows={2}
                  placeholder="תאר את ההמלצה..."
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>תגובת חשמלאי</Label>
                  <Textarea
                    value={rec.electrician_response ?? ''}
                    onChange={(e) => update(rec.id, { electrician_response: e.target.value })}
                    rows={2}
                    placeholder="תגובת חשמלאי..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>תגובת מתכנן</Label>
                  <Textarea
                    value={rec.designer_response ?? ''}
                    onChange={(e) => update(rec.id, { designer_response: e.target.value })}
                    rows={2}
                    placeholder="תגובת מתכנן..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <WizardNavButtons />
    </div>
  )
}

export default Step7Recommendations
