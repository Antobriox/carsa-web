import { redirect } from 'next/navigation'

export default function IniciarSesionRedirectPage() {
  redirect('/login')
}
