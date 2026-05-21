import { type NextFetchEvent, type NextRequest } from 'next/server'

import { recordSiteVisitFromRequest } from '@/lib/analytics/record-visit-middleware'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  const { response, userId, role } = await updateSession(request)

  event.waitUntil(
    recordSiteVisitFromRequest(request, response, role, userId).catch(() => {
      /* no bloquear la respuesta */
    })
  )

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
