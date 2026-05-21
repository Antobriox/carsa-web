'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useCallback, useState } from 'react'

import { useAuth } from '@/context/auth-context'
import type { AddCartItemInput } from '@/stores/cart-store'
import { useCartStore } from '@/stores/cart-store'

export function useCatalogCartAdd() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, profile, loading } = useAuth()
  const addItem = useCartStore((s) => s.addItem)
  const [adminNotice, setAdminNotice] = useState<string | null>(null)

  const dismissAdminNotice = useCallback(() => setAdminNotice(null), [])

  const tryAddToCart = useCallback(
    (input: AddCartItemInput, onAdded?: () => void) => {
      setAdminNotice(null)
      if (loading) return

      if (!user) {
        const next = pathname && pathname !== '/' ? pathname : '/llantas'
        router.push(`/login?next=${encodeURIComponent(next)}`)
        return
      }

      if (profile?.role === 'admin') {
        setAdminNotice(
          'El administrador gestiona productos desde el panel administrativo.'
        )
        return
      }

      if (profile?.role !== 'customer') {
        router.push('/cuenta')
        return
      }

      addItem(input)
      onAdded?.()
    },
    [addItem, loading, pathname, profile?.role, router, user]
  )

  return { tryAddToCart, adminNotice, dismissAdminNotice, authLoading: loading }
}
