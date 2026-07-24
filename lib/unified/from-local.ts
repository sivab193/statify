// Adapter: Spotify ZIP export (full streaming history) → the common view model.
// The export knows exactly how long you listened and when, but nothing about
// genres, popularity or artwork — those sections come back null.
import {
  formatDay,
  formatMinutes,
  formatNumber,
  formatPercent,
  hourLabel,
  minutesToHours,
  MONTH_LABELS,
  plural,
  WEEKDAY_LABELS,
} from '@/lib/format'
import type { LocalStats } from '@/lib/streaming-history/types'
import type {
  EvolutionColumn,
  EvolutionEntry,
  HighlightData,
  TileData,
  UnifiedArtist,
  UnifiedStats,
} from './types'

/** How many discovery eras get their own galaxy ring before the rest merge. */
const ERA_CLUSTERS = 5

function eraClusters(stats: LocalStats): Map<number, string> {
  const counts = new Map<number, number>()
  for (const artist of stats.topArtists) {
    counts.set(artist.firstYear, (counts.get(artist.firstYear) ?? 0) + 1)
  }
  const kept = [...counts.entries()]
    .sort(([, a], [, b]) => b - a)
    .slice(0, ERA_CLUSTERS)
    .map(([year]) => year)
    .sort((a, b) => a - b)
  return new Map(kept.map((year) => [year, `discovered ${year}`]))
}

function artistDiversityPersona(score: number): string {
  if (score >= 70) return 'Wide Net'
  if (score <= 35) return 'Devotee'
  return 'Explorer'
}

function repeatPersona(rate: number): string {
  if (rate >= 75) return 'Loop Fiend'
  if (rate >= 50) return 'Repeat Listener'
  if (rate >= 25) return 'Balanced'
  return 'Serial Explorer'
}

function buildTiles(stats: LocalStats): TileData[] {
  const weekendShare =
    stats.weekdayMinutes + stats.weekendMinutes
      ? stats.weekendMinutes / (stats.weekdayMinutes + stats.weekendMinutes)
      : 0

  return [
    {
      key: 'hours',
      icon: 'hours',
      label: 'Hours',
      value: Math.round(stats.totalMs / 3_600_000).toLocaleString(),
      countTo: stats.totalMs / 3_600_000,
      decimals: 0,
      suffix: '',
      hint: `${formatNumber(stats.totalPlays)} plays`,
    },
    {
      key: 'artists',
      icon: 'artists',
      label: 'Artists',
      value: formatNumber(stats.distinctArtists),
      countTo: stats.distinctArtists,
      decimals: 0,
      suffix: '',
      hint: 'distinct artists',
    },
    {
      key: 'tracks',
      icon: 'tracks',
      label: 'Tracks',
      value: formatNumber(stats.distinctTracks),
      countTo: stats.distinctTracks,
      decimals: 0,
      suffix: '',
      hint: 'distinct tracks',
    },
    {
      key: 'per-day',
      icon: 'calendar',
      label: 'Avg / day',
      value: `${stats.avgMinutesPerDay}m`,
      countTo: stats.avgMinutesPerDay,
      decimals: 0,
      suffix: 'm',
      hint: `over ${formatNumber(stats.daysListened)} active days`,
    },
    {
      key: 'skip',
      icon: 'skip',
      label: 'Skip rate',
      value: formatPercent(stats.skipRate),
      countTo: null,
      decimals: 0,
      suffix: '',
      hint: 'under 30s or skipped',
    },
    {
      key: 'shuffle',
      icon: 'shuffle',
      label: 'Shuffle',
      value: formatPercent(stats.shuffleRate),
      countTo: null,
      decimals: 0,
      suffix: '',
      hint: 'plays on shuffle',
    },
    {
      key: 'peak',
      icon: 'clock',
      label: 'Peak hour',
      value: hourLabel(stats.peakHour),
      countTo: null,
      decimals: 0,
      suffix: '',
      hint: stats.peakHourPersona,
    },
    {
      key: 'weekend',
      icon: 'weekend',
      label: 'Weekend',
      value: formatPercent(weekendShare),
      countTo: null,
      decimals: 0,
      suffix: '',
      hint: 'of your listening',
    },
  ]
}

function buildHighlights(stats: LocalStats): HighlightData[] {
  const out: HighlightData[] = []

  // A single play in a day isn't a repeat — skip the card rather than boast "1×"
  if (stats.onRepeat && stats.onRepeat.plays > 1) {
    out.push({
      key: 'on-repeat',
      icon: 'repeat',
      eyebrow: 'On repeat',
      title: stats.onRepeat.track,
      subtitle: `${stats.onRepeat.plays}× in one day (${formatDay(stats.onRepeat.date)}) — ${
        stats.onRepeat.artist
      }`,
      shareValue: `${stats.onRepeat.plays}×`,
    })
  }
  if (stats.streak) {
    out.push({
      key: 'streak',
      icon: 'flame',
      eyebrow: 'Longest streak',
      title: `${stats.streak.days} days straight`,
      subtitle: `${formatDay(stats.streak.start)} → ${formatDay(
        stats.streak.end,
      )} without missing a day`,
      shareValue: `${stats.streak.days} days`,
    })
  }
  if (stats.recordDay) {
    out.push({
      key: 'record-day',
      icon: 'trophy',
      eyebrow: 'Record day',
      title: formatMinutes(stats.recordDay.minutes),
      subtitle: `Your all-in day — ${formatDay(stats.recordDay.date)}`,
      shareValue: formatMinutes(stats.recordDay.minutes),
    })
  }

  return out
}

