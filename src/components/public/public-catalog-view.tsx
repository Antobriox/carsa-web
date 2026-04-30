'use client'

import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  ArrowUpRight,
  Battery,
  CircleDot,
  Headphones,
  Search,
  ShieldCheck,
  Wrench,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

import {
  EmptyBlock,
  FilterEmpty,
} from '@/components/public/catalog-product-cards'
import {
  BatteryProductGrid,
  ServiceProductGrid,
  TireProductGrid,
} from '@/components/public/catalog-product-grids'
import { buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  batteryMatchesQuery,
  serviceMatchesQuery,
  tireMatchesQuery,
} from '@/lib/catalog-filters'
import {
  PRODUCTO_BATERIA_IMG,
  PRODUCTO_LLANTA_IMG,
} from '@/lib/public-catalog-images'
import { mergeAlignmentBalanceServices } from '@/lib/catalog-services-display'
import { cn } from '@/lib/utils'
import { buildWhatsAppUrl } from '@/lib/whatsapp-public'
import type { CatalogPageProps } from '@/types/catalog'

const easeOut = [0.22, 1, 0.36, 1] as const

function CategoryShowcaseCard({
  href,
  title,
  subtitle,
  cta,
  imageUrl,
  FallbackIcon,
}: {
  href: string
  title: string
  subtitle: string
  cta: string
  imageUrl: string | null
  FallbackIcon: LucideIcon
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: easeOut }}
      className="min-h-0"
    >
      <Link
        href={href}
        className="group relative flex min-h-[260px] overflow-hidden rounded-2xl border border-border/80 bg-card shadow-md ring-1 ring-white/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-carsa-primary/15 sm:min-h-[300px]"
      >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition duration-700 group-hover:scale-[1.04]"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-carsa-elevated via-carsa-secondary to-black">
          <div className="absolute inset-0 flex items-center justify-center opacity-35">
            <FallbackIcon className="size-24 text-carsa-neutral sm:size-28" aria-hidden />
          </div>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10" />
      <div className="relative mt-auto flex w-full flex-col gap-1 p-6 sm:p-8">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-white/75">
          {subtitle}
        </p>
        <h3 className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {title}
        </h3>
        <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
          {cta}
          <ArrowUpRight
            className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden
          />
        </span>
      </div>
      </Link>
    </motion.div>
  )
}

function SectionShell({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id: string
  eyebrow: string
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5, ease: easeOut }}
        className="mb-8 max-w-2xl"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-carsa-primary">
          {eyebrow}
        </p>
        <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
      </motion.div>
      {children}
    </section>
  )
}

