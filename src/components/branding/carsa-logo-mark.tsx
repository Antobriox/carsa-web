'use client'

import Image from 'next/image'

import { cn } from '@/lib/utils'

/** Logo CARSA (`public/Imagen/LANTITAS.png`). Reutilizable en web pública y admin. */
export function CarsaLogoMark({
  size = 10,
  className,
}: {
  /** Tamaño del contenedor en rem (9 = 36px, 10 = 40px). */
  size?: 9 | 10
  className?: string
}) {
  const px = size === 9 ? 36 : 40
  return (
    <span
      className={cn(
        'relative flex shrink-0 overflow-hidden rounded-xl bg-card/85 ring-1 ring-border/60',
        size === 9 ? 'size-9' : 'size-10',
        className
      )}
    >
      <Image
        src="/Imagen/LANTITAS.png"
        alt="CARSA"
        fill
        className="object-contain p-1.5"
        sizes={`${px}px`}
        priority
      />
    </span>
  )
}
