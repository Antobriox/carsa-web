'use client'

import { MessageCircle } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { buildWhatsAppUrlForCustomerPhone } from '@/lib/whatsapp-public'
import { cn } from '@/lib/utils'

type CustomerWhatsAppButtonProps = {
  phone: string | null | undefined
  customerName?: string | null
  size?: 'sm' | 'default'
  className?: string
}

export function CustomerWhatsAppButton({
  phone,
  customerName,
  size = 'sm',
  className,
}: CustomerWhatsAppButtonProps) {
  const trimmed = phone?.trim()
  if (!trimmed) {
    return (
      <span className="text-xs text-muted-foreground">Sin teléfono registrado</span>
    )
  }

  const name = customerName?.trim() || 'cliente'
  const href = buildWhatsAppUrlForCustomerPhone(
    trimmed,
    `Hola, te escribo desde CARSA por tu pedido (${name}).`
  )

  if (!href) {
    return (
      <span className="text-sm text-muted-foreground" title={trimmed}>
        {trimmed}
      </span>
    )
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        buttonVariants({ variant: 'outline', size }),
        'inline-flex gap-2 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200',
        className
      )}
    >
      <MessageCircle className="size-4 shrink-0" aria-hidden />
      Contactar por WhatsApp
    </a>
  )
}