function buildEvolution(stats: LocalStats): UnifiedStats['evolution'] {
  if (stats.activeYears < 2 || stats.recentYear === null || stats.topArtistsRecent.length === 0) {
    return null
  }

  const recentRanks = new Map(stats.topArtistsRecent.map((a, i) => [a.artist, i + 1]))
  const allTimeRanks = new Map(stats.topArtists.map((a, i) => [a.name, i + 1]))

  const entry = (name: string, detail: string): EvolutionEntry => ({
    key: name,
    name,
    imageUrl: null,
    detail,
  })

  const columns: EvolutionColumn[] = [
    {
      key: 'new',
      title: 'New Obsessions',
      subtitle: `big in ${stats.recentYear}, nowhere all-time`,
      items: stats.topArtistsRecent
        .filter((a) => !allTimeRanks.has(a.artist))
        .slice(0, 5)
        .map((a) => entry(a.artist, `#${recentRanks.get(a.artist)} in ${stats.recentYear}`)),
    },
    {
      key: 'rising',
      title: 'Rising',
      subtitle: 'climbing the ranks fast',
      items: stats.topArtistsRecent
        .filter((a) => {
          const allTime = allTimeRanks.get(a.artist)
          return allTime !== undefined && allTime - recentRanks.get(a.artist)! >= 8
        })
        .slice(0, 5)
        .map((a) =>
          entry(
            a.artist,
            `#${allTimeRanks.get(a.artist)} all-time → #${recentRanks.get(a.artist)} now`,
          ),
        ),
    },
    {
      key: 'steady',
      title: 'Steady',
      subtitle: 'top 10 then, top 10 now',
      items: stats.topArtistsRecent
        .slice(0, 10)
        .filter((a) => (allTimeRanks.get(a.artist) ?? Infinity) <= 10)
        .slice(0, 5)
        .map((a) =>
          entry(
            a.artist,
            `#${recentRanks.get(a.artist)} now · #${allTimeRanks.get(a.artist)} all-time`,
          ),
        ),
    },
    {
      key: 'faded',
      title: 'Old Flames',
      subtitle: "all-time greats you've drifted from",
      items: stats.topArtists
        .slice(0, 20)
        .filter((a) => !recentRanks.has(a.name))
        .slice(0, 5)
        .map((a) => entry(a.name, `#${allTimeRanks.get(a.name)} all-time`)),
    },
  ]

  return {
    caption: `Your ${stats.recentYear} rotation vs. your all-time canon`,
    columns,
  }
}

