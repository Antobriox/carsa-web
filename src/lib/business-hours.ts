/** Horario de sucursal en zona horaria de la costa de Ecuador. */
export const CARSA_TIMEZONE = 'America/Guayaquil'

const WEEKDAY_SHORT_TO_DOW: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
}

export type DaySchedule = { label: string; range: string; openMin: number; closeMin: number }

/** Lunes–viernes 08:00–18:00, sábado 08:00–16:00, domingo 08:00–13:00 */
export const CARSA_WEEKLY: DaySchedule[] = [
  { label: 'Lunes', range: '08:00 – 18:00', openMin: 8 * 60, closeMin: 18 * 60 },
  { label: 'Martes', range: '08:00 – 18:00', openMin: 8 * 60, closeMin: 18 * 60 },
  { label: 'Miércoles', range: '08:00 – 18:00', openMin: 8 * 60, closeMin: 18 * 60 },
  { label: 'Jueves', range: '08:00 – 18:00', openMin: 8 * 60, closeMin: 18 * 60 },
  { label: 'Viernes', range: '08:00 – 18:00', openMin: 8 * 60, closeMin: 18 * 60 },
  { label: 'Sábado', range: '08:00 – 16:00', openMin: 8 * 60, closeMin: 16 * 60 },
  { label: 'Domingo', range: '08:00 – 13:00', openMin: 8 * 60, closeMin: 13 * 60 },
]

function getGuayaquilClock(now: Date): { dow: number; minutes: number } {
  const wd = now.toLocaleDateString('en-US', {
    timeZone: CARSA_TIMEZONE,
    weekday: 'short',
  })
  const dow = WEEKDAY_SHORT_TO_DOW[wd] ?? 0

  const dateStr = now.toLocaleString('sv-SE', { timeZone: CARSA_TIMEZONE })
  const timePart = dateStr.split(' ')[1] ?? '0:0:0'
  const [h, m] = timePart.split(':').map((x) => Number(x))
  const minutes = (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0)

  return { dow, minutes }
}

export function getTodaySchedule(): DaySchedule {
  const { dow } = getGuayaquilClock(new Date())
  const idx = dow === 0 ? 6 : dow - 1
  return CARSA_WEEKLY[idx] ?? CARSA_WEEKLY[0]
}

/** `true` si ahora (en Guayaquil) estamos dentro del horario de hoy. */
export function isCarOpenNow(now: Date = new Date()): boolean {
  const { dow, minutes } = getGuayaquilClock(now)
  const idx = dow === 0 ? 6 : dow - 1
  const day = CARSA_WEEKLY[idx]
  if (!day) return false
  return minutes >= day.openMin && minutes < day.closeMin
}
