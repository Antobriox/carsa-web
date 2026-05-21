'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Eye, Plus } from 'lucide-react'

import { registerSaleFromOrder } from '@/app/admin/ventas/actions'
import { adminDialogWide } from '@/lib/admin-dialog-classes'
import { sanitizeUserMessage } from '@/lib/user-facing-error'
import { publishCatalogInventoryBroadcast } from '@/lib/catalog-inventory-broadcast'
import { AdminFloatingToast } from '@/components/admin/admin-floating-toast'
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
import { Textarea } from '@/components/ui/textarea'
import { TireLoadingIcon } from '@/components/ui/tire-loading-icon'
import { useSupabaseTableDebouncedRefresh } from '@/hooks/use-supabase-table-debounced-refresh'
import { createSupabaseBrowser } from '@/lib/supabase/client'

type PaymentMethod = 'cash' | 'transfer' | 'card' | 'other'

type AdminSale = {
  id: string
  order_id: string | null
  customer_id: string | null
  customer_name: string | null
  customer_phone: string | null
  payment_method: PaymentMethod
  total: number | null
  notes: string | null
  created_at: string | null
  updated_at: string | null
}

type AdminSaleItem = {
  id: string
  sale_id: string
  item_type: string | null
  item_id: string | null
  item_name: string | null
  quantity: number | null
  unit_price: number | null
  subtotal: number | null
  created_at: string | null
}

type AdminOrderOption = {
  id: string
  customer_id: string | null
  customer_name: string | null
  customer_phone: string | null
  customer_email: string | null
  status: string | null
  total: number | string | null
  created_at: string | null
}

type AdminOrderItemRow = {
  id: string
  item_type: string | null
  item_id: string | null
  item_name: string | null
  quantity: number | null
  unit_price: number | null
  subtotal: number | null
}

const paymentOptions: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'transfer', label: 'Transferencia' },
  { value: 'card', label: 'Tarjeta' },
  { value: 'other', label: 'Otro' },
]

function paymentLabel(method: PaymentMethod): string {
  return paymentOptions.find((p) => p.value === method)?.label ?? 'Efectivo'
}

const money = new Intl.NumberFormat('es-EC', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
})

function num(v: unknown): number {
  const n = typeof v === 'string' ? Number(v) : Number(v)
  return Number.isFinite(n) ? n : 0
}

function orderStatusLabel(status: string | null | undefined): string {
  const s = (status ?? '').toLowerCase()
  if (s === 'pending') return 'pendiente'
  if (s === 'confirmed') return 'confirmado'
  if (s === 'completed') return 'completado'
  if (s === 'cancelled') return 'cancelado'
  return s || '—'
}

