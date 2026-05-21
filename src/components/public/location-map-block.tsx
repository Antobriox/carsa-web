import { MapPin } from 'lucide-react'

import {
  CARSA_ADDRESS,
  CARSA_GOOGLE_MAPS_URL,
  CARSA_MAPS_EMBED_URL,
} from '@/lib/carsa-location'
import { cn } from '@/lib/utils'

const mapsLinkProps = {
  href: CARSA_GOOGLE_MAPS_URL,
  target: '_blank' as const,
  rel: 'noopener noreferrer' as const,
}

type LocationMapBlockProps = {
  showEmbed?: boolean
  className?: string
}

export function LocationMapBlock({
  showEmbed = true,
  className,
}: LocationMapBlockProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-start gap-2 text-carsa-neutral">
        <MapPin
          className="mt-0.5 size-4 shrink-0 text-carsa-primary"
          aria-hidden
        />
        <div className="min-w-0">
          <p className="font-medium text-carsa-canvas">Ubicación</p>
          <a
            {...mapsLinkProps}
            className="mt-1 block text-sm leading-relaxed text-carsa-neutral transition hover:text-carsa-canvas hover:underline"
          >
            {CARSA_ADDRESS}
          </a>
        </div>
      </div>

      {showEmbed ? (
        <a
          {...mapsLinkProps}
          className="group block overflow-hidden rounded-xl border border-carsa-tertiary/25 bg-carsa-surface/40 shadow-inner shadow-black/20 ring-0 transition hover:border-carsa-primary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-carsa-primary"
          aria-label="Abrir ubicación de CARSA en Google Maps"
        >
          <div className="relative overflow-hidden bg-[#1c1c1c]">
            <iframe
              title="Vista previa de la ubicación de CARSA"
              src={CARSA_MAPS_EMBED_URL}
              className="pointer-events-none h-44 w-full scale-[1.04] border-0 opacity-95 [filter:invert(1)_hue-rotate(185deg)_saturate(0.65)_brightness(0.82)_contrast(1.08)] sm:h-52"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-b from-carsa-secondary/25 via-transparent to-carsa-secondary/50"
              aria-hidden
            />
          </div>
          <p className="border-t border-carsa-tertiary/20 bg-carsa-secondary/80 px-3 py-2 text-center text-xs text-carsa-neutral transition group-hover:text-carsa-canvas">
            Toca el mapa para abrir en Google Maps
          </p>
        </a>
      ) : null}
    </div>
  )
}
