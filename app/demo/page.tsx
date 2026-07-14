import { StatsProvider } from '@/components/providers/stats-provider'
import { DashboardShell } from '@/components/dashboard/shell'
import { DashboardContent } from '@/components/dashboard/dashboard-content'

export const metadata = {
  title: 'Statify — Demo',
}

export default function DemoPage() {
  return (
    <StatsProvider mode="demo">
      <DashboardShell>
        <DashboardContent />
      </DashboardShell>
    </StatsProvider>
  )
}