/** Fecha del pedido solo día (p. ej. 06/05/2026) para el selector y el resumen. */
function formatOrderDateShort(value: string | null | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('es-EC', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function formatOrderEmailSegment(email: string | null | undefined): string {
  const e = (email ?? '').trim()
  return e ? e : 'sin correo'
}

/**
 * Etiqueta legible para identificar el pedido (el valor interno del select es el id, no visible).
 * Formato: Nombre · Teléfono · Correo · Total · Fecha · Estado
 */
function formatOrderSelectLabel(o: AdminOrderOption): string {
  const name = (o.customer_name ?? '').trim() || 'Cliente'
  const phone = (o.customer_phone ?? '').trim() || '—'
  const emailSeg = formatOrderEmailSegment(o.customer_email)
  const totalStr = money.format(num(o.total))
  const dateStr = formatOrderDateShort(o.created_at)
  const statusStr = orderStatusLabel(o.status)
  return `${name} · ${phone} · ${emailSeg} · ${totalStr} · ${dateStr} · ${statusStr}`
}

function itemTypeLabel(t: string | null | undefined): string {
  const x = (t ?? '').toLowerCase()
  if (x === 'tire') return 'Llanta'
  if (x === 'battery') return 'Batería'
  if (x === 'service') return 'Servicio'
  return 'Ítem'
}

function PaymentBadge({ method }: { method: PaymentMethod }) {
  if (method === 'cash') {
    return <Badge className="border-emerald-500/30 bg-emerald-500/15 text-emerald-200">Efectivo</Badge>
  }
  if (method === 'transfer') {
    return <Badge className="border-sky-500/30 bg-sky-500/15 text-sky-200">Transferencia</Badge>
  }
  if (method === 'card') {
    return <Badge className="border-violet-500/30 bg-violet-500/15 text-violet-200">Tarjeta</Badge>
  }
  return (
    <Badge variant="outline" className="border-border/80 text-muted-foreground">
      Otro
    </Badge>
  )
}

function formatDate(value: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('es-EC', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function SalesAdminPanel() {
  const supabase = useMemo(() => createSupabaseBrowser(), [])
  const [sales, setSales] = useState<AdminSale[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{
    variant: 'success' | 'error'
    text: string
  } | null>(null)
  const dismissFeedback = useCallback(() => setFeedback(null), [])

  const [search, setSearch] = useState('')
  const [paymentFilter, setPaymentFilter] = useState<'all' | PaymentMethod>('all')
  const [dateFilter, setDateFilter] = useState('')

  const [createOpen, setCreateOpen] = useState(false)

  const [ordersForSale, setOrdersForSale] = useState<AdminOrderOption[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string>('')
  const [orderItemsPreview, setOrderItemsPreview] = useState<AdminOrderItemRow[]>([])
  const [loadingOrderItems, setLoadingOrderItems] = useState(false)

  const [fromOrderPayment, setFromOrderPayment] = useState<PaymentMethod>('cash')
  const [fromOrderNotes, setFromOrderNotes] = useState('')

  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedSale, setSelectedSale] = useState<AdminSale | null>(null)
  const [detailItems, setDetailItems] = useState<AdminSaleItem[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('sales')
      .select(
        `
        id,
        order_id,
        customer_id,
        customer_name,
        customer_phone,
        payment_method,
        total,
        notes,
        created_at,
        updated_at
      `
      )
      .order('created_at', { ascending: false })
      .limit(150)

    if (error) {
      setFeedback({ variant: 'error', text: 'No se pudieron cargar las ventas.' })
    } else {
      setSales((data ?? []) as AdminSale[])
    }
    setLoading(false)
  }, [supabase])

  const loadOrdersForSale = useCallback(async () => {
    setLoadingOrders(true)
    const { data, error } = await supabase
      .from('orders')
      .select(
        'id, customer_id, customer_name, customer_phone, customer_email, status, total, created_at'
      )
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) {
      setFeedback({
        variant: 'error',
        text: 'No se pudieron cargar los pedidos disponibles.',
      })
      setOrdersForSale([])
    } else {
      setOrdersForSale((data ?? []) as AdminOrderOption[])
    }
    setLoadingOrders(false)
  }, [supabase])

  useEffect(() => {
    queueMicrotask(() => {
      void load()
    })
  }, [load])

  const refreshSalesAndOrderPicklist = useCallback(() => {
    void load()
    void loadOrdersForSale()
  }, [load, loadOrdersForSale])

  useSupabaseTableDebouncedRefresh('sales', refreshSalesAndOrderPicklist)
  useSupabaseTableDebouncedRefresh('orders', refreshSalesAndOrderPicklist)

  useEffect(() => {
    if (!createOpen) return
    queueMicrotask(() => {
      void loadOrdersForSale()
    })
  }, [createOpen, loadOrdersForSale])

  useEffect(() => {
    if (!createOpen || !selectedOrderId) return

    let cancelled = false
    const run = async () => {
      setLoadingOrderItems(true)
      const { data, error } = await supabase
        .from('order_items')
        .select(
          'id, item_type, item_id, item_name, quantity, unit_price, subtotal'
        )
        .eq('order_id', selectedOrderId)
        .order('created_at', { ascending: true })

      if (!cancelled) {
        if (error) {
          setOrderItemsPreview([])
          setFeedback({
            variant: 'error',
            text: 'No se pudieron cargar los productos del pedido.',
          })
        } else {
          setOrderItemsPreview((data ?? []) as AdminOrderItemRow[])
        }
        setLoadingOrderItems(false)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [createOpen, selectedOrderId, supabase])

  const filteredSales = useMemo(() => {
    const term = search.trim().toLowerCase()
    return sales.filter((sale) => {
      const byMethod = paymentFilter === 'all' || sale.payment_method === paymentFilter
      if (!byMethod) return false

      const byDate =
        !dateFilter || (sale.created_at ? sale.created_at.slice(0, 10) === dateFilter : false)
      if (!byDate) return false

      if (!term) return true
      const name = (sale.customer_name ?? '').toLowerCase()
      const phone = (sale.customer_phone ?? '').toLowerCase()
      return name.includes(term) || phone.includes(term)
    })
  }, [sales, search, paymentFilter, dateFilter])

  const selectedOrder = useMemo(
    () => ordersForSale.find((o) => o.id === selectedOrderId) ?? null,
    [ordersForSale, selectedOrderId]
  )

  const openNewSale = () => {
    setSelectedOrderId('')
    setOrderItemsPreview([])
    setFromOrderPayment('cash')
    setFromOrderNotes('')
    setCreateOpen(true)
  }

  const submitFromOrder = async () => {
    setFeedback(null)
    if (!selectedOrderId) {
      setFeedback({
        variant: 'error',
        text: 'Selecciona un pedido para continuar.',
      })
      return
    }

    setSaving(true)
    const result = await registerSaleFromOrder({
      order_id: selectedOrderId,
      payment_method: fromOrderPayment,
      notes: fromOrderNotes.trim() || null,
    })
    setSaving(false)

    if (!result.ok) {
      setFeedback({
        variant: 'error',
        text: sanitizeUserMessage(result.message),
      })
      return
    }

    for (const row of result.inventory) {
      publishCatalogInventoryBroadcast({
        table: row.table,
        id: row.id,
        stock: row.stock,
      })
    }

    setCreateOpen(false)
    setSelectedOrderId('')
    setOrderItemsPreview([])
    setFromOrderNotes('')
    setFeedback({ variant: 'success', text: 'Venta registrada correctamente.' })
    await load()
  }

  const openDetail = async (sale: AdminSale) => {
    setSelectedSale(sale)
    setDetailItems([])
    setDetailOpen(true)
    setLoadingDetail(true)

    const { data, error } = await supabase
      .from('sale_items')
      .select(
        `
        id,
        sale_id,
        item_type,
        item_id,
        item_name,
        quantity,
        unit_price,
        subtotal,
        created_at
      `
      )
      .eq('sale_id', sale.id)
      .order('created_at', { ascending: true })

    if (error) {
      setFeedback({ variant: 'error', text: 'No se pudo cargar el detalle de la venta.' })
    } else {
      setDetailItems((data ?? []) as AdminSaleItem[])
    }
    setLoadingDetail(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            Ventas
          </h2>
          <p className="text-sm text-muted-foreground">
            Historial de ventas y registro desde pedidos ya confirmados con el cliente.
          </p>
        </div>
        <Button
          type="button"
          className="bg-carsa-primary text-white hover:bg-carsa-primary-hover"
          onClick={openNewSale}
        >
          <Plus className="mr-2 size-4" />
          Nueva venta
        </Button>
      </div>

      <AdminFloatingToast
        open={Boolean(feedback?.text)}
        variant={feedback?.variant ?? 'success'}
        message={feedback?.text ?? ''}
        onDismiss={dismissFeedback}
      />

      <div className="grid gap-3 rounded-xl border border-border/70 bg-card/40 p-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="sales-search">Buscar por cliente o teléfono</Label>
          <Input
            id="sales-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ej. Juan o 0991234567"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sales-method">Método de pago</Label>
          <Select
            value={paymentFilter}
            onValueChange={(value) =>
              setPaymentFilter(
                value === 'all' ||
                  value === 'cash' ||
                  value === 'transfer' ||
                  value === 'card' ||
                  value === 'other'
                  ? (value as typeof paymentFilter)
                  : 'all'
              )
            }
          >
            <SelectTrigger id="sales-method" className="h-9 w-full min-w-0">
              <span
                data-slot="select-value"
                className="flex flex-1 truncate text-left text-sm"
              >
                {paymentFilter === 'all' ? 'Todos' : paymentLabel(paymentFilter)}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {paymentOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="sales-date">Fecha</Label>
          <Input
            id="sales-date"
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="min-w-0 max-w-full overflow-x-auto rounded-xl border border-border/70 bg-card/40">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <TireLoadingIcon className="size-8" aria-label="Cargando ventas" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead>Cliente</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Método de pago</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="w-[110px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No hay ventas para los filtros seleccionados.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSales.map((sale) => (
                  <TableRow key={sale.id} className="border-border/50">
                    <TableCell className="max-w-[220px]">
                      <p className="truncate font-medium" title={sale.customer_name ?? ''}>
                        {sale.customer_name?.trim() || 'Cliente sin nombre'}
                      </p>
                    </TableCell>
                    <TableCell>{sale.customer_phone?.trim() || '—'}</TableCell>
                    <TableCell>
                      <PaymentBadge method={sale.payment_method} />
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {money.format(Number(sale.total ?? 0))}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(sale.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-carsa-primary"
                        onClick={() => void openDetail(sale)}
                        aria-label={`Ver venta de ${sale.customer_name ?? 'cliente'}`}
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

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open)
          if (!open) {
            setSelectedOrderId('')
            setOrderItemsPreview([])
            setFromOrderNotes('')
          }
        }}
      >
        <DialogContent className="flex max-h-[min(92dvh,720px)] w-[min(100%-1rem,40rem)] flex-col gap-0 overflow-hidden border-border/70 bg-card p-0 sm:max-w-none">
          <DialogHeader className="shrink-0 border-b border-border/50 px-4 py-2.5 pr-10">
            <DialogTitle className="text-base leading-tight">Nueva venta</DialogTitle>
          </DialogHeader>

          <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
            <div className="space-y-2">
              <div className="space-y-1.5">
                <Label htmlFor="sale-pick-order">Seleccionar pedido confirmado</Label>
                {loadingOrders ? (
                  <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
                    <TireLoadingIcon className="size-4" decorative />
                    Cargando pedidos…
                  </div>
                ) : ordersForSale.length === 0 ? (
                  <p className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                    No hay pedidos confirmados listos para venta. Revisa en Pedidos que el estado
                    sea “Confirmado” antes de registrar aquí.
                  </p>
                ) : (
                  <Select
                    value={selectedOrderId}
                    onValueChange={(value) => {
                      setSelectedOrderId(value ?? '')
                      setOrderItemsPreview([])
                    }}
                  >
                    <SelectTrigger
                      id="sale-pick-order"
                      className="h-auto min-h-9 w-full min-w-0 py-1.5 text-left [&>span]:line-clamp-2 [&>span]:text-left [&>span]:text-xs [&>span]:leading-snug sm:[&>span]:text-sm"
                    >
                      {selectedOrderId === '' ? (
                        <SelectValue placeholder="Selecciona un pedido confirmado" />
                      ) : (
                        <span
                          data-slot="select-value"
                          className="flex flex-1 text-left text-xs leading-snug line-clamp-2 sm:text-sm"
                        >
                          {selectedOrder
                            ? formatOrderSelectLabel(selectedOrder)
                            : 'Selecciona un pedido confirmado'}
                        </span>
                      )}
                    </SelectTrigger>
                    <SelectContent className="max-h-80 min-w-[var(--anchor-width)]">
                      {ordersForSale.map((o) => (
                        <SelectItem key={o.id} value={o.id}>
                          <span className="block max-w-[min(100vw-2rem,36rem)] whitespace-normal text-left text-sm leading-snug">
                            {formatOrderSelectLabel(o)}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {selectedOrder ? (
                <div className="space-y-1.5 rounded-lg border border-border/60 bg-muted/15 p-2.5">
                  <p className="text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground">
                    Productos del pedido
                  </p>
                  <div className="scrollbar-none overflow-x-auto rounded-md border border-border/50">
                      {loadingOrderItems ? (
                        <div className="flex justify-center py-8 text-muted-foreground">
                          <TireLoadingIcon className="size-6" decorative />
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow className="border-border/50 hover:bg-transparent">
                              <TableHead>Tipo</TableHead>
                              <TableHead>Descripción</TableHead>
                              <TableHead className="w-12 text-right">Cant.</TableHead>
                              <TableHead className="w-28 text-right">Precio u.</TableHead>
                              <TableHead className="w-28 text-right">Subtotal</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {orderItemsPreview.length === 0 ? (
                              <TableRow>
                                <TableCell
                                  colSpan={5}
                                  className="text-center text-sm text-muted-foreground"
                                >
                                  Este pedido no tiene productos listados.
                                </TableCell>
                              </TableRow>
                            ) : (
                              orderItemsPreview.map((row) => (
                                <TableRow key={row.id} className="border-border/40">
                                  <TableCell className="text-xs text-muted-foreground">
                                    {itemTypeLabel(row.item_type)}
                                  </TableCell>
                                  <TableCell className="max-w-[180px]">
                                    <p className="truncate text-sm font-medium" title={row.item_name ?? ''}>
                                      {row.item_name?.trim() || '—'}
                                    </p>
                                  </TableCell>
                                  <TableCell className="text-right tabular-nums text-sm">
                                    {row.quantity ?? 0}
                                  </TableCell>
                                  <TableCell className="text-right tabular-nums text-sm">
                                    {money.format(num(row.unit_price))}
                                  </TableCell>
                                  <TableCell className="text-right tabular-nums text-sm">
                                    {money.format(num(row.subtotal))}
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      )}
                  </div>
                </div>
              ) : null}

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="sale-from-order-payment">Método de pago</Label>
                  <Select
                    value={fromOrderPayment}
                    onValueChange={(value) => {
                      const next: PaymentMethod =
                        value === 'cash' ||
                        value === 'transfer' ||
                        value === 'card' ||
                        value === 'other'
                          ? value
                          : 'cash'
                      setFromOrderPayment(next)
                    }}
                  >
                    <SelectTrigger id="sale-from-order-payment" className="h-9 w-full min-w-0">
                      <span
                        data-slot="select-value"
                        className="flex flex-1 truncate text-left text-sm"
                      >
                        {paymentLabel(fromOrderPayment)}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      {paymentOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="sale-from-order-notes">Notas (opcional)</Label>
                  <Textarea
                    id="sale-from-order-notes"
                    rows={2}
                    className="min-h-0 resize-none text-sm"
                    placeholder="Ej. factura a nombre de…"
                    value={fromOrderNotes}
                    onChange={(e) => setFromOrderNotes(e.target.value)}
                    maxLength={5000}
                  />
                </div>
              </div>

              <DialogFooter className="mt-2 !mx-0 !mb-0 shrink-0 gap-2 border-0 bg-transparent px-0 py-0 pt-1 sm:justify-end">
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  type="button"
                  disabled={saving || !selectedOrderId || loadingOrders}
                  onClick={() => void submitFromOrder()}
                  className="bg-carsa-primary text-white hover:bg-carsa-primary-hover"
                >
                  {saving ? (
                    <span className="inline-flex items-center gap-2">
                      <TireLoadingIcon className="size-4" decorative />
                      Guardando…
                    </span>
                  ) : (
                    'Guardar venta'
                  )}
                </Button>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className={adminDialogWide}>
          <DialogHeader className="shrink-0 px-4 pt-4 sm:px-6">
            <DialogTitle>Detalle de venta</DialogTitle>
            <DialogDescription>
              Revisa datos del cliente, método de pago, notas y items vendidos.
            </DialogDescription>
          </DialogHeader>

          {selectedSale ? (
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 pb-4 sm:px-6">
              <div className="grid gap-3 rounded-lg border border-border/60 bg-muted/20 p-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Cliente</p>
                  <p className="text-sm font-medium">
                    {selectedSale.customer_name?.trim() || 'Cliente sin nombre'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Teléfono</p>
                  <p className="text-sm">{selectedSale.customer_phone?.trim() || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Método de pago</p>
                  <div className="pt-1">
                    <PaymentBadge method={selectedSale.payment_method} />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fecha</p>
                  <p className="text-sm">{formatDate(selectedSale.created_at)}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Notas</p>
                <p className="min-h-9 rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-sm">
                  {selectedSale.notes?.trim() || 'Sin notas adicionales.'}
                </p>
              </div>

              <div className="table-scroll rounded-lg border border-border/60">
                {loadingDetail ? (
                  <div className="flex items-center justify-center py-12 text-muted-foreground">
                    <TireLoadingIcon className="size-7" aria-label="Cargando detalle de venta" />
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
                            Esta venta no tiene items registrados.
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
                  Total: {money.format(Number(selectedSale.total ?? 0))}
                </p>
              </div>
            </div>
          ) : null}

          <DialogFooter className="shrink-0 border-t border-border/60 px-4 py-3 sm:px-6">
            <Button type="button" variant="outline" onClick={() => setDetailOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
