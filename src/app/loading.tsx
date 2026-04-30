import { TireLoadingIcon } from '@/components/ui/tire-loading-icon'

/** UI mientras resuelve la ruta (reduce flash antes de redirect o datos). */
export default function AppLoading() {
  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center gap-4 bg-background px-4 py-20"
      aria-busy="true"
    >
      <TireLoadingIcon className="size-11" decorative />
      <p className="text-sm text-muted-foreground">Cargando…</p>
    </div>
  )
}
