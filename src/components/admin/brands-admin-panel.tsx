'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useForm, type Resolver } from 'react-hook-form'

import { AdminFeedbackBanner } from '@/components/admin/admin-feedback-banner'
import { Button } from '@/components/ui/button'
import { TireLoadingIcon } from '@/components/ui/tire-loading-icon'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  batteryBrandSchema,
  tireBrandSchema,
  type BatteryBrandFormValues,
  type TireBrandFormValues,
} from '@/lib/admin/schemas'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import type { AdminBatteryBrand, AdminTireBrand } from '@/types/admin'

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="mt-1 text-xs font-medium text-destructive" role="alert">
      {message}
    </p>
  )
}

export function BrandsAdminPanel() {
  const supabase = useMemo(() => createSupabaseBrowser(), [])
  const [tireBrands, setTireBrands] = useState<AdminTireBrand[]>([])
  const [batteryBrands, setBatteryBrands] = useState<AdminBatteryBrand[]>([])
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState<{
    variant: 'success' | 'error'
    text: string
  } | null>(null)

  const [tireDialogOpen, setTireDialogOpen] = useState(false)
  const [batteryDialogOpen, setBatteryDialogOpen] = useState(false)
  const [editingTire, setEditingTire] = useState<AdminTireBrand | null>(null)
  const [editingBattery, setEditingBattery] = useState<AdminBatteryBrand | null>(null)
  const [deleteTire, setDeleteTire] = useState<AdminTireBrand | null>(null)
  const [deleteBattery, setDeleteBattery] = useState<AdminBatteryBrand | null>(null)
  const [saving, setSaving] = useState(false)

  const tireForm = useForm<TireBrandFormValues>({
    resolver: zodResolver(tireBrandSchema) as Resolver<TireBrandFormValues>,
    defaultValues: { name: '' },
  })

  const batteryForm = useForm<BatteryBrandFormValues>({
    resolver: zodResolver(batteryBrandSchema) as Resolver<BatteryBrandFormValues>,
    defaultValues: { name: '' },
  })

  const load = useCallback(async () => {
    setLoading(true)
    const [tireRes, batteryRes] = await Promise.all([
      supabase.from('tire_brands').select('id, name, created_at').order('name'),
      supabase.from('battery_brands').select('id, name, created_at').order('name'),
    ])

    if (tireRes.error || batteryRes.error) {
      setFeedback({
        variant: 'error',
        text: 'No se pudieron cargar las marcas. Inténtalo nuevamente.',
      })
      setLoading(false)
      return
    }

    setTireBrands((tireRes.data ?? []) as AdminTireBrand[])
    setBatteryBrands((batteryRes.data ?? []) as AdminBatteryBrand[])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    queueMicrotask(() => {
      void load()
    })
  }, [load])

  const openNewTireBrand = () => {
    setEditingTire(null)
    tireForm.reset({ name: '' })
    setTireDialogOpen(true)
  }

  const openEditTireBrand = (brand: AdminTireBrand) => {
    setEditingTire(brand)
    tireForm.reset({ name: brand.name })
    setTireDialogOpen(true)
  }

  const openNewBatteryBrand = () => {
    setEditingBattery(null)
    batteryForm.reset({ name: '' })
    setBatteryDialogOpen(true)
  }

  const openEditBatteryBrand = (brand: AdminBatteryBrand) => {
    setEditingBattery(brand)
    batteryForm.reset({ name: brand.name })
    setBatteryDialogOpen(true)
  }

  const submitTireBrand = tireForm.handleSubmit(async (values) => {
    setSaving(true)
    setFeedback(null)
    const name = values.name.trim()

    try {
      if (editingTire) {
        const { error } = await supabase
          .from('tire_brands')
          .update({ name })
          .eq('id', editingTire.id)
        if (error) throw error

        setFeedback({ variant: 'success', text: 'Marca actualizada correctamente.' })
      } else {
        const { error } = await supabase.from('tire_brands').insert({ name })
        if (error) throw error

        setFeedback({ variant: 'success', text: 'Marca creada correctamente.' })
      }

      setTireDialogOpen(false)
      await load()
    } catch {
      setFeedback({
        variant: 'error',
        text: 'No se pudo guardar la marca. Inténtalo nuevamente.',
      })
    } finally {
      setSaving(false)
    }
  })

  const submitBatteryBrand = batteryForm.handleSubmit(async (values) => {
    setSaving(true)
    setFeedback(null)
    const name = values.name.trim()

    try {
      if (editingBattery) {
        const { error } = await supabase
          .from('battery_brands')
          .update({ name })
          .eq('id', editingBattery.id)
        if (error) throw error

        setFeedback({ variant: 'success', text: 'Marca actualizada correctamente.' })
      } else {
        const { error } = await supabase.from('battery_brands').insert({ name })
        if (error) throw error

        setFeedback({ variant: 'success', text: 'Marca creada correctamente.' })
      }

      setBatteryDialogOpen(false)
      await load()
    } catch {
      setFeedback({
        variant: 'error',
        text: 'No se pudo guardar la marca. Inténtalo nuevamente.',
      })
    } finally {
      setSaving(false)
    }
  })

  const confirmDeleteTire = async () => {
    if (!deleteTire) return
    setSaving(true)

    const { count, error: countError } = await supabase
      .from('tires')
      .select('id', { count: 'exact', head: true })
      .eq('brand_id', deleteTire.id)

    if (countError) {
      setSaving(false)
      setFeedback({
        variant: 'error',
        text: 'No se pudo eliminar la marca. Inténtalo nuevamente.',
      })
      return
    }

    if ((count ?? 0) > 0) {
      setSaving(false)
      setDeleteTire(null)
      setFeedback({
        variant: 'error',
        text: 'No puedes eliminar esta marca porque tiene productos asociados.',
      })
      return
    }

    const { error } = await supabase.from('tire_brands').delete().eq('id', deleteTire.id)
    setSaving(false)

    if (error) {
      setFeedback({
        variant: 'error',
        text: 'No se pudo eliminar la marca. Inténtalo nuevamente.',
      })
      return
    }

    setDeleteTire(null)
    setFeedback({ variant: 'success', text: 'Marca eliminada correctamente.' })
    void load()
  }

  const confirmDeleteBattery = async () => {
    if (!deleteBattery) return
    setSaving(true)

    const { count, error: countError } = await supabase
      .from('batteries')
      .select('id', { count: 'exact', head: true })
      .eq('brand_id', deleteBattery.id)

    if (countError) {
      setSaving(false)
      setFeedback({
        variant: 'error',
        text: 'No se pudo eliminar la marca. Inténtalo nuevamente.',
      })
      return
    }

    if ((count ?? 0) > 0) {
      setSaving(false)
      setDeleteBattery(null)
      setFeedback({
        variant: 'error',
        text: 'No puedes eliminar esta marca porque tiene productos asociados.',
      })
      return
    }

    const { error } = await supabase
      .from('battery_brands')
      .delete()
      .eq('id', deleteBattery.id)
    setSaving(false)

    if (error) {
      setFeedback({
        variant: 'error',
        text: 'No se pudo eliminar la marca. Inténtalo nuevamente.',
      })
      return
    }

    setDeleteBattery(null)
    setFeedback({ variant: 'success', text: 'Marca eliminada correctamente.' })
    void load()
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Marcas
        </h2>
        <p className="text-sm text-muted-foreground">
          Administra las marcas de llantas y baterías.
        </p>
      </div>

      {feedback ? (
        <AdminFeedbackBanner variant={feedback.variant} message={feedback.text} />
      ) : null}

      <Tabs defaultValue="tires" className="gap-4">
        <TabsList variant="line" className="w-full max-w-md">
          <TabsTrigger value="tires">Llantas</TabsTrigger>
          <TabsTrigger value="batteries">Baterías</TabsTrigger>
        </TabsList>

        <TabsContent value="tires" className="space-y-3 outline-none">
          <div className="flex justify-end">
            <Button
              type="button"
              className="bg-carsa-primary text-white hover:bg-carsa-primary-hover"
              onClick={openNewTireBrand}
            >
              <Plus className="mr-2 size-4" />
              Nueva marca
            </Button>
          </div>

          <div className="overflow-hidden rounded-xl border border-border/70 bg-card/40">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <TireLoadingIcon className="size-8" aria-label="Cargando marcas de llantas" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border/60 hover:bg-transparent">
                    <TableHead>Nombre</TableHead>
                    <TableHead className="w-[120px] text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tireBrands.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        No hay marcas registradas.
                      </TableCell>
                    </TableRow>
                  ) : (
                    tireBrands.map((brand) => (
                      <TableRow key={brand.id} className="border-border/50">
                        <TableCell className="font-medium">{brand.name}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="text-carsa-primary"
                            onClick={() => openEditTireBrand(brand)}
                            aria-label={`Editar ${brand.name}`}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive"
                            onClick={() => setDeleteTire(brand)}
                            aria-label={`Eliminar ${brand.name}`}
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
        </TabsContent>

        <TabsContent value="batteries" className="space-y-3 outline-none">
          <div className="flex justify-end">
            <Button
              type="button"
              className="bg-carsa-primary text-white hover:bg-carsa-primary-hover"
              onClick={openNewBatteryBrand}
            >
              <Plus className="mr-2 size-4" />
              Nueva marca
            </Button>
          </div>

          <div className="overflow-hidden rounded-xl border border-border/70 bg-card/40">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <TireLoadingIcon className="size-8" aria-label="Cargando marcas de baterías" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border/60 hover:bg-transparent">
                    <TableHead>Nombre</TableHead>
                    <TableHead className="w-[120px] text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batteryBrands.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        No hay marcas registradas.
                      </TableCell>
                    </TableRow>
                  ) : (
                    batteryBrands.map((brand) => (
                      <TableRow key={brand.id} className="border-border/50">
                        <TableCell className="font-medium">{brand.name}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="text-carsa-primary"
                            onClick={() => openEditBatteryBrand(brand)}
                            aria-label={`Editar ${brand.name}`}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive"
                            onClick={() => setDeleteBattery(brand)}
                            aria-label={`Eliminar ${brand.name}`}
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
        </TabsContent>
      </Tabs>

      <Dialog open={tireDialogOpen} onOpenChange={setTireDialogOpen}>
        <DialogContent className="border-border/70 bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTire ? 'Editar marca de llanta' : 'Nueva marca de llanta'}
            </DialogTitle>
            <DialogDescription>
              Completa el nombre y guarda para actualizar el catálogo.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitTireBrand} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="tire-brand-name">Nombre</Label>
              <Input id="tire-brand-name" {...tireForm.register('name')} />
              <FieldError message={tireForm.formState.errors.name?.message} />
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setTireDialogOpen(false)}>
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

      <Dialog open={batteryDialogOpen} onOpenChange={setBatteryDialogOpen}>
        <DialogContent className="border-border/70 bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingBattery ? 'Editar marca de batería' : 'Nueva marca de batería'}
            </DialogTitle>
            <DialogDescription>
              Completa el nombre y guarda para actualizar el catálogo.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitBatteryBrand} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="battery-brand-name">Nombre</Label>
              <Input id="battery-brand-name" {...batteryForm.register('name')} />
              <FieldError message={batteryForm.formState.errors.name?.message} />
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setBatteryDialogOpen(false)}>
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

      <Dialog open={!!deleteTire} onOpenChange={() => setDeleteTire(null)}>
        <DialogContent className="border-border/70 bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle>¿Eliminar marca de llanta?</DialogTitle>
            <DialogDescription>
              Vas a eliminar{' '}
              <strong className="text-foreground">{deleteTire?.name ?? 'esta marca'}</strong>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setDeleteTire(null)}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={saving}
              onClick={() => void confirmDeleteTire()}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteBattery} onOpenChange={() => setDeleteBattery(null)}>
        <DialogContent className="border-border/70 bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle>¿Eliminar marca de batería?</DialogTitle>
            <DialogDescription>
              Vas a eliminar{' '}
              <strong className="text-foreground">{deleteBattery?.name ?? 'esta marca'}</strong>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setDeleteBattery(null)}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={saving}
              onClick={() => void confirmDeleteBattery()}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
