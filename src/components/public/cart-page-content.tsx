'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2 } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { useCart } from '@/context/cart-context'
import { formatMxn } from '@/lib/format'
import { cn } from '@/lib/utils'

export function CartPageContent() {
  const { lines, removeLine, setLineQuantity, subtotal, clear } = useCart()

  if (lines.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/80 bg-muted/10 px-6 py-14 text-center">
        <p className="text-sm text-muted-foreground">
          Tu carrito está vacío. Agrega llantas o baterías desde el detalle de
          cada producto.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/llantas"
            className={cn(
              buttonVariants({ size: 'lg' }),
              'bg-carsa-primary text-white hover:bg-carsa-primary-hover'
            )}
          >
            Ver llantas
          </Link>
          <Link
            href="/baterias"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'lg' }),
              'border-carsa-tertiary/50'
            )}
          >
            Ver baterías
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <ul className="space-y-4">
        {lines.map((line) => {
          const lineSum = line.unitPrice * line.quantity
          return (
            <li
              key={`${line.kind}-${line.id}`}
              className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card/50 p-4 sm:flex-row sm:items-center"
            >
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-carsa-surface/80">
                <Image
                  src={line.imageSrc}
                  alt=""
                  fill
                  className="object-contain p-2"
                  sizes="96px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-carsa-primary">
                  {line.kind === 'tire' ? 'Llanta' : 'Batería'}
                </p>
                <p className="font-medium text-foreground">{line.name}</p>
                {line.brand ? (
                  <p className="text-xs uppercase tracking-wider text-carsa-neutral">
                    {line.brand}
                  </p>
                ) : null}
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatMxn(line.unitPrice)} c/u
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:flex-col sm:items-end">
                <div
                  className={cn(
                    'inline-flex items-center rounded-xl border border-border/80 bg-background/80 p-0.5',
                    'ring-1 ring-white/[0.06]'
                  )}
                >
                  <button
                    type="button"
                    aria-label="Menos"
                    className="flex size-9 items-center justify-center rounded-lg hover:bg-muted"
                    onClick={() =>
                      setLineQuantity(line.kind, line.id, line.quantity - 1)
                    }
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="min-w-[2rem] text-center text-sm font-semibold tabular-nums">
                    {line.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Más"
                    disabled={line.quantity >= line.maxStock}
                    className="flex size-9 items-center justify-center rounded-lg hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                    onClick={() =>
                      setLineQuantity(line.kind, line.id, line.quantity + 1)
                    }
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <p className="text-lg font-semibold tabular-nums text-foreground">
                  {formatMxn(lineSum)}
                </p>
                <button
                  type="button"
                  onClick={() => removeLine(line.kind, line.id)}
                  className={cn(
                    buttonVariants({ variant: 'ghost', size: 'sm' }),
                    'text-destructive hover:bg-destructive/10 hover:text-destructive'
                  )}
                  aria-label="Quitar del carrito"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      <div className="flex flex-col gap-4 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => clear()}
          className={cn(
            buttonVariants({ variant: 'outline', size: 'sm' }),
            'self-start border-destructive/40 text-destructive hover:bg-destructive/10'
          )}
        >
          Vaciar carrito
        </button>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Total estimado
          </p>
          <p className="font-heading text-3xl font-bold tracking-tight text-foreground">
            {formatMxn(subtotal)}
          </p>
        </div>
      </div>
    </div>
  )
}
