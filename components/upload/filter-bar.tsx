'use client'

import { useState } from 'react'
import { SlidersHorizontal, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ParseMeta, PlayFilters } from '@/lib/streaming-history/types'

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-3.5 py-1.5 text-sm font-medium transition-all',
        active
          ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25'
          : 'bg-card/70 text-muted-foreground hover:text-foreground border border-border',
      )}
    >
      {children}
    </button>
  )
}

export function FilterBar({
  meta,
  filters,
  onChange,
  pending,
}: {
  meta: ParseMeta
  filters: PlayFilters
  onChange: (next: PlayFilters) => void
  pending?: boolean
}) {
  const [showPlatforms, setShowPlatforms] = useState(false)

  const toggleYear = (year: number) => {
    const cur = filters.years ?? []
    const next = cur.includes(year) ? cur.filter((y) => y !== year) : [...cur, year]
    onChange({ ...filters, years: next.length === 0 || next.length === meta.years.length ? null : next })
  }

  const togglePlatform = (p: string) => {
    const cur = filters.platforms ?? []
    const next = cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]
    onChange({
      ...filters,
      platforms: next.length === 0 || next.length === meta.platforms.length ? null : next,
    })
  }

  const yearActive = (y: number) => filters.years === null || filters.years.includes(y)
  const platformLabel =
    filters.platforms === null ? 'All devices' : `${filters.platforms.length} device(s)`
  const dirty = filters.years !== null || filters.platforms !== null || filters.excludeSkips

  return (
    <div className="border-t border-border/60 bg-background/60 px-4 py-3">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2">
        <span className="mr-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <SlidersHorizontal className={cn('h-3.5 w-3.5 text-primary', pending && 'animate-pulse')} />
          Filters
        </span>

        <Pill active={filters.years === null} onClick={() => onChange({ ...filters, years: null })}>
          All time
        </Pill>
        {meta.years.map((year) => (
          <Pill key={year} active={filters.years !== null && yearActive(year)} onClick={() => toggleYear(year)}>
            {year}
          </Pill>
        ))}

        <span className="mx-1 h-5 w-px bg-border" />

        <div className="relative">
          <Pill active={filters.platforms !== null} onClick={() => setShowPlatforms((s) => !s)}>
            {platformLabel}
          </Pill>
          {showPlatforms && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-10 cursor-default"
                aria-hidden
                onClick={() => setShowPlatforms(false)}
              />
              <div className="absolute left-0 top-full z-20 mt-2 w-52 space-y-1 rounded-xl border border-border bg-popover p-2 shadow-xl">
                {meta.platforms.map((p) => {
                  const on = filters.platforms === null || filters.platforms.includes(p)
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePlatform(p)}
                      className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-sm hover:bg-muted"
                    >
                      <span>{p}</span>
                      {on && <Check className="h-3.5 w-3.5 text-primary" />}
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>

        <Pill
          active={filters.excludeSkips}
          onClick={() => onChange({ ...filters, excludeSkips: !filters.excludeSkips })}
        >
          Exclude skips
        </Pill>

        {dirty && (
          <button
            type="button"
            onClick={() => onChange({ years: null, platforms: null, excludeSkips: false })}
            className="ml-1 inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" /> Reset
          </button>
        )}
      </div>
    </div>
  )
}
