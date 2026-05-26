'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import {
  Battery,
  CircleDot,
  CircleGauge,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Star,
  Wrench,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCatalogCartAdd } from '@/hooks/use-catalog-cart-add'
import { formatBatteryDisplayTitle } from '@/lib/catalog-battery-display'
import {
  formatTireDisplayTitle,
  tireToDisplayInput,
} from '@/lib/catalog-tire-display'
import { formatMxn } from '@/lib/format'
import {
  resolveBatteryDisplayImage,
  resolveServiceDisplayImage,
  resolveTireDisplayImage,
} from '@/lib/public-catalog-images'
import { cn } from '@/lib/utils'
import { buildWhatsAppUrl } from '@/lib/whatsapp-public'
import {
  joinBrandName,
  type CatalogBattery,
  type CatalogService,
  type CatalogTire,
} from '@/types/catalog'

function priceNumber(value: number | string): number {
  const n = typeof value === 'string' ? Number(value) : value
  return Number.isFinite(n) ? n : 0
}

function dashOr(value: string | null | undefined): string {
  if (value == null || value === '') return '—'
  return value
}

export function TireCard({ tire }: { tire: CatalogTire }) {
  const [open, setOpen] = useState(false)
  const [qty, setQty] = useState(1)
  const { tryAddToCart, adminNotice, dismissAdminNotice, authLoading } =
    useCatalogCartAdd()
  const brand = joinBrandName(tire.tire_brands)
  const displayTitle = formatTireDisplayTitle(tireToDisplayInput(tire))
  const subtitle = brand || null
  const lowStock = tire.stock > 0 && tire.stock < 5
  const tireImageSrc = resolveTireDisplayImage(tire)
  const unitPrice = priceNumber(tire.price)
  const maxQty = tire.stock > 0 ? tire.stock : 0
  const safeQty =
    maxQty > 0 ? Math.min(Math.max(1, qty), maxQty) : 1
  const lineTotal = unitPrice * (maxQty > 0 ? safeQty : 0)

  const tireWhatsApp = buildWhatsAppUrl(
    `Hola CARSA, me interesa cotizar la llanta ${displayTitle}.`
  )

  const handleDialogOpenChange = (next: boolean) => {
    if (!next) dismissAdminNotice()
    if (next) setQty(1)
    setOpen(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <div className="contents">
        <Card
          className={cn(
            'border-border/80 bg-card/80 transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-carsa-primary/15'
          )}
        >
          <button
            type="button"
            onClick={() => handleDialogOpenChange(true)}
            className={cn(
              'relative aspect-[4/3] w-full bg-carsa-surface/80',
              'cursor-pointer transition-colors hover:bg-carsa-surface',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-carsa-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card'
            )}
            aria-label={`Ver detalle de ${displayTitle}`}
          >
            {tireImageSrc ? (
              <Image
                src={tireImageSrc}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-contain p-4"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <CircleDot className="size-14 opacity-40" aria-hidden />
              </div>
            )}
            {tire.is_featured && (
              <Badge
                className="pointer-events-none absolute left-3 top-3 border-carsa-primary/35 bg-carsa-primary/15 text-carsa-primary backdrop-blur-sm"
                variant="outline"
              >
                <Star className="size-3" aria-hidden />
                Destacada
              </Badge>
            )}
          </button>
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle className="line-clamp-2 text-base leading-snug">
              {displayTitle}
            </CardTitle>
            {subtitle ? (
              <p className="text-xs font-medium uppercase tracking-wider text-carsa-neutral">
                {subtitle}
              </p>
            ) : null}
          </CardHeader>
          <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-border/60 bg-muted/20">
            <div>
              <p className="text-lg font-semibold tracking-tight text-foreground">
                {formatMxn(tire.price)}
              </p>
              <p className="text-xs text-muted-foreground">
                {tire.stock <= 0 ? (
                  <span className="text-destructive">Sin existencias</span>
                ) : lowStock ? (
                  <span className="text-amber-400">
                    Pocas piezas ({tire.stock})
                  </span>
                ) : (
                  <>Stock: {tire.stock}</>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleDialogOpenChange(true)}
              className={cn(
                buttonVariants({ size: 'sm' }),
                'max-w-[11rem] shrink-0 whitespace-normal bg-carsa-primary px-2.5 text-center text-xs text-white leading-snug hover:bg-carsa-primary-hover sm:max-w-none sm:px-3 sm:text-sm'
              )}
            >
              Ver detalle
            </button>
          </CardFooter>
        </Card>

        <DialogContent
          showCloseButton
          className={cn(
            'max-h-[min(92dvh,680px)] w-[calc(100%-1.25rem)] gap-0 overflow-hidden border-border/60 bg-card p-0 text-foreground ring-border/40',
            'sm:max-h-[min(88dvh,620px)] sm:max-w-[min(100%-2rem,42rem)] lg:max-w-[46rem]'
          )}
        >
          <div className="flex max-h-[inherit] min-h-0 flex-col overflow-hidden md:flex-row">
            {/* Columna imagen: altura fija en desktop para que el panel no exija scroll */}
            <div className="relative flex w-full shrink-0 items-center justify-center border-b border-border/50 bg-carsa-surface/80 md:w-[280px] md:border-b-0 md:border-r">
              <div className="relative h-36 w-full sm:h-[260px] md:h-[280px]">
                {tireImageSrc ? (
                  <Image
                    src={tireImageSrc}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, 280px"
                    className="object-contain p-3 sm:p-4"
                    priority={false}
                  />
                ) : (
                  <div className="flex h-full min-h-[9rem] items-center justify-center text-muted-foreground sm:min-h-0">
                    <CircleDot className="size-16 opacity-40" aria-hidden />
                  </div>
                )}
              </div>
            </div>

            {/* Columna contenido: sin scroll en desktop; en móvil muy bajo solo si hace falta */}
            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain px-3 py-3 sm:max-h-[min(88dvh,620px)] sm:gap-2.5 sm:overflow-y-visible sm:px-4 sm:py-3.5">
              <DialogHeader className="shrink-0 gap-0.5 space-y-0 text-left">
                <DialogTitle className="font-heading text-base leading-tight sm:text-lg">
                  {displayTitle}
                </DialogTitle>
                {subtitle ? (
                  <DialogDescription className="text-xs text-carsa-neutral sm:text-sm">
                    {subtitle}
                  </DialogDescription>
                ) : (
                  <DialogDescription className="sr-only">
                    Detalle del producto
                  </DialogDescription>
                )}
              </DialogHeader>

              <dl className="shrink-0 space-y-0 text-sm">
                <div className="flex justify-between gap-3 border-b border-border/35 py-1">
                  <dt className="text-muted-foreground">Rin</dt>
                  <dd className="text-right font-medium tabular-nums">{tire.rim}</dd>
                </div>
                <div className="flex justify-between gap-3 border-b border-border/35 py-1">
                  <dt className="text-muted-foreground">Medida</dt>
                  <dd className="text-right font-medium">{tire.size}</dd>
                </div>
                <div className="flex justify-between gap-3 border-b border-border/35 py-1">
                  <dt className="text-muted-foreground">Modelo</dt>
                  <dd className="text-right font-medium">
                    {dashOr(tire.model)}
                  </dd>
                </div>
              </dl>

              <div className="min-h-0 shrink-0">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Descripción
                </p>
                <p
                  className="mt-0.5 line-clamp-4 text-xs leading-snug text-foreground/90 sm:line-clamp-3 sm:text-sm sm:leading-relaxed"
                  title={
                    tire.description?.trim()
                      ? tire.description
                      : undefined
                  }
                >
                  {tire.description?.trim()
                    ? tire.description
                    : 'Sin descripción en catálogo.'}
                </p>
              </div>

              {maxQty > 0 ? (
                <div className="mt-auto shrink-0 space-y-2 border-t border-border/50 pt-2">
                  <div className="rounded-lg border border-border/60 bg-muted/10 p-3 ring-1 ring-white/[0.03] sm:p-3.5">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          Cantidad
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          {tire.stock <= 0 ? (
                            <span className="text-xs font-medium text-destructive">
                              Sin existencias
                            </span>
                          ) : lowStock ? (
                            <Badge
                              variant="outline"
                              className="border-amber-500/45 bg-amber-500/10 px-2 py-0.5 text-[0.7rem] font-medium text-amber-100"
                            >
                              Pocas: {maxQty} disp.
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-emerald-500/35 bg-emerald-500/10 px-2 py-0.5 text-[0.7rem] font-medium tabular-nums text-emerald-100"
                            >
                              En stock · {maxQty} uds.
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div
                        className={cn(
                          'inline-flex shrink-0 items-center rounded-lg border border-border/80 bg-background/90 p-0.5',
                          'ring-1 ring-white/[0.05]'
                        )}
                      >
                        <button
                          type="button"
                          aria-label="Disminuir cantidad"
                          disabled={safeQty <= 1}
                          onClick={() => setQty((q) => Math.max(1, q - 1))}
                          className={cn(
                            'flex size-9 items-center justify-center rounded-md text-foreground transition sm:size-8',
                            'hover:bg-muted disabled:pointer-events-none disabled:opacity-40'
                          )}
                        >
                          <Minus className="size-4 sm:size-3.5" aria-hidden />
                        </button>
                        <span className="min-w-[2.25rem] text-center text-sm font-semibold tabular-nums">
                          {safeQty}
                        </span>
                        <button
                          type="button"
                          aria-label="Aumentar cantidad"
                          disabled={safeQty >= maxQty}
                          onClick={() =>
                            setQty((q) => Math.min(maxQty, q + 1))
                          }
                          className={cn(
                            'flex size-9 items-center justify-center rounded-md text-foreground transition sm:size-8',
                            'hover:bg-muted disabled:pointer-events-none disabled:opacity-40'
                          )}
                        >
                          <Plus className="size-4 sm:size-3.5" aria-hidden />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 border-t border-border/40 pt-3">
                      <p className="text-[0.7rem] text-muted-foreground">
                        Precio unitario{' '}
                        <span className="font-medium text-foreground">
                          {formatMxn(unitPrice)}
                        </span>
                        <span className="text-border/80"> · </span>
                        {safeQty} uds.
                      </p>
                      <p className="mt-1 font-heading text-2xl font-bold tabular-nums leading-none text-foreground">
                        {formatMxn(lineTotal)}
                      </p>
                    </div>

                    {adminNotice ? (
                      <div
                        role="alert"
                        className="mt-3 w-full rounded-lg border border-amber-500/35 bg-amber-500/10 px-3 py-2.5 text-xs leading-snug text-amber-100"
                      >
                        <p>{adminNotice}</p>
                        <Link
                          href="/admin"
                          className="mt-2 inline-flex font-medium text-carsa-primary underline"
                        >
                          Ir al panel
                        </Link>
                      </div>
                    ) : null}

                    <div className="mt-3 flex w-full flex-col gap-2.5 border-t border-border/40 pt-3">
                      {tireWhatsApp ? (
                        <a
                          href={tireWhatsApp}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            buttonVariants({ variant: 'outline', size: 'default' }),
                            'h-auto min-h-10 w-full justify-center gap-2 whitespace-normal border-border/70 px-3 py-2.5 text-center text-sm leading-snug'
                          )}
                        >
                          <MessageCircle className="size-4 shrink-0 opacity-90" aria-hidden />
                          Consultar por WhatsApp
                        </a>
                      ) : null}
                      <button
                        type="button"
                        disabled={authLoading}
                        onClick={() => {
                          tryAddToCart(
                            {
                              item_type: 'tire',
                              item_id: tire.id,
                              item_name: displayTitle,
                              image_url: tireImageSrc.trim()
                                ? tireImageSrc
                                : null,
                              unit_price: unitPrice,
                              quantity: safeQty,
                              available_quantity: maxQty,
                            },
                            () => setOpen(false)
                          )
                        }}
                        className={cn(
                          buttonVariants({ size: 'default' }),
                          'h-auto min-h-10 w-full justify-center border border-carsa-primary/45 bg-carsa-primary px-3 py-2.5 text-sm font-semibold text-white',
                          'hover:bg-carsa-primary-hover disabled:pointer-events-none disabled:opacity-50'
                        )}
                      >
                        Agregar al carrito
                      </button>
                      <Link
                        href="/carrito"
                        className={cn(
                          buttonVariants({ variant: 'outline', size: 'default' }),
                          'h-auto min-h-10 w-full justify-center gap-2 border-border/70 bg-background/90 px-3 py-2.5 text-center text-sm hover:bg-muted/50'
                        )}
                      >
                        <ShoppingBag className="size-4 shrink-0 opacity-90" aria-hidden />
                        Ver carrito
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="shrink-0 text-sm text-destructive">
                  Sin existencias
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </div>
    </Dialog>
  )
}

export function BatteryCard({ battery }: { battery: CatalogBattery }) {
  const [open, setOpen] = useState(false)
  const [qty, setQty] = useState(1)
  const { tryAddToCart, adminNotice, dismissAdminNotice, authLoading } =
    useCatalogCartAdd()
  const brand = joinBrandName(battery.battery_brands)
  const displayTitle = formatBatteryDisplayTitle(battery)
  const lowStock = battery.stock > 0 && battery.stock < 4
  const warrantyLabel =
    battery.warranty_months != null
      ? `${battery.warranty_months} meses`
      : '—'
  const batteryImageSrc = resolveBatteryDisplayImage(battery)
  const unitPrice = priceNumber(battery.price)
  const maxQty = battery.stock > 0 ? battery.stock : 0
  const safeQty =
    maxQty > 0 ? Math.min(Math.max(1, qty), maxQty) : 1
  const lineTotal = unitPrice * (maxQty > 0 ? safeQty : 0)

  const batteryWhatsApp = buildWhatsAppUrl(
    `Hola CARSA, me interesa cotizar la batería ${displayTitle}${
      brand ? ` (${brand})` : ''
    }.`
  )

  const handleDialogOpenChange = (next: boolean) => {
    if (!next) dismissAdminNotice()
    if (next) setQty(1)
    setOpen(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <div className="contents">
        <Card
          className={cn(
            'border-border/80 bg-card/80 transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-carsa-primary/15'
          )}
        >
          <button
            type="button"
            onClick={() => handleDialogOpenChange(true)}
            className={cn(
              'relative aspect-[4/3] w-full bg-carsa-surface/80',
              'cursor-pointer transition-colors hover:bg-carsa-surface',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-carsa-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card'
            )}
            aria-label={`Ver detalle de ${displayTitle}`}
          >
            {batteryImageSrc ? (
              <Image
                src={batteryImageSrc}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-contain p-4"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <Battery className="size-14 opacity-40" aria-hidden />
              </div>
            )}
            {battery.is_featured && (
              <Badge
                className="pointer-events-none absolute left-3 top-3 border-carsa-primary/35 bg-carsa-primary/15 text-carsa-primary backdrop-blur-sm"
                variant="outline"
              >
                <Star className="size-3" aria-hidden />
                Destacada
              </Badge>
            )}
          </button>
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle className="line-clamp-2 text-base leading-snug">
              {displayTitle}
            </CardTitle>
            {brand ? (
              <p className="text-xs font-medium uppercase tracking-wider text-carsa-neutral">
                {brand}
              </p>
            ) : null}
          </CardHeader>
          <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-border/60 bg-muted/20">
            <div>
              <p className="text-lg font-semibold tracking-tight text-foreground">
                {formatMxn(battery.price)}
              </p>
              <p className="text-xs text-muted-foreground">
                {battery.stock <= 0 ? (
                  <span className="text-destructive">Sin existencias</span>
                ) : lowStock ? (
                  <span className="text-amber-400">
                    Pocas piezas ({battery.stock})
                  </span>
                ) : (
                  <>Stock: {battery.stock}</>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleDialogOpenChange(true)}
              className={cn(
                buttonVariants({ size: 'sm' }),
                'max-w-[11rem] shrink-0 whitespace-normal bg-carsa-primary px-2.5 text-center text-xs text-white leading-snug hover:bg-carsa-primary-hover sm:max-w-none sm:px-3 sm:text-sm'
              )}
            >
              Ver detalle
            </button>
          </CardFooter>
        </Card>

        <DialogContent
          showCloseButton
          className={cn(
            'max-h-[min(92dvh,680px)] w-[calc(100%-1.25rem)] gap-0 overflow-hidden border-border/60 bg-card p-0 text-foreground ring-border/40',
            'sm:max-h-[min(88dvh,620px)] sm:max-w-[min(100%-2rem,42rem)] lg:max-w-[46rem]'
          )}
        >
          <div className="flex max-h-[inherit] min-h-0 flex-col overflow-hidden md:flex-row">
            <div className="relative flex w-full shrink-0 items-center justify-center border-b border-border/50 bg-carsa-surface/80 md:w-[280px] md:border-b-0 md:border-r">
              <div className="relative h-36 w-full sm:h-[260px] md:h-[280px]">
                {batteryImageSrc ? (
                  <Image
                    src={batteryImageSrc}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, 280px"
                    className="object-contain p-3 sm:p-4"
                  />
                ) : (
                  <div className="flex h-full min-h-[9rem] items-center justify-center text-muted-foreground sm:min-h-0">
                    <Battery className="size-16 opacity-40" aria-hidden />
                  </div>
                )}
              </div>
            </div>

            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain px-3 py-3 sm:max-h-[min(88dvh,620px)] sm:gap-2.5 sm:overflow-y-visible sm:px-4 sm:py-3.5">
              <DialogHeader className="shrink-0 gap-0.5 space-y-0 text-left">
                <DialogTitle className="font-heading text-base leading-tight sm:text-lg">
                  {displayTitle}
                </DialogTitle>
                {brand ? (
                  <DialogDescription className="text-[0.65rem] font-medium uppercase tracking-wider text-carsa-neutral sm:text-xs">
                    {brand}
                  </DialogDescription>
                ) : (
                  <DialogDescription className="sr-only">
                    Detalle del producto
                  </DialogDescription>
                )}
              </DialogHeader>

              <dl className="shrink-0 space-y-0 text-sm">
                <div className="flex justify-between gap-3 border-b border-border/35 py-1">
                  <dt className="text-muted-foreground">Modelo</dt>
                  <dd className="text-right font-medium">
                    {dashOr(battery.model)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3 border-b border-border/35 py-1">
                  <dt className="text-muted-foreground">Amperaje</dt>
                  <dd className="text-right font-medium">
                    {dashOr(battery.amperage)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3 border-b border-border/35 py-1">
                  <dt className="text-muted-foreground">Voltaje</dt>
                  <dd className="text-right font-medium">
                    {dashOr(battery.voltage)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3 border-b border-border/35 py-1">
                  <dt className="text-muted-foreground">Polaridad</dt>
                  <dd className="text-right font-medium">
                    {dashOr(battery.polarity)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3 border-b border-border/35 py-1">
                  <dt className="text-muted-foreground">Garantía</dt>
                  <dd className="text-right font-medium">{warrantyLabel}</dd>
                </div>
              </dl>

              <div className="min-h-0 shrink-0">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Descripción
                </p>
                <p
                  className="mt-0.5 line-clamp-4 text-xs leading-snug text-foreground/90 sm:line-clamp-3 sm:text-sm sm:leading-relaxed"
                  title={
                    battery.description?.trim()
                      ? battery.description
                      : undefined
                  }
                >
                  {battery.description?.trim()
                    ? battery.description
                    : 'Sin descripción en catálogo.'}
                </p>
              </div>

              {maxQty > 0 ? (
                <div className="mt-auto shrink-0 space-y-2 border-t border-border/50 pt-2">
                  <div className="rounded-lg border border-border/60 bg-muted/10 p-3 ring-1 ring-white/[0.03] sm:p-3.5">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          Cantidad
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          {battery.stock <= 0 ? (
                            <span className="text-xs font-medium text-destructive">
                              Sin existencias
                            </span>
                          ) : lowStock ? (
                            <Badge
                              variant="outline"
                              className="border-amber-500/45 bg-amber-500/10 px-2 py-0.5 text-[0.7rem] font-medium text-amber-100"
                            >
                              Pocas: {maxQty} disp.
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-emerald-500/35 bg-emerald-500/10 px-2 py-0.5 text-[0.7rem] font-medium tabular-nums text-emerald-100"
                            >
                              En stock · {maxQty} uds.
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div
                        className={cn(
                          'inline-flex shrink-0 items-center rounded-lg border border-border/80 bg-background/90 p-0.5',
                          'ring-1 ring-white/[0.05]'
                        )}
                      >
                        <button
                          type="button"
                          aria-label="Disminuir cantidad"
                          disabled={safeQty <= 1}
                          onClick={() => setQty((q) => Math.max(1, q - 1))}
                          className={cn(
                            'flex size-9 items-center justify-center rounded-md text-foreground transition sm:size-8',
                            'hover:bg-muted disabled:pointer-events-none disabled:opacity-40'
                          )}
                        >
                          <Minus className="size-4 sm:size-3.5" aria-hidden />
                        </button>
                        <span className="min-w-[2.25rem] text-center text-sm font-semibold tabular-nums">
                          {safeQty}
                        </span>
                        <button
                          type="button"
                          aria-label="Aumentar cantidad"
                          disabled={safeQty >= maxQty}
                          onClick={() =>
                            setQty((q) => Math.min(maxQty, q + 1))
                          }
                          className={cn(
                            'flex size-9 items-center justify-center rounded-md text-foreground transition sm:size-8',
                            'hover:bg-muted disabled:pointer-events-none disabled:opacity-40'
                          )}
                        >
                          <Plus className="size-4 sm:size-3.5" aria-hidden />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 border-t border-border/40 pt-3">
                      <p className="text-[0.7rem] text-muted-foreground">
                        Precio unitario{' '}
                        <span className="font-medium text-foreground">
                          {formatMxn(unitPrice)}
                        </span>
                        <span className="text-border/80"> · </span>
                        {safeQty} uds.
                      </p>
                      <p className="mt-1 font-heading text-2xl font-bold tabular-nums leading-none text-foreground">
                        {formatMxn(lineTotal)}
                      </p>
                    </div>

                    {adminNotice ? (
                      <div
                        role="alert"
                        className="mt-3 w-full rounded-lg border border-amber-500/35 bg-amber-500/10 px-3 py-2.5 text-xs leading-snug text-amber-100"
                      >
                        <p>{adminNotice}</p>
                        <Link
                          href="/admin"
                          className="mt-2 inline-flex font-medium text-carsa-primary underline"
                        >
                          Ir al panel
                        </Link>
                      </div>
                    ) : null}

                    <div className="mt-3 flex w-full flex-col gap-2.5 border-t border-border/40 pt-3">
                      {batteryWhatsApp ? (
                        <a
                          href={batteryWhatsApp}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            buttonVariants({ variant: 'outline', size: 'default' }),
                            'h-auto min-h-10 w-full justify-center gap-2 whitespace-normal border-border/70 px-3 py-2.5 text-center text-sm leading-snug'
                          )}
                        >
                          <MessageCircle className="size-4 shrink-0 opacity-90" aria-hidden />
                          Consultar por WhatsApp
                        </a>
                      ) : null}
                      <button
                        type="button"
                        disabled={authLoading}
                        onClick={() => {
                          tryAddToCart(
                            {
                              item_type: 'battery',
                              item_id: battery.id,
                              item_name: displayTitle,
                              image_url: batteryImageSrc.trim()
                                ? batteryImageSrc
                                : null,
                              unit_price: unitPrice,
                              quantity: safeQty,
                              available_quantity: maxQty,
                            },
                            () => setOpen(false)
                          )
                        }}
                        className={cn(
                          buttonVariants({ size: 'default' }),
                          'h-auto min-h-10 w-full justify-center border border-carsa-primary/45 bg-carsa-primary px-3 py-2.5 text-sm font-semibold text-white',
                          'hover:bg-carsa-primary-hover disabled:pointer-events-none disabled:opacity-50'
                        )}
                      >
                        Agregar al carrito
                      </button>
                      <Link
                        href="/carrito"
                        className={cn(
                          buttonVariants({ variant: 'outline', size: 'default' }),
                          'h-auto min-h-10 w-full justify-center gap-2 border-border/70 bg-background/90 px-3 py-2.5 text-center text-sm hover:bg-muted/50'
                        )}
                      >
                        <ShoppingBag className="size-4 shrink-0 opacity-90" aria-hidden />
                        Ver carrito
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="shrink-0 text-sm text-destructive">
                  Sin existencias
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </div>
    </Dialog>
  )
}

export function ServiceCard({
  service,
  consultCtaLabel = 'Consultar',
}: {
  service: CatalogService
  consultCtaLabel?: string
}) {
  const unitPrice = priceNumber(service.price)
  const hasPrice = unitPrice > 0
  const consult = buildWhatsAppUrl(
    hasPrice
      ? `Hola CARSA, me interesa el servicio: ${service.name}. Precio referencial: ${formatMxn(unitPrice)}.`
      : `Hola CARSA, me interesa el servicio: ${service.name}.`
  )
  const PlaceholderIcon =
    service.display_placeholder === 'gauge' ? CircleGauge : Wrench
  const serviceImageSrc = resolveServiceDisplayImage(service)

  return (
    <Card
      className={cn(
        'border-border/80 bg-card/80 transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-carsa-primary/15'
      )}
    >
      <div className="relative aspect-[4/3] w-full bg-carsa-surface/80">
        {serviceImageSrc ? (
          <Image
            src={serviceImageSrc}
            alt={service.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-contain p-4"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <PlaceholderIcon className="size-14 opacity-40" aria-hidden />
          </div>
        )}
        {service.is_featured && (
          <Badge
            className="absolute left-3 top-3 border-carsa-primary/35 bg-carsa-primary/15 text-carsa-primary backdrop-blur-sm"
            variant="outline"
          >
            <Sparkles className="size-3" aria-hidden />
            Destacado
          </Badge>
        )}
      </div>
      <CardHeader className="border-b border-border/60 pb-3">
        <CardTitle className="text-base leading-snug">{service.name}</CardTitle>
      </CardHeader>
      <CardContent className="pt-2 text-sm text-muted-foreground">
        {service.description ? (
          <p className="line-clamp-4 leading-relaxed">{service.description}</p>
        ) : (
          <p className="text-muted-foreground/80">
            Servicio profesional en taller. Escríbenos para agendar o cotizar.
          </p>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-border/60 bg-muted/20">
        <div>
          {hasPrice ? (
            <p className="text-lg font-semibold tracking-tight text-foreground">
              {formatMxn(unitPrice)}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Cotización según tu vehículo
            </p>
          )}
        </div>
        <a
          href={consult ?? '#contacto'}
          target={consult ? '_blank' : undefined}
          rel={consult ? 'noopener noreferrer' : undefined}
          className={cn(
            buttonVariants({ size: 'sm' }),
            'w-full bg-carsa-primary text-center text-xs text-white hover:bg-carsa-primary-hover sm:w-auto sm:px-4 sm:text-sm'
          )}
        >
          {consultCtaLabel}
        </a>
      </CardFooter>
    </Card>
  )
}

export function EmptyBlock({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border/80 bg-carsa-surface/40 px-6 py-14 text-center text-sm text-muted-foreground">
      Aún no hay {label} disponibles en este momento.
    </div>
  )
}

export function FilterEmpty({ onClear }: { onClear: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/25 px-6 py-14 text-center">
      <p className="text-sm leading-relaxed text-muted-foreground">
        No hay resultados para tu búsqueda. Prueba otra medida o marca, o
        escríbenos por WhatsApp y te ayudamos en minutos.
      </p>
      <button
        type="button"
        onClick={onClear}
        className={cn(
          buttonVariants({ variant: 'link', size: 'sm' }),
          'mt-2 text-carsa-primary'
        )}
      >
        Limpiar búsqueda
      </button>
    </div>
  )
}
