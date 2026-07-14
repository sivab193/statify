'use client'

import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Headphones } from 'lucide-react'
import { useStats } from '@/components/providers/stats-provider'
import { sessionPatterns } from '@/lib/insights'

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

export function SessionPatterns() {
  const { data } = useStats()
  const sessions = useMemo(() => (data ? sessionPatterns(data.recent) : null), [data])

  if (!sessions) return null

  return (
    <Card className="p-6 space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Headphones className="w-4 h-4 text-primary" /> Session Patterns
        </h2>
        <p className="text-xs text-muted-foreground">
          How you actually listen — based on your last 50 plays
          ({sessions.spanDays} day{sessions.spanDays === 1 ? '' : 's'})
        </p>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-5">
        <Stat value={`${sessions.sessionCount}`} label="listening sessions" />
        <Stat value={`${sessions.avgMinutes} min`} label="average session" />
        <Stat value={`${sessions.avgTracks}`} label="tracks per session" />
        <Stat
          value={`${sessions.longestBinge.tracks} tracks`}
          label={`longest binge — ${sessions.longestBinge.minutes} min straight`}
        />
      </div>
    </Card>
  )
}
