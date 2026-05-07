import type { ComponentType } from 'react'
import Link from 'next/link'
import {
  ArrowUpRight,
  Package,
  ShoppingBag,
  AlertTriangle,
  CircleDollarSign,
  Battery,
  Wrench,
  TrendingUp,
  Sparkles,
} from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchDashboardStats } from '@/lib/admin/dashboard-stats'
import { formatMxn } from '@/lib/format'
import { cn } from '@/lib/utils'

export const metadata = {
  title: 'Admin · Dashboard',
}

function StatCard({
  title,
  value,
  hint,
  icon: Icon,
  className,
}: {
  title: string
  value: string
  hint: string
  icon: ComponentType<{ className?: string }>
  className?: string
}) {
  return (
    <Card
      className={cn(
        'group relative overflow-hidden border-border/60 bg-card/50 transition-all duration-300',
        'hover:border-carsa-primary/25 hover:bg-card/70 hover:shadow-lg hover:shadow-black/20',
        className
      )}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-carsa-primary/10 blur-2xl transition-opacity group-hover:opacity-100 opacity-70"
        aria-hidden
      />
      <CardHeader className="relative flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium leading-tight text-muted-foreground">
          {title}
        </CardTitle>
        <span className="flex size-9 items-center justify-center rounded-xl border border-border/80 bg-muted/40 text-carsa-primary transition-colors group-hover:border-carsa-primary/30 group-hover:bg-carsa-primary/10">
          <Icon className="size-4" aria-hidden />
        </span>
      </CardHeader>
      <CardContent className="relative">
        <p className="font-heading text-2xl font-bold tabular-nums tracking-tight text-foreground sm:text-3xl">
          {value}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  )
}

export default async function AdminDashboardPage() {
  const stats = await fetchDashboardStats()

  const revenueTotal = stats.salesRevenueTotal
  const revenueMonth = stats.salesRevenueThisMonth
  const revenueDisplay =
    revenueTotal != null && Number.isFinite(revenueTotal) ? formatMxn(revenueTotal) : '—'
  const revenueMonthDisplay =
    revenueMonth != null && Number.isFinite(revenueMonth) ? formatMxn(revenueMonth) : '—'

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-carsa-primary/90">
            Panel administrador
          </p>
          <h2 className="mt-1 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Dashboard
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Vista general de inventario, pedidos e ingresos por ventas para tomar decisiones rápido.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/pedidos"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'default' }),
              'border-border/80 bg-card/40 hover:border-carsa-primary/40 hover:bg-carsa-primary/10'
            )}
          >
            Pedidos
            <ArrowUpRight className="size-3.5 opacity-70" aria-hidden />
          </Link>
          <Link
            href="/admin/ventas"
            className={cn(
              buttonVariants({ variant: 'default', size: 'default' }),
              'bg-carsa-primary text-white hover:bg-carsa-primary-hover'
            )}
          >
            Ventas
            <ArrowUpRight className="size-3.5 opacity-90" aria-hidden />
          </Link>
        </div>
      </div>

      {stats.warnings.length > 0 ? (
        <div
          role="alert"
          className="rounded-xl border border-amber-500/35 bg-amber-500/[0.08] px-4 py-3 text-sm text-amber-100 shadow-sm shadow-amber-950/20"
        >
          <p className="font-medium text-amber-50">Algunos datos no se pudieron cargar por completo.</p>
          <ul className="mt-2 list-inside list-disc text-xs text-amber-100/85">
            {stats.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Hero ingresos */}
      <section
        className={cn(
          'relative overflow-hidden rounded-2xl border border-white/[0.08]',
          'bg-gradient-to-br from-carsa-primary/[0.18] via-card/90 to-background',
          'shadow-xl shadow-black/25 ring-1 ring-white/[0.06]'
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(227,27,35,0.22),transparent)]"
          aria-hidden
        />
        <div className="pointer-events-none absolute -bottom-24 -right-24 size-72 rounded-full bg-carsa-primary/10 blur-3xl" aria-hidden />
        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.15fr_1fr] lg:gap-10 lg:p-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-medium text-foreground/90 backdrop-blur-sm">
              <Sparkles className="size-3.5 text-amber-300/90" aria-hidden />
              Ingresos por ventas
            </div>
            <p className="mt-5 text-sm text-foreground/75">
              Suma de todas las ventas registradas en el sistema.
            </p>
            <p className="mt-3 break-words font-heading text-3xl font-bold tabular-nums tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]">
              {revenueDisplay}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Montos mostrados en el mismo formato que el resto del panel.
            </p>
          </div>

          <div className="flex flex-col justify-center gap-4">
            <div className="rounded-xl border border-white/10 bg-black/25 p-4 backdrop-blur-md sm:p-5">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <TrendingUp className="size-3.5 text-emerald-400/90" aria-hidden />
                Este mes
              </div>
              <p className="mt-2 break-words font-heading text-xl font-bold tabular-nums text-foreground sm:text-3xl">
                {revenueMonthDisplay}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Ventas con fecha de registro en el mes actual.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-black/20 p-4 backdrop-blur-sm">
                <p className="text-xs text-muted-foreground">Ventas registradas</p>
                <p className="mt-1 font-heading text-2xl font-bold tabular-nums text-foreground">
                  {stats.salesRegistered != null ? String(stats.salesRegistered) : '—'}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-4 backdrop-blur-sm">
                <p className="text-xs text-muted-foreground">Pedidos pendientes</p>
                <p className="mt-1 font-heading text-2xl font-bold tabular-nums text-foreground">
                  {stats.pendingOrders != null ? String(stats.pendingOrders) : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catálogo */}
      <div>
        <h3 className="mb-4 font-heading text-lg font-semibold tracking-tight text-foreground">
          Catálogo
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            title="Total llantas"
            value={stats.tires != null ? String(stats.tires) : '—'}
            hint="Productos en catálogo"
            icon={Package}
          />
          <StatCard
            title="Total baterías"
            value={stats.batteries != null ? String(stats.batteries) : '—'}
            hint="Productos en catálogo"
            icon={Battery}
          />
          <StatCard
            title="Total servicios"
            value={stats.services != null ? String(stats.services) : '—'}
            hint="Servicios disponibles"
            icon={Wrench}
            className="sm:col-span-2 xl:col-span-1"
          />
        </div>
      </div>

      {/* Operación */}
      <div>
        <h3 className="mb-4 font-heading text-lg font-semibold tracking-tight text-foreground">
          Operación
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Bajo stock"
            value={stats.lowStockProducts != null ? String(stats.lowStockProducts) : '—'}
            hint="Llantas con stock entre 1 y 4 · Baterías entre 1 y 3"
            icon={AlertTriangle}
          />
          <StatCard
            title="Pedidos pendientes"
            value={stats.pendingOrders != null ? String(stats.pendingOrders) : '—'}
            hint="Pendientes o en proceso"
            icon={ShoppingBag}
          />
          <StatCard
            title="Historial de ventas"
            value={stats.salesRegistered != null ? String(stats.salesRegistered) : '—'}
            hint="Registros en ventas confirmadas"
            icon={CircleDollarSign}
            className="sm:col-span-2 lg:col-span-1"
          />
        </div>
      </div>
    </div>
  )
}
