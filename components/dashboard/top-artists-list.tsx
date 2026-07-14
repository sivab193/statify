'use client'

import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useStats } from '@/components/providers/stats-provider'
import { formatCount } from '@/components/charts/chart-theme'

export function TopArtistsList({ limit = 10 }: { limit?: number }) {
  const { artists } = useStats()
  const top = artists.slice(0, limit)

  return (
    <Card className="p-6 space-y-5">
      <h2 className="text-lg font-semibold">Top Artists</h2>
      {top.length === 0 ? (
        <p className="text-center text-muted-foreground py-10 text-sm">
          No data for this period
        </p>
      ) : (
        <div className="space-y-4">
          {top.map((artist, index) => (
            <a
              key={artist.id}
              href={artist.spotifyUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-4 group"
            >
              <div className="w-6 text-muted-foreground font-semibold tabular-nums">
                {index + 1}
              </div>
              <Avatar className="w-11 h-11">
                <AvatarImage src={artist.imageUrl ?? undefined} alt="" />
                <AvatarFallback>{artist.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate group-hover:text-primary transition-colors">
                  {artist.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {artist.genres.slice(0, 2).join(' · ') || `${formatCount(artist.followers)} followers`}
                </p>
              </div>
              <div className="w-20 bg-muted rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-primary h-full"
                  style={{ width: `${((limit - index) / limit) * 100}%` }}
                />
              </div>
            </a>
          ))}
        </div>
      )}
    </Card>
  )
}
