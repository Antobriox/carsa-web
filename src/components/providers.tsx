'use client'

import { SiteVisitTracker } from '@/components/analytics/site-visit-tracker'
import { AuthProvider } from '@/context/auth-context'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SiteVisitTracker />
      {children}
    </AuthProvider>
  )
}
