import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

import type { ProfileRole } from '@/types/auth'

const VISITOR_COOKIE = 'carsa_visitor'

function shouldTrackPath(pathname: string): boolean {
  if (pathname.startsWith('/admin')) return false
  if (pathname.startsWith('/api')) return false
  if (pathname.startsWith('/auth')) return false
  if (pathname.startsWith('/_next')) return false
  return true
}

function isDocumentNavigation(request: NextRequest): boolean {
  if (request.method !== 'GET') return false
  const dest = request.headers.get('sec-fetch-dest')
  if (dest) return dest === 'document'
  const accept = request.headers.get('accept') ?? ''
  return accept.includes('text/html')
}

/** Registra visita en el servidor (más fiable que solo el navegador). */
export async function recordSiteVisitFromRequest(
  request: NextRequest,
  response: NextResponse,
  role: ProfileRole | null,
  userId: string | null
): Promise<void> {
  const pathname = request.nextUrl.pathname
  if (!shouldTrackPath(pathname) || !isDocumentNavigation(request)) return

  let visitorKey = request.cookies.get(VISITOR_COOKIE)?.value?.trim()
  const isNewVisitor = !visitorKey
  if (!visitorKey) {
    visitorKey = crypto.randomUUID()
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const isCustomer = role === 'customer'

  await supabase.from('site_visits').insert({
    path: pathname,
    visitor_key: visitorKey,
    user_id: userId,
    is_customer: isCustomer,
  })

  if (isNewVisitor) {
    response.cookies.set(VISITOR_COOKIE, visitorKey, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    })
  }
}
