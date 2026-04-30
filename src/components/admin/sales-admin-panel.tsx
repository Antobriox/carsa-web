'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Eye, Plus } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch, type Resolver } from 'react-hook-form'
import { z } from 'zod'

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
import { Textarea } from '@/components/ui/textarea'
import { TireLoadingIcon } from '@/components/ui/tire-loading-icon'
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

const paymentOptions: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'transfer', label: 'Transferencia' },
  { value: 'card', label: 'Tarjeta' },
  { value: 'other', label: 'Otro' },
]

const saleFormSchema = z.object({
  customer_name: z.string().min(1, 'Nombre requerido').max(180),
  customer_phone: z.string().min(1, 'Teléfono requerido').max(60),
  payment_method: z.enum(['cash', 'transfer', 'card', 'other']),
  total: z.coerce.number().min(0, 'Total no puede ser negativo'),
  notes: z.string().max(5000).optional().or(z.literal('')),
})

type SaleFormValues = z.infer<typeof saleFormSchema>

const money = new Intl.NumberFormat('es-EC', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
})

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

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="mt-1 text-xs font-medium text-destructive" role="alert">
      {message}
    </p>
  )
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

  const [search, setSearch] = useState('')
  const [paymentFilter, setPaymentFilter] = useState<'all' | PaymentMethod>('all')
  const [dateFilter, setDateFilter] = useState('')

  const [createOpen, setCreateOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedSale, setSelectedSale] = useState<AdminSale | null>(null)
  const [detailItems, setDetailItems] = useState<AdminSaleItem[]>([])

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleFormSchema) as Resolver<SaleFormValues>,
    defaultValues: {
      customer_name: '',
      customer_phone: '',
      payment_method: 'cash',
      total: 0,
      notes: '',
    },
  })
  const paymentMethodForm = useWatch({
    control: form.control,
    name: 'payment_method',
  })

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

  useEffect(() => {
    queueMicrotask(() => {
      void load()
    })
  }, [load])

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

  const openNewSale = () => {
    form.reset({
      customer_name: '',
      customer_phone: '',
      payment_method: 'cash',
      total: 0,
      notes: '',
    })
    setCreateOpen(true)
  }

  const submitSale = form.handleSubmit(async (values) => {
    setSaving(true)
    setFeedback(null)
    const now = new Date().toISOString()
    const payload = {
      customer_name: values.customer_name.trim(),
      customer_phone: values.customer_phone.trim(),
      payment_method: values.payment_method,
      total: Number(values.total),
      notes: values.notes?.trim() || null,
      updated_at: now,
    }

    const { error } = await supabase.from('sales').insert(payload)
    setSaving(false)

    if (error) {
      setFeedback({
        variant: 'error',
        text: 'No se pudo registrar la venta. Inténtalo nuevamente.',
      })
      return
    }

    setCreateOpen(false)
    setFeedback({ variant: 'success', text: 'Venta registrada correctamente.' })
    await load()
  })

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
            Revisa el historial y registra nuevas ventas.
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

      {feedback ? (
        <AdminFeedbackBanner variant={feedback.variant} message={feedback.text} />
      ) : null}

      <div className="grid gap-3 rounded-xl border border-border/70 bg-card/40 p-3 sm:grid-cols-3">
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
            items={[
              { value: 'all', label: 'Todos' },
              ...paymentOptions.map((p) => ({ value: p.value, label: p.label })),
            ]}
            value={paymentFilter}
            onValueChange={(value) => setPaymentFilter((value as typeof paymentFilter) ?? 'all')}
          >
            <SelectTrigger id="sales-method" className="h-9 w-full min-w-0">
              <SelectValue placeholder="Filtrar método" />
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

      <div className="overflow-hidden rounded-xl border border-border/70 bg-card/40">
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

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="border-border/70 bg-card sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Nueva venta</DialogTitle>
            <DialogDescription>
              Registra una venta manual con la información principal.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitSale} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sale-customer-name">Nombre del cliente</Label>
                <Input id="sale-customer-name" {...form.register('customer_name')} />
                <FieldError message={form.formState.errors.customer_name?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sale-customer-phone">Teléfono</Label>
                <Input id="sale-customer-phone" {...form.register('customer_phone')} />
                <FieldError message={form.formState.errors.customer_phone?.message} />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sale-payment-method">Método de pago</Label>
                <Select
                  items={paymentOptions}
                  value={paymentMethodForm}
                  onValueChange={(value) => {
                    form.setValue('payment_method', (value as PaymentMethod) ?? 'cash')
                  }}
                >
                  <SelectTrigger id="sale-payment-method" className="h-9 w-full min-w-0">
                    <SelectValue placeholder="Selecciona método" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError message={form.formState.errors.payment_method?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sale-total">Total</Label>
                <Input
                  id="sale-total"
                  type="number"
                  min={0}
                  step="0.01"
                  {...form.register('total')}
                />
                <FieldError message={form.formState.errors.total?.message} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sale-notes">Notas</Label>
              <Textarea
                id="sale-notes"
                rows={3}
                placeholder="Opcional"
                {...form.register('notes')}
              />
              <FieldError message={form.formState.errors.notes?.message} />
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-carsa-primary text-white hover:bg-carsa-primary-hover"
              >
                {saving ? (
                  <span className="inline-flex items-center gap-2">
                    <TireLoadingIcon className="size-4" decorative />
                    Guardando…
                  </span>
                ) : (
                  'Guardar'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="border-border/70 bg-card sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detalle de venta</DialogTitle>
            <DialogDescription>
              Revisa datos del cliente, método de pago, notas y items vendidos.
            </DialogDescription>
          </DialogHeader>

          {selectedSale ? (
            <div className="space-y-4">
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

              <div className="overflow-hidden rounded-lg border border-border/60">
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDetailOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
