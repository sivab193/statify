'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { UploadDropzone } from '@/components/upload/upload-dropzone'
import { LocalStatsView } from '@/components/upload/local-stats-view'
import { FilterBar } from '@/components/upload/filter-bar'
import { aggregate } from '@/lib/streaming-history/aggregate'
import { ALL_FILTERS, type ParseMeta, type Play, type PlayFilters } from '@/lib/streaming-history/types'
import { ArrowLeft, Music2, Clock, Sparkles } from 'lucide-react'

function scopeLabelFor(filters: PlayFilters, meta: ParseMeta): string {
  if (filters.years && filters.years.length) {
    const sorted = [...filters.years].sort((a, b) => a - b)
    return sorted.length === 1 ? `${sorted[0]}` : `${sorted[0]}–${sorted[sorted.length - 1]}`
  }
  return 'All time'
}

export default function UploadPage() {
  const [data, setData] = useState<{ plays: Play[]; meta: ParseMeta } | null>(null)
  const [filters, setFilters] = useState<PlayFilters>(ALL_FILTERS)
  const [pending, startTransition] = useTransition()

  const stats = useMemo(
    () => (data ? aggregate(data.plays, filters) : null),
    [data, filters],
  )

  const onFilterChange = (next: PlayFilters) => {
    startTransition(() => setFilters(next))
  }

  if (data && stats) {
    return (
      <main className="min-h-screen bg-background">
        <FilterBar meta={data.meta} filters={filters} onChange={onFilterChange} pending={pending} />
        <div className={pending ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
          <LocalStatsView
            stats={stats}
            scopeLabel={scopeLabelFor(filters, data.meta)}
            onReset={() => {
              setData(null)
              setFilters(ALL_FILTERS)
            }}
          />
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-xl space-y-10">
        <div className="space-y-4 text-center">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Music2 className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-balance text-4xl font-bold tracking-tight">
            Your stats, <span className="text-primary">no login</span>
          </h1>
          <p className="mx-auto max-w-md text-pretty leading-relaxed text-muted-foreground">
            Upload the Spotify data export you requested — Statify reads your full listening history
            right here in the browser, then lets you filter by year and device and share any stat as
            an image.
          </p>
        </div>

        <UploadDropzone onReady={(plays, meta) => setData({ plays, meta })} />

        {/* How to get your data */}
        <div className="mx-auto max-w-lg space-y-4 rounded-xl border border-border bg-card/50 p-5">
          <h2 className="flex items-center gap-2 font-semibold">
            <Sparkles className="h-4 w-4 text-primary" /> How to get your Spotify data
          </h2>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">1</span>
              <span>
                Open{' '}
                <a
                  href="https://www.spotify.com/account/privacy/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-primary underline underline-offset-2"
                >
                  spotify.com/account/privacy
                </a>{' '}
                and scroll to <span className="font-medium text-foreground">Download your data</span>.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">2</span>
              <span>
                Tick <span className="font-medium text-foreground">Extended streaming history</span>{' '}
                (not the basic “Account data” box — that one lacks the full history), then click{' '}
                <span className="font-medium text-foreground">Request data</span> and confirm via the
                email Spotify sends.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">3</span>
              <span>
                Wait for the “Your data is ready” email, then download the ZIP (named{' '}
                <span className="font-mono text-xs">my_spotify_data.zip</span>).
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">4</span>
              <span>
                Drop the ZIP above — <span className="font-medium text-foreground">no need to unzip</span>{' '}
                it first.
              </span>
            </li>
          </ol>
          <div className="flex items-start gap-2 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2.5 text-xs text-muted-foreground">
            <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <span>
              <span className="font-medium text-foreground">Timing:</span> Spotify’s page says it can
              take up to 30 days, but in practice it’s often much faster — sometimes just a few hours.
              You’ll get an email the moment it’s ready.
            </span>
          </div>
        </div>

        <div className="text-center">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" /> Back home
            </Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
