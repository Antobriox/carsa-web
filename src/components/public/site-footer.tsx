import Link from 'next/link'
import { MapPin, MessageCircle } from 'lucide-react'

import { BusinessHoursBlock } from '@/components/public/business-hours-block'
import { buttonVariants } from '@/components/ui/button'
import {
  buildWhatsAppUrl,
  formatWhatsAppForDisplay,
  getWhatsAppDigits,
} from '@/lib/whatsapp-public'
import { cn } from '@/lib/utils'

const footerLinkClass =
  'text-sm text-carsa-neutral transition hover:text-carsa-canvas'

export function SiteFooter() {
  const digits = getWhatsAppDigits()
  const phoneLabel = formatWhatsAppForDisplay(digits) || '+593 980 822 825'
  const whatsappHref =
    buildWhatsAppUrl(
      'Hola CARSA, quiero información sobre llantas, baterías o servicios.'
    ) ?? '#contacto'

  return (
    <footer
      id="contacto"
      className="border-t border-carsa-tertiary/25 bg-carsa-secondary py-14 text-sm"
    >
      <div className="mx-auto max-w-6xl space-y-12 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:pl-[max(1.5rem,env(safe-area-inset-left))] sm:pr-[max(1.5rem,env(safe-area-inset-right))]">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div className="space-y-4">
            <p className="font-heading text-lg font-bold tracking-tight text-carsa-primary">
              CARSA
            </p>
            <p className="text-sm leading-relaxed text-carsa-canvas/90">
              Tu aliado confiable en neumáticos, baterías de alta resistencia y
              servicio en taller en Portoviejo.
            </p>
            <a
              href={whatsappHref}
              target={whatsappHref.startsWith('http') ? '_blank' : undefined}
              rel={
                whatsappHref.startsWith('http')
                  ? 'noopener noreferrer'
                  : undefined
              }
              className={cn(
                buttonVariants({ size: 'lg' }),
                'h-11 w-fit gap-2 bg-carsa-primary px-5 text-white shadow-lg shadow-carsa-primary/25 hover:bg-carsa-primary-hover'
              )}
            >
              <MessageCircle className="size-4" aria-hidden />
              WhatsApp {phoneLabel}
            </a>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-carsa-canvas/70">
              Legal
            </p>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="#" className={footerLinkClass}>
                  Términos y condiciones
                </Link>
              </li>
              <li>
                <Link href="#" className={footerLinkClass}>
                  Política de privacidad
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-carsa-canvas/70">
              Nosotros
            </p>
            <ul className="mt-4 space-y-2.5">
              <li>
                <a href="#contacto" className={footerLinkClass}>
                  Sucursales
                </a>
              </li>
              <li>
                <a href="#inicio" className={footerLinkClass}>
                  Inicio
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-carsa-canvas/70">
              Ayuda
            </p>
            <ul className="mt-4 space-y-2.5">
              <li>
                <a href={whatsappHref} className={footerLinkClass}>
                  Preguntas frecuentes
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="grid gap-10 border-t border-carsa-tertiary/20 pt-10 lg:grid-cols-2 lg:gap-12">
          <div className="space-y-4">
            <div className="flex items-start gap-2 text-carsa-neutral">
              <MapPin
                className="mt-0.5 size-4 shrink-0 text-carsa-primary"
                aria-hidden
              />
              <div>
                <p className="font-medium text-carsa-canvas">Ubicación</p>
                <p className="mt-1 text-carsa-neutral">
                  Avenida Metropolitana, Portoviejo, Manabí, Ecuador
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="font-medium text-carsa-canvas">Horario</p>
            <BusinessHoursBlock />
            <p className="text-xs text-carsa-neutral">
              Hora Ecuador (
              <span className="text-carsa-canvas/80">America/Guayaquil</span>).
            </p>
          </div>
        </div>

        <p className="border-t border-carsa-tertiary/20 pt-8 text-center text-xs text-carsa-neutral">
          © {new Date().getFullYear()} CARSA. Precios y existencias sujetos a
          cambio sin previo aviso.
        </p>
      </div>
    </footer>
  )
}
