import type { CatalogBattery, CatalogService, CatalogTire } from '@/types/catalog'

/** Imagen genérica de llanta en `public/producto/` */
export const PRODUCTO_LLANTA_IMG = '/producto/llanta.png'
/** Imagen genérica de batería en `public/producto/` */
export const PRODUCTO_BATERIA_IMG = '/producto/Bateria.png'

export function resolveTireDisplayImage(tire: CatalogTire): string {
  return tire.image_url?.trim() || ''
}

export function resolveBatteryDisplayImage(battery: CatalogBattery): string {
  return battery.image_url?.trim() || ''
}

/**
 * Para cards públicas: usar solo imagen propia del servicio.
 * Si no existe, UI renderiza placeholder neutral.
 */
export function resolveServiceDisplayImage(service: CatalogService): string {
  return service.image_url?.trim() || ''
}
