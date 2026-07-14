export type TimeRange = 'short_term' | 'medium_term' | 'long_term'

export const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: 'short_term', label: 'Last 4 Weeks' },
  { value: 'medium_term', label: 'Last 6 Months' },
  { value: 'long_term', label: 'All Time' },
]

export interface SpotifyArtistLite {
  id: string
  name: string
  imageUrl: string | null
  genres: string[]
  popularity: number
  followers: number
  spotifyUrl: string
}

export interface SpotifyTrackLite {
  id: string
  name: string
  artists: string[]
  albumName: string
  albumImageUrl: string | null
  releaseDate: string
  durationMs: number
  explicit: boolean
  popularity: number
  spotifyUrl: string
}

export interface RecentPlay {
  trackId: string
  trackName: string
  artistName: string
  albumImageUrl: string | null
  durationMs: number
  playedAt: string
}

export interface UserProfile {
  id: string
  displayName: string
  imageUrl: string | null
  followers: number
}

export interface StatsPayload {
  user: UserProfile
  artists: Record<TimeRange, SpotifyArtistLite[]>
  tracks: Record<TimeRange, SpotifyTrackLite[]>
  recent: RecentPlay[]
}
