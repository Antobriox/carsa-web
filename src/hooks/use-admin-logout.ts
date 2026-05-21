'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useRef, useState } from 'react'

import { useAuth } from '@/context/auth-context'
import { devError } from '@/lib/dev-log'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { useCartStore } from '@/stores/cart-store'

export function useAdminLogout() {
  const router = useRouter()
  const { clearClientSession } = useAuth()
  const supabase = useMemo(() => createSupabaseBrowser(), [])
  const onceRef = useRef(false)
  const [busy, setBusy] = useState(false)

  const logout = async () => {
    if (onceRef.current) return
    onceRef.current = true
    setBusy(true)
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' })
      if (error) devError('[CARSA logout]', error)
      clearClientSession()
      useCartStore.getState().clearCart()
      router.replace('/')
      router.refresh()
    } catch (e) {
      devError('[CARSA logout]', e)
      clearClientSession()
      useCartStore.getState().clearCart()
      router.replace('/')
      router.refresh()
    } finally {
      setBusy(false)
      onceRef.current = false
    }
  }

  return { logout, busy }
}
