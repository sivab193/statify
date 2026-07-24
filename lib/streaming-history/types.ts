// Types for the "upload your Spotify data" path. These describe the raw
// Extended Streaming History records Spotify ships in the account export, the
// compact per-play shape we keep in memory for re-filtering, and the
// aggregated stats we compute from them entirely in the browser.

/** One row from a Streaming_History_Audio_*.json file. */
export interface RawPlay {
  ts: string
  platform: string | null
  ms_played: number
  conn_country: string | null
  master_metadata_track_name: string | null
  master_metadata_album_artist_name: string | null
  master_metadata_album_album_name: string | null
  spotify_track_uri: string | null
  reason_start: string | null
  reason_end: string | null
  shuffle: boolean | null
  skipped: boolean | null
  offline: boolean | null
  incognito_mode: boolean | null
  episode_name?: string | null
}

/**
 * Compact, pre-parsed play. The worker produces these once so re-aggregating
 * under different filters never re-parses a Date or re-derives labels.
 */
export interface Play {
  t: number // epoch ms
  year: number
  month: string // YYYY-MM
  day: string // YYYY-MM-DD
  hour: number // 0–23, viewer-local
  dow: number // 0=Sun … 6=Sat
  ms: number
  uri: string
  track: string
  artist: string
  album: string
  platform: string // prettified
  country: string
  skip: boolean
  shuffle: boolean
  offline: boolean
}

export interface PlayFilters {
  /** null = all years */
  years: number[] | null
  /** null = all platforms */
  platforms: string[] | null
  /** drop plays under 30s / flagged skipped */
  excludeSkips: boolean
}

export const ALL_FILTERS: PlayFilters = { years: null, platforms: null, excludeSkips: false }

export interface ParseMeta {
  years: number[]
  platforms: string[]
  totalPlays: number
}

export interface TrackAgg {
  uri: string
  name: string
  artist: string
  album: string
  ms: number
  plays: number
  skips: number
}

export interface ArtistAgg {
  name: string
  ms: number
  plays: number
  distinctTracks: number
  /** First year this artist appears in the filtered history */
  firstYear: number
}

export interface AlbumAgg {
  name: string
  artist: string
  ms: number
  plays: number
}

export interface YearAgg {
  year: number
  minutes: number
  plays: number
}

export interface MonthAgg {
  month: string // YYYY-MM
  minutes: number
}

export interface HourBin {
  hour: number
  minutes: number
}

export interface WeekdayBin {
  day: number // 0=Sun … 6=Sat
  minutes: number
}

export interface LabelledAgg {
  label: string
  minutes: number
  plays: number
}

export interface RecordDay {
  date: string
  minutes: number
}

export interface ArtistYear {
  year: number
  artist: string
  minutes: number
  plays: number
}

export interface DiscoveryYear {
  year: number
  newArtists: number
}

export interface Streak {
  days: number
  start: string
  end: string
}

export interface SeasonBin {
  month: number // 0=Jan … 11=Dec
  minutes: number
}

export interface OnRepeat {
  track: string
  artist: string
  date: string
  plays: number
}

/** Listening broken into sittings — a gap over 30 minutes starts a new one. */
export interface SessionAgg {
  count: number
  avgMinutes: number
  avgTracks: number
  longestTracks: number
  longestMinutes: number
}

/** Artists that keep showing up in the yearly top 20. */
export interface RideOrDie {
  name: string
  years: number
}

/** Everything the upload dashboard renders — recomputed on every filter change. */
export interface LocalStats {
  generatedAt: string
  totalPlays: number
  totalMs: number
  distinctTracks: number
  distinctArtists: number
  firstPlay: string | null
  lastPlay: string | null
  spanDays: number
  daysListened: number
  avgMinutesPerDay: number
  skipRate: number
  shuffleRate: number
  offlineRate: number
  peakHour: number
  peakHourPersona: string
  topTracks: TrackAgg[]
  topArtists: ArtistAgg[]
  topAlbums: AlbumAgg[]
  byYear: YearAgg[]
  byMonth: MonthAgg[]
  clock: HourBin[]
  weekday: WeekdayBin[]
  seasonal: SeasonBin[]
  weekendMinutes: number
  weekdayMinutes: number
  platforms: LabelledAgg[]
  countries: LabelledAgg[]
  reasonEnd: { reason: string; count: number }[]
  recordDay: RecordDay | null
  topArtistPerYear: ArtistYear[]
  discovery: DiscoveryYear[]
  streak: Streak | null
  onRepeat: OnRepeat | null
  firstEver: { track: string; artist: string; ts: string } | null
  sessions: SessionAgg | null
  /** Most recent year in scope — the "now" side of taste evolution */
  recentYear: number | null
  /** Top artists of `recentYear`, for comparison against the all-time list */
  topArtistsRecent: ArtistYear[]
  rideOrDie: RideOrDie[]
  /** Share of active years in which a ride-or-die artist held a top-20 spot */
  loyaltyScore: number
  /** Normalized Shannon entropy over artist listening time, 0–100 */
  artistDiversity: number
  /** Number of years with any listening — how meaningful the yearly views are */
  activeYears: number
}

export type WorkerRequest = {
  files: { name: string; buffer: ArrayBuffer }[]
}

export type WorkerResponse =
  | { type: 'progress'; stage: string; percent: number }
  | { type: 'done'; plays: Play[]; meta: ParseMeta }
  | { type: 'error'; message: string }
