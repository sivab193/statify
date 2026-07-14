'use client'

/* eslint-disable @next/next/no-img-element */
import { Card } from '@/components/ui/card'
import { useStats } from '@/components/providers/stats-provider'

function formatDuration(ms: number) {
  const totalSeconds = Math.round(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = `${totalSeconds % 60}`.padStart(2, '0')
  return `${minutes}:${seconds}`
}

export function TopTracksList({ limit = 10 }: { limit?: number }) {
  const { tracks } = useStats()
  const top = tracks.slice(0, limit)

  return (
    <Card className="p-6 space-y-5">
      <h2 className="text-lg font-semibold">Top Tracks</h2>
      {top.length === 0 ? (
        <p className="text-center text-muted-foreground py-10 text-sm">
          No data for this period
        </p>
      ) : (
        <div className="space-y-4">
          {top.map((track, index) => (
            <a
              key={track.id}
              href={track.spotifyUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-4 group"
            >
              <div className="w-6 text-muted-foreground font-semibold tabular-nums">
                {index + 1}
              </div>
              {track.albumImageUrl ? (
                <img
                  src={track.albumImageUrl}
                  alt=""
                  className="w-11 h-11 rounded-md object-cover"
                />
              ) : (
                <div className="w-11 h-11 rounded-md bg-muted" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate group-hover:text-primary transition-colors">
                  {track.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {track.artists.join(', ')}
                </p>
              </div>
              <span className="text-xs text-muted-foreground tabular-nums">
                {formatDuration(track.durationMs)}
              </span>
            </a>
          ))}
        </div>
      )}
    </Card>
  )
}
