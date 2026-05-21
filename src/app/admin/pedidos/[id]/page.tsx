import Link from 'next/link'
import { notFound } from 'next/navigation'

import { CustomerWhatsAppButton } from '@/components/admin/customer-whatsapp-button'
import { buttonVariants } from '@/components/ui/button'
import { formatMxn } from '@/lib/format'
import { formatDate, pickField, pickNumber } from '@/lib/admin/row-display'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'

export const metadata = {
  title: 'Admin · Detalle pedido',
}

function formatOrderStatus(value: unknown): string {
  const s = String(value ?? '').toLowerCase()
  if (s === 'pending' || s === 'pendiente') return 'Pendiente'
  if (s === 'confirmed' || s === 'confirmado') return 'Confirmado'
  if (s === 'cancelled' || s === 'cancelado') return 'Cancelado'
  if (s === 'completed' || s === 'completado') return 'Completado'
  if (!s) return '—'
  return String(value)
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
  const customerName = pickField(row, [
    'customer_name',
    'full_name',
    'client_name',
    'nombre',
    'name',
  ])
  const customerPhone = pickField(row, [
    'phone',
    'telefono',
    'customer_phone',
    'tel',
  ])
  const phoneForWa =
    customerPhone !== '—' ? customerPhone : null

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
        <p className="text-sm text-muted-foreground">
          {customerName !== '—' ? customerName : 'Cliente'} ·{' '}
          {formatDate(row.created_at ?? row.fecha ?? row.date)}
        </p>
      </div>

      <dl className="grid gap-4 rounded-xl border border-border/70 bg-card/40 p-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Cliente</dt>
          <dd className="font-medium">{customerName}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-muted-foreground">Teléfono / WhatsApp</dt>
          <dd className="mt-1 space-y-2">
            <span className="font-medium">
              {phoneForWa ?? 'Sin teléfono registrado'}
            </span>
            <div>
              <CustomerWhatsAppButton
                phone={phoneForWa}
                customerName={customerName !== '—' ? customerName : undefined}
              />
            </div>
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Estado</dt>
          <dd>
            {formatOrderStatus(
              row.status ?? row.estado ?? row.order_status
            )}
          </dd>
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
    </div>
  )
}
