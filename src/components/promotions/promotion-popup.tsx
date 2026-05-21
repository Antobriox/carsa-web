'use client'

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { PopupPromotion } from '@/types/promotions'

const SESSION_KEY = 'carsa_promotions_closed'
const AUTO_ADVANCE_MS = 60_000

type PromotionPopupProps = {
  promotions: PopupPromotion[]
}

export type PromotionPopupHandle = {
  open: () => void
}

type ImageSize = { width: number; height: number }

function fitImageToViewport(naturalW: number, naturalH: number): ImageSize {
  if (naturalW <= 0 || naturalH <= 0) return { width: 300, height: 200 }

  const vw = typeof window !== 'undefined' ? window.innerWidth : 390
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const maxW = Math.min(vw * 0.92, 720)
  const maxH = Math.min(vh * 0.82, 840)
  const scale = Math.min(maxW / naturalW, maxH / naturalH, 1)

  return {
    width: Math.max(1, Math.round(naturalW * scale)),
    height: Math.max(1, Math.round(naturalH * scale)),
  }
}

const iconBtn =
  'flex size-9 cursor-pointer items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/75 active:scale-95'

const closeBtn =
  'flex size-9 cursor-pointer items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-all duration-200 hover:bg-carsa-primary/75 hover:shadow-lg hover:shadow-carsa-primary/35 active:scale-95'

export const PromotionPopup = forwardRef<
  PromotionPopupHandle,
  PromotionPopupProps
>(function PromotionPopup({ promotions }, ref) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const [sizes, setSizes] = useState<Record<string, ImageSize>>({})
  const [viewportTick, setViewportTick] = useState(0)

  const multiple = promotions.length > 1
  const current = promotions[index]

  useEffect(() => {
    if (!promotions.length) return
    queueMicrotask(() => {
      try {
        if (sessionStorage.getItem(SESSION_KEY) === 'true') return
      } catch {
        return
      }
      setOpen(true)
    })
  }, [promotions])

  useEffect(() => {
    for (const p of promotions) {
      const img = new window.Image()
      img.onload = () => {
        setSizes((prev) =>
          prev[p.id]
            ? prev
            : {
                ...prev,
                [p.id]: { width: img.naturalWidth, height: img.naturalHeight },
              }
        )
      }
      img.src = p.image_url
    }
  }, [promotions])

  useEffect(() => {
    if (!open) return
    const onResize = () => setViewportTick((n) => n + 1)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [open])

  useEffect(() => {
    if (!open || !multiple) return
    const t = window.setInterval(
      () => setIndex((i) => (i + 1) % promotions.length),
      AUTO_ADVANCE_MS
    )
    return () => window.clearInterval(t)
  }, [open, multiple, promotions.length])

  useEffect(() => {
    if (!open || !multiple) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')
        setIndex((i) => (i - 1 + promotions.length) % promotions.length)
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % promotions.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, multiple, promotions.length])

  const displaySize = useMemo(() => {
    void viewportTick
    if (!current) return { width: 300, height: 200 }
    const n = sizes[current.id]
    return n
      ? fitImageToViewport(n.width, n.height)
      : { width: 300, height: 200 }
  }, [current, sizes, viewportTick])

  const close = useCallback(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, 'true')
    } catch {
      /* ignore */
    }
    setOpen(false)
  }, [])

  useImperativeHandle(ref, () => ({
    open: () => {
      if (!promotions.length) return
      setIndex(0)
      setOpen(true)
    },
  }))

  if (!promotions.length) return null

  return (
    <Dialog open={open} onOpenChange={(v) => !v && close()}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/40 backdrop-blur-sm"
        className={cn(
          'max-w-none gap-0 border-0 bg-transparent p-0 shadow-none ring-0',
          'w-auto sm:max-w-none',
          'data-open:zoom-in-100 data-open:fade-in-0'
        )}
      >
        <DialogTitle className="sr-only">Promoción</DialogTitle>
        <DialogDescription className="sr-only">
          Imagen promocional
        </DialogDescription>

        <div className="relative p-1 sm:p-2">
          <button
            type="button"
            onClick={close}
            aria-label="Cerrar"
            className={cn(closeBtn, 'absolute -right-1 -top-1 z-30 sm:right-0 sm:top-0')}
          >
            <X className="size-4" strokeWidth={2.5} aria-hidden />
          </button>

          <motion.div
            layout
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="relative overflow-hidden rounded-xl shadow-2xl shadow-black/50"
            style={{
              width: displaySize.width,
              height: displaySize.height,
            }}
          >
            <AnimatePresence mode="wait">
              {current ? (
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={current.image_url}
                    alt={current.title?.trim() || 'Promoción'}
                    width={displaySize.width}
                    height={displaySize.height}
                    className="block size-full object-contain"
                    decoding="async"
                    onLoad={(e) => {
                      const el = e.currentTarget
                      if (!el.naturalWidth) return
                      setSizes((prev) => ({
                        ...prev,
                        [current.id]: {
                          width: el.naturalWidth,
                          height: el.naturalHeight,
                        },
                      }))
                    }}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>

            {multiple ? (
              <>
                <button
                  type="button"
                  aria-label="Anterior"
                  onClick={() =>
                    setIndex(
                      (i) => (i - 1 + promotions.length) % promotions.length
                    )
                  }
                  className={cn(iconBtn, 'absolute left-2 top-1/2 z-20 -translate-y-1/2')}
                >
                  <ChevronLeft className="size-5" aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label="Siguiente"
                  onClick={() =>
                    setIndex((i) => (i + 1) % promotions.length)
                  }
                  className={cn(iconBtn, 'absolute right-2 top-1/2 z-20 -translate-y-1/2')}
                >
                  <ChevronRight className="size-5" aria-hidden />
                </button>

                <div
                  className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1.5 backdrop-blur-sm"
                  role="tablist"
                  aria-label="Promociones"
                >
                  {promotions.map((p, i) => (
                    <button
                      key={p.id}
                      type="button"
                      role="tab"
                      aria-selected={i === index}
                      aria-label={`${i + 1} de ${promotions.length}`}
                      onClick={() => setIndex(i)}
                      className={cn(
                        'cursor-pointer rounded-full transition-all duration-200',
                        i === index
                          ? 'size-2 bg-white'
                          : 'size-1.5 bg-white/40 hover:bg-white/70'
                      )}
                    />
                  ))}
                </div>
              </>
            ) : null}
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  )
})
