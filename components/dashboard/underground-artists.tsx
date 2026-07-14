'use client'

import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Gem } from 'lucide-react'
import { useStats } from '@/components/providers/stats-provider'
import { undergroundArtists } from '@/lib/insights'
import { formatCount } from '@/components/charts/chart-theme'

export function UndergroundArtists() {
  const { artists } = useStats()
  const underground = useMemo(() => undergroundArtists(artists), [artists])

  if (underground.length === 0) return null

  return (
    <Card className="p-6 space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Gem className="w-4 h-4 text-primary" /> Underground Finds
        </h2>
        <p className="text-xs text-muted-foreground">
          Top artists of yours the rest of the world hasn&apos;t caught up to
        </p>
      </div>

      <ul className="space-y-3">
        {underground.map((artist) => (
          <li key={artist.id}>
            <a
              href={artist.spotifyUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 group"
            >
              <Avatar className="w-9 h-9">
                <AvatarImage src={artist.imageUrl ?? undefined} alt="" />
                <AvatarFallback className="text-xs">{artist.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                  {artist.name}
                </p>
                <p className="text-xs text-muted-foreground capitalize truncate">
                  {artist.genres.slice(0, 2).join(' · ')}
                </p>
              </div>
              <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                {formatCount(artist.followers)} listeners
              </span>
            </a>
          </li>
        ))}
      </ul>
    </Card>
  )
}
