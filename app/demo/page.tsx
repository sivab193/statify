import { RemoteStatsProvider } from '@/components/providers/stats-provider'
import { StatsShell } from '@/components/stats/shell'
import { StatsDashboard } from '@/components/stats/dashboard'

export const metadata = {
  title: 'Statify — Demo',
}

export default function DemoPage() {
  return (
    <RemoteStatsProvider mode="demo">
      <StatsShell>
        <StatsDashboard />
      </StatsShell>
    </RemoteStatsProvider>
  )
}
