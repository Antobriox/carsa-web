'use client'

import { motion } from 'motion/react'

import {
  BatteryCard,
  ServiceCard,
  TireCard,
} from '@/components/public/catalog-product-cards'
import type { CatalogBattery, CatalogService, CatalogTire } from '@/types/catalog'

const easeOut = [0.22, 1, 0.36, 1] as const

export function TireProductGrid({ tires }: { tires: CatalogTire[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {tires.map((tire, index) => (
        <motion.div
          key={tire.id}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-24px' }}
          transition={{
            delay: (index % 6) * 0.05,
            duration: 0.45,
            ease: easeOut,
          }}
        >
          <TireCard tire={tire} />
        </motion.div>
      ))}
    </div>
  )
}

export function BatteryProductGrid({
  batteries,
}: {
  batteries: CatalogBattery[]
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {batteries.map((battery, index) => (
        <motion.div
          key={battery.id}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-24px' }}
          transition={{
            delay: (index % 6) * 0.05,
            duration: 0.45,
            ease: easeOut,
          }}
        >
          <BatteryCard battery={battery} />
        </motion.div>
      ))}
    </div>
  )
}

export function ServiceProductGrid({
  services,
  consultCtaLabel,
}: {
  services: CatalogService[]
  consultCtaLabel?: string
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service, index) => (
        <motion.div
          key={service.id}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-24px' }}
          transition={{
            delay: (index % 6) * 0.05,
            duration: 0.45,
            ease: easeOut,
          }}
        >
          <ServiceCard service={service} consultCtaLabel={consultCtaLabel} />
        </motion.div>
      ))}
    </div>
  )
}
