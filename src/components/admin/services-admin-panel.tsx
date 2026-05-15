'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { ImageIcon, Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { useForm, useWatch, type Resolver } from 'react-hook-form'

import { AdminFloatingToast } from '@/components/admin/admin-floating-toast'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { TireLoadingIcon } from '@/components/ui/tire-loading-icon'
import { serviceSchema, type ServiceFormValues } from '@/lib/admin/schemas'
import { devError } from '@/lib/dev-log'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { uploadProductImage } from '@/lib/supabase/storage-product-image'
import type { AdminService } from '@/types/admin'

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

export function ServicesAdminPanel() {
  const supabase = useMemo(() => createSupabaseBrowser(), [])
  const [rows, setRows] = useState<AdminService[]>([])
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState<{
    variant: 'success' | 'error'
    text: string
  } | null>(null)
  const dismissFeedback = useCallback(() => setFeedback(null), [])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<AdminService | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminService | null>(null)
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema) as Resolver<ServiceFormValues>,
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      price: 0,
      image_url: '',
      is_active: true,
      is_featured: false,
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = form

  const isActiveForm = useWatch({ control: form.control, name: 'is_active' })
  const isFeaturedForm = useWatch({ control: form.control, name: 'is_featured' })
  const imageUrlForm = useWatch({ control: form.control, name: 'image_url' })
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
    const { data, error } = await supabase
      .from('services')
      .select(
        `
        id,
        name,
        slug,
        description,
        price,
        image_url,
        is_active,
        is_featured
      `
      )
      .order('name')

    if (error) {
      setFeedback({ variant: 'error', text: 'No se pudieron cargar los servicios.' })
    } else {
      setRows((data ?? []) as AdminService[])
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
      name: '',
      slug: '',
      description: '',
      price: 0,
      image_url: '',
      is_active: true,
      is_featured: false,
    })
    setDialogOpen(true)
  }

  const openEdit = (service: AdminService) => {
    setEditing(service)
    setImageFile(null)
    reset({
      name: service.name,
      slug: service.slug,
      description: service.description ?? '',
      price: Number(service.price),
      image_url: service.image_url ?? '',
      is_active: service.is_active,
      is_featured: service.is_featured,
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
    const payload = {
      name: values.name.trim(),
      slug: values.slug.trim().toLowerCase(),
      description: values.description?.trim() || null,
      price: Number(values.price),
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
        folder: 'services',
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
          .from('services')
          .update({ ...payload, image_url: nextImageUrl })
          .eq('id', editing.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('services')
          .insert({ ...payload, image_url: nextImageUrl })
          .select('id')
          .single()
        if (error) throw error
      }

      setFeedback({
        variant: 'success',
        text: editing ? 'Servicio actualizado.' : 'Servicio creado.',
      })
      closeDialog()
      await load()
    } catch (e: unknown) {
      devError(
        editing
          ? '[admin/servicios] error al editar servicio'
          : '[admin/servicios] error al crear servicio',
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
        text: 'No se pudo guardar el servicio.',
      })
    } finally {
      setSaving(false)
    }
  })

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setSaving(true)
    const { error } = await supabase.from('services').delete().eq('id', deleteTarget.id)
    setSaving(false)

    if (error) {
      setFeedback({
        variant: 'error',
        text: 'No se pudo eliminar el servicio. Inténtalo nuevamente.',
      })
    } else {
      setFeedback({ variant: 'success', text: 'Servicio eliminado.' })
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
            Servicios
          </h2>
          <p className="text-sm text-muted-foreground">
            Administra los servicios del catálogo.
          </p>
        </div>
        <Button
          type="button"
          className="bg-carsa-primary text-white hover:bg-carsa-primary-hover"
          onClick={openCreate}
        >
          <Plus className="mr-2 size-4" />
          Nuevo servicio
        </Button>
      </div>

      <AdminFloatingToast
        open={Boolean(feedback?.text)}
        variant={feedback?.variant ?? 'success'}
        message={feedback?.text ?? ''}
        onDismiss={dismissFeedback}
      />

      <div className="min-w-0 max-w-full overflow-x-auto rounded-xl border border-border/70 bg-card/40">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <TireLoadingIcon className="size-8" aria-label="Cargando servicios" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead>Nombre</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[120px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No hay servicios registrados.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((service) => (
                  <TableRow key={service.id} className="border-border/50">
                    <TableCell className="max-w-[420px]">
                      <p className="truncate font-medium" title={service.name}>
                        {service.name}
                      </p>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {service.slug}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {money.format(Number(service.price))}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge
                          variant={service.is_active ? 'default' : 'secondary'}
                          className={
                            service.is_active
                              ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-200'
                              : ''
                          }
                        >
                          {service.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={
                            service.is_featured
                              ? 'border-amber-400/50 bg-amber-500/10 text-amber-200'
                              : 'border-border/80 text-muted-foreground'
                          }
                        >
                          {service.is_featured ? (
                            <span className="inline-flex items-center gap-1">
                              <Star className="size-3 fill-amber-400 text-amber-400" />
                              Destacado
                            </span>
                          ) : (
                            'Normal'
                          )}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-carsa-primary"
                        onClick={() => openEdit(service)}
                        aria-label={`Editar ${service.name}`}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive"
                        onClick={() => setDeleteTarget(service)}
                        aria-label={`Eliminar ${service.name}`}
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
        <DialogContent className="max-h-[min(92dvh,720px)] w-[min(calc(100vw-1rem),42rem)] max-w-[calc(100vw-1rem)] overflow-y-auto border-border/70 bg-card sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar servicio' : 'Nuevo servicio'}</DialogTitle>
            <DialogDescription>
              Completa la información y guarda para actualizar el catálogo.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} className="space-y-2.5">
            <div className="space-y-2">
              <Label htmlFor="s-name">Nombre</Label>
              <Input id="s-name" {...register('name')} />
              <FieldError message={errors.name?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="s-slug">Enlace del servicio (opcional)</Label>
              <Input
                id="s-slug"
                placeholder="Ej. alineacion y balanceo"
                {...register('slug')}
              />
              <FieldError message={errors.slug?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="s-desc">Descripción</Label>
              <Textarea
                id="s-desc"
                rows={3}
                placeholder="Describe el servicio para el catálogo"
                {...register('description')}
              />
              <FieldError message={errors.description?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="s-price">Precio</Label>
              <Input id="s-price" type="number" step="0.01" min={0} {...register('price')} />
              <FieldError message={errors.price?.message} />
            </div>

            <div className="flex flex-wrap gap-3 rounded-lg border border-border/50 bg-muted/20 px-3 py-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={Boolean(isActiveForm)}
                  onChange={(e) => setValue('is_active', e.target.checked)}
                />
                Activo en catálogo
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={Boolean(isFeaturedForm)}
                  onChange={(e) => setValue('is_featured', e.target.checked)}
                />
                <Star className="size-3.5 text-amber-400" aria-hidden />
                Destacado
              </label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="s-img">Imagen</Label>
              <Input
                id="s-img"
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
        <DialogContent className="max-h-[min(92dvh,720px)] w-[min(calc(100vw-1rem),28rem)] max-w-[calc(100vw-1rem)] overflow-y-auto border-border/70 bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle>¿Eliminar servicio?</DialogTitle>
            <DialogDescription>
              Vas a eliminar{' '}
              <strong className="text-foreground">
                {deleteTarget?.name ?? 'este servicio'}
              </strong>
              . Esta acción no se puede deshacer.
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
