import type { Metadata, Viewport } from 'next'
import { Geist, Heebo } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import SwRegister from '@/components/sw-register'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const heebo = Heebo({ subsets: ['hebrew', 'latin'], variable: '--font-heebo', display: 'swap' })

export const metadata: Metadata = {
  title: 'מערכת בדיקת חשמל | Electrical Inspection',
  description: 'Professional electrical installation inspection management',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'בדיקת חשמל',
  },
}

export const viewport: Viewport = {
  themeColor: '#1B3A5C',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${geist.variable} ${heebo.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Toaster richColors position="top-center" />
        <SwRegister />
      </body>
    </html>
  )
}
