'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react'
import { LogoMark } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FilterBar } from '@/components/upload/filter-bar'
import { useStats } from '@/components/providers/stats-provider'
import { UsageStats } from '@/components/usage-stats'
import { SiteFooter } from '@/components/site-footer'
import { TIME_RANGES, type TimeRange } from '@/lib/types'
import type { ReactNode } from 'react'

/**
 * One header for every source. The scope control swaps — a range select for
 * the API paths, the year/device filters for an export — but everything else
 * (brand, identity line, actions) stays put.
 */
export function StatsShell({ children }: { children: ReactNode }) {
  const { source, user, timeRange, setTimeRange, meta, filters, setFilters, recomputing, onReset } =
    useStats()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between gap-3 px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <LogoMark className="h-10 w-10 rounded-[24%] shadow-sm shadow-primary/20" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Statify</h1>
              {source === 'demo' && (
                <p className="flex items-center gap-1 text-xs text-primary">
                  <Sparkles className="h-3 w-3" /> Demo mode — sample data
                </p>
              )}
              {source === 'spotify' && user && (
                <p className="text-xs text-muted-foreground">{user.displayName}</p>
              )}
              {source === 'upload' && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3 w-3 text-primary" /> Your export — read in this browser
                </p>
              )}
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {timeRange && (
              <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
                <SelectTrigger className="w-[150px] sm:w-[180px]">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_RANGES.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {source === 'demo' && (
              <Button asChild size="sm" className="gap-2">
                <Link href="/auth">Connect Spotify</Link>
              </Button>
            )}

            {source === 'spotify' && (
              <>
                {user?.imageUrl && (
                  <Avatar className="hidden h-8 w-8 sm:block">
                    <AvatarImage src={user.imageUrl} alt={user.displayName} />
                    <AvatarFallback>{user.displayName.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                )}
                <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            )}

            {source === 'upload' && onReset && (
              <Button variant="ghost" size="sm" onClick={onReset} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                <span className="hidden sm:inline">New upload</span>
              </Button>
            )}
          </div>
        </div>

        {meta && filters && (
          <FilterBar meta={meta} filters={filters} onChange={setFilters} pending={recomputing} />
        )}
      </header>

      <main>{children}</main>

      {/* Usage stats - shown on all stats pages */}
      <div className="py-8 flex justify-center">
        <UsageStats />
      </div>

      <SiteFooter />
    </div>
  )
}
