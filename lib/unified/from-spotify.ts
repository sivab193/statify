// Adapter: Spotify Web API payload (live sign-in + demo) → the common view
// model. The API knows genres, popularity and artwork but only ships ranked
// top-50 lists plus the last 50 plays — so time totals, streaks and device
// breakdowns stay null here.
import {
  artistLoyalty,
  eraExplorer,
  genreBreakdown,
  listeningClock,
  mainstreamMeter,
  sessionPatterns,
  tasteEvolution,
  undergroundArtists,
} from '@/lib/insights'
import { formatCount } from '@/components/charts/chart-theme'
import { formatNumber, hourLabel, WEEKDAY_LABELS } from '@/lib/format'
import { TIME_RANGES, type StatsPayload, type TimeRange, type SpotifyArtistLite } from '@/lib/types'
import type {
  EvolutionColumn,
  HighlightData,
  RecapData,
  StatsSource,
  TileData,
  UnifiedAlbum,
  UnifiedArtist,
  UnifiedStats,
} from './types'

/** How many genres get their own galaxy ring before the rest merge into "other". */
const GENRE_CLUSTERS = 5

function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000)
  return `${Math.floor(totalSeconds / 60)}:${`${totalSeconds % 60}`.padStart(2, '0')}`
}

/** Rank-weighted top genres — the same weighting the DNA card uses. */
function clusterGenres(artists: SpotifyArtistLite[]): string[] {
  const weights = new Map<string, number>()
  artists.forEach((artist, i) => {
    for (const genre of artist.genres) {
      weights.set(genre, (weights.get(genre) ?? 0) + (artists.length - i))
    }
  })
  return [...weights.entries()]
    .sort(([, a], [, b]) => b - a)
    .slice(0, GENRE_CLUSTERS)
    .map(([genre]) => genre)
}

/** The API has no album chart, so rank albums by how deep their tracks sit in the top list. */
function deriveAlbums(payload: StatsPayload, range: TimeRange): UnifiedAlbum[] {
  const tracks = payload.tracks[range]
  const albums = new Map<
    string,
    { name: string; artist: string; imageUrl: string | null; weight: number; tracks: number }
  >()

  tracks.forEach((track, i) => {
    const artist = track.artists[0] ?? 'Unknown Artist'
    const key = `${track.albumName}|${artist}`
    const existing = albums.get(key)
    if (existing) {
      existing.weight += tracks.length - i
      existing.tracks++
      existing.imageUrl ??= track.albumImageUrl
    } else {
      albums.set(key, {
        name: track.albumName,
        artist,
        imageUrl: track.albumImageUrl,
        weight: tracks.length - i,
        tracks: 1,
      })
    }
  })

  return [...albums.entries()]
    .sort(([, a], [, b]) => b.weight - a.weight)
    .slice(0, 20)
    .map(([key, album], i) => ({
      key,
      name: album.name,
      artist: album.artist,
      imageUrl: album.imageUrl,
      url: null,
      rank: i + 1,
      value: `${album.tracks} track${album.tracks === 1 ? '' : 's'}`,
      detail: album.artist,
    }))
}

/**
 * Same four recap slots as the export path, filled from what the API knows:
 * it has no play counts or streaks, so genre and obscurity take those seats.
 */
function buildRecap(payload: StatsPayload, range: TimeRange): RecapData {
  const artists = payload.artists[range]
  const tracks = payload.tracks[range]
  const genre = genreBreakdown(artists)
  const meter = mainstreamMeter(tracks)
  const clock = listeningClock(payload.recent)

  return {
    caption: `${formatNumber(tracks.length)} top tracks · ${formatNumber(
      artists.length,
    )} top artists`,
    stats: [
      { label: 'Top track', value: tracks[0]?.name ?? '—' },
      { label: 'Peak hour', value: clock ? hourLabel(clock.peakHour) : '—' },
      { label: 'Top genre', value: genre.topGenre ?? '—' },
      { label: 'Obscurity', value: meter ? `${meter.obscurity}/100` : '—' },
    ],
  }
}

