// Types for the "upload your Spotify data" path. These describe the raw
// Extended Streaming History records Spotify ships in the account export, and
// the aggregated shape we compute from them entirely in the browser.

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
  // Podcast/audiobook rows also appear in these files; we ignore them by
  // requiring spotify_track_uri to be present.
  episode_name?: string | null
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
  /** YYYY-MM */
  month: string
  minutes: number
}

export interface HourBin {
  hour: number
  minutes: number
}

export interface WeekdayBin {
  /** 0 = Sunday … 6 = Saturday */
  day: number
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

/** Everything the upload dashboard renders — computed in a worker. */
export interface LocalStats {
  generatedAt: string
  totalPlays: number
  totalMs: number
  distinctTracks: number
  distinctArtists: number
  firstPlay: string | null
  lastPlay: string | null
  spanDays: number
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
  platforms: LabelledAgg[]
  countries: LabelledAgg[]
  reasonEnd: { reason: string; count: number }[]
  recordDay: RecordDay | null
}

export type WorkerRequest = {
  files: { name: string; buffer: ArrayBuffer }[]
}

export type WorkerResponse =
  | { type: 'progress'; stage: string; percent: number }
  | { type: 'done'; stats: LocalStats }
  | { type: 'error'; message: string }
