'use client'

import { createSupabaseBrowser } from '@/lib/supabase/client'

const BUCKET = 'product-images'

export async function uploadProductImage(params: {
  folder: 'tires' | 'batteries' | 'services' | 'promotions'
  file: File
  /** Ruta relativa dentro del bucket, p. ej. `abc-uuid.jpg` */
  objectPath: string
}) {
  const supabase = createSupabaseBrowser()
  const path = `${params.folder}/${params.objectPath}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, params.file, {
    upsert: true,
    contentType: params.file.type || undefined,
  })

  if (error) {
    return { publicUrl: null as string | null, error }
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return { publicUrl: data.publicUrl, error: null }
}
