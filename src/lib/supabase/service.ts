import { createClient } from '@supabase/supabase-js'

export function hasServiceRoleKey(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim())
}

/**
 * Cliente con privilegios elevados solo en servidor (envío push, etc.).
 * Para push en producción se requiere SUPABASE_SERVICE_ROLE_KEY.
 */
export function createServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  const key = serviceKey ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) {
    throw new Error('Faltan variables de Supabase en el servidor.')
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
