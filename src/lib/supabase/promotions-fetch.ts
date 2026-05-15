import { createClient } from '@/lib/supabase/server'

import type { PopupPromotion } from '@/types/promotions'

const popupSelect = `
  id,
  title,
  image_url
` as const

export async function fetchActivePopupPromotions() {
  const supabase = await createClient()
  return supabase
    .from('promotions')
    .select(popupSelect)
    .eq('is_active', true)
    .eq('is_popup', true)
    .order('created_at', { ascending: false })
}

export function asPopupPromotionList(
  data: unknown
): PopupPromotion[] {
  if (!Array.isArray(data)) return []
  return data
    .map((row) => {
      if (!row || typeof row !== 'object') return null
      const r = row as Record<string, unknown>
      const imageUrl =
        typeof r.image_url === 'string' ? r.image_url.trim() : ''
      if (!imageUrl) return null
      return {
        id: String(r.id ?? ''),
        title: typeof r.title === 'string' ? r.title : null,
        image_url: imageUrl,
      } satisfies PopupPromotion
    })
    .filter((p): p is PopupPromotion => Boolean(p?.id))
}
