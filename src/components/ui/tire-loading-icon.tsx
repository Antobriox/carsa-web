import { cn } from '@/lib/utils'

type TireLoadingIconProps = {
  className?: string
  /** Si hay texto visible “Cargando…”, marca decorativo para lectores de pantalla. */
  decorative?: boolean
  'aria-label'?: string
}

/**
 * Icono de llanta en rotación para estados de carga (rutas, paneles, etc.).
 */
export function TireLoadingIcon({
  className,
  decorative = false,
  'aria-label': ariaLabel = 'Cargando',
}: TireLoadingIconProps) {
  return (
    <svg
      className={cn('animate-spin text-carsa-primary', className)}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : ariaLabel}
      role={decorative ? 'presentation' : 'img'}
    >
      <circle
        cx="24"
        cy="24"
        r="18"
        stroke="currentColor"
        strokeWidth="5"
        strokeDasharray="16 26"
        strokeLinecap="round"
        opacity={0.88}
      />
      <circle
        cx="24"
        cy="24"
        r="18"
        stroke="currentColor"
        strokeWidth="5"
        strokeDasharray="16 26"
        strokeDashoffset="21"
        strokeLinecap="round"
        opacity={0.35}
      />
      <circle
        cx="24"
        cy="24"
        r="9"
        stroke="currentColor"
        strokeWidth="1.75"
        opacity={0.45}
      />
      <circle cx="24" cy="24" r="3" fill="currentColor" opacity={0.2} />
    </svg>
  )
}
