'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

function shouldTrack(pathname: string): boolean {
  if (pathname.startsWith('/admin')) return false
  if (pathname.startsWith('/api')) return false
  if (pathname.startsWith('/_next')) return false
  return true
}

/** Respaldo en cliente si el middleware no registró la visita. */
export function SiteVisitTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname || !shouldTrack(pathname)) return

    void fetch('/api/analytics/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ path: pathname }),
    }).catch(() => {
      /* sin bloquear la UI */
    })
  }, [pathname])

  return null
}
