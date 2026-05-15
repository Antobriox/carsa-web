'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { Bell, CheckCheck, Loader2, ShoppingBag } from 'lucide-react'

import { AdminFloatingToast } from '@/components/admin/admin-floating-toast'
import { AdminPushNotifications } from '@/components/admin/admin-push-notifications'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/context/auth-context'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { AdminNotification } from '@/types/admin-notifications'

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat('es-MX', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return ''
  }
}

function notificationHref(n: AdminNotification): string {
  if (n.order_id) return `/admin/pedidos/${n.order_id}`
  return '/admin/pedidos'
}

export function AdminNotifications() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const instanceId = useId().replace(/:/g, '')
  const isAdmin = profile?.role === 'admin'

  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const seenIdsRef = useRef<Set<string>>(new Set())
  const initialLoadDoneRef = useRef(false)

  const userId = user?.id

  const load = useCallback(async () => {
    if (!userId || !isAdmin) return

    const supabase = createSupabaseBrowser()

    const [notifRes, readsRes] = await Promise.all([
      supabase
        .from('admin_notifications')
        .select(
          'id, type, order_id, title, message, payload, is_active, created_at'
        )
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(30),
      supabase
        .from('admin_notification_reads')
        .select('notification_id')
        .eq('user_id', userId),
    ])

    const rows = (notifRes.data ?? []) as AdminNotification[]
    const readSet = new Set(
      (readsRes.data ?? []).map((r) => r.notification_id as string)
    )

    setNotifications(rows)
    setReadIds(readSet)

    if (!initialLoadDoneRef.current) {
      rows.forEach((n) => seenIdsRef.current.add(n.id))
      initialLoadDoneRef.current = true
    }

    setLoading(false)
  }, [userId, isAdmin])

  useEffect(() => {
    if (authLoading) return
    if (!isAdmin || !userId) {
      queueMicrotask(() => setLoading(false))
      return
    }
    queueMicrotask(() => {
      void load()
    })
  }, [authLoading, isAdmin, userId, load])

  useEffect(() => {
    if (!isAdmin || !userId) return

    const supabase = createSupabaseBrowser()

    const channel = supabase
      .channel(`admin-notifications-${instanceId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_notifications',
        },
        (payload) => {
          const row = payload.new as AdminNotification
          if (!row?.id || row.is_active === false) return
          if (seenIdsRef.current.has(row.id)) return

          seenIdsRef.current.add(row.id)
          setNotifications((prev) => {
            if (prev.some((n) => n.id === row.id)) return prev
            return [row, ...prev].slice(0, 30)
          })

          setToastMessage(
            row.title?.trim()
              ? `${row.title}${row.message?.trim() ? ` — ${row.message}` : ''}`
              : row.message?.trim() || 'Tienes un aviso nuevo'
          )
          setToastOpen(true)
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [instanceId, isAdmin, userId])

  const unreadCount = useMemo(
    () => notifications.filter((n) => !readIds.has(n.id)).length,
    [notifications, readIds]
  )

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!userId || readIds.has(notificationId)) return

      setReadIds((prev) => new Set(prev).add(notificationId))

      const supabase = createSupabaseBrowser()
      const { error } = await supabase.from('admin_notification_reads').insert({
        notification_id: notificationId,
        user_id: userId,
        read_at: new Date().toISOString(),
      })

      if (error) {
        setReadIds((prev) => {
          const next = new Set(prev)
          next.delete(notificationId)
          return next
        })
      }
    },
    [userId, readIds]
  )

  const markAllRead = useCallback(async () => {
    if (!userId) return
    const unread = notifications.filter((n) => !readIds.has(n.id))
    if (!unread.length) return

    const next = new Set(readIds)
    unread.forEach((n) => next.add(n.id))
    setReadIds(next)

    const supabase = createSupabaseBrowser()
    const { error } = await supabase.from('admin_notification_reads').insert(
      unread.map((n) => ({
        notification_id: n.id,
        user_id: userId,
        read_at: new Date().toISOString(),
      }))
    )

    if (error) {
      void load()
    }
  }, [userId, notifications, readIds, load])

  if (authLoading || !isAdmin) return null

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="relative shrink-0 rounded-xl text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              aria-label={
                unreadCount > 0
                  ? `Notificaciones, ${unreadCount} sin leer`
                  : 'Notificaciones'
              }
            >
              <Bell className="size-5" aria-hidden />
              {unreadCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex min-w-[1.125rem] items-center justify-center rounded-full bg-carsa-primary px-1 text-[0.625rem] font-bold leading-none text-white ring-2 ring-background">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              ) : null}
            </Button>
          }
        />

        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-[min(22rem,calc(100vw-2rem))] border-border/70 bg-popover/95 p-0 shadow-xl shadow-black/30 backdrop-blur-md"
        >
          <div className="flex items-center justify-between gap-2 border-b border-border/60 px-3 py-2.5">
            <p className="text-sm font-semibold text-foreground">Notificaciones</p>
            {unreadCount > 0 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1 px-2 text-xs text-muted-foreground"
                onClick={() => void markAllRead()}
              >
                <CheckCheck className="size-3.5" aria-hidden />
                Marcar leídas
              </Button>
            ) : null}
          </div>

          <DropdownMenuGroup className="max-h-[min(20rem,50vh)] overflow-y-auto p-1">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Cargando…
              </div>
            ) : notifications.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                No hay avisos por ahora.
              </p>
            ) : (
              notifications.map((n) => {
                const unread = !readIds.has(n.id)
                return (
                  <DropdownMenuItem
                    key={n.id}
                    className={cn(
                      'cursor-pointer gap-3 rounded-lg px-3 py-2.5',
                      unread && 'bg-carsa-primary/5'
                    )}
                    onClick={() => {
                      void markAsRead(n.id)
                      setMenuOpen(false)
                      router.push(notificationHref(n))
                    }}
                  >
                    <span
                      className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-lg',
                        unread
                          ? 'bg-carsa-primary/15 text-carsa-primary'
                          : 'bg-muted/50 text-muted-foreground'
                      )}
                    >
                      <ShoppingBag className="size-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          'block text-sm leading-snug',
                          unread
                            ? 'font-semibold text-foreground'
                            : 'font-medium text-foreground/90'
                        )}
                      >
                        {n.title}
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                        {n.message}
                      </span>
                      <span className="mt-1 block text-[0.65rem] text-muted-foreground/80">
                        {formatWhen(n.created_at)}
                      </span>
                    </span>
                    {unread ? (
                      <span
                        className="size-2 shrink-0 rounded-full bg-carsa-primary"
                        aria-hidden
                      />
                    ) : null}
                  </DropdownMenuItem>
                )
              })
            )}
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="my-0" />
          <div className="space-y-2 px-3 py-3">
            <AdminPushNotifications />
            <Link
              href="/admin/pedidos"
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'sm' }),
                'h-8 w-full justify-center text-xs text-muted-foreground'
              )}
              onClick={() => setMenuOpen(false)}
            >
              Ver todos los pedidos
            </Link>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <AdminFloatingToast
        open={toastOpen}
        variant="info"
        message={toastMessage}
        onDismiss={() => setToastOpen(false)}
        durationMs={7000}
      />
    </>
  )
}
