'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Clock3,
  Disc3,
  Headphones,
  Mic2,
  Music2,
  RotateCcw,
  SkipForward,
  Shuffle,
  CalendarDays,
  Trophy,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { chart, tooltipStyle } from '@/components/charts/chart-theme'
import type { LocalStats } from '@/lib/streaming-history/types'
import {
  WEEKDAY_LABELS,
  formatDay,
  formatHours,
  formatMinutes,
  formatNumber,
  formatPercent,
  hourLabel,
} from '@/lib/streaming-history/format'
import type { LucideIcon } from 'lucide-react'

// --- Small building blocks --------------------------------------------------

function Tile({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon
  label: string
  value: string
  hint: string
}) {
  return (
    <Card className="gap-2 p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-semibold leading-tight">{value}</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </Card>
  )
}

function SectionCard({
  title,
  icon: Icon,
  subtitle,
  children,
  className,
}: {
  title: string
  icon: LucideIcon
  subtitle?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={`gap-4 p-6 ${className ?? ''}`}>
      <div className="space-y-1">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Icon className="h-4 w-4 text-primary" /> {title}
        </h2>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </Card>
  )
}

function RankedList({
  items,
}: {
  items: { key: string; primary: string; secondary?: string; value: string }[]
}) {
  return (
    <ol className="space-y-1">
      {items.map((item, i) => (
        <li
          key={item.key}
          className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/40"
        >
          <span className="w-5 shrink-0 text-right text-sm font-semibold text-muted-foreground tabular-nums">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{item.primary}</p>
            {item.secondary && (
              <p className="truncate text-xs text-muted-foreground">{item.secondary}</p>
            )}
          </div>
          <span className="shrink-0 text-sm font-semibold text-primary tabular-nums">
            {item.value}
          </span>
        </li>
      ))}
    </ol>
  )
}

// --- Listening clock (radial) -----------------------------------------------

const SIZE = 252
const CENTER = SIZE / 2
const INNER = 36
const OUTER = 96

function wedgePath(hour: number, value: number, max: number) {
  const startAngle = (hour / 24) * Math.PI * 2 - Math.PI / 2
  const endAngle = ((hour + 0.82) / 24) * Math.PI * 2 - Math.PI / 2
  const r = INNER + (max > 0 ? (value / max) * (OUTER - INNER) : 0)
  const point = (angle: number, radius: number) =>
    `${CENTER + Math.cos(angle) * radius},${CENTER + Math.sin(angle) * radius}`
  return [
    `M ${point(startAngle, INNER)}`,
    `L ${point(startAngle, r)}`,
    `A ${r} ${r} 0 0 1 ${point(endAngle, r)}`,
    `L ${point(endAngle, INNER)}`,
    `A ${INNER} ${INNER} 0 0 0 ${point(startAngle, INNER)}`,
    'Z',
  ].join(' ')
}

function ListeningClock({ stats }: { stats: LocalStats }) {
  const max = Math.max(...stats.clock.map((b) => b.minutes), 1)
  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="h-52 w-52 shrink-0"
        role="img"
        aria-label={`Minutes listened per hour; peak at ${hourLabel(stats.peakHour)}`}
      >
        <circle cx={CENTER} cy={CENTER} r={INNER - 4} fill="none" stroke="var(--color-border)" />
        {stats.clock.map(({ hour, minutes }) => (
          <path
            key={hour}
            d={wedgePath(hour, minutes, max)}
            fill="var(--color-primary)"
            opacity={
              hour === stats.peakHour ? 1 : minutes > 0 ? 0.25 + (minutes / max) * 0.45 : 0.08
            }
          >
            <title>{`${hourLabel(hour)} — ${formatMinutes(minutes)}`}</title>
          </path>
        ))}
        {[0, 6, 12, 18].map((h) => {
          const angle = (h / 24) * Math.PI * 2 - Math.PI / 2
          const x = CENTER + Math.cos(angle) * (OUTER + 12)
          const y = CENTER + Math.sin(angle) * (OUTER + 12)
          return (
            <text
              key={h}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="9"
              fill="var(--color-muted-foreground)"
            >
              {h === 0 ? '12AM' : h === 12 ? '12PM' : h < 12 ? `${h}AM` : `${h - 12}PM`}
            </text>
          )
        })}
      </svg>
      <div className="space-y-2 text-center sm:text-left">
        <p className="text-3xl font-semibold">{hourLabel(stats.peakHour)}</p>
        <p className="text-sm text-muted-foreground">is when your music peaks</p>
        <p className="text-sm">
          Verdict: <span className="font-medium text-primary">{stats.peakHourPersona}</span>
        </p>
      </div>
    </div>
  )
}

// --- Main view --------------------------------------------------------------

