'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { ImageIcon, Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { Controller, useForm, useWatch, type Resolver } from 'react-hook-form'

import { AdminFeedbackBanner } from '@/components/admin/admin-feedback-banner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import { batterySchema, type BatteryFormValues } from '@/lib/admin/schemas'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { uploadProductImage } from '@/lib/supabase/storage-product-image'
import type { AdminBattery, AdminBatteryBrand } from '@/types/admin'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

const money = new Intl.NumberFormat('es-EC', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
})

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="mt-1 text-xs font-medium text-destructive" role="alert">
      {message}
    </p>
  )
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error !== null) {
    return JSON.stringify(error, null, 2)
  }
  return String(error)
}

export function BatteriesAdminPanel() {
  const supabase = useMemo(() => createSupabaseBrowser(), [])
  const [brands, setBrands] = useState<AdminBatteryBrand[]>([])
  const brandItems = useMemo(
    () => brands.map((b) => ({ value: b.id, label: b.name })),
    [brands]
  )
  const [rows, setRows] = useState<AdminBattery[]>([])
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState<{
    variant: 'success' | 'error'
    text: string
  } | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<AdminBattery | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminBattery | null>(null)
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const form = useForm<BatteryFormValues>({
    resolver: zodResolver(batterySchema) as Resolver<BatteryFormValues>,
    defaultValues: {
      brand_id: '',
      supplier_code: '',
      name: '',
      model: '',
      amperage: '',
      voltage: '',
      polarity: '',
      warranty_months: null,
      description: '',
      price: 0,
      stock: 0,
      image_url: '',
      is_active: true,
      is_featured: false,
    },
  })

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = form

  const isActiveForm = useWatch({ control, name: 'is_active' })
  const isFeaturedForm = useWatch({ control, name: 'is_featured' })
  const imageUrlForm = useWatch({ control, name: 'image_url' })
  const warrantyMonths = useWatch({ control, name: 'warranty_months' })
  const previewUrl = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : null),
    [imageFile]
  )

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const load = useCallback(async () => {
    setLoading(true)
    const [bRes, tRes] = await Promise.all([
      supabase.from('battery_brands').select('id, name').order('name'),
      supabase
        .from('batteries')
        .select(
          `
          id,
          brand_id,
          supplier_code,
          name,
          model,
          amperage,
          voltage,
          polarity,
          warranty_months,
          description,
          price,
          stock,
          image_url,
          is_active,
          is_featured,
          battery_brands ( id, name )
        `
        )
        .order('name'),
    ])
    if (bRes.error) {
      setFeedback({ variant: 'error', text: 'No se pudieron cargar las marcas.' })
    } else {
      setBrands((bRes.data ?? []) as AdminBatteryBrand[])
    }
    if (tRes.error) {
      setFeedback({ variant: 'error', text: 'No se pudieron cargar las baterías.' })
    } else {
      setRows((tRes.data ?? []) as AdminBattery[])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    queueMicrotask(() => {
      void load()
    })
  }, [load])

  const closeDialog = () => {
    setDialogOpen(false)
    setImageFile(null)
  }

  const openCreate = () => {
    setEditing(null)
    setImageFile(null)
    reset({
      brand_id: brands[0]?.id ?? '',
      supplier_code: '',
      name: '',
      model: '',
      amperage: '',
      voltage: '',
      polarity: '',
      warranty_months: null,
      description: '',
      price: 0,
      stock: 0,
      image_url: '',
      is_active: true,
      is_featured: false,
    })
    setDialogOpen(true)
  }

  const openEdit = (t: AdminBattery) => {
    setEditing(t)
    setImageFile(null)
    reset({
      brand_id: t.brand_id,
      supplier_code: t.supplier_code ?? '',
      name: t.name,
      model: t.model ?? '',
      amperage: t.amperage ?? '',
      voltage: t.voltage ?? '',
      polarity: t.polarity ?? '',
      warranty_months: t.warranty_months,
      description: t.description ?? '',
      price: Number(t.price),
      stock: t.stock,
      image_url: t.image_url ?? '',
      is_active: t.is_active,
      is_featured: t.is_featured,
    })
    setDialogOpen(true)
  }

  const onSubmit = handleSubmit(async (values) => {
    setSaving(true)
    setFeedback(null)

    if (imageFile) {
      if (!imageFile.type.startsWith('image/')) {
        setFeedback({ variant: 'error', text: 'El archivo debe ser una imagen.' })
        setSaving(false)
        return
      }
      if (imageFile.size > MAX_IMAGE_BYTES) {
        setFeedback({
          variant: 'error',
          text: 'La imagen no puede superar 5 MB.',
        })
        setSaving(false)
        return
      }
    }

    const now = new Date().toISOString()
    const warrantyNum =
      values.warranty_months === null || values.warranty_months === undefined
        ? null
        : Math.max(0, Math.floor(Number(values.warranty_months)))

    const payload = {
      brand_id: values.brand_id,
      supplier_code: values.supplier_code?.trim() || null,
      name: values.name.trim(),
      model: values.model?.trim() || null,
      amperage: values.amperage?.trim() || null,
      voltage: values.voltage?.trim() || null,
      polarity: values.polarity?.trim() || null,
      warranty_months: warrantyNum,
      description: values.description?.trim() || null,
      price: Number(values.price),
      stock: Math.floor(Number(values.stock)),
      image_url: values.image_url?.trim() || null,
      is_active: values.is_active,
      is_featured: values.is_featured,
      updated_at: now,
    }

    const uploadSelectedImage = async (file: File): Promise<string> => {
      const safeName = file.name
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, '-')
        .replace(/-+/g, '-')
      const objectPath = `${Date.now()}-${safeName}`
      const { publicUrl, error } = await uploadProductImage({
        folder: 'batteries',
        file,
        objectPath,
      })
      if (error || !publicUrl) {
        throw new Error('IMAGE_UPLOAD_FAILED')
      }
      return publicUrl
    }

    try {
      let nextImageUrl: string | null = payload.image_url

      if (imageFile) {
        nextImageUrl = await uploadSelectedImage(imageFile)
      }

      if (editing) {
        const { error } = await supabase
          .from('batteries')
          .update({ ...payload, image_url: nextImageUrl })
          .eq('id', editing.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('batteries')
          .insert({ ...payload, image_url: nextImageUrl })
          .select('id')
          .single()
        if (error) throw error
      }

      setFeedback({
        variant: 'success',
        text: editing ? 'Batería actualizada.' : 'Batería creada.',
      })
      closeDialog()
      await load()
    } catch (e: unknown) {
      console.error(
        editing
          ? '[admin/baterias] error al editar batería'
          : '[admin/baterias] error al crear batería',
        getErrorMessage(e)
      )
      if (e instanceof Error && e.message === 'IMAGE_UPLOAD_FAILED') {
        setFeedback({
          variant: 'error',
          text: 'No se pudo subir la imagen. Inténtalo nuevamente.',
        })
        return
      }
      setFeedback({
        variant: 'error',
        text: 'No se pudo guardar la batería.',
      })
    } finally {
      setSaving(false)
    }
  })

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setSaving(true)
    const { error } = await supabase.from('batteries').delete().eq('id', deleteTarget.id)
    setSaving(false)
    if (error) {
      setFeedback({
        variant: 'error',
        text: 'No se pudo eliminar la batería. Inténtalo nuevamente.',
      })
    } else {
      setFeedback({ variant: 'success', text: 'Batería eliminada.' })
      setDeleteTarget(null)
      void load()
    }
  }

  const displayImageSrc = previewUrl || imageUrlForm?.trim() || null

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            Baterías
          </h2>
          <p className="text-sm text-muted-foreground">
            Administra el inventario de baterías.
          </p>
        </div>
        <Button
          type="button"
          className="bg-carsa-primary text-white hover:bg-carsa-primary-hover"
          onClick={openCreate}
          disabled={brands.length === 0}
        >
          <Plus className="mr-2 size-4" />
          Nueva batería
        </Button>
      </div>

      {brands.length === 0 && !loading ? (
        <p className="text-sm text-amber-200/90">
          Crea al menos una marca en <strong>Marcas</strong> antes de añadir baterías.
        </p>
      ) : null}

      {feedback ? (
        <AdminFeedbackBanner variant={feedback.variant} message={feedback.text} />
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border/70 bg-card/40">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <TireLoadingIcon className="size-8" aria-label="Cargando baterías" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead>Nombre</TableHead>
                <TableHead>Amp. / V</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead className="w-24">Stock</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[120px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No hay baterías registradas.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((t) => (
                  <TableRow key={t.id} className="border-border/50">
                    <TableCell className="max-w-[420px]">
                      <p className="truncate font-medium" title={t.name}>
                        {t.name}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm tabular-nums">
                      <p className="truncate" title={[t.amperage, t.voltage].filter(Boolean).join(' · ')}>
                        {[t.amperage, t.voltage].filter(Boolean).join(' · ') || '—'}
                      </p>
                    </TableCell>
                    <TableCell className="tabular-nums">{money.format(Number(t.price))}</TableCell>
                    <TableCell className="tabular-nums">{t.stock}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge
                          variant={t.is_active ? 'default' : 'secondary'}
                          className={
                            t.is_active
                              ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-200'
                              : ''
                          }
                        >
                          {t.is_active ? 'Activa' : 'Inactiva'}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={
                            t.is_featured
                              ? 'border-amber-400/50 bg-amber-500/10 text-amber-200'
                              : 'border-border/80 text-muted-foreground'
                          }
                        >
                          {t.is_featured ? (
                            <span className="inline-flex items-center gap-1">
                              <Star className="size-3 fill-amber-400 text-amber-400" />
                              Destacada
                            </span>
                          ) : (
                            'Normal'
                          )}
                        </Badge>
                        {t.stock <= 3 ? (
                          <Badge variant="destructive" className="font-medium">
                            Bajo stock
                          </Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-carsa-primary"
                        onClick={() => openEdit(t)}
                        aria-label={`Editar ${t.name}`}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive"
                        onClick={() => setDeleteTarget(t)}
                        aria-label={`Eliminar ${t.name}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => (open ? setDialogOpen(true) : closeDialog())}>
        <DialogContent className="border-border/70 bg-card sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar batería' : 'Nueva batería'}</DialogTitle>
            <DialogDescription>
              Completa la información y guarda para actualizar el catálogo.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-2.5">
            <div className="space-y-2">
              <Label htmlFor="b-brand">Marca</Label>
              <Controller
                control={control}
                name="brand_id"
                render={({ field }) => (
                  <Select
                    items={brandItems}
                    modal={false}
                    value={field.value || null}
                    onValueChange={(v) => field.onChange(v ?? '')}
                  >
                    <SelectTrigger id="b-brand" size="default" className="h-9 w-full min-w-0">
                      <SelectValue placeholder="Selecciona marca" />
                    </SelectTrigger>
                    <SelectContent className="z-[200]">
                      {brands.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.brand_id?.message} />
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="b-code">Código proveedor</Label>
                <Input id="b-code" placeholder="Opcional" {...register('supplier_code')} />
                <FieldError message={errors.supplier_code?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="b-warranty">Garantía (meses)</Label>
                <Input
                  id="b-warranty"
                  type="number"
                  min={0}
                  placeholder="Opcional"
                  value={warrantyMonths ?? ''}
                  onChange={(e) => {
                    const raw = e.target.value
                    if (raw === '') {
                      setValue('warranty_months', null, { shouldValidate: true })
                      return
                    }
                    const n = parseInt(raw, 10)
                    if (Number.isNaN(n)) {
                      setValue('warranty_months', null, { shouldValidate: true })
                      return
                    }
                    setValue('warranty_months', Math.max(0, n), { shouldValidate: true })
                  }}
                />
                <FieldError message={errors.warranty_months?.message} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="b-name">Nombre</Label>
              <Input id="b-name" {...register('name')} />
              <FieldError message={errors.name?.message} />
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="b-model">Modelo</Label>
                <Input id="b-model" placeholder="Opcional" {...register('model')} />
                <FieldError message={errors.model?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="b-amp">Amperaje</Label>
                <Input id="b-amp" placeholder="Opcional" {...register('amperage')} />
                <FieldError message={errors.amperage?.message} />
              </div>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="b-v">Voltaje</Label>
                <Input id="b-v" placeholder="Opcional" {...register('voltage')} />
                <FieldError message={errors.voltage?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="b-pol">Polaridad</Label>
                <Input id="b-pol" placeholder="Opcional" {...register('polarity')} />
                <FieldError message={errors.polarity?.message} />
              </div>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="b-price">Precio</Label>
                <Input id="b-price" type="number" step="0.01" min={0} {...register('price')} />
                <FieldError message={errors.price?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="b-stock">Stock</Label>
                <Input id="b-stock" type="number" min={0} step={1} {...register('stock')} />
                <FieldError message={errors.stock?.message} />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 rounded-lg border border-border/50 bg-muted/20 px-3 py-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={Boolean(isActiveForm)}
                  onChange={(e) => setValue('is_active', e.target.checked)}
                />
                Activa en catálogo
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={Boolean(isFeaturedForm)}
                  onChange={(e) => setValue('is_featured', e.target.checked)}
                />
                <Star className="size-3.5 text-amber-400" aria-hidden />
                Destacada
              </label>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="b-desc">Descripción</Label>
                <Textarea
                  id="b-desc"
                  rows={2}
                  placeholder="Opcional"
                  {...register('description')}
                />
                <FieldError message={errors.description?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="b-img">Imagen</Label>
                <Input
                  id="b-img"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="cursor-pointer"
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                />
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, WebP o GIF · máx. 5 MB.
                </p>
                <div className="flex min-h-[92px] items-center justify-center overflow-hidden rounded-lg border border-dashed border-border/80 bg-muted/30 p-2">
                  {displayImageSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element -- blob: y URLs externas
                    <img
                      src={displayImageSrc}
                      alt="Vista previa"
                      className="max-h-28 w-auto max-w-full rounded-md object-contain shadow-sm"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                      <ImageIcon className="size-7 opacity-40" />
                      <span className="text-xs">Sin imagen</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={closeDialog}>
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

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="border-border/70 bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle>¿Eliminar batería?</DialogTitle>
            <DialogDescription>
              Vas a eliminar{' '}
              <strong className="text-foreground">
                {deleteTarget?.name ?? 'esta batería'}
              </strong>
              . Esta acción no se puede deshacer. Si hay pedidos vinculados, el sistema puede
              rechazar el borrado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={saving}
              onClick={() => void confirmDelete()}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
