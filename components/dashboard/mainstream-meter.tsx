'use client'

import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Radar } from 'lucide-react'
import { useStats } from '@/components/providers/stats-provider'
import { mainstreamMeter } from '@/lib/insights'

const BANDS = [
  { min: 0, label: 'Chart Dweller' },
  { min: 25, label: 'Balanced' },
  { min: 45, label: 'Crate Digger' },
  { min: 65, label: 'Deep Underground' },
]

export function MainstreamMeter() {
  const { tracks } = useStats()
  const meter = useMemo(() => mainstreamMeter(tracks), [tracks])

  if (!meter) return null

  return (
    <Card className="p-6 space-y-5">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Radar className="w-4 h-4 text-primary" /> Mainstream Meter
        </h2>
        <p className="text-xs text-muted-foreground">
          How far off the charts your taste runs — 100 is pure obscurity
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-baseline gap-3">
          <span className="text-5xl font-semibold">{meter.obscurity}</span>
          <span className="text-sm text-muted-foreground">/ 100 obscurity</span>
        </div>

        {/* Meter: accent fill on a lighter step of the same ramp */}
        <div className="h-3 rounded-full bg-primary/15 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700"
            style={{ width: `${meter.obscurity}%` }}
          />
        </div>

        <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wide">
          {BANDS.map((band) => (
            <span
              key={band.label}
              className={band.label === meter.persona || (band.label === 'Balanced' && meter.persona === 'Balanced Listener') ? 'text-primary font-semibold' : ''}
            >
              {band.label}
            </span>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">
          Your top tracks average <span className="text-foreground font-medium">{meter.avgPopularity}/100</span> on
          Spotify&apos;s popularity scale. Verdict:{' '}
          <span className="text-primary font-medium">{meter.persona}</span>.
        </p>
      </div>
    </Card>
  )
}