function buildHighlights(payload: StatsPayload): HighlightData[] {
  const out: HighlightData[] = []
  const { recent } = payload

  if (recent.length) {
    const counts = new Map<string, { name: string; artist: string; plays: number }>()
    for (const play of recent) {
      const entry = counts.get(play.trackId)
      if (entry) entry.plays++
      else
        counts.set(play.trackId, { name: play.trackName, artist: play.artistName, plays: 1 })
    }
    const champion = [...counts.values()].sort((a, b) => b.plays - a.plays)[0]
    if (champion && champion.plays > 1) {
      out.push({
        key: 'on-repeat',
        icon: 'repeat',
        eyebrow: 'On repeat',
        title: champion.name,
        subtitle: `${champion.plays}× in your last ${recent.length} plays — ${champion.artist}`,
        shareValue: `${champion.plays}×`,
        shareEyebrow: 'Most obsessed',
        shareCaption: `in your last ${recent.length} plays · ${champion.artist}`,
      })
    }
  }

  const sessions = sessionPatterns(recent)
  if (sessions && sessions.longestBinge.tracks > 1) {
    out.push({
      key: 'binge',
      icon: 'flame',
      eyebrow: 'Longest binge',
      title: `${sessions.longestBinge.tracks} tracks straight`,
      subtitle: `${sessions.longestBinge.minutes} minutes without stepping away`,
      shareValue: `${sessions.longestBinge.tracks} tracks`,
      shareEyebrow: 'Dedication',
      shareCaption: `back to back · ${sessions.longestBinge.minutes} minutes straight`,
    })
  }

  const allTime = new Set(payload.artists.long_term.map((a) => a.id))
  const newest = payload.artists.short_term.findIndex((a) => !allTime.has(a.id))
  if (newest !== -1) {
    const artist = payload.artists.short_term[newest]
    out.push({
      key: 'newest',
      icon: 'sparkles',
      eyebrow: 'Newest obsession',
      title: artist.name,
      subtitle: `#${newest + 1} this month, nowhere in your all-time top ${
        payload.artists.long_term.length
      }`,
      shareValue: `#${newest + 1}`,
      shareCaption: `this month, nowhere all-time · ${artist.name}`,
    })
  }

  return out
}

function buildTiles(payload: StatsPayload, range: TimeRange, albumCount: number): TileData[] {
  const artists = payload.artists[range]
  const tracks = payload.tracks[range]
  const genre = genreBreakdown(artists)
  const meter = mainstreamMeter(tracks)
  const clock = listeningClock(payload.recent)
  const loyalty = artistLoyalty(payload.artists)
  const genreCount = new Set(artists.flatMap((a) => a.genres)).size

  return [
    {
      key: 'artists',
      icon: 'artists',
      label: 'Artists',
      value: formatNumber(artists.length),
      countTo: artists.length,
      decimals: 0,
      suffix: '',
      hint: 'in your top list',
    },
    {
      key: 'tracks',
      icon: 'tracks',
      label: 'Tracks',
      value: formatNumber(tracks.length),
      countTo: tracks.length,
      decimals: 0,
      suffix: '',
      hint: 'in your top list',
    },
    {
      key: 'albums',
      icon: 'albums',
      label: 'Albums',
      value: formatNumber(albumCount),
      countTo: albumCount,
      decimals: 0,
      suffix: '',
      hint: 'behind those tracks',
    },
    {
      key: 'genres',
      icon: 'genre',
      label: 'Genres',
      value: formatNumber(genreCount),
      countTo: genreCount,
      decimals: 0,
      suffix: '',
      hint: 'across your top artists',
    },
    {
      key: 'top-genre',
      icon: 'genre',
      label: 'Top genre',
      value: genre.topGenre ?? '—',
      countTo: null,
      decimals: 0,
      suffix: '',
      hint: `${genre.persona} · diversity ${genre.diversityScore}/100`,
    },
    {
      key: 'obscurity',
      icon: 'radar',
      label: 'Obscurity',
      value: meter ? `${meter.obscurity}/100` : '—',
      countTo: null,
      decimals: 0,
      suffix: '',
      hint: meter?.persona ?? 'Not enough data',
    },
    {
      key: 'peak',
      icon: 'clock',
      label: 'Peak hour',
      value: clock ? hourLabel(clock.peakHour) : '—',
      countTo: null,
      decimals: 0,
      suffix: '',
      hint: clock?.persona ?? 'Not enough data',
    },
    {
      key: 'ride-or-die',
      icon: 'loyalty',
      label: 'Ride or die',
      value: `${loyalty.rideOrDie.length} artists`,
      countTo: null,
      decimals: 0,
      suffix: '',
      hint: 'in your top list across every range',
    },
  ]
}

