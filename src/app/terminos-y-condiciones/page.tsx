import { LegalPageLayout } from '@/components/public/legal-page-layout'
import { termsIntro, termsSections } from '@/content/legal-terms'
import { redirectAdminToPanel } from '@/lib/auth/redirect-admin-from-public'

export const metadata = {
  title: 'Términos y Condiciones',
  description:
    'Términos y condiciones de uso del sitio web de CARSA en Portoviejo.',
}

export default async function TerminosPage() {
  await redirectAdminToPanel()

  return (
    <LegalPageLayout
      title="Términos y Condiciones"
      updated="mayo de 2026"
      intro={termsIntro}
      sections={termsSections}
    />
  )
}
