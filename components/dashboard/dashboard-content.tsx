'use client'

import { useStats } from '@/components/providers/stats-provider'
import { useCan3D } from '@/lib/use-preferences'
import { DashboardSkeleton } from '@/components/dashboard/card-skeleton'
import { ErrorState } from '@/components/dashboard/error-state'
import { StatTiles } from '@/components/dashboard/stat-tiles'
import { TopArtistsList } from '@/components/dashboard/top-artists-list'
import { TopTracksList } from '@/components/dashboard/top-tracks-list'
import { MainstreamMeter } from '@/components/dashboard/mainstream-meter'
import { EraExplorer } from '@/components/dashboard/era-explorer'
import { ListeningClock } from '@/components/dashboard/listening-clock'
import { GenreBreakdown } from '@/components/dashboard/genre-breakdown'
import { TasteEvolution } from '@/components/dashboard/taste-evolution'
import { ArtistLoyalty } from '@/components/dashboard/artist-loyalty'
import { SessionPatterns } from '@/components/dashboard/session-patterns'
import { UndergroundArtists } from '@/components/dashboard/underground-artists'
import { LazyAlbumWall, LazyGenreGalaxy } from '@/components/three/lazy'

export function DashboardContent() {
  const { status, retry } = useStats()
  const can3D = useCan3D()

  if (status === 'loading') return <DashboardSkeleton />
  if (status === 'error') return <ErrorState onRetry={retry} />

  return (
    <>
      <StatTiles />

      {can3D && <LazyGenreGalaxy />}
      {can3D && <LazyAlbumWall />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopArtistsList />
        <TopTracksList />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ListeningClock />
        <EraExplorer />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GenreBreakdown />
        <div className="space-y-6">
          <MainstreamMeter />
          <SessionPatterns />
        </div>
      </div>

      <TasteEvolution />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ArtistLoyalty />
        <UndergroundArtists />
      </div>
    </>
  )
}
