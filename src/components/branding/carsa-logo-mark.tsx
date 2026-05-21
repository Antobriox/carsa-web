'use client'

import Image from 'next/image'

import { cn } from '@/lib/utils'

const SIZE_CLASS = {
  9: 'size-9',
  10: 'size-10',
  11: 'size-11',
  12: 'size-12',
  14: 'size-14',
  16: 'size-16',
  20: 'size-20',
} as const

const SIZE_PX = {
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
} as const

/** Logo CARSA (`public/Imagen/LANTITAS.png`). Reutilizable en web pública y admin. */
export function CarsaLogoMark({
  size = 10,
  variant = 'boxed',
  className,
}: {
  /** Tamaño del contenedor (9 = 36px … 20 = 80px). También puedes usar `className="size-24"`. */
  size?: 9 | 10 | 11 | 12 | 14 | 16 | 20
  /** `plain` = solo el muñeco, sin recuadro. */
  variant?: 'boxed' | 'plain'
  className?: string
}) {
  const px = SIZE_PX[size]
  return (
    <span
      className={cn(
        'relative flex shrink-0',
        SIZE_CLASS[size],
        variant === 'boxed' &&
          'overflow-hidden rounded-xl bg-card/85 ring-1 ring-border/60',
        variant === 'plain' && 'overflow-visible',
        className
      )}
    >
      <Image
        src="/Imagen/LANTITAS.png"
        alt="CARSA"
        fill
        className={cn(
          'object-contain',
          variant === 'boxed' ? 'p-1.5' : 'object-bottom p-0'
        )}
        sizes={`${px}px`}
        priority
      />
    </span>
  )
}
