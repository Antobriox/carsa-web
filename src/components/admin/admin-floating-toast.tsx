'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'

import { cn } from '@/lib/utils'

type ToastVariant = 'success' | 'error' | 'info'

/**
 * Aviso breve en esquina superior (estilo compacto), se oculta solo a los 5 s.
 */
export function AdminFloatingToast({
  open,
  variant,
  message,
  onDismiss,
  durationMs = 5000,
}: {
  open: boolean
  variant: ToastVariant
  message: string
  onDismiss: () => void
  /** Tiempo visible; por defecto 5 s. */
  durationMs?: number
}) {
  useEffect(() => {
    if (!open || !message.trim()) return
    const id = window.setTimeout(() => onDismiss(), durationMs)
    return () => window.clearTimeout(id)
  }, [open, message, onDismiss, durationMs])

  return (
    <AnimatePresence mode="wait">
      {open && message.trim() ? (
        <motion.div
          key={message}
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: -12, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          className={cn(
            'pointer-events-none fixed top-4 right-4 z-[200] max-w-[min(20rem,calc(100vw-2rem))]',
            'rounded-2xl border px-4 py-3 text-sm font-medium leading-snug shadow-xl shadow-black/40',
            'backdrop-blur-md',
            variant === 'success' &&
              'border-emerald-500/45 bg-emerald-950/85 text-emerald-50 ring-1 ring-emerald-500/20',
            variant === 'error' &&
              'border-destructive/50 bg-destructive/90 text-destructive-foreground ring-1 ring-destructive/25',
            variant === 'info' &&
              'border-border/80 bg-popover/95 text-popover-foreground ring-1 ring-white/10'
          )}
        >
          {message}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
