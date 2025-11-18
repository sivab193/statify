'use client'

import { Card } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface ListeningActivityProps {
  dateRange: string
  demo?: boolean
}

interface ActivityData {
  day: string
  hours: number
}

export function ListeningActivity({ dateRange, demo }: ListeningActivityProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [activityData, setActivityData] = useState<ActivityData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsVisible(false)
    const timer = setTimeout(() => setIsVisible(true), 400)
    return () => clearTimeout(timer)
  }, [dateRange])

  useEffect(() => {
    async function fetchActivity() {
      setIsLoading(true)
      try {
        const response = await fetch('/api/spotify/recently-played?limit=50')
        if (response.ok) {
          const data = await response.json()
          
          // Group by day of week
          const dayMap: { [key: string]: number } = {
            'Sun': 0, 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0
          }
          
          data.items?.forEach((item: any) => {
            const date = new Date(item.played_at)
            const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]
            const durationHours = (item.track?.duration_ms || 0) / 1000 / 60 / 60
            dayMap[day] += durationHours
          })

          const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
          setActivityData(days.map(day => ({
            day,
            hours: Math.round(dayMap[day] * 10) / 10
          })))
        }
      } catch (error) {
        console.error('[v0] Failed to fetch listening activity:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchActivity()
  }, [dateRange])

  const maxHours = Math.max(...activityData.map(d => d.hours), 1)

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-card-foreground">Listening Activity</h2>
        <p className="text-sm text-muted-foreground">Hours per day</p>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : activityData.length === 0 ? (
        <p className="text-center text-muted-foreground py-24">No activity data available</p>
      ) : (
        <div className="flex items-end justify-between gap-4 h-64">
          {activityData.map((data, index) => {
            const height = (data.hours / maxHours) * 100
            return (
              <div key={data.day} className="flex-1 flex flex-col items-center gap-3">
                <div className="relative w-full flex items-end justify-center h-full">
                  <div 
                    className="w-full bg-gradient-to-t from-primary to-primary/50 rounded-t-lg transition-all duration-1000 ease-out relative group cursor-pointer hover:from-primary hover:to-primary/70"
                    style={{ 
                      height: isVisible ? `${height}%` : '0%',
                      transitionDelay: `${index * 100}ms`
                    }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-card border border-border px-2 py-1 rounded text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {data.hours}h
                    </div>
                  </div>
                </div>
                <p className="text-sm font-medium text-muted-foreground">{data.day}</p>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
