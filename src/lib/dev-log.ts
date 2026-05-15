/** Registra errores solo en desarrollo (evita ruido en consola de producción). */
export function devError(...args: unknown[]) {
  if (process.env.NODE_ENV === 'development') {
    console.error(...args)
  }
}
