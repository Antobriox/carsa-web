import type { ComponentType } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Package,
  ShoppingBag,
  CircleDollarSign,
  Battery,
  Wrench,
  TrendingUp,
  Eye,
  AlertCircle,
} from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { DashboardStats } from '@/lib/admin/dashboard-stats'
import type { SiteVisitStats } from '@/lib/analytics/visit-stats'
import { formatMxn } from '@/lib/format'
import { cn } from '@/lib/utils'

type AdminDashboardProps = {
  stats: DashboardStats
  visits: SiteVisitStats
}

function MetricCard({
  label,
  value,
  icon: Icon,
  href,
  accent = false,
}: {
  label: string
  value: string
  icon: ComponentType<{ className?: string }>
  href?: string
  accent?: boolean
}) {
  const inner = (
    <Card
      className={cn(
        'h-full border-border/60 bg-card/80 transition-colors',
        href && 'hover:border-carsa-primary/40 hover:bg-card',
        accent && 'border-carsa-primary/30 bg-gradient-to-br from-carsa-primary/10 via-card to-card'
      )}
    >
      <CardContent className="flex h-full flex-col justify-between p-5">
        <div className="flex items-start justify-between gap-3">
          <span
            className={cn(
              'flex size-10 items-center justify-center rounded-xl',
              accent
                ? 'bg-carsa-primary/15 text-carsa-primary'
                : 'bg-muted/60 text-muted-foreground'
            )}
          >
            <Icon className="size-5" aria-hidden />
          </span>
          {href ? (
            <ArrowRight className="size-4 text-muted-foreground/60" aria-hidden />
          ) : null}
        </div>
        <div className="mt-6">
          <p className="font-heading text-2xl font-semibold tabular-nums tracking-tight text-foreground sm:text-3xl">
            {value}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )

  if (href) {
    return (
      <Link href={href} className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-carsa-primary/50 rounded-2xl">
        {inner}
      </Link>
    )
  }

  return inner
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/30 px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  )
}

export function AdminDashboard({ stats, visits }: AdminDashboardProps) {
  const revenueDisplay =
    stats.salesRevenueTotal != null && Number.isFinite(stats.salesRevenueTotal)
      ? formatMxn(stats.salesRevenueTotal)
      : '—'
  const revenueMonthDisplay =
    stats.salesRevenueThisMonth != null &&
    Number.isFinite(stats.salesRevenueThisMonth)
      ? formatMxn(stats.salesRevenueThisMonth)
      : '—'

  const pending = stats.pendingOrders ?? 0
  const lowStock = stats.lowStockProducts ?? 0
  const visitorsToday = visits.uniqueVisitorsToday ?? 0

  const todayLabel = new Date().toLocaleDateString('es-EC', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'America/Guayaquil',
  })

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm capitalize text-muted-foreground">{todayLabel}</p>
          <h2 className="mt-1 font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Panel de control
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/pedidos"
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'border-border/70 bg-card/50'
            )}
          >
            Ver pedidos
          </Link>
          <Link
            href="/admin/ventas"
            className={cn(
              buttonVariants({ variant: 'default' }),
              'bg-carsa-primary text-white hover:bg-carsa-primary-hover'
            )}
          >
            Registrar venta
          </Link>
        </div>
      </div>

      {stats.warnings.length > 0 ? (
        <div
          role="alert"
          className="flex gap-3 rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-sm text-amber-100/90"
        >
          <AlertCircle className="size-5 shrink-0 text-amber-400" aria-hidden />
          <p>Parte de los datos no se cargó. Revisa tu conexión o recarga la página.</p>
        </div>
      ) : null}

      {(pending > 0 || lowStock > 0) && (
        <div className="flex flex-col gap-3 rounded-xl border border-carsa-primary/25 bg-carsa-primary/5 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <AlertCircle className="size-5 shrink-0 text-carsa-primary" aria-hidden />
            <div>
              <p className="font-medium text-foreground">Requiere tu atención</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {pending > 0 && `${pending} pedido${pending === 1 ? '' : 's'} pendiente${pending === 1 ? '' : 's'}`}
                {pending > 0 && lowStock > 0 && ' · '}
                {lowStock > 0 &&
                  `${lowStock} producto${lowStock === 1 ? '' : 's'} con poco stock`}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            {pending > 0 ? (
              <Link
                href="/admin/pedidos"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'sm' }),
                  'border-carsa-primary/30'
                )}
              >
                Pedidos
              </Link>
            ) : null}
            {lowStock > 0 ? (
              <Link
                href="/admin/llantas"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'sm' }),
                  'border-carsa-primary/30'
                )}
              >
                Inventario
              </Link>
            ) : null}
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Ingresos del mes"
          value={revenueMonthDisplay}
          icon={TrendingUp}
          accent
        />
        <MetricCard
          label="Pedidos pendientes"
          value={String(pending)}
          icon={ShoppingBag}
          href="/admin/pedidos"
        />
        <MetricCard
          label="Visitantes hoy"
          value={visits.available ? String(visitorsToday) : '—'}
          icon={Eye}
        />
        <MetricCard
          label="Ingresos acumulados"
          value={revenueDisplay}
          icon={CircleDollarSign}
          href="/admin/ventas"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="border-border/60 bg-card/80 lg:col-span-3">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Ventas</h3>
            <p className="mt-3 font-heading text-4xl font-semibold tabular-nums tracking-tight text-foreground">
              {revenueMonthDisplay}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Ingresos del mes en curso</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <MiniStat label="Total histórico" value={revenueDisplay} />
              <MiniStat
                label="Ventas registradas"
                value={
                  stats.salesRegistered != null ? String(stats.salesRegistered) : '—'
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 lg:col-span-2">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Sitio web</h3>
            {!visits.available ? (
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {visits.setupHint ??
                  'Activa el seguimiento con scripts/site-visits.sql en Supabase.'}
              </p>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <MiniStat
                  label="Páginas vistas hoy"
                  value={String(visits.pageViewsToday ?? 0)}
                />
                <MiniStat
                  label="Clientes con sesión"
                  value={String(visits.customerVisitorsToday ?? 0)}
                />
                <MiniStat
                  label="Clientes registrados"
                  value={String(visits.registeredCustomers ?? 0)}
                />
                <MiniStat
                  label="Últimos 7 días"
                  value={String(visits.uniqueVisitorsWeek ?? 0)}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">Catálogo activo</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            label="Llantas publicadas"
            value={stats.tires != null ? String(stats.tires) : '—'}
            icon={Package}
            href="/admin/llantas"
          />
          <MetricCard
            label="Baterías publicadas"
            value={stats.batteries != null ? String(stats.batteries) : '—'}
            icon={Battery}
            href="/admin/baterias"
          />
          <MetricCard
            label="Servicios publicados"
            value={stats.services != null ? String(stats.services) : '—'}
            icon={Wrench}
            href="/admin/servicios"
          />
        </div>
      </div>
    </div>
  )
}
