import { AlertCircle } from 'lucide-react'

import { redirectAdminToPanel } from '@/lib/auth/redirect-admin-from-public'
import { PublicCatalogView } from '@/components/public/public-catalog-view'
import { SiteFooter } from '@/components/public/site-footer'
import { SiteHeader } from '@/components/public/site-header'
import { WhatsAppFloatingButton } from '@/components/public/whatsapp-floating-button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  asBatteryList,
  asServiceList,
  asTireList,
  fetchActiveBatteries,
  fetchActiveServices,
  fetchActiveTires,
} from '@/lib/supabase/catalog-fetch'
import {
  asPopupPromotionList,
  fetchActivePopupPromotions,
} from '@/lib/supabase/promotions-fetch'
import type {
  CatalogBattery,
  CatalogPageProps,
  CatalogService,
  CatalogTire,
} from '@/types/catalog'

function pickHeroImage<T extends { image_url: string | null; is_featured: boolean }>(
  items: T[]
): string | null {
  const withImg = items.filter((i) => i.image_url)
  const featured = withImg.find((i) => i.is_featured)
  return featured?.image_url ?? withImg[0]?.image_url ?? null
}

export default async function Home() {
  await redirectAdminToPanel()

  const [tiresRes, batteriesRes, servicesRes, promotionsRes] = await Promise.all([
    fetchActiveTires(),
    fetchActiveBatteries(),
    fetchActiveServices(),
    fetchActivePopupPromotions(),
  ])

  const tiresError = tiresRes.error
  const batteriesError = batteriesRes.error
  const servicesError = servicesRes.error

  if (tiresError || batteriesError || servicesError) {
    const message =
      tiresError?.message ||
      batteriesError?.message ||
      servicesError?.message ||
      'Error desconocido'

    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <SiteHeader />
        <main className="flex min-w-0 flex-1 items-center justify-center py-16 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:pl-[max(1.5rem,env(safe-area-inset-left))] sm:pr-[max(1.5rem,env(safe-area-inset-right))]">
          <Card className="max-w-lg border-destructive/30 bg-card/90">
            <CardHeader>
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="size-5 shrink-0" aria-hidden />
                <CardTitle>No se pudo cargar el catálogo</CardTitle>
              </div>
              <CardDescription className="text-muted-foreground">
                No pudimos cargar el catálogo por ahora. Inténtalo de nuevo en unos
                segundos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="rounded-lg border border-border/80 bg-muted/30 p-3 font-mono text-xs leading-relaxed text-muted-foreground">
                {message}
              </p>
            </CardContent>
          </Card>
        </main>
        <SiteFooter />
        <WhatsAppFloatingButton />
      </div>
    )
  }

  const tireList = asTireList(tiresRes.data) as CatalogTire[]
  const batteryList = asBatteryList(batteriesRes.data) as CatalogBattery[]

  const popupPromotions = asPopupPromotionList(promotionsRes.data)

  const catalog: CatalogPageProps = {
    tires: tireList,
    batteries: batteryList,
    services: asServiceList(servicesRes.data) as CatalogService[],
    heroTireImageUrl: pickHeroImage(tireList),
    heroBatteryImageUrl: pickHeroImage(batteryList),
    popupPromotions,
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="min-w-0 flex-1">
        <PublicCatalogView {...catalog} />
      </main>
      <SiteFooter />
      <WhatsAppFloatingButton />
    </div>
  )
}
