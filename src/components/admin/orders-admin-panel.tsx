'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Eye } from 'lucide-react'

import { AdminFeedbackBanner } from '@/components/admin/admin-feedback-banner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TireLoadingIcon } from '@/components/ui/tire-loading-icon'
import { createSupabaseBrowser } from '@/lib/supabase/client'

type OrderStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

type AdminOrder = {
  id: string
  customer_name: string | null
  customer_phone: string | null
  customer_email: string | null
  status: OrderStatus
  total: number | null
  notes: string | null
  created_at: string | null
  updated_at: string | null
}

type AdminOrderItem = {
  id: string
  order_id: string
  item_type: string | null
  item_id: string | null
  item_name: string | null
  quantity: number | null
  unit_price: number | null
  subtotal: number | null
  created_at: string | null
}

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'cancelled', label: 'Cancelado' },
  { value: 'completed', label: 'Completado' },
]

const money = new Intl.NumberFormat('es-EC', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
})

function formatDate(value: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('es-EC', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function StatusBadge({ status }: { status: OrderStatus }) {
  if (status === 'confirmed') {
    return (
      <Badge className="border-sky-500/30 bg-sky-500/15 text-sky-200">Confirmado</Badge>
    )
  }
  if (status === 'completed') {
    return (
      <Badge className="border-emerald-500/30 bg-emerald-500/15 text-emerald-200">
        Completado
      </Badge>
    )
  }
  if (status === 'cancelled') {
    return <Badge variant="destructive">Cancelado</Badge>
  }
  return (
    <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-200">
      Pendiente
    </Badge>
  )
}

export function OrdersAdminPanel() {
  const supabase = useMemo(() => createSupabaseBrowser(), [])
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [feedback, setFeedback] = useState<{
    variant: 'success' | 'error'
    text: string
  } | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all')
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null)
  const [detailItems, setDetailItems] = useState<AdminOrderItem[]>([])
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select(
        `
        id,
        customer_name,
        customer_phone,
        customer_email,
        status,
        total,
        notes,
        created_at,
        updated_at
      `
      )
      .order('created_at', { ascending: false })
      .limit(150)

    if (error) {
      setFeedback({ variant: 'error', text: 'No se pudieron cargar los pedidos.' })
    } else {
      setOrders((data ?? []) as AdminOrder[])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    queueMicrotask(() => {
      void load()
    })
  }, [load])

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase()
    return orders.filter((order) => {
      const byStatus = statusFilter === 'all' || order.status === statusFilter
      if (!byStatus) return false
      if (!term) return true
      const name = (order.customer_name ?? '').toLowerCase()
      const phone = (order.customer_phone ?? '').toLowerCase()
      return name.includes(term) || phone.includes(term)
    })
  }, [orders, search, statusFilter])

  const openDetail = async (order: AdminOrder) => {
    setSelectedOrder(order)
    setDetailItems([])
    setLoadingDetail(true)

    const { data, error } = await supabase
      .from('order_items')
      .select(
        `
        id,
        order_id,
        item_type,
        item_id,
        item_name,
        quantity,
        unit_price,
        subtotal,
        created_at
      `
      )
      .eq('order_id', order.id)
      .order('created_at', { ascending: true })

    if (error) {
      setFeedback({ variant: 'error', text: 'No se pudo cargar el detalle del pedido.' })
    } else {
      setDetailItems((data ?? []) as AdminOrderItem[])
    }
    setLoadingDetail(false)
  }

  const closeDetail = () => {
    setSelectedOrder(null)
    setDetailItems([])
  }

  const changeOrderStatus = async (nextStatus: OrderStatus) => {
    if (!selectedOrder) return
    if (selectedOrder.status === nextStatus) return

    setUpdatingStatus(true)
    const now = new Date().toISOString()
    const { error } = await supabase
      .from('orders')
      .update({ status: nextStatus, updated_at: now })
      .eq('id', selectedOrder.id)
    setUpdatingStatus(false)

    if (error) {
      setFeedback({
        variant: 'error',
        text: 'No se pudo actualizar el estado del pedido.',
      })
      return
    }

    setOrders((prev) =>
      prev.map((order) =>
        order.id === selectedOrder.id
          ? { ...order, status: nextStatus, updated_at: now }
          : order
      )
    )
    setSelectedOrder((prev) =>
      prev ? { ...prev, status: nextStatus, updated_at: now } : prev
    )
    setFeedback({ variant: 'success', text: 'Estado actualizado correctamente.' })
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            Pedidos
          </h2>
          <p className="text-sm text-muted-foreground">
            Revisa y gestiona pedidos y cotizaciones desde un solo lugar.
          </p>
        </div>
      </div>

      {feedback ? (
        <AdminFeedbackBanner variant={feedback.variant} message={feedback.text} />
      ) : null}

      <div className="grid gap-3 rounded-xl border border-border/70 bg-card/40 p-3 sm:grid-cols-[1fr_220px]">
        <div className="space-y-2">
          <Label htmlFor="orders-search">Buscar por nombre o teléfono</Label>
          <Input
            id="orders-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ej. Juan o 0991234567"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="orders-status">Filtrar por estado</Label>
          <Select
            items={[
              { value: 'all', label: 'Todos' },
              ...statusOptions.map((s) => ({ value: s.value, label: s.label })),
            ]}
            value={statusFilter}
            onValueChange={(value) => setStatusFilter((value as typeof statusFilter) ?? 'all')}
          >
            <SelectTrigger id="orders-status" className="h-9 w-full min-w-0">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/70 bg-card/40">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <TireLoadingIcon className="size-8" aria-label="Cargando pedidos" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead>Cliente</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="w-[110px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No hay pedidos para los filtros seleccionados.
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id} className="border-border/50">
                    <TableCell className="max-w-[220px]">
                      <p className="truncate font-medium" title={order.customer_name ?? ''}>
                        {order.customer_name?.trim() || 'Cliente sin nombre'}
                      </p>
                    </TableCell>
                    <TableCell>{order.customer_phone?.trim() || '—'}</TableCell>
                    <TableCell className="max-w-[240px]">
                      <p className="truncate" title={order.customer_email ?? ''}>
                        {order.customer_email?.trim() || '—'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {money.format(Number(order.total ?? 0))}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(order.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-carsa-primary"
                        onClick={() => void openDetail(order)}
                        aria-label={`Ver pedido de ${order.customer_name ?? 'cliente'}`}
                      >
                        <Eye className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={(open) => (!open ? closeDetail() : null)}>
        <DialogContent className="border-border/70 bg-card sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detalle del pedido</DialogTitle>
            <DialogDescription>
              Revisa la información del cliente, los productos y el estado del pedido.
            </DialogDescription>
          </DialogHeader>

          {selectedOrder ? (
            <div className="space-y-4">
              <div className="grid gap-3 rounded-lg border border-border/60 bg-muted/20 p-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Cliente</p>
                  <p className="text-sm font-medium">
                    {selectedOrder.customer_name?.trim() || 'Cliente sin nombre'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Teléfono</p>
                  <p className="text-sm">{selectedOrder.customer_phone?.trim() || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Correo</p>
                  <p className="text-sm">{selectedOrder.customer_email?.trim() || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fecha</p>
                  <p className="text-sm">{formatDate(selectedOrder.created_at)}</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-[260px_1fr]">
                <div className="space-y-2">
                  <Label htmlFor="order-status">Estado</Label>
                  <Select
                    items={statusOptions}
                    value={selectedOrder.status}
                    onValueChange={(value) => {
                      if (value) void changeOrderStatus(value as OrderStatus)
                    }}
                    disabled={updatingStatus}
                  >
                    <SelectTrigger id="order-status" className="h-9 w-full min-w-0">
                      <SelectValue placeholder="Selecciona estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Notas</p>
                  <p className="min-h-9 rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-sm">
                    {selectedOrder.notes?.trim() || 'Sin notas adicionales.'}
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border border-border/60">
                {loadingDetail ? (
                  <div className="flex items-center justify-center py-12 text-muted-foreground">
                    <TireLoadingIcon className="size-7" aria-label="Cargando detalle del pedido" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/60 hover:bg-transparent">
                        <TableHead>Producto o servicio</TableHead>
                        <TableHead className="w-20">Cant.</TableHead>
                        <TableHead className="w-36">Precio unitario</TableHead>
                        <TableHead className="w-36">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detailItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            Este pedido no tiene items registrados.
                          </TableCell>
                        </TableRow>
                      ) : (
                        detailItems.map((item) => (
                          <TableRow key={item.id} className="border-border/50">
                            <TableCell>
                              <p className="font-medium">{item.item_name?.trim() || 'Item sin nombre'}</p>
                            </TableCell>
                            <TableCell className="tabular-nums">{item.quantity ?? 0}</TableCell>
                            <TableCell className="tabular-nums">
                              {money.format(Number(item.unit_price ?? 0))}
                            </TableCell>
                            <TableCell className="tabular-nums">
                              {money.format(Number(item.subtotal ?? 0))}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>

              <div className="flex items-center justify-end">
                <p className="rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-sm font-semibold tabular-nums">
                  Total: {money.format(Number(selectedOrder.total ?? 0))}
                </p>
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDetail}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
