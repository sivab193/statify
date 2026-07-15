'use client'

import { useEffect, useState } from 'react'
import { Eye, Zap, UploadCloud } from 'lucide-react'
import { useCountUp } from '@/lib/streaming-history/use-count-up'
import type { LucideIcon } from 'lucide-react'

interface Counts {
  visits: number | null
  connected: number | null
  uploads: number | null
}

/** Fire a one-per-session visit beacon. */
export function trackVisit() {
  if (typeof window === 'undefined') return
  if (sessionStorage.getItem('statify-visited')) return
  sessionStorage.setItem('statify-visited', '1')
  fetch('/api/stats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event: 'visit' }),
    keepalive: true,
  }).catch(() => {})
}

function StatChip({ icon: Icon, value, label }: { icon: LucideIcon; value: number; label: string }) {
  const n = useCountUp(value)
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-left">
        <p className="text-lg font-bold leading-none tabular-nums">
          {Math.round(n).toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

export function UsageStats() {
  const [counts, setCounts] = useState<Counts | null>(null)

  useEffect(() => {
    trackVisit()
    fetch('/api/stats')
      .then((r) => r.json())
      .then((data: Counts) => setCounts(data))
      .catch(() => {})
  }, [])

  // Only render once a store is attached and returns real numbers.
  if (!counts || counts.visits === null) return null

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 rounded-2xl border border-border bg-card/50 px-8 py-5 backdrop-blur">
      <StatChip icon={Eye} value={counts.visits ?? 0} label="visits" />
      <span className="hidden h-8 w-px bg-border sm:block" />
      <StatChip icon={Zap} value={counts.connected ?? 0} label="Spotify connections" />
      <span className="hidden h-8 w-px bg-border sm:block" />
      <StatChip icon={UploadCloud} value={counts.uploads ?? 0} label="data uploads" />
    </div>
  )
}
