// Pure insight computations over the StatsPayload. Everything here runs
// client-side so range switches recompute instantly and demo mode works
// without a server.
import type {
  RecentPlay,
  SpotifyArtistLite,
  SpotifyTrackLite,
  TimeRange,
} from '@/lib/types'

// --- Mainstream Meter -------------------------------------------------------

export interface MainstreamMeter {
  avgPopularity: number
  obscurity: number
  persona: string
}

export function mainstreamMeter(tracks: SpotifyTrackLite[]): MainstreamMeter | null {
  if (tracks.length === 0) return null
  const avgPopularity = Math.round(
    tracks.reduce((sum, t) => sum + t.popularity, 0) / tracks.length
  )
  const obscurity = 100 - avgPopularity
  const persona =
    obscurity >= 65
      ? 'Deep Underground'
      : obscurity >= 45
        ? 'Crate Digger'
        : obscurity >= 25
          ? 'Balanced Listener'
          : 'Chart Dweller'
  return { avgPopularity, obscurity, persona }
}

// --- Era Explorer ------------------------------------------------------------

export interface EraExplorer {
  decades: { decade: string; count: number }[]
  centerYear: number | null
  oldest: SpotifyTrackLite | null
}

export function eraExplorer(tracks: SpotifyTrackLite[]): EraExplorer {
  // release_date precision can be YYYY, YYYY-MM, or YYYY-MM-DD
  const dated = tracks
    .map((t) => ({ track: t, year: parseInt(t.releaseDate.slice(0, 4), 10) }))
    .filter(({ year }) => Number.isFinite(year) && year > 1900)

  const byDecade = new Map<number, number>()
  for (const { year } of dated) {
    const decade = Math.floor(year / 10) * 10
    byDecade.set(decade, (byDecade.get(decade) ?? 0) + 1)
  }

  const decades = [...byDecade.entries()]
    .sort(([a], [b]) => a - b)
    .map(([decade, count]) => ({ decade: `${decade}s`, count }))

  const centerYear = dated.length
    ? Math.round(dated.reduce((sum, { year }) => sum + year, 0) / dated.length)
    : null

  const oldest = dated.length
    ? dated.reduce((min, cur) => (cur.year < min.year ? cur : min)).track
    : null

  return { decades, centerYear, oldest }
}

// --- Listening Clock ---------------------------------------------------------

export interface ListeningClock {
  bins: { hour: number; plays: number }[]
  peakHour: number
  persona: string
}

export function listeningClock(recent: RecentPlay[]): ListeningClock | null {
  if (recent.length === 0) return null
  const bins = Array.from({ length: 24 }, (_, hour) => ({ hour, plays: 0 }))
  for (const play of recent) {
    // Intentionally local timezone — runs in the listener's browser
    bins[new Date(play.playedAt).getHours()].plays++
  }
  const peakHour = bins.reduce((max, b) => (b.plays > max.plays ? b : max)).hour
  const persona =
    peakHour >= 22 || peakHour < 5
      ? 'Night Owl'
      : peakHour < 9
        ? 'Early Bird'
        : peakHour < 17
          ? 'Daytime Grooves'
          : 'Evening Unwinder'
  return { bins, peakHour, persona }
}

// --- Taste Evolution ---------------------------------------------------------

export interface ArtistDelta {
  artist: SpotifyArtistLite
  shortRank: number | null
  longRank: number | null
}

export interface TasteEvolution {
  newObsessions: ArtistDelta[]
  oldFlames: ArtistDelta[]
  rising: ArtistDelta[]
  steady: ArtistDelta[]
}

export function tasteEvolution(
  shortTerm: SpotifyArtistLite[],
  longTerm: SpotifyArtistLite[]
): TasteEvolution {
  const shortRanks = new Map(shortTerm.map((a, i) => [a.id, i + 1]))
  const longRanks = new Map(longTerm.map((a, i) => [a.id, i + 1]))

  const delta = (artist: SpotifyArtistLite): ArtistDelta => ({
    artist,
    shortRank: shortRanks.get(artist.id) ?? null,
    longRank: longRanks.get(artist.id) ?? null,
  })

  return {
    newObsessions: shortTerm
      .slice(0, 20)
      .filter((a) => !longRanks.has(a.id))
      .slice(0, 5)
      .map(delta),
    oldFlames: longTerm
      .slice(0, 20)
      .filter((a) => !shortRanks.has(a.id))
      .slice(0, 5)
      .map(delta),
    rising: shortTerm
      .filter((a) => {
        const long = longRanks.get(a.id)
        const short = shortRanks.get(a.id)!
        return long !== undefined && long - short >= 10
      })
      .slice(0, 5)
      .map(delta),
    steady: shortTerm
      .slice(0, 10)
      .filter((a) => (longRanks.get(a.id) ?? Infinity) <= 10)
      .slice(0, 5)
      .map(delta),
  }
}

