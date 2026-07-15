'use client'

import { useMemo } from 'react'
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
  Repeat,
  Flame,
  Sparkles,
  Sunrise,
  TrendingUp,
  Globe2,
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
import { LazyHeroScene } from '@/components/three/lazy'
import { ShareButton } from '@/components/upload/share-button'
import { useCountUp } from '@/lib/streaming-history/use-count-up'
import type { LocalStats } from '@/lib/streaming-history/types'
import type { ShareSpec } from '@/lib/streaming-history/share'
import {
  MONTH_LABELS,
  WEEKDAY_LABELS,
  formatDay,
  formatHours,
  formatMinutes,
  formatNumber,
  formatPercent,
  hourLabel,
  minutesToHours,
} from '@/lib/streaming-history/format'
import type { LucideIcon } from 'lucide-react'

const SHARE_TEXT = 'My Spotify, decoded 🎧 → made with Statify'

// --- Animation wrapper ------------------------------------------------------

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <div
      className={`animate-fade-slide-up opacity-0 ${className ?? ''}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  )
}

// --- Tiles ------------------------------------------------------------------

function CountTile({
  icon: Icon,
  label,
  target,
  suffix = '',
  decimals = 0,
  hint,
  share,
}: {
  icon: LucideIcon
  label: string
  target: number
  suffix?: string
  decimals?: number
  hint: string
  share?: () => ShareSpec
}) {
  const v = useCountUp(target)
  return (
    <Card className="group/card relative gap-2 overflow-hidden p-5">
      <div className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition-opacity group-hover/card:opacity-100" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
        </div>
        {share && (
          <ShareButton spec={share} text={SHARE_TEXT} filename={`statify-${label}.png`} />
        )}
      </div>
      <p className="text-3xl font-semibold leading-tight tabular-nums">
        {v.toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}
        <span className="text-xl text-muted-foreground">{suffix}</span>
      </p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </Card>
  )
}

function StatTile({
  icon: Icon,
  label,
  value,
  hint,
  share,
}: {
  icon: LucideIcon
  label: string
  value: string
  hint: string
  share?: () => ShareSpec
}) {
  return (
    <Card className="group/card gap-2 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
        </div>
        {share && <ShareButton spec={share} text={SHARE_TEXT} filename={`statify-${label}.png`} />}
      </div>
      <p className="text-2xl font-semibold leading-tight">{value}</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </Card>
  )
}

// --- Highlight card (big colourful insight) ---------------------------------

function Highlight({
  icon: Icon,
  eyebrow,
  title,
  subtitle,
  delay,
  share,
}: {
  icon: LucideIcon
  eyebrow: string
  title: string
  subtitle: string
  delay: number
  share?: () => ShareSpec
}) {
  return (
    <Reveal delay={delay}>
      <Card className="group/card relative h-full gap-3 overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-6">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/15 blur-3xl" />
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          {share && <ShareButton spec={share} text={SHARE_TEXT} filename="statify-insight.png" />}
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>
        <p className="text-2xl font-bold leading-tight text-balance">{title}</p>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </Card>
    </Reveal>
  )
}

// --- Section wrapper --------------------------------------------------------

function SectionCard({
  title,
  icon: Icon,
  subtitle,
  children,
  share,
  className,
}: {
  title: string
  icon: LucideIcon
  subtitle?: string
  children: React.ReactNode
  share?: () => ShareSpec
  className?: string
}) {
  return (
    <Card className={`group/card gap-4 p-6 ${className ?? ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Icon className="h-4 w-4 text-primary" /> {title}
          </h2>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {share && <ShareButton spec={share} text={SHARE_TEXT} filename={`statify-${title}.png`} />}
      </div>
      {children}
    </Card>
  )
}

