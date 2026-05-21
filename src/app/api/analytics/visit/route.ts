import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

const VISITOR_COOKIE = 'carsa_visitor'
const MAX_PATH_LEN = 500

export async function POST(request: Request) {
  let path = '/'
  try {
    const body = (await request.json()) as { path?: unknown }
    if (typeof body.path === 'string' && body.path.trim()) {
      path = body.path.trim().slice(0, MAX_PATH_LEN)
    }
  } catch {
    /* cuerpo vacío */
  }

  if (path.startsWith('/admin') || path.startsWith('/api')) {
    return NextResponse.json({ ok: true })
  }

  const cookieStore = await cookies()
  let visitorKey = cookieStore.get(VISITOR_COOKIE)?.value?.trim()
  const isNewVisitor = !visitorKey
  if (!visitorKey) {
    visitorKey = crypto.randomUUID()
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isCustomer = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
    isCustomer = profile?.role === 'customer'
  }

  const { error } = await supabase.from('site_visits').insert({
    path,
    visitor_key: visitorKey,
    user_id: user?.id ?? null,
    is_customer: isCustomer,
  })

  const response = NextResponse.json({ ok: !error })

  if (isNewVisitor) {
    response.cookies.set(VISITOR_COOKIE, visitorKey, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    })
  }

  return response
}
