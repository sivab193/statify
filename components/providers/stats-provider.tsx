'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import type { SpotifyArtistLite, SpotifyTrackLite, StatsPayload, TimeRange } from '@/lib/types'

interface StatsContextValue {
  data: StatsPayload | null
  status: 'loading' | 'ready' | 'error'
  retry: () => void
  timeRange: TimeRange
  setTimeRange: (range: TimeRange) => void
  /** Artists/tracks for the currently selected time range */
  artists: SpotifyArtistLite[]
  tracks: SpotifyTrackLite[]
  isDemo: boolean
}

const StatsContext = createContext<StatsContextValue | null>(null)

interface StatsProviderProps {
  children: ReactNode
  mode?: 'live' | 'demo'
}

export function StatsProvider({ children, mode = 'live' }: StatsProviderProps) {
  const router = useRouter()
  const isDemo = mode === 'demo'
  const [data, setData] = useState<StatsPayload | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [timeRange, setTimeRange] = useState<TimeRange>('medium_term')
  const [attempt, setAttempt] = useState(0)

  const retry = useCallback(() => {
    setStatus('loading')
    setAttempt((n) => n + 1)
  }, [])

  useEffect(() => {
    if (!isDemo) return
    let cancelled = false
    // Client-side so recent-play timestamps land in the viewer's timezone,
    // and the demo dataset stays out of the live-dashboard bundle
    import('@/lib/demo-data').then(({ buildDemoStats }) => {
      if (cancelled) return
      setData(buildDemoStats())
      setStatus('ready')
    })
    return () => {
      cancelled = true
    }
  }, [isDemo])

  useEffect(() => {
    if (isDemo) return
    let cancelled = false

    fetch('/api/spotify/stats')
      .then(async (res) => {
        if (res.status === 401) {
          router.push('/auth')
          return
        }
        if (!res.ok) throw new Error(`Stats request failed: ${res.status}`)
        const payload: StatsPayload = await res.json()
        if (!cancelled) {
          setData(payload)
          setStatus('ready')
        }
      })
      .catch((error) => {
        console.error(error)
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [isDemo, router, attempt])

  const value = useMemo<StatsContextValue>(
    () => ({
      data,
      status,
      retry,
      timeRange,
      setTimeRange,
      artists: data?.artists[timeRange] ?? [],
      tracks: data?.tracks[timeRange] ?? [],
      isDemo,
    }),
    [data, status, retry, timeRange, isDemo]
  )

  return <StatsContext.Provider value={value}>{children}</StatsContext.Provider>
}

export function useStats() {
  const context = useContext(StatsContext)
  if (!context) throw new Error('useStats must be used inside <StatsProvider>')
  return context
}
