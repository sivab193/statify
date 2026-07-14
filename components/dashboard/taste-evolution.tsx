'use client'

import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sprout, Flame, TrendingUp, Anchor } from 'lucide-react'
import { useStats } from '@/components/providers/stats-provider'
import { tasteEvolution, type ArtistDelta } from '@/lib/insights'
import type { LucideIcon } from 'lucide-react'

function Column({
  icon: Icon,
  title,
  subtitle,
  items,
  detail,
}: {
  icon: LucideIcon
  title: string
  subtitle: string
  items: ArtistDelta[]
  detail: (d: ArtistDelta) => string
}) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5 text-primary" /> {title}
        </h3>
        <p className="text-[11px] text-muted-foreground">{subtitle}</p>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">Nothing here — yet</p>
      ) : (
        <ul className="space-y-2">
          {items.map(({ artist, shortRank, longRank }) => (
            <li key={artist.id} className="flex items-center gap-2.5">
              <Avatar className="w-7 h-7">
                <AvatarImage src={artist.imageUrl ?? undefined} alt="" />
                <AvatarFallback className="text-[10px]">{artist.name[0]}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm truncate">{artist.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {detail({ artist, shortRank, longRank })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function TasteEvolution() {
  const { data } = useStats()
  const evolution = useMemo(
    () => (data ? tasteEvolution(data.artists.short_term, data.artists.long_term) : null),
    [data]
  )

  if (!evolution) return null

  return (
    <Card className="p-6 space-y-5">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Taste Evolution</h2>
        <p className="text-xs text-muted-foreground">
          Your last four weeks vs. your all-time canon
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <Column
          icon={Sprout}
          title="New Obsessions"
          subtitle="big right now, nowhere all-time"
          items={evolution.newObsessions}
          detail={(d) => `#${d.shortRank} this month`}
        />
        <Column
          icon={TrendingUp}
          title="Rising"
          subtitle="climbing the ranks fast"
          items={evolution.rising}
          detail={(d) => `#${d.longRank} all-time → #${d.shortRank} now`}
        />
        <Column
          icon={Anchor}
          title="Steady"
          subtitle="top 10 then, top 10 now"
          items={evolution.steady}
          detail={(d) => `#${d.shortRank} now · #${d.longRank} all-time`}
        />
        <Column
          icon={Flame}
          title="Old Flames"
          subtitle="all-time greats you've drifted from"
          items={evolution.oldFlames}
          detail={(d) => `#${d.longRank} all-time`}
        />
      </div>
    </Card>
  )
}
