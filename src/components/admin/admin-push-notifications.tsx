'use client'

import { useCallback, useEffect, useState } from 'react'
import { BellRing, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { registerBrowserPush } from '@/lib/push/register-browser-push'
import { cn } from '@/lib/utils'

type PushUiState = 'idle' | 'loading' | 'active' | 'blocked' | 'unsupported'

const reasonMessage: Record<string, string> = {
  config:
    'La clave VAPID pública no es válida o está incompleta. Regenera el par en .env.local (npx web-push generate-vapid-keys), reinicia npm run dev e inténtalo de nuevo.',
  register: 'No se pudo registrar este dispositivo. Vuelve a intentar.',
  denied: 'Las notificaciones están bloqueadas en el navegador.',
  unsupported: 'Tu navegador no admite notificaciones push.',
}

export function AdminPushNotifications({ className }: { className?: string }) {
  const [uiState, setUiState] = useState<PushUiState>('loading')
  const [message, setMessage] = useState<string | null>(null)

  const sync = useCallback(async () => {
    setMessage(null)

    if (
      typeof window !== 'undefined' &&
      (!('Notification' in window) || !('serviceWorker' in navigator))
    ) {
      setUiState('unsupported')
      return
    }

    setUiState('loading')

    const result = await registerBrowserPush()

    if (result.ok) {
      setUiState('active')
      return
    }

    if (result.reason === 'denied') {
      setUiState('blocked')
      return
    }
    if (result.reason === 'unsupported') {
      setUiState('unsupported')
      return
    }

    setUiState('idle')
    setMessage(reasonMessage[result.reason] ?? reasonMessage.register)
  }, [])

  useEffect(() => {
    queueMicrotask(() => {
      if (
        typeof window === 'undefined' ||
        !('Notification' in window) ||
        !('serviceWorker' in navigator)
      ) {
        setUiState('unsupported')
        return
      }
      if (Notification.permission === 'denied') {
        setUiState('blocked')
        return
      }
      if (Notification.permission === 'granted') {
        void sync()
        return
      }
      setUiState('idle')
    })
  }, [sync])

  if (uiState === 'unsupported') {
    return (
      <p className={cn('text-xs text-muted-foreground', className)}>
        {reasonMessage.unsupported}
      </p>
    )
  }

  if (uiState === 'blocked') {
    return (
      <p className={cn('text-xs text-muted-foreground', className)}>
        {reasonMessage.denied}
      </p>
    )
  }

  if (uiState === 'loading') {
    return (
      <p
        className={cn(
          'flex items-center justify-center gap-2 py-1 text-xs text-muted-foreground',
          className
        )}
      >
        <Loader2 className="size-3.5 animate-spin" aria-hidden />
        Comprobando notificaciones…
      </p>
    )
  }

  if (uiState === 'active') {
    return (
      <div className={cn('space-y-2', className)}>
        <p className="flex items-center gap-2 text-xs font-medium text-emerald-400/90">
          <BellRing className="size-3.5 shrink-0" aria-hidden />
          Notificaciones activadas en este dispositivo
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-full text-xs text-muted-foreground"
          onClick={() => void sync()}
        >
          Volver a sincronizar
        </Button>
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 w-full border-border/70 bg-card/40 text-xs"
        onClick={() => void sync()}
      >
        <BellRing className="size-3.5" aria-hidden />
        Activar notificaciones
      </Button>
      {message ? (
        <p className="text-xs text-muted-foreground">{message}</p>
      ) : null}
    </div>
  )
}
