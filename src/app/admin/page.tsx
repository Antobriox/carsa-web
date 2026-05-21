import { AdminDashboard } from '@/components/admin/admin-dashboard'
import { fetchDashboardStats } from '@/lib/admin/dashboard-stats'
import { fetchSiteVisitStats } from '@/lib/analytics/visit-stats'

export const metadata = {
  title: 'Admin · Dashboard',
}

export default async function AdminDashboardPage() {
  const [stats, visits] = await Promise.all([
    fetchDashboardStats(),
    fetchSiteVisitStats(),
  ])

  return <AdminDashboard stats={stats} visits={visits} />
}