export function fromLocalStats(stats: LocalStats, scopeLabel: string): UnifiedStats {
  const eras = eraClusters(stats)
  const totalMinutes = stats.totalMs / 60_000

  const artists: UnifiedArtist[] = stats.topArtists.map((a, i) => ({
    key: a.name,
    name: a.name,
    imageUrl: null,
    url: null,
    genres: [],
    followers: null,
    popularity: null,
    minutes: Math.round(a.ms / 60_000),
    plays: a.plays,
    distinctTracks: a.distinctTracks,
    firstYear: a.firstYear,
    rank: i + 1,
    cluster: eras.get(a.firstYear) ?? 'earlier',
    value: formatMinutes(a.ms / 60_000),
    detail: `${formatNumber(a.plays)} plays · ${plural(a.distinctTracks, 'track')}`,
  }))

  const repeatRate = stats.totalPlays
    ? Math.round((1 - stats.distinctTracks / stats.totalPlays) * 100)
    : 0

  const spotlight = stats.topArtists
    .filter((a) => a.distinctTracks >= 3)
    .map((a) => ({ artist: a, intensity: a.plays / a.distinctTracks }))
    .sort((a, b) => b.intensity - a.intensity)
    .slice(0, 6)

  return {
    source: 'upload',
    scopeLabel,

    hero: {
      eyebrow: `Your listening · ${scopeLabel}`,
      countTo: stats.totalMs / 3_600_000,
      value: Math.round(stats.totalMs / 3_600_000).toLocaleString(),
      suffix: ' hrs',
      caption:
        stats.firstPlay && stats.lastPlay
          ? `${formatDay(stats.firstPlay)} → ${formatDay(stats.lastPlay)} · ${formatNumber(
              stats.totalPlays,
            )} plays across ${formatNumber(stats.daysListened)} days`
          : `${formatNumber(stats.totalPlays)} plays`,
    },

    tiles: buildTiles(stats),
    highlights: buildHighlights(stats),
    artists,

    tracks: stats.topTracks.map((t, i) => ({
      key: t.uri,
      name: t.name,
      artist: t.artist,
      album: t.album,
      imageUrl: null,
      url: t.uri.startsWith('spotify:track:')
        ? `https://open.spotify.com/track/${t.uri.slice('spotify:track:'.length)}`
        : null,
      releaseYear: null,
      rank: i + 1,
      value: formatMinutes(t.ms / 60_000),
      detail: `${t.artist} · ${formatNumber(t.plays)} plays`,
    })),

    albums: stats.topAlbums.map((a, i) => ({
      key: `${a.name}|${a.artist}`,
      name: a.name,
      artist: a.artist,
      imageUrl: null,
      url: null,
      rank: i + 1,
      value: formatMinutes(a.ms / 60_000),
      detail: a.artist,
    })),

    clusterLabel: 'the year you found them',

    clock: {
      bins: stats.clock.map((b) => ({ hour: b.hour, value: b.minutes })),
      unit: 'minutes',
      peakHour: stats.peakHour,
      persona: stats.peakHourPersona,
      caption: 'Minutes across a 24-hour dial, in your timezone',
    },

    era: null,

    dna: {
      title: 'Artist DNA',
      caption: 'Share of your listening time by artist',
      items: artists.slice(0, 8).map((a) => ({
        name: a.name,
        share: totalMinutes ? (a.minutes ?? 0) / totalMinutes : 0,
      })),
      diversity: stats.artistDiversity,
      persona: artistDiversityPersona(stats.artistDiversity),
      diversityLabel: 'Artist diversity',
    },

    meter: {
      title: 'Obsession Meter',
      caption: 'How much you replay versus reach for something new — 100 is pure repeat',
      value: repeatRate,
      valueLabel: '/ 100 repeat',
      bands: ['Serial Explorer', 'Balanced', 'Repeat Listener', 'Loop Fiend'],
      activeBand: repeatPersona(repeatRate),
      description: `${formatNumber(stats.totalPlays)} plays covered ${formatNumber(
        stats.distinctTracks,
      )} different tracks. Verdict: ${repeatPersona(repeatRate)}.`,
    },

    evolution: buildEvolution(stats),

    loyalty: stats.rideOrDie.length
      ? {
          headline: `${stats.rideOrDie.length}`,
          score: stats.loyaltyScore,
          caption: `artists held a top-20 spot across your ${stats.activeYears} listening years · loyalty ${stats.loyaltyScore}%`,
          artists: stats.rideOrDie.map((r) => ({
            key: r.name,
            name: r.name,
            imageUrl: null,
            url: null,
          })),
        }
      : null,

    sessions: stats.sessions
      ? {
          count: stats.sessions.count,
          avgMinutes: stats.sessions.avgMinutes,
          avgTracks: stats.sessions.avgTracks,
          longestTracks: stats.sessions.longestTracks,
          longestMinutes: stats.sessions.longestMinutes,
          caption: 'Every stretch of listening with less than 30 minutes of silence',
        }
      : null,

    spotlight: spotlight.length
      ? {
          title: 'Repeat Offenders',
          caption: 'Artists you loop the hardest — plays per distinct track',
          items: spotlight.map(({ artist, intensity }, i) => ({
            key: artist.name,
            name: artist.name,
            imageUrl: null,
            url: null,
            genres: [],
            followers: null,
            popularity: null,
            minutes: Math.round(artist.ms / 60_000),
            plays: artist.plays,
            distinctTracks: artist.distinctTracks,
            firstYear: artist.firstYear,
            rank: i + 1,
            cluster: eras.get(artist.firstYear) ?? 'earlier',
            value: `${intensity.toFixed(1)}× per track`,
            detail: `${formatNumber(artist.plays)} plays · ${plural(artist.distinctTracks, 'track')}`,
          })),
        }
      : null,

    timeline: {
      unit: 'minutes',
      byYear: stats.byYear.map((y) => ({ label: `${y.year}`, value: y.minutes })),
      byMonth: stats.byMonth.map((m) => ({ label: m.month, value: m.minutes })),
      weekday: stats.weekday.map((d) => ({ label: WEEKDAY_LABELS[d.day], value: d.minutes })),
      seasonal: stats.seasonal.map((s) => ({ label: MONTH_LABELS[s.month], value: s.minutes })),
      discovery: stats.discovery.map((d) => ({ label: `${d.year}`, value: d.newArtists })),
      topArtistPerYear: stats.topArtistPerYear.map((a) => ({
        year: a.year,
        artist: a.artist,
        detail: `${minutesToHours(a.minutes)}h`,
      })),
      weekdayCaption: 'When you press play, across your whole history',
    },

    contexts: {
      platforms: stats.platforms.map((p) => ({
        label: p.label,
        value: p.minutes,
        display: formatMinutes(p.minutes),
      })),
      countries: stats.countries.map((c) => ({
        label: c.label,
        value: c.minutes,
        display: formatMinutes(c.minutes),
      })),
    },

    footnote: 'Computed locally from your export · nothing left your browser.',
  }
}
