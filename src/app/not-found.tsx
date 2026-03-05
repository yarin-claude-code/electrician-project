import Link from 'next/link'

export default function NotFound(): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-4xl font-bold text-foreground">404</h1>
      <p className="text-muted-foreground">הדף שחיפשת לא נמצא</p>
      <Link href="/dashboard" className="text-primary hover:underline text-sm">
        חזרה ללוח הבקרה
      </Link>
    </div>
  )
}
