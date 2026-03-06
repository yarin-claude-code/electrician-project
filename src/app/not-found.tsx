import Link from 'next/link'

export default function NotFound(): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold text-foreground">404</h1>
      <p className="text-muted-foreground">הדף שחיפשת לא נמצא</p>
      <Link href="/dashboard" className="text-sm text-primary hover:underline">
        חזרה ללוח הבקרה
      </Link>
    </div>
  )
}