// --- Genre Breakdown + Diversity ----------------------------------------------

export interface GenreBreakdown {
  genres: { genre: string; share: number }[]
  diversityScore: number
  persona: string
  topGenre: string | null
}

export function genreBreakdown(artists: SpotifyArtistLite[]): GenreBreakdown {
  const weights = new Map<string, number>()
  artists.forEach((artist, index) => {
    const w = artists.length - index
    for (const genre of artist.genres) {
      weights.set(genre, (weights.get(genre) ?? 0) + w)
    }
  })

  const total = [...weights.values()].reduce((a, b) => a + b, 0)
  const sorted = [...weights.entries()].sort(([, a], [, b]) => b - a)
  const genres = sorted.slice(0, 8).map(([genre, w]) => ({
    genre,
    share: total ? w / total : 0,
  }))

  // Normalized Shannon entropy over all genre shares, scaled 0–100
  let diversityScore = 0
  if (weights.size > 1 && total > 0) {
    const entropy = -[...weights.values()].reduce((sum, w) => {
      const p = w / total
      return sum + p * Math.log(p)
    }, 0)
    diversityScore = Math.round((entropy / Math.log(weights.size)) * 100)
  }

  const persona =
    diversityScore >= 70 ? 'Genre Nomad' : diversityScore <= 35 ? 'Specialist' : 'Explorer'

  return { genres, diversityScore, persona, topGenre: sorted[0]?.[0] ?? null }
}

// --- Artist Loyalty ------------------------------------------------------------

export interface ArtistLoyalty {
  score: number
  rideOrDie: SpotifyArtistLite[]
}

export function artistLoyalty(
  artists: Record<TimeRange, SpotifyArtistLite[]>
): ArtistLoyalty {
  const short = new Map(artists.short_term.map((a, i) => [a.id, i]))
  const medium = new Map(artists.medium_term.map((a, i) => [a.id, i]))
  const long = new Map(artists.long_term.map((a, i) => [a.id, i]))

  const rideOrDie = artists.long_term
    .filter((a) => short.has(a.id) && medium.has(a.id))
    .sort(
      (a, b) =>
        short.get(a.id)! + medium.get(a.id)! + long.get(a.id)! -
        (short.get(b.id)! + medium.get(b.id)! + long.get(b.id)!)
    )

  const denominator = Math.min(
    artists.short_term.length,
    artists.medium_term.length,
    artists.long_term.length
  )

  return {
    score: denominator ? Math.round((rideOrDie.length / denominator) * 100) : 0,
    rideOrDie,
  }
}

// --- Session Patterns -----------------------------------------------------------

export interface SessionPatterns {
  sessionCount: number
  avgMinutes: number
  avgTracks: number
  longestBinge: { tracks: number; minutes: number }
  spanDays: number
}

const SESSION_GAP_MS = 30 * 60 * 1000

export function sessionPatterns(recent: RecentPlay[]): SessionPatterns | null {
  if (recent.length === 0) return null
  const plays = [...recent].sort(
    (a, b) => new Date(a.playedAt).getTime() - new Date(b.playedAt).getTime()
  )

  const sessions: RecentPlay[][] = [[plays[0]]]
  for (let i = 1; i < plays.length; i++) {
    const gap =
      new Date(plays[i].playedAt).getTime() - new Date(plays[i - 1].playedAt).getTime()
    if (gap > SESSION_GAP_MS) sessions.push([])
    sessions[sessions.length - 1].push(plays[i])
  }

  const minutes = (session: RecentPlay[]) => {
    const start = new Date(session[0].playedAt).getTime()
    const end =
      new Date(session[session.length - 1].playedAt).getTime() +
      session[session.length - 1].durationMs
    return Math.round((end - start) / 60000)
  }

  const longest = sessions.reduce((max, s) => (s.length > max.length ? s : max))
  const spanMs =
    new Date(plays[plays.length - 1].playedAt).getTime() -
    new Date(plays[0].playedAt).getTime()

  return {
    sessionCount: sessions.length,
    avgMinutes: Math.round(sessions.reduce((sum, s) => sum + minutes(s), 0) / sessions.length),
    avgTracks: Math.round(plays.length / sessions.length),
    longestBinge: { tracks: longest.length, minutes: minutes(longest) },
    spanDays: Math.max(1, Math.round(spanMs / 86400000)),
  }
}

// --- Underground Artists ----------------------------------------------------------

const UNDERGROUND_FOLLOWER_CAP = 100_000

export function undergroundArtists(artists: SpotifyArtistLite[]): SpotifyArtistLite[] {
  return artists
    .filter((a) => a.followers > 0 && a.followers < UNDERGROUND_FOLLOWER_CAP)
    .sort((a, b) => a.followers - b.followers)
    .slice(0, 6)
}
