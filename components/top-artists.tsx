'use client'

import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface TopArtistsProps {
  dateRange: string
  demo?: boolean
}

interface SpotifyArtist {
  id: string
  name: string
  images: { url: string }[]
  followers: { total: number }
}

export function TopArtists({ dateRange, demo }: TopArtistsProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [artists, setArtists] = useState<SpotifyArtist[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsVisible(false)
    const timer = setTimeout(() => setIsVisible(true), 200)
    return () => clearTimeout(timer)
  }, [dateRange])

  useEffect(() => {
    async function fetchTopArtists() {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/spotify/top-artists?time_range=${dateRange}&limit=10`)
        if (response.ok) {
          const data = await response.json()
          setArtists(data.items || [])
        }
      } catch (error) {
        console.error('[v0] Failed to fetch top artists:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchTopArtists()
  }, [dateRange])

  return (
    <Card className="p-6 space-y-6">
      <h2 className="text-xl font-bold text-card-foreground">Top Artists</h2>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : artists.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No data available for this period</p>
      ) : (
        <div className="space-y-4">
          {artists.map((artist, index) => (
            <div
              key={artist.id}
              className={`flex items-center gap-4 transition-all duration-500 ${
                isVisible 
                  ? 'opacity-100 translate-x-0' 
                  : 'opacity-0 -translate-x-4'
              }`}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              <div className="w-8 text-muted-foreground font-bold text-lg">
                {index + 1}
              </div>
              
              <Avatar className="w-12 h-12">
                <AvatarImage 
                  src={artist.images[0]?.url || "/placeholder.svg?height=48&width=48"} 
                  alt={artist.name} 
                />
                <AvatarFallback>{artist.name[0]}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-card-foreground truncate">{artist.name}</p>
                <p className="text-sm text-muted-foreground">
                  {artist.followers.total.toLocaleString()} followers
                </p>
              </div>

              <div className="w-24 bg-muted rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-1000"
                  style={{ 
                    width: isVisible ? `${((10 - index) / 10) * 100}%` : '0%',
                    transitionDelay: `${index * 80 + 200}ms`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