function RankedList({
  items,
}: {
  items: {
    key: string
    primary: string
    secondary?: string
    value: string
    share?: () => ShareSpec
  }[]
}) {
  return (
    <ol className="space-y-1">
      {items.map((item, i) => (
        <li
          key={item.key}
          className="group/card flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/50"
        >
          <span className="w-5 shrink-0 text-right text-sm font-semibold tabular-nums text-muted-foreground">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{item.primary}</p>
            {item.secondary && (
              <p className="truncate text-xs text-muted-foreground">{item.secondary}</p>
            )}
          </div>
          {item.share && (
            <ShareButton spec={item.share} text={SHARE_TEXT} filename="statify-track.png" />
          )}
          <span className="shrink-0 text-sm font-semibold tabular-nums text-primary">
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
            opacity={hour === stats.peakHour ? 1 : minutes > 0 ? 0.25 + (minutes / max) * 0.45 : 0.08}
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

export function LocalStatsView({
  stats,
  scopeLabel,
  onReset,
}: {
  stats: LocalStats
  scopeLabel: string
  onReset: () => void
}) {
  const totalHours = useCountUp(stats.totalMs / 3_600_000)

  const weekdayData = stats.weekday.map((d) => ({ label: WEEKDAY_LABELS[d.day], minutes: d.minutes }))
  const maxWeekday = Math.max(...weekdayData.map((d) => d.minutes), 1)
  const seasonalData = stats.seasonal.map((s) => ({ label: MONTH_LABELS[s.month], minutes: s.minutes }))
  const maxSeason = Math.max(...seasonalData.map((d) => d.minutes), 1)
  const maxPlatform = Math.max(...stats.platforms.map((p) => p.minutes), 1)
  const maxCountry = Math.max(...stats.countries.map((c) => c.minutes), 1)
  const weekendPct = stats.weekdayMinutes + stats.weekendMinutes
    ? stats.weekendMinutes / (stats.weekdayMinutes + stats.weekendMinutes)
    : 0

  // --- Share spec builders (lazy: read current stats on click) --------------

  const storySpec = useMemo<() => ShareSpec>(
    () => () => ({
      variant: 'story',
      eyebrow: `My Spotify · ${scopeLabel}`,
      title: 'The Recap',
      bigValue: `${formatHours(stats.totalMs)} hrs`,
      bigCaption: `${formatNumber(stats.totalPlays)} plays · ${formatNumber(stats.distinctArtists)} artists`,
      rows: stats.topArtists.slice(0, 5).map((a, i) => ({
        rank: i + 1,
        primary: a.name,
        value: minutesToHours(a.ms / 60000) + 'h',
      })),
      stats: [
        { label: 'Top track', value: stats.topTracks[0]?.name ?? '—' },
        { label: 'Peak hour', value: hourLabel(stats.peakHour) },
        { label: 'Skip rate', value: formatPercent(stats.skipRate) },
        { label: 'Day streak', value: `${stats.streak?.days ?? 0} days` },
      ],
    }),
    [stats, scopeLabel],
  )

  const artistsSpec = useMemo<() => ShareSpec>(
    () => () => ({
      variant: 'tile',
      eyebrow: `Top artists · ${scopeLabel}`,
      title: 'On heavy rotation',
      rows: stats.topArtists.slice(0, 5).map((a, i) => ({
        rank: i + 1,
        primary: a.name,
        secondary: `${formatNumber(a.plays)} plays`,
        value: minutesToHours(a.ms / 60000) + 'h',
      })),
    }),
    [stats, scopeLabel],
  )

  const tracksSpec = useMemo<() => ShareSpec>(
    () => () => ({
      variant: 'tile',
      eyebrow: `Top tracks · ${scopeLabel}`,
      title: 'Songs on repeat',
      rows: stats.topTracks.slice(0, 5).map((t, i) => ({
        rank: i + 1,
        primary: t.name,
        secondary: t.artist,
        value: minutesToHours(t.ms / 60000) + 'h',
      })),
    }),
    [stats, scopeLabel],
  )

  return (
    <div className="space-y-8 pb-16">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-70">
          <LazyHeroScene className="h-full w-full" />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 pb-10 pt-16 text-center">
          <Reveal className="w-full">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Your listening · {scopeLabel}
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="text-6xl font-black tracking-tight tabular-nums sm:text-8xl">
              {totalHours.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              <span className="text-primary"> hrs</span>
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-md text-pretty text-muted-foreground">
              {stats.firstPlay && stats.lastPlay
                ? `${formatDay(stats.firstPlay)} → ${formatDay(stats.lastPlay)} · ${formatNumber(
                    stats.totalPlays,
                  )} plays across ${formatNumber(stats.daysListened)} days`
                : `${formatNumber(stats.totalPlays)} plays`}
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <ShareButton
                spec={storySpec}
                variant="full"
                label="Share my recap"
                filename="statify-recap.png"
                text={SHARE_TEXT}
              />
              <Button variant="outline" size="lg" className="rounded-full" onClick={onReset}>
                <RotateCcw className="h-4 w-4" /> Upload another
              </Button>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-8 px-4">
        {/* Count-up tiles */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Reveal delay={0.05}>
            <CountTile
              icon={Headphones}
              label="Hours"
              target={stats.totalMs / 3_600_000}
              decimals={0}
              hint={`${formatNumber(stats.totalPlays)} plays`}
            />
          </Reveal>
          <Reveal delay={0.1}>
            <CountTile
              icon={Mic2}
              label="Artists"
              target={stats.distinctArtists}
              hint="distinct artists"
              share={artistsSpec}
            />
          </Reveal>
          <Reveal delay={0.15}>
            <CountTile
              icon={Music2}
              label="Tracks"
              target={stats.distinctTracks}
              hint="distinct tracks"
              share={tracksSpec}
            />
          </Reveal>
          <Reveal delay={0.2}>
            <CountTile
              icon={CalendarDays}
              label="Avg / day"
              target={stats.avgMinutesPerDay}
              suffix="m"
              hint={`over ${formatNumber(stats.daysListened)} active days`}
            />
          </Reveal>
        </div>

        {/* Highlight insights */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stats.onRepeat && (
            <Highlight
              icon={Repeat}
              eyebrow="On repeat"
              title={`${stats.onRepeat.track}`}
              subtitle={`${stats.onRepeat.plays}× in one day (${formatDay(stats.onRepeat.date)}) — ${stats.onRepeat.artist}`}
              delay={0.05}
              share={() => ({
                variant: 'tile',
                eyebrow: 'Most obsessed',
                title: stats.onRepeat!.track,
                bigValue: `${stats.onRepeat!.plays}×`,
                bigCaption: `in a single day · ${stats.onRepeat!.artist}`,
              })}
            />
          )}
          {stats.streak && (
            <Highlight
              icon={Flame}
              eyebrow="Longest streak"
              title={`${stats.streak.days} days straight`}
              subtitle={`${formatDay(stats.streak.start)} → ${formatDay(stats.streak.end)} without missing a day`}
              delay={0.1}
              share={() => ({
                variant: 'tile',
                eyebrow: 'Dedication',
                title: 'Longest listening streak',
                bigValue: `${stats.streak!.days} days`,
                bigCaption: 'without skipping a single day',
              })}
            />
          )}
          {stats.recordDay && (
            <Highlight
              icon={Trophy}
              eyebrow="Record day"
              title={formatMinutes(stats.recordDay.minutes)}
              subtitle={`Your all-in day — ${formatDay(stats.recordDay.date)}`}
              delay={0.15}
              share={() => ({
                variant: 'tile',
                eyebrow: 'Record day',
                title: formatDay(stats.recordDay!.date),
                bigValue: formatMinutes(stats.recordDay!.minutes),
                bigCaption: 'in a single day',
              })}
            />
          )}
        </div>

        {/* Behaviour tiles */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatTile
            icon={SkipForward}
            label="Skip rate"
            value={formatPercent(stats.skipRate)}
            hint="under 30s or skipped"
            share={() => ({
              variant: 'tile',
              eyebrow: 'Attention span',
              title: 'Skip rate',
              bigValue: formatPercent(stats.skipRate),
              bigCaption: 'of plays cut short',
            })}
          />
          <StatTile
            icon={Shuffle}
            label="Shuffle"
            value={formatPercent(stats.shuffleRate)}
            hint="plays on shuffle"
          />
          <StatTile
            icon={Clock3}
            label="Peak hour"
            value={hourLabel(stats.peakHour)}
            hint={stats.peakHourPersona}
          />
          <StatTile
            icon={Sunrise}
            label="Weekend"
            value={formatPercent(weekendPct)}
            hint="of your listening"
          />
        </div>

        {/* Clock + yearly */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal>
            <SectionCard
              title="Listening Clock"
              icon={Clock3}
              subtitle="Minutes across a 24-hour dial, your timezone"
              className="h-full"
              share={() => ({
                variant: 'tile',
                eyebrow: 'Body clock',
                title: 'When I press play',
                bigValue: hourLabel(stats.peakHour),
                bigCaption: `is my peak · ${stats.peakHourPersona}`,
              })}
            >
              <ListeningClock stats={stats} />
            </SectionCard>
          </Reveal>

          <Reveal delay={0.05}>
            <SectionCard title="Minutes by year" icon={CalendarDays} subtitle="Your all-time trend" className="h-full">
              <ResponsiveContainer width="100%" height={252}>
                <BarChart data={stats.byYear} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <XAxis dataKey="year" stroke={chart.axis} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis stroke={chart.axis} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => `${Math.round(v / 60)}h`} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: chart.accentDim }} formatter={(v: number) => [formatMinutes(v), 'Listened']} />
                  <Bar dataKey="minutes" fill={chart.accent} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </SectionCard>
          </Reveal>
        </div>

        {/* Top artist per year timeline */}
        {stats.topArtistPerYear.length > 1 && (
          <Reveal>
            <SectionCard
              title="Your #1 each year"
              icon={TrendingUp}
              subtitle="The artist that owned every year"
              share={() => ({
                variant: 'tile',
                eyebrow: 'Year by year',
                title: 'My #1 artist each year',
                rows: stats.topArtistPerYear.map((a) => ({
                  primary: a.artist,
                  secondary: `${a.year}`,
                  value: minutesToHours(a.minutes) + 'h',
                })),
              })}
            >
              <div className="flex gap-3 overflow-x-auto pb-2">
                {stats.topArtistPerYear.map((a) => (
                  <div
                    key={a.year}
                    className="flex min-w-[140px] flex-col gap-1 rounded-xl border border-border bg-gradient-to-b from-primary/5 to-card p-4"
                  >
                    <span className="text-xs font-semibold text-primary">{a.year}</span>
                    <span className="truncate text-sm font-semibold" title={a.artist}>
                      {a.artist}
                    </span>
                    <span className="text-xs text-muted-foreground">{minutesToHours(a.minutes)}h</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </Reveal>
        )}

        {/* Monthly rhythm */}
        {stats.byMonth.length > 1 && (
          <Reveal>
            <SectionCard title="Monthly rhythm" icon={Music2} subtitle="Minutes each month across your history">
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={stats.byMonth} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="monthFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chart.accent} stopOpacity={0.5} />
                      <stop offset="100%" stopColor={chart.accent} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke={chart.axis} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} minTickGap={40} tickFormatter={(v: string) => v.slice(0, 4)} />
                  <YAxis stroke={chart.axis} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => `${Math.round(v / 60)}h`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [formatMinutes(v), 'Listened']} />
                  <Area type="monotone" dataKey="minutes" stroke={chart.accent} strokeWidth={2} fill="url(#monthFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </SectionCard>
          </Reveal>
        )}

        {/* Top lists */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Reveal>
            <SectionCard title="Top artists" icon={Mic2} subtitle="By time listened" share={artistsSpec} className="h-full">
              <RankedList
                items={stats.topArtists.slice(0, 10).map((a) => ({
                  key: a.name,
                  primary: a.name,
                  secondary: `${formatNumber(a.plays)} plays · ${a.distinctTracks} tracks`,
                  value: formatMinutes(a.ms / 60000),
                  share: () => ({
                    variant: 'tile',
                    eyebrow: 'Top artist',
                    title: a.name,
                    bigValue: minutesToHours(a.ms / 60000) + ' hrs',
                    bigCaption: `${formatNumber(a.plays)} plays · ${a.distinctTracks} tracks`,
                  }),
                }))}
              />
            </SectionCard>
          </Reveal>

          <Reveal delay={0.05}>
            <SectionCard title="Top tracks" icon={Music2} subtitle="By time listened" share={tracksSpec} className="h-full">
              <RankedList
                items={stats.topTracks.slice(0, 10).map((t) => ({
                  key: t.uri,
                  primary: t.name,
                  secondary: t.artist,
                  value: formatMinutes(t.ms / 60000),
                  share: () => ({
                    variant: 'tile',
                    eyebrow: 'Top track',
                    title: t.name,
                    bigValue: `${formatNumber(t.plays)}`,
                    bigCaption: `plays · ${t.artist}`,
                  }),
                }))}
              />
            </SectionCard>
          </Reveal>

          <Reveal delay={0.1}>
            <SectionCard title="Top albums" icon={Disc3} subtitle="By time listened" className="h-full">
              <RankedList
                items={stats.topAlbums.slice(0, 10).map((a) => ({
                  key: `${a.name} ${a.artist}`,
                  primary: a.name,
                  secondary: a.artist,
                  value: formatMinutes(a.ms / 60000),
                }))}
              />
            </SectionCard>
          </Reveal>
        </div>

        {/* Seasonal + weekday */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal>
            <SectionCard title="Seasons of sound" icon={Sparkles} subtitle="Which months you play the most" className="h-full">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={seasonalData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <XAxis dataKey="label" stroke={chart.axis} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} interval={0} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: chart.accentDim }} formatter={(v: number) => [formatMinutes(v), 'Listened']} />
                  <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                    {seasonalData.map((d) => (
                      <Cell key={d.label} fill={chart.accent} fillOpacity={0.35 + (d.minutes / maxSeason) * 0.65} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </SectionCard>
          </Reveal>

          <Reveal delay={0.05}>
            <SectionCard title="Days of the week" icon={CalendarDays} subtitle="When you press play" className="h-full">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weekdayData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <XAxis dataKey="label" stroke={chart.axis} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: chart.accentDim }} formatter={(v: number) => [formatMinutes(v), 'Listened']} />
                  <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                    {weekdayData.map((d) => (
                      <Cell key={d.label} fill={chart.accent} fillOpacity={0.35 + (d.minutes / maxWeekday) * 0.65} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </SectionCard>
          </Reveal>
        </div>

        {/* Discovery */}
        {stats.discovery.length > 1 && (
          <Reveal>
            <SectionCard title="New artists discovered" icon={Sparkles} subtitle="First time you heard each artist, by year">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={stats.discovery} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <XAxis dataKey="year" stroke={chart.axis} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis stroke={chart.axis} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: chart.accentDim }} formatter={(v: number) => [v, 'New artists']} />
                  <Bar dataKey="newArtists" fill={chart.accent} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </SectionCard>
          </Reveal>
        )}

        {/* Where + countries */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal>
            <SectionCard title="Where you listen" icon={Headphones} subtitle="By device / platform" className="h-full">
              <div className="space-y-3 pt-1">
                {stats.platforms.map((p) => (
                  <div key={p.label} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{p.label}</span>
                      <span className="text-muted-foreground">{formatMinutes(p.minutes)}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${(p.minutes / maxPlatform) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </Reveal>

          <Reveal delay={0.05}>
            <SectionCard title="Around the world" icon={Globe2} subtitle="Where you were when you listened" className="h-full">
              <div className="space-y-3 pt-1">
                {stats.countries.map((c) => (
                  <div key={c.label} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{c.label}</span>
                      <span className="text-muted-foreground">{formatMinutes(c.minutes)}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${(c.minutes / maxCountry) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </Reveal>
        </div>

        <p className="pt-4 text-center text-xs text-muted-foreground">
          Computed locally from your export · nothing left your browser.
        </p>
      </div>
    </div>
  )
}
