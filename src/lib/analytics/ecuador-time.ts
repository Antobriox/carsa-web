const TZ = 'America/Guayaquil'

/** Medianoche de hoy en Ecuador, en ISO UTC (Ecuador = UTC−5, sin horario de verano). */
export function ecuadorTodayStartIso(): string {
  const day = new Date().toLocaleDateString('en-CA', { timeZone: TZ })
  return `${day}T05:00:00.000Z`
}

export function ecuadorDaysAgoStartIso(days: number): string {
  const now = new Date()
  const past = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  const day = past.toLocaleDateString('en-CA', { timeZone: TZ })
  return `${day}T05:00:00.000Z`
}
