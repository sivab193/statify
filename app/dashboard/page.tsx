'use client'

import { StatsOverview } from '@/components/stats-overview'
import { TopArtists } from '@/components/top-artists'
import { TopTracks } from '@/components/top-tracks'
import { ListeningActivity } from '@/components/listening-activity'
import { DateRangeSelector } from '@/components/date-range-selector'
import { Music2, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState('medium_term') // Updated default to match Spotify API time ranges
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/spotify/me')
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else {
          router.push('/auth')
        }
      } catch (error) {
        console.error('[v0] Failed to fetch user:', error)
        router.push('/auth')
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [router])

  const handleLogout = () => {
    document.cookie = 'spotify_access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'spotify_refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    router.push('/auth')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Music2 className="w-12 h-12 text-primary animate-pulse mx-auto" />
          <p className="text-muted-foreground">Loading your stats...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Music2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Spotify Stats</h1>
              {user && <p className="text-xs text-muted-foreground">{user.display_name}</p>}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <DateRangeSelector value={dateRange} onChange={setDateRange} />
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        <StatsOverview dateRange={dateRange} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopArtists dateRange={dateRange} />
          <TopTracks dateRange={dateRange} />
        </div>

        <ListeningActivity dateRange={dateRange} />
      </main>
    </div>
  )
}
