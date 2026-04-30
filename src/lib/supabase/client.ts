import { createBrowserClient } from '@supabase/ssr'

/**
 * Cliente Supabase para componentes del navegador (auth, listeners).
 * Usa cookies vía @supabase/ssr para alinear sesión con el servidor.
 */
export function createSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}

