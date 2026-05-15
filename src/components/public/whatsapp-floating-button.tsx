'use client'

import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'

import { CarsaLogoMark } from '@/components/branding/carsa-logo-mark'
import { WhatsAppLogoIcon } from '@/components/icons/whatsapp-logo-icon'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { buildWhatsAppUrl } from '@/lib/whatsapp-public'

const BOUNCE_DURATION = 1.55
/** Solapamiento muñeco ↔ burbuja: más negativo = más abajo (toca). Prueba -mb-2 … -mb-4. */
const MASCOT_BUBBLE_OVERLAP = '-mb-3'

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
  const pathname = usePathname()
  const { href, label } = getWhatsAppHref()
  const external = href.startsWith('http')
  const onCart = pathname === '/carrito'

  return (
    <motion.div
      className={cn(
        'fixed z-50 right-[max(1rem,env(safe-area-inset-right))] sm:bottom-8 sm:right-8',
        onCart
          ? 'bottom-[max(5.5rem,env(safe-area-inset-bottom))]'
          : 'bottom-[max(1.25rem,env(safe-area-inset-bottom))]'
      )}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        aria-label={label}
        className="group flex flex-col items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-carsa-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-full"
      >
        <motion.div
          aria-hidden
          className={cn(
            'relative z-10 hidden motion-reduce:animate-none min-[480px]:block',
            MASCOT_BUBBLE_OVERLAP
          )}
          style={{ transformOrigin: 'bottom center' }}
          animate={{
            y: [0, -26, 2, -9, 0],
            scaleY: [1, 1.04, 0.86, 0.95, 1],
            scaleX: [1, 0.97, 1.1, 1.02, 1],
          }}
          transition={{
            duration: BOUNCE_DURATION,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.38, 0.52, 0.68, 1],
          }}
        >
          <CarsaLogoMark
            variant="plain"
            size={20}
            className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.55)]"
          />
        </motion.div>

        <motion.span
          className={cn(
            buttonVariants({ size: 'icon-lg', className: 'size-14 rounded-full' }),
            'bg-carsa-primary text-white shadow-lg shadow-carsa-primary/40 ring-2 ring-carsa-primary/50',
            'group-hover:bg-carsa-primary-hover group-hover:shadow-xl group-hover:shadow-carsa-primary/45'
          )}
          style={{ transformOrigin: 'center center' }}
          animate={{ scale: [1, 1, 0.9, 1.04, 1] }}
          transition={{
            duration: BOUNCE_DURATION,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.48, 0.54, 0.62, 1],
          }}
        >
          <WhatsAppLogoIcon />
        </motion.span>
      </a>
    </motion.div>
  )
}
