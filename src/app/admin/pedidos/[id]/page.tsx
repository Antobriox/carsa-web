import Link from 'next/link'
import { notFound } from 'next/navigation'

import { buttonVariants } from '@/components/ui/button'
import { formatMxn } from '@/lib/format'
import { formatDate, pickField, pickNumber } from '@/lib/admin/row-display'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'

export const metadata = {
  title: 'Admin · Detalle pedido',
}

export default async function AdminPedidoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error || !data) notFound()

  const row = data as Record<string, unknown>
  const total = pickNumber(row, [
    'total',
    'total_amount',
    'amount',
    'grand_total',
  ])

  return (
    <div className="space-y-6">
      <Link
        href="/admin/pedidos"
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'sm' }),
          'text-carsa-primary'
        )}
      >
        ← Volver a pedidos
      </Link>
      <div>
        <h2 className="font-heading text-2xl font-semibold">Detalle del pedido</h2>
        <p className="text-sm text-muted-foreground">ID: {String(row.id)}</p>
      </div>

      <dl className="grid gap-4 rounded-xl border border-border/70 bg-card/40 p-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Cliente</dt>
          <dd className="font-medium">
            {pickField(row, [
              'customer_name',
              'full_name',
              'client_name',
              'nombre',
              'name',
            ])}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Teléfono</dt>
          <dd>
            {pickField(row, [
              'phone',
              'telefono',
              'customer_phone',
              'tel',
            ])}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Estado</dt>
          <dd>{pickField(row, ['status', 'estado', 'order_status'])}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Total</dt>
          <dd>{total != null ? formatMxn(total) : '—'}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-muted-foreground">Fecha</dt>
          <dd>{formatDate(row.created_at ?? row.fecha ?? row.date)}</dd>
        </div>
      </dl>

      <details className="rounded-lg border border-border/60 bg-muted/20 p-3 text-xs">
        <summary className="cursor-pointer font-medium text-muted-foreground">
          Datos crudos (JSON)
        </summary>
        <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-all">
          {JSON.stringify(data, null, 2)}
        </pre>
      </details>
    </div>
  )
}
