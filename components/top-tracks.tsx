'use client'

import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Play, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

interface TopTracksProps {
  dateRange: string
  demo?: boolean
}

interface SpotifyTrack {
  id: string
  name: string
  artists: { name: string }[]
  album: {
    images: { url: string }[]
  }
  external_urls: {
    spotify: string
  }
}

export function TopTracks({ dateRange, demo }: TopTracksProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [tracks, setTracks] = useState<SpotifyTrack[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsVisible(false)
    const timer = setTimeout(() => setIsVisible(true), 300)
    return () => clearTimeout(timer)
  }, [dateRange])

  useEffect(() => {
    async function fetchTopTracks() {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/spotify/top-tracks?time_range=${dateRange}&limit=10`)
        if (response.ok) {
          const data = await response.json()
          setTracks(data.items || [])
        }
      } catch (error) {
        console.error('[v0] Failed to fetch top tracks:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchTopTracks()
  }, [dateRange])

  return (
    <Card className="p-6 space-y-6">
      <h2 className="text-xl font-bold text-card-foreground">Top Tracks</h2>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : tracks.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No data available for this period</p>
      ) : (
        <div className="space-y-4">
          {tracks.map((track, index) => (
            <div
              key={track.id}
              className={`flex items-center gap-4 group cursor-pointer transition-all duration-500 ${
                isVisible 
                  ? 'opacity-100 translate-x-0' 
                  : 'opacity-0 -translate-x-4'
              }`}
              style={{ transitionDelay: `${index * 80}ms` }}
              onClick={() => window.open(track.external_urls.spotify, '_blank')}
            >
              <div className="w-8 text-muted-foreground font-bold text-lg group-hover:text-primary transition-colors">
                {index + 1}
              </div>
              
              <div className="relative">
                <Avatar className="w-12 h-12">
                  <AvatarImage 
                    src={track.album.images[0]?.url || "/placeholder.svg?height=48&width=48"} 
                    alt={track.name} 
                  />
                  <AvatarFallback>{track.name[0]}</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                  <Play className="w-5 h-5 text-primary fill-primary" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-card-foreground truncate">{track.name}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {track.artists.map(a => a.name).join(', ')}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm font-medium text-card-foreground">#{index + 1}</p>
                <p className="text-xs text-muted-foreground">rank</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
