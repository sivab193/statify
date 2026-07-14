'use client'

import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Disc3, Radar, HeartHandshake, Clock3 } from 'lucide-react'
import { useStats } from '@/components/providers/stats-provider'
import {
  artistLoyalty,
  genreBreakdown,
  listeningClock,
  mainstreamMeter,
} from '@/lib/insights'
import type { LucideIcon } from 'lucide-react'

function Tile({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon
  label: string
  value: string
  hint: string
}) {
  return (
    <Card className="p-5 space-y-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="w-4 h-4 text-primary" />
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-semibold leading-tight capitalize">{value}</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </Card>
  )
}

export function StatTiles() {
  const { data, artists, tracks } = useStats()

  const genre = useMemo(() => genreBreakdown(artists), [artists])
  const meter = useMemo(() => mainstreamMeter(tracks), [tracks])
  const loyalty = useMemo(() => (data ? artistLoyalty(data.artists) : null), [data])
  const clock = useMemo(() => (data ? listeningClock(data.recent) : null), [data])

  if (!data) return null

  const hourLabel = (h: number) => {
    const period = h < 12 ? 'AM' : 'PM'
    const display = h % 12 === 0 ? 12 : h % 12
    return `${display} ${period}`
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Tile
        icon={Disc3}
        label="Top genre"
        value={genre.topGenre ?? '—'}
        hint={`${genre.persona} · diversity ${genre.diversityScore}/100`}
      />
      <Tile
        icon={Radar}
        label="Obscurity"
        value={meter ? `${meter.obscurity}/100` : '—'}
        hint={meter?.persona ?? 'Not enough data'}
      />
      <Tile
        icon={HeartHandshake}
        label="Ride or die"
        value={loyalty ? `${loyalty.rideOrDie.length} artists` : '—'}
        hint="in your top list across every era"
      />
      <Tile
        icon={Clock3}
        label="Peak hour"
        value={clock ? hourLabel(clock.peakHour) : '—'}
        hint={clock?.persona ?? 'Not enough data'}
      />
    </div>
  )
}
