// One view model for every data source. The Spotify API path (sign-in + demo)
// and the ZIP-export path answer different questions about the same listening,
// so each adapter fills what it can and leaves the rest null — the dashboard
// renders one common set of cards from whatever is present.

export type StatsSource = 'spotify' | 'demo' | 'upload'

export type TileIcon =
  | 'hours'
  | 'artists'
  | 'tracks'
  | 'albums'
  | 'calendar'
  | 'genre'
  | 'radar'
  | 'clock'
  | 'loyalty'
  | 'skip'
  | 'shuffle'
  | 'weekend'

export type HighlightIcon = 'repeat' | 'flame' | 'trophy' | 'sparkles' | 'headphones'

export interface UnifiedArtist {
  key: string
  name: string
  imageUrl: string | null
  url: string | null
  genres: string[]
  followers: number | null
  popularity: number | null
  minutes: number | null
  plays: number | null
  distinctTracks: number | null
  firstYear: number | null
  rank: number
  /** Legend/grouping label for the 3D galaxy — genre (API) or discovery era (export) */
  cluster: string
  /** Right-hand value in ranked lists and share cards */
  value: string
  /** Secondary line in ranked lists */
  detail: string
}

export interface UnifiedTrack {
  key: string
  name: string
  artist: string
  album: string
  imageUrl: string | null
  url: string | null
  releaseYear: number | null
  rank: number
  value: string
  detail: string
}

export interface UnifiedAlbum {
  key: string
  name: string
  artist: string
  imageUrl: string | null
  url: string | null
  rank: number
  value: string
  detail: string
}

export interface HeroData {
  eyebrow: string
  /** Set when the headline is a number the page should count up to */
  countTo: number | null
  value: string
  suffix: string
  caption: string
}

export interface TileData {
  key: string
  icon: TileIcon
  label: string
  value: string
  /** Set to animate from 0 — `value` is then only the SSR/fallback text */
  countTo: number | null
  decimals: number
  suffix: string
  hint: string
}

export interface HighlightData {
  key: string
  icon: HighlightIcon
  eyebrow: string
  title: string
  subtitle: string
  /** Big number on the shared image; falls back to the title */
  shareValue?: string
}

export interface ClockData {
  bins: { hour: number; value: number }[]
  unit: 'plays' | 'minutes'
  peakHour: number
  persona: string
  caption: string
}

export interface DnaData {
  title: string
  caption: string
  items: { name: string; share: number }[]
  diversity: number
  persona: string
  diversityLabel: string
}

export interface MeterData {
  title: string
  caption: string
  /** 0–100 */
  value: number
  valueLabel: string
  bands: string[]
  activeBand: string
  description: string
}

export interface EraData {
  decades: { decade: string; count: number }[]
  centerYear: number | null
  oldest: { name: string; year: number } | null
  caption: string
}

export interface EvolutionEntry {
  key: string
  name: string
  imageUrl: string | null
  detail: string
}

export interface EvolutionColumn {
  key: string
  title: string
  subtitle: string
  items: EvolutionEntry[]
}

export interface EvolutionData {
  caption: string
  columns: EvolutionColumn[]
}

export interface LoyaltyData {
  headline: string
  score: number
  caption: string
  artists: { key: string; name: string; imageUrl: string | null; url: string | null }[]
}

export interface SessionData {
  count: number
  avgMinutes: number
  avgTracks: number
  longestTracks: number
  longestMinutes: number
  caption: string
}

export interface SpotlightData {
  title: string
  caption: string
  items: UnifiedArtist[]
}

export interface SeriesPoint {
  label: string
  value: number
}

export interface TimelineData {
  /** Minutes (export) or plays (API) — drives axis + tooltip formatting */
  unit: 'plays' | 'minutes'
  byYear: SeriesPoint[]
  byMonth: SeriesPoint[]
  weekday: SeriesPoint[]
  seasonal: SeriesPoint[]
  discovery: SeriesPoint[]
  topArtistPerYear: { year: number; artist: string; detail: string }[]
  /** Sub-line for the weekday card — the two sources sample different windows */
  weekdayCaption: string
}

export interface ContextRow {
  label: string
  value: number
  display: string
}

export interface UnifiedStats {
  source: StatsSource
  /** "Last 6 Months", "All time", "2023–2025" … */
  scopeLabel: string
  hero: HeroData
  tiles: TileData[]
  highlights: HighlightData[]
  artists: UnifiedArtist[]
  tracks: UnifiedTrack[]
  albums: UnifiedAlbum[]
  /** What the galaxy clusters mean for this source */
  clusterLabel: string
  clock: ClockData | null
  era: EraData | null
  dna: DnaData | null
  meter: MeterData | null
  evolution: EvolutionData | null
  loyalty: LoyaltyData | null
  sessions: SessionData | null
  spotlight: SpotlightData | null
  timeline: TimelineData
  contexts: { platforms: ContextRow[]; countries: ContextRow[] }
  footnote: string
}
