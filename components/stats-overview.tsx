'use client'

import { Card } from '@/components/ui/card'
import { Clock, Headphones, Music, TrendingUp, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

interface StatsOverviewProps {
  dateRange: string
  demo?: boolean
}

export function StatsOverview({ dateRange, demo }: StatsOverviewProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [stats, setStats] = useState({
    listeningTime: 0,
    tracksPlayed: 0,
    uniqueArtists: 0,
    topGenre: 'Loading...'
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsVisible(false)
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [dateRange])

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true)
      try {
        // Fetch top tracks, top artists, and recently played
        const [tracksRes, artistsRes, recentRes] = await Promise.all([
          fetch(`/api/spotify/top-tracks?time_range=${dateRange}&limit=50`),
          fetch(`/api/spotify/top-artists?time_range=${dateRange}&limit=50`),
          fetch('/api/spotify/recently-played?limit=50')
        ])

        const [tracksData, artistsData, recentData] = await Promise.all([
          tracksRes.ok ? tracksRes.json() : { items: [] },
          artistsRes.ok ? artistsRes.json() : { items: [] },
          recentRes.ok ? recentRes.json() : { items: [] }
        ])

        // Calculate listening time (approximate based on recently played)
        const totalMs = recentData.items?.reduce((acc: number, item: any) => {
          return acc + (item.track?.duration_ms || 0)
        }, 0) || 0
        const hours = Math.round(totalMs / 1000 / 60 / 60)

        // Get top genre from top artists
        const genres = artistsData.items?.flatMap((artist: any) => artist.genres) || []
        const genreCounts = genres.reduce((acc: any, genre: string) => {
          acc[genre] = (acc[genre] || 0) + 1
          return acc
        }, {})
        const topGenre = Object.keys(genreCounts).sort((a, b) => genreCounts[b] - genreCounts[a])[0] || 'N/A'

        setStats({
          listeningTime: hours,
          tracksPlayed: tracksData.items?.length || 0,
          uniqueArtists: artistsData.items?.length || 0,
          topGenre: topGenre.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        })
      } catch (error) {
        console.error('[v0] Failed to fetch stats:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [dateRange])

  const statsData = [
    { 
      label: 'Recent Listening',
      value: isLoading ? '-' : `${stats.listeningTime}+ hrs`,
      icon: Clock,
      color: 'text-chart-1'
    },
    { 
      label: 'Top Tracks',
      value: isLoading ? '-' : stats.tracksPlayed.toString(),
      icon: Headphones,
      color: 'text-chart-2'
    },
    { 
      label: 'Top Artists',
      value: isLoading ? '-' : stats.uniqueArtists.toString(),
      icon: Music,
      color: 'text-chart-3'
    },
    { 
      label: 'Top Genre',
      value: isLoading ? '-' : stats.topGenre,
      icon: TrendingUp,
      color: 'text-chart-4'
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card
            key={stat.label}
            className={`p-6 space-y-3 transition-all duration-500 ${
              isVisible 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <Icon className={`w-5 h-5 ${stat.color}`} />
              <div className={`w-10 h-10 rounded-full ${stat.color} bg-current opacity-10`} />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              ) : (
                <p className="text-3xl font-bold text-card-foreground">{stat.value}</p>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
