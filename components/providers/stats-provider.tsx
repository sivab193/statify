'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import { aggregate } from '@/lib/streaming-history/aggregate'
import { ALL_FILTERS, type ParseMeta, type Play, type PlayFilters } from '@/lib/streaming-history/types'
import { fromLocalStats } from '@/lib/unified/from-local'
import { fromSpotifyStats } from '@/lib/unified/from-spotify'
import type { StatsSource, UnifiedStats } from '@/lib/unified/types'
import type { StatsPayload, TimeRange, UserProfile } from '@/lib/types'

interface StatsContextValue {
  stats: UnifiedStats | null
  status: 'loading' | 'ready' | 'error'
  source: StatsSource
  retry: () => void
  /** Signed-in / demo scope control — null on the upload path */
  timeRange: TimeRange | null
  setTimeRange: (range: TimeRange) => void
  user: UserProfile | null
  /** Upload scope control — null on the API paths */
  meta: ParseMeta | null
  filters: PlayFilters | null
  setFilters: (filters: PlayFilters) => void
  /** True while a filter change is re-aggregating */
  recomputing: boolean
  onReset: (() => void) | null
}

const StatsContext = createContext<StatsContextValue | null>(null)

const BASE: Pick<
  StatsContextValue,
  'timeRange' | 'setTimeRange' | 'user' | 'meta' | 'filters' | 'setFilters' | 'recomputing' | 'onReset'
> = {
  timeRange: null,
  setTimeRange: () => {},
  user: null,
  meta: null,
  filters: null,
  setFilters: () => {},
  recomputing: false,
  onReset: null,
}

/** Signed-in Spotify data, or the bundled demo profile. */
export function RemoteStatsProvider({
  children,
  mode = 'live',
}: {
  children: ReactNode
  mode?: 'live' | 'demo'
}) {
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
      ...BASE,
      stats: data ? fromSpotifyStats(data, timeRange, isDemo ? 'demo' : 'spotify') : null,
      status,
      source: isDemo ? 'demo' : 'spotify',
      retry,
      timeRange,
      setTimeRange,
      user: data?.user ?? null,
    }),
    [data, status, retry, timeRange, isDemo],
  )

  return <StatsContext.Provider value={value}>{children}</StatsContext.Provider>
}

function scopeLabelFor(filters: PlayFilters): string {
  if (filters.years?.length) {
    const sorted = [...filters.years].sort((a, b) => a - b)
    return sorted.length === 1 ? `${sorted[0]}` : `${sorted[0]}–${sorted[sorted.length - 1]}`
  }
  return 'All time'
}

/** Plays parsed from a Spotify ZIP export — everything stays in the browser. */
export function LocalStatsProvider({
  children,
  plays,
  meta,
  onReset,
}: {
  children: ReactNode
  plays: Play[]
  meta: ParseMeta
  onReset: () => void
}) {
  const [filters, setFiltersState] = useState<PlayFilters>(ALL_FILTERS)
  const [recomputing, startTransition] = useTransition()

  const setFilters = useCallback((next: PlayFilters) => {
    startTransition(() => setFiltersState(next))
  }, [])

  const stats = useMemo(
    () => fromLocalStats(aggregate(plays, filters), scopeLabelFor(filters)),
    [plays, filters],
  )

  const value = useMemo<StatsContextValue>(
    () => ({
      ...BASE,
      stats,
      status: 'ready',
      source: 'upload',
      retry: onReset,
      meta,
      filters,
      setFilters,
      recomputing,
      onReset,
    }),
    [stats, meta, filters, setFilters, recomputing, onReset],
  )

  return <StatsContext.Provider value={value}>{children}</StatsContext.Provider>
}

export function useStats() {
  const context = useContext(StatsContext)
  if (!context) throw new Error('useStats must be used inside a stats provider')
  return context
}
