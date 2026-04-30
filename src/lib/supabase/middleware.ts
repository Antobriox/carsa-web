import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

import type { ProfileRole } from '@/types/auth'

/**
 * Copia cookies de sesión Supabase a una respuesta de redirección
 * (evita perder el refresh del token al hacer redirect).
 */
function redirectPreservingSessionCookies(
  to: URL,
  sessionResponse: NextResponse
): NextResponse {
  const redirectResponse = NextResponse.redirect(to)

  const setCookies = sessionResponse.headers.getSetCookie?.()
  if (setCookies?.length) {
    for (const c of setCookies) {
      redirectResponse.headers.append('Set-Cookie', c)
    }
  } else {
    sessionResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
  }

  for (const name of ['cache-control', 'expires', 'pragma'] as const) {
    const v = sessionResponse.headers.get(name)
    if (v) redirectResponse.headers.set(name, v)
  }

  return redirectResponse
}

function isAdminPath(pathname: string): boolean {
  return pathname === '/admin' || pathname.startsWith('/admin/')
}

/**
 * Refresca la sesión de Supabase y aplica reglas de rol (admin vs público).
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
          if (headers) {
            Object.entries(headers).forEach(([key, value]) => {
              supabaseResponse.headers.set(key, value)
            })
          }
        },
      },
    }
  )

  const pathname = request.nextUrl.pathname

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const skipRoleLookup =
    pathname.startsWith('/api') || pathname.startsWith('/auth/callback')

  let role: ProfileRole | null = null
  if (user && !skipRoleLookup) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
    role = (profile?.role as ProfileRole | undefined) ?? null
  }

  const isAdmin = role === 'admin'

  if (skipRoleLookup) {
    return supabaseResponse
  }

  if (isAdmin && !isAdminPath(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    url.search = ''
    return redirectPreservingSessionCookies(url, supabaseResponse)
  }

  if (isAdminPath(pathname)) {
    if (!user) {
      const login = new URL('/login', request.nextUrl.origin)
      login.searchParams.set('next', pathname + request.nextUrl.search)
      return redirectPreservingSessionCookies(login, supabaseResponse)
    }
    if (!isAdmin) {
      const cuenta = new URL('/cuenta', request.nextUrl.origin)
      cuenta.searchParams.set('admin', 'forbidden')
      return redirectPreservingSessionCookies(cuenta, supabaseResponse)
    }
  }

  return supabaseResponse
}
