'use client'

import { MessageCircle } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { buildWhatsAppUrl } from '@/lib/whatsapp-public'

function getWhatsAppHref(): { href: string; label: string } {
  const url =
    buildWhatsAppUrl(
      'Hola CARSA, quiero información sobre llantas, baterías o servicios.'
    ) ?? '#contacto'
  return {
    href: url,
    label: url.startsWith('http') ? 'Abrir WhatsApp' : 'Ir a contacto',
  }
}

export function WhatsAppFloatingButton() {
  const { href, label } = getWhatsAppHref()
  const external = href.startsWith('http')

  return (
    <div className="fixed z-50 bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1.25rem,env(safe-area-inset-right))] sm:bottom-8 sm:right-8">
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        aria-label={label}
        className={cn(
          buttonVariants({ size: 'icon-lg', className: 'size-14 rounded-full' }),
          'shadow-lg shadow-carsa-primary/35 ring-2 ring-carsa-primary/50 bg-carsa-primary text-white hover:bg-carsa-primary-hover'
        )}
      >
        <MessageCircle className="size-7" aria-hidden />
      </a>
    </div>
  )
}
