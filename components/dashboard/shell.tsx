'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Music2, LogOut, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useStats } from '@/components/providers/stats-provider'
import { TIME_RANGES, type TimeRange } from '@/lib/types'
import type { ReactNode } from 'react'

export function DashboardShell({ children }: { children: ReactNode }) {
  const { data, timeRange, setTimeRange, isDemo } = useStats()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Music2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Statify</h1>
              {isDemo ? (
                <p className="text-xs text-primary flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Demo mode — sample data
                </p>
              ) : (
                data && <p className="text-xs text-muted-foreground">{data.user.displayName}</p>
              )}
            </div>
          </Link>

          <div className="flex items-center gap-3">
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

            {isDemo ? (
              <Button asChild size="sm" className="gap-2">
                <Link href="/auth">Connect Spotify</Link>
              </Button>
            ) : (
              <>
                {data?.user.imageUrl && (
                  <Avatar className="w-8 h-8 hidden sm:block">
                    <AvatarImage src={data.user.imageUrl} alt={data.user.displayName} />
                    <AvatarFallback>{data.user.displayName.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                )}
                <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">{children}</main>
    </div>
  )
}
