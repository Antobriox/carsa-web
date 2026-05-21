import { z } from 'zod'

export const tireBrandSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(200),
})

export const batteryBrandSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(200),
})

export const tireSchema = z.object({
  brand_id: z.string().uuid('Selecciona una marca'),
  supplier_code: z.string().max(120).optional().or(z.literal('')),
  name: z.string().min(1, 'Nombre requerido').max(300),
  rim: z.coerce.number().positive('Indica el rim en pulgadas (número)'),
  size: z.string().min(1, 'Medida requerida').max(120),
  model: z.string().max(200).optional().or(z.literal('')),
  description: z.string().max(5000).optional().or(z.literal('')),
  price: z.coerce.number().min(0, 'Precio no puede ser negativo'),
  stock: z.coerce
    .number()
    .int('Stock debe ser un número entero')
    .min(0, 'Stock no puede ser negativo'),
  image_url: z.string().max(2000).optional().or(z.literal('')).nullable(),
  is_active: z.boolean(),
  is_featured: z.boolean(),
})

export const batterySchema = z.object({
  brand_id: z.string().uuid('Selecciona una marca'),
  supplier_code: z.string().max(120).optional().or(z.literal('')),
  name: z.string().min(1, 'Nombre requerido').max(300),
  model: z.string().max(200).optional().or(z.literal('')),
  amperage: z.string().max(80).optional().or(z.literal('')),
  voltage: z.string().max(40).optional().or(z.literal('')),
  polarity: z.string().max(40).optional().or(z.literal('')),
  warranty_months: z.number().int().min(0).max(120).nullable().optional(),
  description: z.string().max(5000).optional().or(z.literal('')),
  price: z.coerce.number().min(0, 'Precio no puede ser negativo'),
  stock: z.coerce
    .number()
    .int('Stock debe ser un número entero')
    .min(0, 'Stock no puede ser negativo'),
  image_url: z.string().max(2000).optional().or(z.literal('')).nullable(),
  is_active: z.boolean(),
  is_featured: z.boolean(),
})

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const serviceSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(200),
  slug: z
    .string()
    .min(1, 'Slug requerido')
    .max(120)
    .regex(slugRegex, 'Solo minúsculas, números y guiones'),
  description: z.string().max(5000).optional().or(z.literal('')),
  price: z.coerce.number().min(0),
  image_url: z.string().max(2000).optional().or(z.literal('')).nullable(),
  is_active: z.boolean(),
  is_featured: z.boolean(),
})

export const promotionSchema = z.object({
  title: z.string().max(200).optional().or(z.literal('')),
  image_url: z.string().max(2000).optional().or(z.literal('')).nullable(),
  is_active: z.boolean(),
  is_popup: z.boolean(),
})

export type TireFormValues = z.infer<typeof tireSchema>
export type BatteryFormValues = z.infer<typeof batterySchema>
export type ServiceFormValues = z.infer<typeof serviceSchema>
export type TireBrandFormValues = z.infer<typeof tireBrandSchema>
export type BatteryBrandFormValues = z.infer<typeof batteryBrandSchema>
export type PromotionFormValues = z.infer<typeof promotionSchema>
