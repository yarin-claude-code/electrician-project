'use client'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ reset }: Props): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <p className="text-destructive font-medium">אירעה שגיאה</p>
      <button onClick={reset} className="text-sm text-muted-foreground underline hover:text-foreground">
        נסה שוב
      </button>
    </div>
  )
}
