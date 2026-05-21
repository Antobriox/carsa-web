'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { Loader2, Minus, Plus, Trash2 } from 'lucide-react'

import { submitCartOrder } from '@/app/carrito/actions'
import { ProfilePhoneForm } from '@/components/auth/profile-phone-form'
import { sanitizeUserMessage } from '@/lib/user-facing-error'
import { buttonVariants } from '@/components/ui/button'
import { useAuth } from '@/context/auth-context'
import { formatMxn } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/stores/cart-store'

const tireFallback = '/producto/llanta.png'
const batteryFallback = '/producto/Bateria.png'

function lineImageSrc(
  item_type: 'tire' | 'battery',
  image_url: string | null
): string {
  if (image_url && image_url.trim()) return image_url
  return item_type === 'tire' ? tireFallback : batteryFallback
}

export function CartPageContent() {
  const router = useRouter()
  const { profile } = useAuth()
  const items = useCartStore((s) => s.items)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const clearCart = useCartStore((s) => s.clearCart)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const total = useMemo(
    () => Math.round(items.reduce((a, i) => a + i.subtotal, 0) * 100) / 100,
    [items]
  )

  const phoneMissing = !profile?.phone?.trim()

  const handleConfirm = async () => {
    if (items.length === 0) return
    if (phoneMissing) {
      setError('Necesitamos tu número de WhatsApp para confirmar el pedido.')
      return
    }
    setSubmitting(true)
    setError(null)

    const result = await submitCartOrder({
      lines: items.map((i) => ({
        item_type: i.item_type,
        item_id: i.item_id,
        quantity: i.quantity,
      })),
    })

    setSubmitting(false)

    if (!result.ok) {
      setError(sanitizeUserMessage(result.message))
      return
    }

    clearCart()
    router.push('/cuenta?pedido=enviado')
    router.refresh()
  }

  if (items.length === 0) {
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
      {phoneMissing ? (
        <div
          role="status"
          className="space-y-4 rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-4 text-sm text-amber-100"
        >
          <p>
            Necesitamos tu número de WhatsApp para confirmar el pedido. Complétalo
            aquí o en{' '}
            <Link
              href="/cuenta?completar=whatsapp"
              className="font-medium text-carsa-primary underline"
            >
              Mi cuenta
            </Link>
            .
          </p>
          <ProfilePhoneForm
            initialPhone={profile?.phone}
            compact
            submitLabel="Guardar y continuar"
            onSaved={() => setError(null)}
          />
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}

      <ul className="space-y-4">
        {items.map((line) => {
          const imgSrc = lineImageSrc(line.item_type, line.image_url)
          return (
            <li
              key={`${line.item_type}-${line.item_id}`}
              className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card/50 p-4 sm:flex-row sm:items-center"
            >
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-carsa-surface/80">
                <Image
                  src={imgSrc}
                  alt=""
                  fill
                  className="object-contain p-2"
                  sizes="96px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-carsa-primary">
                  {line.item_type === 'tire' ? 'Llanta' : 'Batería'}
                </p>
                <p className="font-medium text-foreground">{line.item_name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatMxn(line.unit_price)} c/u
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 md:flex-col md:items-end">
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
                      updateQuantity(
                        line.item_type,
                        line.item_id,
                        line.quantity - 1
                      )
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
                    disabled={line.quantity >= line.available_quantity}
                    className="flex size-9 items-center justify-center rounded-lg hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                    onClick={() =>
                      updateQuantity(
                        line.item_type,
                        line.item_id,
                        line.quantity + 1
                      )
                    }
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <p className="text-lg font-semibold tabular-nums text-foreground">
                  {formatMxn(line.subtotal)}
                </p>
                <button
                  type="button"
                  onClick={() => removeItem(line.item_type, line.item_id)}
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
          onClick={() => clearCart()}
          className={cn(
            buttonVariants({ variant: 'outline', size: 'sm' }),
            'self-start border-destructive/40 text-destructive hover:bg-destructive/10'
          )}
        >
          Vaciar carrito
        </button>
        <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:items-end">
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Total estimado
            </p>
            <p className="font-heading text-3xl font-bold tracking-tight text-foreground">
              {formatMxn(total)}
            </p>
          </div>
          <button
            type="button"
            disabled={submitting || phoneMissing}
            onClick={() => void handleConfirm()}
            className={cn(
              buttonVariants({ size: 'lg' }),
              'w-full bg-carsa-primary text-white hover:bg-carsa-primary-hover sm:w-auto sm:min-w-[14rem]',
              'disabled:pointer-events-none disabled:opacity-50'
            )}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                Enviando…
              </>
            ) : (
              'Confirmar pedido'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
