'use client'

import { ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'

import {
  CARSA_WEEKLY,
  getTodaySchedule,
  isCarOpenNow,
} from '@/lib/business-hours'

export function BusinessHoursBlock() {
  const [open, setOpen] = useState<boolean | null>(null)

  useEffect(() => {
    const tick = () => setOpen(isCarOpenNow())
    const t = window.setTimeout(tick, 0)
    const id = window.setInterval(tick, 60_000)
    return () => {
      window.clearTimeout(t)
      window.clearInterval(id)
    }
  }, [])

  const today = getTodaySchedule()

  return (
    <div className="rounded-xl border border-white/10 bg-carsa-elevated/90">
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 marker:content-none [&::-webkit-details-marker]:hidden">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-carsa-neutral">
              Horario de atención
            </p>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
              {open === null ? (
                <span className="text-sm text-carsa-neutral">…</span>
              ) : open ? (
                <span className="text-sm font-semibold text-emerald-400">
                  Abierto ahora
                </span>
              ) : (
                <span className="text-sm font-semibold text-carsa-neutral">
                  Cerrado ahora
                </span>
              )}
              {open !== null && (
                <span className="text-sm text-carsa-canvas">{today.range}</span>
              )}
            </div>
          </div>
          <ChevronDown
            className="size-5 shrink-0 text-carsa-neutral transition-transform duration-200 group-open:rotate-180"
            aria-hidden
          />
        </summary>
        <ul className="space-y-0 border-t border-white/10 px-4 py-2 text-sm text-carsa-neutral">
          {CARSA_WEEKLY.map((row) => (
            <li
              key={row.label}
              className="flex items-center justify-between gap-4 border-b border-white/5 py-2.5 last:border-0"
            >
              <span className="text-carsa-canvas/95">{row.label}</span>
              <span className="tabular-nums text-carsa-neutral">{row.range}</span>
            </li>
          ))}
        </ul>
      </details>
    </div>
  )
}
