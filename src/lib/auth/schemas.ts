import { z } from 'zod'

/** Teléfono / WhatsApp del cliente (registro y perfil). */
export const customerPhoneSchema = z
  .string()
  .trim()
  .min(1, 'El número de WhatsApp es obligatorio')
  .min(8, 'Introduce un número válido con código de área')
  .max(20, 'Máximo 20 caracteres')
  .regex(
    /^[\d\s+\-()]+$/,
    'Usa solo números y símbolos habituales de teléfono'
  )

const passwordField = z
  .string()
  .min(8, 'Mínimo 8 caracteres')
  .regex(/[A-Z]/, 'Incluye al menos una mayúscula')
  .regex(/[a-z]/, 'Incluye al menos una minúscula')
  .regex(/[0-9]/, 'Incluye al menos un número')
  .regex(/[^A-Za-z0-9]/, 'Incluye al menos un símbolo')

export const loginSchema = z.object({
  email: z.string().email('Introduce un correo válido'),
  password: z.string().min(1, 'Introduce tu contraseña'),
})

export const registerSchema = z
  .object({
    full_name: z
      .string()
      .min(2, 'Mínimo 2 caracteres')
      .max(120, 'Máximo 120 caracteres'),
    phone: customerPhoneSchema,
    email: z.string().email('Introduce un correo válido'),
    password: passwordField,
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((v) => v === true, {
      message: 'Debes aceptar los términos y condiciones',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>

export const recoverSchema = z.object({
  email: z.string().email('Introduce un correo válido'),
})

export type RecoverFormValues = z.infer<typeof recoverSchema>

export const profilePhoneSchema = z.object({
  phone: customerPhoneSchema,
})

export type ProfilePhoneFormValues = z.infer<typeof profilePhoneSchema>
