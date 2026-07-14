'use client'

import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Layers } from 'lucide-react'
import { useStats } from '@/components/providers/stats-provider'
import { genreBreakdown } from '@/lib/insights'

export function GenreBreakdown() {
  const { artists } = useStats()
  const breakdown = useMemo(() => genreBreakdown(artists), [artists])

  if (breakdown.genres.length === 0) return null

  const maxShare = breakdown.genres[0].share

  return (
    <Card className="p-6 space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" /> Genre DNA
        </h2>
        <p className="text-xs text-muted-foreground">
          Rank-weighted share of your top artists&apos; genres
        </p>
      </div>

      <div className="space-y-2.5">
        {breakdown.genres.map(({ genre, share }) => (
          <div key={genre} className="flex items-center gap-3">
            <span className="w-32 shrink-0 text-sm capitalize truncate" title={genre}>
              {genre}
            </span>
            <div className="flex-1 h-4 rounded bg-muted/40 overflow-hidden">
              <div
                className="h-full rounded-r bg-primary"
                style={{ width: `${(share / maxShare) * 100}%` }}
              />
            </div>
            <span className="w-10 text-right text-xs text-muted-foreground tabular-nums">
              {Math.round(share * 100)}%
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <p className="text-sm text-muted-foreground">Genre diversity</p>
        <p className="text-sm">
          <span className="font-semibold">{breakdown.diversityScore}/100</span>{' '}
          <span className="text-primary font-medium">· {breakdown.persona}</span>
        </p>
      </div>
    </Card>
  )
}
