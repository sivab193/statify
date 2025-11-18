'use client'

import { StatsOverview } from '@/components/stats-overview'
import { TopArtists } from '@/components/top-artists'
import { TopTracks } from '@/components/top-tracks'
import { ListeningActivity } from '@/components/listening-activity'
import { DateRangeSelector } from '@/components/date-range-selector'
import { Music2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function DemoPage() {
  const [dateRange, setDateRange] = useState('last_month')

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Music2 className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Spotify Stats - Demo</h1>
          </div>
          
          <Link href="/auth">
            <Button>Connect Spotify</Button>
          </Link>
        </div>
      </header>

      {/* Demo Banner */}
      <div className="bg-primary/10 border-b border-primary/20">
        <div className="container mx-auto px-4 py-3 text-center">
          <p className="text-sm text-primary font-medium">
            This is a demo with sample data. Connect your Spotify to see your real stats!
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <DateRangeSelector value={dateRange} onChange={setDateRange} />
        </div>

        <StatsOverview dateRange={dateRange} demo />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopArtists dateRange={dateRange} demo />
          <TopTracks dateRange={dateRange} demo />
        </div>

        <ListeningActivity dateRange={dateRange} demo />
      </main>
    </div>
  )
}
