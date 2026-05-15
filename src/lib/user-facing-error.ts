export const CATALOG_LOAD_MESSAGE =
  'No pudimos cargar el catálogo en este momento. Revisa tu conexión e inténtalo de nuevo en unos minutos.'

export const GENERIC_SAVE_ERROR =
  'No se pudieron guardar los cambios. Inténtalo nuevamente.'

export const GENERIC_DELETE_ERROR =
  'No se pudo completar la eliminación. Inténtalo nuevamente.'

export const GENERIC_LOAD_ERROR =
  'No se pudieron cargar los datos. Inténtalo nuevamente.'

/** Evita mostrar mensajes crudos de la API en la interfaz. */
export function sanitizeUserMessage(
  message: string | undefined | null,
  fallback = 'Algo salió mal. Inténtalo de nuevo.'
): string {
  const raw = (message ?? '').trim()
  if (!raw) return fallback

  const lower = raw.toLowerCase()
  const technical =
    lower.includes('supabase') ||
    lower.includes('postgres') ||
    lower.includes('row level') ||
    lower.includes('rls') ||
    lower.includes('jwt') ||
    lower.includes('bucket') ||
    lower.includes('storage') ||
    lower.includes('violates') ||
    lower.includes('permission denied') ||
    lower.includes('pgrst') ||
    lower.includes('uuid') ||
    lower.includes('duplicate key') ||
    lower.includes('foreign key')

  return technical ? fallback : raw
}
