/** Mensajes claros para errores típicos de Supabase Auth (español). */
export function mapAuthError(message: string): string {
  const m = message.toLowerCase()

  if (m.includes('invalid login credentials') || m.includes('invalid_credentials')) {
    return 'Correo o contraseña incorrectos.'
  }
  if (m.includes('email not confirmed') || m.includes('email_not_confirmed')) {
    return 'Confirma tu correo antes de iniciar sesión.'
  }
  if (m.includes('user already registered') || m.includes('already been registered')) {
    return 'Este correo ya está registrado. Inicia sesión o recupera tu contraseña.'
  }
  if (m.includes('password') && m.includes('weak')) {
    return 'La contraseña no cumple los requisitos de seguridad.'
  }
  if (m.includes('rate limit') || m.includes('too many')) {
    return 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.'
  }
  if (m.includes('network') || m.includes('fetch')) {
    return 'Error de conexión. Revisa tu internet e inténtalo de nuevo.'
  }

  return message || 'Algo salió mal. Inténtalo de nuevo.'
}
