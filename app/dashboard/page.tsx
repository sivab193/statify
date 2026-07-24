import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { COOKIE_ACCESS, COOKIE_REFRESH } from '@/lib/session'
import { RemoteStatsProvider } from '@/components/providers/stats-provider'
import { StatsShell } from '@/components/stats/shell'
import { StatsDashboard } from '@/components/stats/dashboard'

export default async function DashboardPage() {
  const store = await cookies()
  if (!store.has(COOKIE_ACCESS) && !store.has(COOKIE_REFRESH)) {
    redirect('/auth')
  }

  return (
    <RemoteStatsProvider mode="live">
      <StatsShell>
        <StatsDashboard />
      </StatsShell>
    </RemoteStatsProvider>
  )
}
