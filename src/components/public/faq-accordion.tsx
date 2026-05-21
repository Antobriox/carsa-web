'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { faqItems } from '@/content/faq'
import { CARSA_GOOGLE_MAPS_URL } from '@/lib/carsa-location'
import { cn } from '@/lib/utils'

export function FaqAccordion() {
  return (
    <Accordion className="w-full rounded-xl border border-border/70 bg-card/30">
      {faqItems.map((item) => (
        <AccordionItem
          key={item.id}
          value={item.id}
          className="border-border/50 px-4 sm:px-5"
        >
          <AccordionTrigger className="py-4 text-base font-medium text-foreground hover:text-carsa-primary hover:no-underline">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <p>{item.answer}</p>
            {item.showMapsLink ? (
              <p className="mt-3">
                <a
                  href={CARSA_GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'font-medium text-carsa-primary underline-offset-4 hover:underline'
                  )}
                >
                  Ver ubicación en Google Maps
                </a>
              </p>
            ) : null}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
