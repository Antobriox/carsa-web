import { RegisterForm } from '@/components/auth/register-form'
import { redirectAdminToPanel } from '@/lib/auth/redirect-admin-from-public'

export const metadata = {
  title: 'Crear cuenta',
}

export default async function RegistroPage() {
  await redirectAdminToPanel()
  return <RegisterForm />
}
