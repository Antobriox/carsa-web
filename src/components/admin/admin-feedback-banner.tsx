import { cn } from '@/lib/utils'

export function AdminFeedbackBanner({
  variant,
  message,
}: {
  variant: 'success' | 'error' | 'info'
  message: string
}) {
  return (
    <div
      role="status"
      className={cn(
        'rounded-lg border px-3 py-2 text-sm',
        variant === 'success' &&
          'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
        variant === 'error' &&
          'border-destructive/40 bg-destructive/10 text-destructive',
        variant === 'info' && 'border-border bg-muted/30 text-muted-foreground'
      )}
    >
      {message}
    </div>
  )
}
