import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { COOKIE_ACCESS, COOKIE_REFRESH } from '@/lib/session'
import { StatsProvider } from '@/components/providers/stats-provider'
import { DashboardShell } from '@/components/dashboard/shell'
import { DashboardContent } from '@/components/dashboard/dashboard-content'

export default async function DashboardPage() {
  const store = await cookies()
  if (!store.has(COOKIE_ACCESS) && !store.has(COOKIE_REFRESH)) {
    redirect('/auth')
  }

  return (
    <StatsProvider mode="live">
      <DashboardShell>
        <DashboardContent />
      </DashboardShell>
    </StatsProvider>
  )
}