export function LocalStatsView({ stats, onReset }: { stats: LocalStats; onReset: () => void }) {
  const maxWeekday = Math.max(...stats.weekday.map((d) => d.minutes), 1)
  const weekdayData = stats.weekday.map((d) => ({
    label: WEEKDAY_LABELS[d.day],
    minutes: d.minutes,
  }))
  const maxPlatform = Math.max(...stats.platforms.map((p) => p.minutes), 1)

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your listening, all time</h1>
          <p className="text-sm text-muted-foreground">
            {stats.firstPlay && stats.lastPlay
              ? `${formatDay(stats.firstPlay)} → ${formatDay(stats.lastPlay)} · ${formatNumber(
                  stats.spanDays,
                )} days`
              : 'From your Spotify Extended Streaming History'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onReset}>
          <RotateCcw className="h-4 w-4" /> Upload another
        </Button>
      </div>

      {/* Hero tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile
          icon={Headphones}
          label="Time listened"
          value={`${formatHours(stats.totalMs)} hrs`}
          hint={`${formatNumber(stats.totalPlays)} plays`}
        />
        <Tile
          icon={Mic2}
          label="Artists"
          value={formatNumber(stats.distinctArtists)}
          hint="distinct artists played"
        />
        <Tile
          icon={Music2}
          label="Tracks"
          value={formatNumber(stats.distinctTracks)}
          hint="distinct tracks played"
        />
        <Tile
          icon={Clock3}
          label="Peak hour"
          value={hourLabel(stats.peakHour)}
          hint={stats.peakHourPersona}
        />
      </div>

      {/* Behaviour tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile
          icon={SkipForward}
          label="Skip rate"
          value={formatPercent(stats.skipRate)}
          hint="plays under 30s or skipped"
        />
        <Tile
          icon={Shuffle}
          label="Shuffle"
          value={formatPercent(stats.shuffleRate)}
          hint="plays started on shuffle"
        />
        <Tile
          icon={Trophy}
          label="Record day"
          value={stats.recordDay ? formatMinutes(stats.recordDay.minutes) : '—'}
          hint={stats.recordDay ? formatDay(stats.recordDay.date) : 'Not enough data'}
        />
        <Tile
          icon={CalendarDays}
          label="Offline"
          value={formatPercent(stats.offlineRate)}
          hint="plays while offline"
        />
      </div>

      {/* Clock + yearly */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Listening Clock"
          icon={Clock3}
          subtitle="Minutes across a 24-hour dial, in your timezone"
        >
          <ListeningClock stats={stats} />
        </SectionCard>

        <SectionCard title="Minutes by year" icon={CalendarDays} subtitle="Your all-time trend">
          <ResponsiveContainer width="100%" height={252}>
            <BarChart data={stats.byYear} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <XAxis
                dataKey="year"
                stroke={chart.axis}
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke={chart.axis}
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={40}
                tickFormatter={(v) => `${Math.round(v / 60)}h`}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                cursor={{ fill: chart.accentDim }}
                formatter={(v: number) => [formatMinutes(v), 'Listened']}
              />
              <Bar dataKey="minutes" fill={chart.accent} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Monthly trend */}
      {stats.byMonth.length > 1 && (
        <SectionCard
          title="Monthly rhythm"
          icon={Music2}
          subtitle="Minutes listened each month across your whole history"
        >
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats.byMonth} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="monthFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chart.accent} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={chart.accent} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                stroke={chart.axis}
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                minTickGap={40}
                tickFormatter={(v: string) => v.slice(0, 4)}
              />
              <YAxis
                stroke={chart.axis}
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={40}
                tickFormatter={(v) => `${Math.round(v / 60)}h`}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [formatMinutes(v), 'Listened']}
              />
              <Area
                type="monotone"
                dataKey="minutes"
                stroke={chart.accent}
                strokeWidth={2}
                fill="url(#monthFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>
      )}

      {/* Top lists */}
      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Top artists" icon={Mic2} subtitle="By time listened">
          <RankedList
            items={stats.topArtists.slice(0, 10).map((a) => ({
              key: a.name,
              primary: a.name,
              secondary: `${formatNumber(a.plays)} plays · ${a.distinctTracks} tracks`,
              value: formatMinutes(a.ms / 60000),
            }))}
          />
        </SectionCard>

        <SectionCard title="Top tracks" icon={Music2} subtitle="By time listened">
          <RankedList
            items={stats.topTracks.slice(0, 10).map((t) => ({
              key: t.uri,
              primary: t.name,
              secondary: t.artist,
              value: formatMinutes(t.ms / 60000),
            }))}
          />
        </SectionCard>

        <SectionCard title="Top albums" icon={Disc3} subtitle="By time listened">
          <RankedList
            items={stats.topAlbums.slice(0, 10).map((a) => ({
              key: `${a.name} ${a.artist}`,
              primary: a.name,
              secondary: a.artist,
              value: formatMinutes(a.ms / 60000),
            }))}
          />
        </SectionCard>
      </div>

      {/* Weekday + platforms */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Days of the week" icon={CalendarDays} subtitle="When you press play">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weekdayData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <XAxis
                dataKey="label"
                stroke={chart.axis}
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                cursor={{ fill: chart.accentDim }}
                formatter={(v: number) => [formatMinutes(v), 'Listened']}
              />
              <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                {weekdayData.map((d) => (
                  <Cell
                    key={d.label}
                    fill={chart.accent}
                    fillOpacity={0.35 + (d.minutes / maxWeekday) * 0.65}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Where you listen" icon={Headphones} subtitle="By device / platform">
          <div className="space-y-3 pt-1">
            {stats.platforms.map((p) => (
              <div key={p.label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{p.label}</span>
                  <span className="text-muted-foreground">{formatMinutes(p.minutes)}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(p.minutes / maxPlatform) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <p className="pt-4 text-center text-xs text-muted-foreground">
        Computed locally from your export · nothing left your browser.
      </p>
    </div>
  )
}
