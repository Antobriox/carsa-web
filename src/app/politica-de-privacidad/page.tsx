import { LegalPageLayout } from '@/components/public/legal-page-layout'
import { privacyIntro, privacySections } from '@/content/legal-privacy'
import { redirectAdminToPanel } from '@/lib/auth/redirect-admin-from-public'

export const metadata = {
  title: 'Política de Privacidad',
  description:
    'Política de privacidad y tratamiento de datos personales de CARSA.',
}

export default async function PoliticaPrivacidadPage() {
  await redirectAdminToPanel()

  return (
    <LegalPageLayout
      title="Política de Privacidad"
      updated="mayo de 2026"
      intro={privacyIntro}
      sections={privacySections}
    />
  )
}
