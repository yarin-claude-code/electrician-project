import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'כניסה | מערכת בדיקת חשמל',
  description: 'כניסה והרשמה למערכת בדיקת חשמל מקצועית',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children
}
