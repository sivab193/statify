'use client'

import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { Hourglass } from 'lucide-react'
import { useStats } from '@/components/providers/stats-provider'
import { eraExplorer } from '@/lib/insights'
import { chart, tooltipStyle } from '@/components/charts/chart-theme'

export function EraExplorer() {
  const { tracks } = useStats()
  const era = useMemo(() => eraExplorer(tracks), [tracks])

  if (era.decades.length === 0) return null

  return (
    <Card className="p-6 space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Hourglass className="w-4 h-4 text-primary" /> Era Explorer
        </h2>
        <p className="text-xs text-muted-foreground">
          When the music you love was actually made
        </p>
      </div>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={era.decades} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={chart.grid} strokeWidth={1} />
            <XAxis
              dataKey="decade"
              tickLine={false}
              axisLine={false}
              tick={{ fill: chart.axis, fontSize: 11 }}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fill: chart.axis, fontSize: 11 }}
            />
            <Tooltip
              cursor={{ fill: 'color-mix(in oklch, var(--color-muted) 50%, transparent)' }}
              contentStyle={tooltipStyle}
              formatter={(value) => [`${value} tracks`, undefined]}
              labelStyle={{ color: 'var(--color-popover-foreground)' }}
            />
            <Bar
              dataKey="count"
              name="Tracks"
              fill={chart.accent}
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {era.centerYear && (
        <p className="text-sm text-muted-foreground">
          Your musical center of gravity:{' '}
          <span className="text-primary font-semibold">{era.centerYear}</span>
          {era.oldest && (
            <>
              {' '}· oldest favorite:{' '}
              <span className="text-foreground font-medium">
                {era.oldest.name} ({era.oldest.releaseDate.slice(0, 4)})
              </span>
            </>
          )}
        </p>
      )}
    </Card>
  )
}
