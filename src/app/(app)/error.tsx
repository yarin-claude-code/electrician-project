'use client'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ reset }: Props): React.ReactElement {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-4">
      <p className="font-medium text-destructive">אירעה שגיאה</p>
      <button
        onClick={reset}
        className="text-sm text-muted-foreground underline hover:text-foreground"
      >
        נסה שוב
      </button>
    </div>
  )
}
