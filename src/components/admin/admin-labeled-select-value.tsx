'use client'

import { SelectValue } from '@/components/ui/select'

type SelectItem = { value: string; label: string }

/** Muestra la etiqueta legible en lugar del valor interno (p. ej. UUID). */
export function AdminLabeledSelectValue({
  value,
  items,
  placeholder,
}: {
  value: string | null | undefined
  items: SelectItem[]
  placeholder: string
}) {
  const label = items.find((item) => item.value === value)?.label
  if (!label) {
    return <SelectValue placeholder={placeholder} />
  }
  return (
    <span
      data-slot="select-value"
      className="flex flex-1 text-left line-clamp-1"
    >
      {label}
    </span>
  )
}
