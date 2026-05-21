'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { ImageIcon, Pencil, Plus, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useForm, useWatch, type Resolver } from 'react-hook-form'

import { AdminFloatingToast } from '@/components/admin/admin-floating-toast'
import { devError } from '@/lib/dev-log'
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
import { TireLoadingIcon } from '@/components/ui/tire-loading-icon'
import { promotionSchema, type PromotionFormValues } from '@/lib/admin/schemas'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { uploadProductImage } from '@/lib/supabase/storage-product-image'
import type { AdminPromotion } from '@/types/admin'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

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

function promotionLabel(row: AdminPromotion) {
  return row.title?.trim() || 'Sin nombre interno'
}

export function PromotionsAdminPanel() {
  const supabase = useMemo(() => createSupabaseBrowser(), [])
  const [rows, setRows] = useState<AdminPromotion[]>([])
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState<{
    variant: 'success' | 'error'
    text: string
  } | null>(null)
  const dismissFeedback = useCallback(() => setFeedback(null), [])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<AdminPromotion | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminPromotion | null>(null)
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionSchema) as Resolver<PromotionFormValues>,
    defaultValues: {
      title: '',
      image_url: '',
      is_active: true,
      is_popup: true,
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
  const isPopupForm = useWatch({ control: form.control, name: 'is_popup' })
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
      .from('promotions')
      .select(
        'id, title, image_url, is_active, is_popup, created_at, updated_at'
      )
      .order('created_at', { ascending: false })

    if (error) {
      setFeedback({
        variant: 'error',
        text: 'No se pudieron cargar las promociones.',
      })
    } else {
      setRows((data ?? []) as AdminPromotion[])
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
      title: '',
      image_url: '',
      is_active: true,
      is_popup: true,
    })
    setDialogOpen(true)
  }

  const openEdit = (row: AdminPromotion) => {
    setEditing(row)
    setImageFile(null)
    reset({
      title: row.title ?? '',
      image_url: row.image_url ?? '',
      is_active: row.is_active,
      is_popup: row.is_popup,
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

    const existingUrl = values.image_url?.trim() || editing?.image_url?.trim() || ''
    if (!editing && !imageFile && !existingUrl) {
      setFeedback({ variant: 'error', text: 'Debes subir una imagen.' })
      setSaving(false)
      return
    }

    const now = new Date().toISOString()
    const payload = {
      title: values.title?.trim() || null,
      is_active: values.is_active,
      is_popup: values.is_popup,
      updated_at: now,
    }

    const uploadSelectedImage = async (file: File): Promise<string> => {
      const safeName = file.name
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, '-')
        .replace(/-+/g, '-')
      const objectPath = `${Date.now()}-${safeName}`
      const { publicUrl, error } = await uploadProductImage({
        folder: 'promotions',
        file,
        objectPath,
      })
      if (error || !publicUrl) {
        throw new Error('IMAGE_UPLOAD_FAILED')
      }
      return publicUrl
    }

    try {
      let nextImageUrl: string | null = existingUrl || null

      if (imageFile) {
        nextImageUrl = await uploadSelectedImage(imageFile)
      }

      if (!nextImageUrl) {
        setFeedback({ variant: 'error', text: 'Debes subir una imagen.' })
        setSaving(false)
        return
      }

      if (editing) {
        const { error } = await supabase
          .from('promotions')
          .update({ ...payload, image_url: nextImageUrl })
          .eq('id', editing.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('promotions')
          .insert({ ...payload, image_url: nextImageUrl })
        if (error) throw error
      }

      setFeedback({
        variant: 'success',
        text: editing ? 'Promoción actualizada.' : 'Promoción creada.',
      })
      closeDialog()
      await load()
    } catch (e: unknown) {
      devError(
        editing
          ? '[admin/promociones] error al editar'
          : '[admin/promociones] error al crear',
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
        text: 'No se pudo guardar la promoción.',
      })
    } finally {
      setSaving(false)
    }
  })

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setSaving(true)
    const { error } = await supabase
      .from('promotions')
      .delete()
      .eq('id', deleteTarget.id)
    setSaving(false)

    if (error) {
      setFeedback({
        variant: 'error',
        text: 'No se pudo eliminar la promoción. Inténtalo nuevamente.',
      })
    } else {
      setFeedback({ variant: 'success', text: 'Promoción eliminada.' })
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
            Promociones
          </h2>
          <p className="text-sm text-muted-foreground">
            Imágenes promocionales para la página de inicio. No modifican precios
            ni el carrito.
          </p>
        </div>
        <Button
          type="button"
          className="bg-carsa-primary text-white hover:bg-carsa-primary-hover"
          onClick={openCreate}
        >
          <Plus className="mr-2 size-4" />
          Nueva promoción
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
            <TireLoadingIcon className="size-8" aria-label="Cargando promociones" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead>Vista previa</TableHead>
                <TableHead>Nombre interno</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[120px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No hay promociones registradas.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id} className="border-border/50">
                    <TableCell>
                      {row.image_url ? (
                        <div className="relative size-14 overflow-hidden rounded-lg border border-border/60 bg-muted/30">
                          <Image
                            src={row.image_url}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[280px]">
                      <p className="truncate font-medium" title={promotionLabel(row)}>
                        {promotionLabel(row)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge
                          variant={row.is_active ? 'default' : 'secondary'}
                          className={
                            row.is_active
                              ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-200'
                              : ''
                          }
                        >
                          {row.is_active ? 'Activa' : 'Inactiva'}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={
                            row.is_popup
                              ? 'border-carsa-primary/40 bg-carsa-primary/10 text-carsa-primary'
                              : 'border-border/80 text-muted-foreground'
                          }
                        >
                          {row.is_popup ? 'Popup inicio' : 'Sin popup'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-carsa-primary"
                        onClick={() => openEdit(row)}
                        aria-label={`Editar ${promotionLabel(row)}`}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive"
                        onClick={() => setDeleteTarget(row)}
                        aria-label={`Eliminar ${promotionLabel(row)}`}
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

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => (open ? setDialogOpen(true) : closeDialog())}
      >
        <DialogContent className="max-h-[min(92dvh,720px)] w-[min(calc(100vw-1rem),32rem)] max-w-[calc(100vw-1rem)] overflow-y-auto border-border/70 bg-card sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Editar promoción' : 'Nueva promoción'}
            </DialogTitle>
            <DialogDescription>
              La imagen se mostrará en un popup en la página de inicio si está
              activa y marcada como popup.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="p-title">Nombre interno (opcional)</Label>
              <Input
                id="p-title"
                placeholder="Ej. Oferta marzo"
                {...register('title')}
              />
              <FieldError message={errors.title?.message} />
            </div>

            <div className="flex flex-col gap-3 rounded-lg border border-border/50 bg-muted/20 px-3 py-2.5">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={Boolean(isActiveForm)}
                  onChange={(e) => setValue('is_active', e.target.checked)}
                />
                Promoción activa
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={Boolean(isPopupForm)}
                  onChange={(e) => setValue('is_popup', e.target.checked)}
                />
                Mostrar como ventana en la página de inicio
              </label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="p-img">Imagen promocional</Label>
              <Input
                id="p-img"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="cursor-pointer"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              />
              <p className="text-xs text-muted-foreground">
                JPG, PNG, WebP o GIF · máx. 5 MB.
                {editing ? ' Deja vacío para conservar la imagen actual.' : ''}
              </p>
              <div className="flex min-h-[120px] items-center justify-center overflow-hidden rounded-lg border border-dashed border-border/80 bg-muted/30 p-2">
                {displayImageSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element -- blob: y vista previa local
                  <img
                    src={displayImageSrc}
                    alt="Vista previa"
                    className="max-h-40 w-auto max-w-full rounded-md object-contain shadow-sm"
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
            <DialogTitle>¿Eliminar promoción?</DialogTitle>
            <DialogDescription>
              Vas a eliminar{' '}
              <strong className="text-foreground">
                {deleteTarget ? promotionLabel(deleteTarget) : 'esta promoción'}
              </strong>
              . Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
            >
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