export function fromSpotifyStats(
  payload: StatsPayload,
  range: TimeRange,
  source: StatsSource,
): UnifiedStats {
  const rangeArtists = payload.artists[range]
  const rangeTracks = payload.tracks[range]
  const scopeLabel = TIME_RANGES.find((r) => r.value === range)?.label ?? 'All Time'

  const topGenres = clusterGenres(rangeArtists)
  const genre = genreBreakdown(rangeArtists)
  const meter = mainstreamMeter(rangeTracks)
  const clock = listeningClock(payload.recent)
  const era = eraExplorer(rangeTracks)
  const sessions = sessionPatterns(payload.recent)
  const loyalty = artistLoyalty(payload.artists)
  const evolution = tasteEvolution(payload.artists.short_term, payload.artists.long_term)
  const albums = deriveAlbums(payload, range)

  const toArtist = (artist: SpotifyArtistLite, i: number): UnifiedArtist => ({
    key: artist.id,
    name: artist.name,
    imageUrl: artist.imageUrl,
    url: artist.spotifyUrl,
    genres: artist.genres,
    followers: artist.followers,
    popularity: artist.popularity,
    minutes: null,
    plays: null,
    distinctTracks: null,
    firstYear: null,
    rank: i + 1,
    cluster: artist.genres.find((g) => topGenres.includes(g)) ?? 'other',
    value: artist.followers ? formatCount(artist.followers) : `#${i + 1}`,
    detail:
      artist.genres.slice(0, 2).join(' · ') ||
      (artist.followers ? `${formatCount(artist.followers)} followers` : 'genre unknown'),
  })

  const weekdayBins = Array.from({ length: 7 }, (_, day) => ({
    label: WEEKDAY_LABELS[day],
    value: 0,
  }))
  for (const play of payload.recent) {
    weekdayBins[new Date(play.playedAt).getDay()].value++
  }

  const evolutionColumns: EvolutionColumn[] = [
    {
      key: 'new',
      title: 'New Obsessions',
      subtitle: 'big right now, nowhere all-time',
      items: evolution.newObsessions.map((d) => ({
        key: d.artist.id,
        name: d.artist.name,
        imageUrl: d.artist.imageUrl,
        detail: `#${d.shortRank} this month`,
      })),
    },
    {
      key: 'rising',
      title: 'Rising',
      subtitle: 'climbing the ranks fast',
      items: evolution.rising.map((d) => ({
        key: d.artist.id,
        name: d.artist.name,
        imageUrl: d.artist.imageUrl,
        detail: `#${d.longRank} all-time → #${d.shortRank} now`,
      })),
    },
    {
      key: 'steady',
      title: 'Steady',
      subtitle: 'top 10 then, top 10 now',
      items: evolution.steady.map((d) => ({
        key: d.artist.id,
        name: d.artist.name,
        imageUrl: d.artist.imageUrl,
        detail: `#${d.shortRank} now · #${d.longRank} all-time`,
      })),
    },
    {
      key: 'faded',
      title: 'Old Flames',
      subtitle: "all-time greats you've drifted from",
      items: evolution.oldFlames.map((d) => ({
        key: d.artist.id,
        name: d.artist.name,
        imageUrl: d.artist.imageUrl,
        detail: `#${d.longRank} all-time`,
      })),
    },
  ]

  const underground = undergroundArtists(rangeArtists)

  return {
    source,
    scopeLabel,

    hero: {
      eyebrow: `Your listening · ${scopeLabel}`,
      countTo: null,
      value: rangeArtists[0]?.name ?? 'No data yet',
      suffix: '',
      caption: rangeArtists.length
        ? `Your #1 artist · ${rangeTracks.length} top tracks · ${
            genre.topGenre ?? 'genre unknown'
          }`
        : 'Play some music and check back',
    },

    tiles: buildTiles(payload, range, albums.length),
    recap: buildRecap(payload, range),
    highlights: buildHighlights(payload),
    artists: rangeArtists.map(toArtist),

    tracks: rangeTracks.map((track, i) => ({
      key: track.id,
      name: track.name,
      artist: track.artists.join(', '),
      album: track.albumName,
      imageUrl: track.albumImageUrl,
      url: track.spotifyUrl,
      releaseYear: parseInt(track.releaseDate.slice(0, 4), 10) || null,
      rank: i + 1,
      value: formatDuration(track.durationMs),
      detail: track.artists.join(', '),
    })),

    albums,
    clusterLabel: 'Genre',

    clock: clock && {
      bins: clock.bins.map((b) => ({ hour: b.hour, value: b.plays })),
      unit: 'plays',
      peakHour: clock.peakHour,
      persona: clock.persona,
      caption: `Your last ${payload.recent.length} plays around a 24-hour dial, in your timezone`,
    },

    era: era.decades.length
      ? {
          decades: era.decades,
          centerYear: era.centerYear,
          oldest: era.oldest
            ? { name: era.oldest.name, year: parseInt(era.oldest.releaseDate.slice(0, 4), 10) }
            : null,
          caption: 'When the music you love was actually made',
        }
      : null,

    dna: genre.genres.length
      ? {
          title: 'Genre DNA',
          caption: "Rank-weighted share of your top artists' genres",
          items: genre.genres.map((g) => ({ name: g.genre, share: g.share })),
          diversity: genre.diversityScore,
          persona: genre.persona,
          diversityLabel: 'Genre diversity',
        }
      : null,

    meter: meter && {
      title: 'Mainstream Meter',
      caption: 'How far off the charts your taste runs — 100 is pure obscurity',
      value: meter.obscurity,
      valueLabel: '/ 100 obscurity',
      bands: ['Chart Dweller', 'Balanced', 'Crate Digger', 'Deep Underground'],
      activeBand: meter.persona,
      description: `Your top tracks average ${meter.avgPopularity}/100 on Spotify's popularity scale. Verdict: ${meter.persona}.`,
    },

    evolution: evolutionColumns.some((c) => c.items.length)
      ? { caption: 'Your last four weeks vs. your all-time canon', columns: evolutionColumns }
      : null,

    loyalty: loyalty.rideOrDie.length
      ? {
          headline: `${loyalty.rideOrDie.length}`,
          score: loyalty.score,
          caption: `artists never leave your rotation · loyalty ${loyalty.score}%`,
          artists: loyalty.rideOrDie.slice(0, 12).map((a) => ({
            key: a.id,
            name: a.name,
            imageUrl: a.imageUrl,
            url: a.spotifyUrl,
          })),
        }
      : null,

    sessions: sessions && {
      count: sessions.sessionCount,
      avgMinutes: sessions.avgMinutes,
      avgTracks: sessions.avgTracks,
      longestTracks: sessions.longestBinge.tracks,
      longestMinutes: sessions.longestBinge.minutes,
      caption: `From your last ${payload.recent.length} plays (${sessions.spanDays} day${
        sessions.spanDays === 1 ? '' : 's'
      })`,
    },

    spotlight: underground.length
      ? {
          title: 'Underground Finds',
          caption: "Top artists of yours the rest of the world hasn't caught up to",
          items: underground.map((artist, i) => ({
            ...toArtist(artist, i),
            value: `${formatCount(artist.followers)} listeners`,
          })),
        }
      : null,

    timeline: {
      unit: 'plays',
      byYear: [],
      byMonth: [],
      weekday: weekdayBins,
      seasonal: [],
      discovery: [],
      topArtistPerYear: [],
      weekdayCaption: `From your last ${payload.recent.length} plays`,
    },

    contexts: { platforms: [], countries: [] },

    footnote:
      source === 'demo'
        ? 'Sample data — connect Spotify or upload your export for the real thing.'
        : 'Read-only Spotify data · fetched for this session only.',
  }
}