export function PublicCatalogView({
  tires,
  batteries,
  services,
  heroTireImageUrl,
  heroBatteryImageUrl,
}: CatalogPageProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const featuredTires = useMemo(
    () => tires.filter((t) => t.is_featured),
    [tires]
  )
  const featuredBatteries = useMemo(
    () => batteries.filter((b) => b.is_featured),
    [batteries]
  )
  const filteredFeaturedTires = useMemo(
    () => featuredTires.filter((t) => tireMatchesQuery(query, t)),
    [featuredTires, query]
  )
  const filteredFeaturedBatteries = useMemo(
    () => featuredBatteries.filter((b) => batteryMatchesQuery(query, b)),
    [featuredBatteries, query]
  )
  const displayServices = useMemo(
    () => mergeAlignmentBalanceServices(services),
    [services]
  )
  const filteredServices = useMemo(
    () => displayServices.filter((s) => serviceMatchesQuery(query, s)),
    [displayServices, query]
  )

  const workshopWhatsApp = buildWhatsAppUrl(
    'Hola CARSA, quiero cotización / cita en taller.'
  )
  const medidaWhatsApp =
    buildWhatsAppUrl(
      'Hola CARSA, no encuentro mi medida / necesito ayuda para elegir llanta o batería.'
    ) ?? '#contacto'

  const q = query.trim()

  return (
    <div className="flex flex-col">
      <section
        id="inicio"
        className="relative overflow-hidden border-b border-border/60"
      >
        <Image
          src="/Imagen/CARSARportada.png"
          alt=""
          fill
          priority
          className="z-0 object-cover object-center"
          sizes="100vw"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-br from-black/82 via-black/68 to-black/55"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_90%_70%_at_20%_30%,rgba(227,27,35,0.12),transparent_55%)]"
          aria-hidden
        />

        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-14 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:pt-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.09, delayChildren: 0.04 },
              },
            }}
            className="max-w-3xl"
          >
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.45, ease: easeOut },
                },
              }}
              className="text-xs font-semibold uppercase tracking-[0.22em] text-carsa-primary"
            >
              Portoviejo · neumáticos · baterías · taller
            </motion.p>
            <motion.h1
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, ease: easeOut },
                },
              }}
              className="mt-4 font-heading text-4xl font-bold leading-[1.06] tracking-tight text-foreground sm:text-5xl lg:text-[3.35rem]"
            >
              Tu llanta o batería a un clic.
            </motion.h1>
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, ease: easeOut },
                },
              }}
              className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              Busca por medida o marca, revisa existencias en vivo y coordina con
              nuestro equipo por WhatsApp. Sin complicaciones: tú eliges, CARSA
              asesora.
            </motion.p>

            <motion.form
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, ease: easeOut },
                },
              }}
              className="mt-8 max-w-2xl"
              onSubmit={(e) => {
                e.preventDefault()
                const t = query.trim()
                router.push(t ? `/llantas?q=${encodeURIComponent(t)}` : '/llantas')
              }}
            >
              <div className="flex flex-col gap-2 rounded-2xl border border-border/90 bg-card/95 p-2 shadow-lg shadow-black/20 ring-1 ring-white/5 sm:flex-row sm:items-center sm:gap-0 sm:pl-4">
                <div className="flex min-h-12 flex-1 items-center gap-3 px-2 sm:px-0">
                  <Search
                    className="size-5 shrink-0 text-carsa-neutral"
                    aria-hidden
                  />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar por medida (ej. 205/55R16) o marca…"
                    className="h-11 border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0 md:text-base"
                    aria-label="Buscar en catálogo"
                  />
                </div>
                <button
                  type="submit"
                  className={cn(
                    buttonVariants({ size: 'lg' }),
                    'h-11 shrink-0 gap-2 rounded-xl bg-carsa-primary px-6 text-white shadow-md shadow-carsa-primary/25 hover:bg-carsa-primary-hover sm:rounded-xl'
                  )}
                >
                  Buscar
                  <ArrowRight className="size-4" aria-hidden />
                </button>
              </div>
            </motion.form>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, ease: easeOut },
                },
              }}
              className="mt-6 flex flex-wrap gap-3"
            >
              <Link
                href="/llantas"
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'inline-flex h-11 items-center justify-center border-0 bg-carsa-canvas px-6 font-semibold text-carsa-secondary shadow-sm hover:bg-carsa-canvas/90'
                )}
              >
                Ver catálogo completo
              </Link>
              <a
                href={medidaWhatsApp}
                target={medidaWhatsApp.startsWith('http') ? '_blank' : undefined}
                rel={
                  medidaWhatsApp.startsWith('http')
                    ? 'noopener noreferrer'
                    : undefined
                }
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'h-11 border-border bg-transparent px-6 text-foreground hover:border-carsa-primary/50 hover:bg-carsa-primary/10'
                )}
              >
                No encuentro mi medida
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <div className="border-y border-border/60 bg-background/90 ring-1 ring-white/[0.04]">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-3 sm:gap-8 sm:px-6">
          {[
            {
              icon: Headphones,
              title: 'Asesoría por WhatsApp',
              text: 'Escríbenos al WhatsApp de CARSA: te orientamos con medida y modelo para tu auto, dudas de compatibilidad, cotización y confirmación de stock antes de que vengas o pagues.',
            },
            {
              icon: ShieldCheck,
              title: 'Compra segura',
              text: 'Lo que ves en el catálogo (precio y disponibilidad) es lo que manejamos en tienda: sin cargos ocultos. Sabes qué llevas y cuánto pagas.',
            },
            {
              icon: Wrench,
              title: 'Instalación coordinada',
              text: 'Si compras con nosotros, agendamos contigo la cita en taller: montaje de llanta o batería y, cuando aplica, alineación y balanceo en secuencia con nuestro equipo, sin saltar entre distintos sitios.',
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.08, duration: 0.45, ease: easeOut }}
              className="flex gap-4"
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-carsa-primary/12 text-carsa-primary ring-1 ring-carsa-primary/20">
                <item.icon className="size-5" aria-hidden />
              </div>
              <div>
                <p className="font-semibold text-foreground">{item.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {item.text}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="border-b border-border/60 bg-background py-14 sm:py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 sm:grid-cols-2 sm:gap-10 lg:gap-12 sm:px-6">
          <CategoryShowcaseCard
            href="/llantas"
            title="Llantas"
            subtitle="Catálogo"
            cta="Explorar catálogo"
            imageUrl={heroTireImageUrl ?? PRODUCTO_LLANTA_IMG}
            FallbackIcon={CircleDot}
          />
          <CategoryShowcaseCard
            href="/baterias"
            title="Baterías"
            subtitle="Alta resistencia"
            cta="Ver modelos"
            imageUrl={heroBatteryImageUrl ?? PRODUCTO_BATERIA_IMG}
            FallbackIcon={Battery}
          />
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-20 px-4 py-16 sm:px-6 sm:py-20">
        {q ? (
          <div className="-mb-12 flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full border border-border bg-muted/40 px-3 py-1 text-muted-foreground">
              Filtro:{' '}
              <span className="font-medium text-foreground">&ldquo;{q}&rdquo;</span>
            </span>
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-carsa-primary underline-offset-4 hover:underline"
            >
              Limpiar
            </button>
          </div>
        ) : null}

        <SectionShell
          id="llantas-destacadas"
          eyebrow="Selección"
          title="Llantas destacadas"
          description="Selección de llantas marcadas como destacadas en el catálogo. El inventario completo está en la página de llantas."
        >
          {tires.length === 0 ? (
            <EmptyBlock label="llantas activas" />
          ) : featuredTires.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-12 text-center">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Aún no hay llantas marcadas como destacadas. Puedes revisar todo
                el inventario activo en el catálogo completo.
              </p>
              <Link
                href="/llantas"
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'mt-6 inline-flex bg-carsa-primary text-white hover:bg-carsa-primary-hover'
                )}
              >
                Ver catálogo de llantas
              </Link>
            </div>
          ) : filteredFeaturedTires.length === 0 ? (
            <FilterEmpty onClear={() => setQuery('')} />
          ) : (
            <TireProductGrid tires={filteredFeaturedTires} />
          )}
        </SectionShell>

        <SectionShell
          id="baterias-destacadas"
          eyebrow="Energía"
          title="Baterías destacadas"
          description="Selección de baterías marcadas como destacadas en el catálogo. El inventario completo está en la página de baterías."
        >
          {batteries.length === 0 ? (
            <EmptyBlock label="baterías activas" />
          ) : featuredBatteries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-12 text-center">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Aún no hay baterías marcadas como destacadas. Consulta el
                catálogo completo para ver todas las referencias activas.
              </p>
              <Link
                href="/baterias"
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'mt-6 inline-flex bg-carsa-primary text-white hover:bg-carsa-primary-hover'
                )}
              >
                Ver catálogo de baterías
              </Link>
            </div>
          ) : filteredFeaturedBatteries.length === 0 ? (
            <FilterEmpty onClear={() => setQuery('')} />
          ) : (
            <BatteryProductGrid batteries={filteredFeaturedBatteries} />
          )}
        </SectionShell>

        <SectionShell
          id="servicios"
          eyebrow="Taller"
          title="Servicios"
          description="Procesos cuidados para que conduzcas con seguridad y comodidad. Cotiza o agenda por WhatsApp."
        >
          {services.length === 0 ? (
            <EmptyBlock label="servicios activos" />
          ) : filteredServices.length === 0 ? (
            <FilterEmpty onClear={() => setQuery('')} />
          ) : (
            <ServiceProductGrid services={filteredServices} />
          )}
        </SectionShell>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="rounded-2xl border border-carsa-primary/25 bg-gradient-to-br from-carsa-primary/12 via-transparent to-carsa-surface/90 p-8 sm:p-10"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                ¿Listo para cotizar o agendar?
              </h3>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
                Envíanos rin y medida, o la llave de tu batería actual, y te
                respondemos con opciones claras.
              </p>
            </div>
            <a
              href={workshopWhatsApp ?? '#contacto'}
              target={workshopWhatsApp ? '_blank' : undefined}
              rel={workshopWhatsApp ? 'noopener noreferrer' : undefined}
              className={cn(
                buttonVariants({ size: 'lg' }),
                'h-11 shrink-0 bg-carsa-primary px-6 text-white shadow-md shadow-carsa-primary/25 hover:bg-carsa-primary-hover'
              )}
            >
              Escribir por WhatsApp
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
