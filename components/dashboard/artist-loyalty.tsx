'use client'

import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { HeartHandshake } from 'lucide-react'
import { useStats } from '@/components/providers/stats-provider'
import { artistLoyalty } from '@/lib/insights'

export function ArtistLoyalty() {
  const { data } = useStats()
  const loyalty = useMemo(() => (data ? artistLoyalty(data.artists) : null), [data])

  if (!loyalty) return null

  return (
    <Card className="p-6 space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <HeartHandshake className="w-4 h-4 text-primary" /> Ride or Die
        </h2>
        <p className="text-xs text-muted-foreground">
          Artists in your top list this month, this year, and all-time
        </p>
      </div>

      <div className="flex items-baseline gap-3">
        <span className="text-5xl font-semibold">{loyalty.rideOrDie.length}</span>
        <span className="text-sm text-muted-foreground">
          artists never leave your rotation · loyalty {loyalty.score}%
        </span>
      </div>

      {loyalty.rideOrDie.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {loyalty.rideOrDie.slice(0, 12).map((artist) => (
            <a
              key={artist.id}
              href={artist.spotifyUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-full border border-border bg-muted/30 pl-1 pr-3 py-1 hover:border-primary/50 transition-colors"
            >
              <Avatar className="w-6 h-6">
                <AvatarImage src={artist.imageUrl ?? undefined} alt="" />
                <AvatarFallback className="text-[9px]">{artist.name[0]}</AvatarFallback>
              </Avatar>
              <span className="text-xs">{artist.name}</span>
            </a>
          ))}
        </div>
      )}
    </Card>
  )
}
