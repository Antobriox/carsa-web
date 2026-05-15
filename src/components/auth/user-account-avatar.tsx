import Link from 'next/link'

import { getUserInitials } from '@/lib/user-initials'
import { cn } from '@/lib/utils'

type UserAccountAvatarProps = {
  fullName: string | null | undefined
  email?: string | null
  href?: string
  onClick?: () => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'size-8 text-[0.65rem]',
  md: 'size-9 text-xs sm:size-10 sm:text-sm',
  lg: 'size-11 text-sm',
} as const

export function UserAccountAvatar({
  fullName,
  email,
  href = '/cuenta',
  onClick,
  className,
  size = 'md',
}: UserAccountAvatarProps) {
  const initials = getUserInitials(fullName, email)
  const label = fullName?.trim() ? `Mi cuenta (${fullName.trim()})` : 'Mi cuenta'

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-label={label}
      title={fullName?.trim() || 'Mi cuenta'}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full',
        'bg-carsa-primary/20 font-semibold tracking-tight text-carsa-primary',
        'ring-2 ring-carsa-primary/25 transition duration-200',
        'hover:bg-carsa-primary/35 hover:ring-carsa-primary/45',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-carsa-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'active:scale-[0.97]',
        sizeClasses[size],
        className
      )}
    >
      <span aria-hidden>{initials}</span>
    </Link>
  )
}
