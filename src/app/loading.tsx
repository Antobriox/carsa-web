import { TireLoadingIcon } from '@/components/ui/tire-loading-icon'

/** UI mientras resuelve la ruta (reduce flash antes de redirect o datos). */
export default function AppLoading() {
  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center gap-4 bg-background py-20 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]"
      aria-busy="true"
    >
      <TireLoadingIcon className="size-11" decorative />
      <p className="text-sm text-muted-foreground">Cargando…</p>
    </div>
  )
}
