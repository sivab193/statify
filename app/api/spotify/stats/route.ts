import { NextResponse } from 'next/server'
import { spotifyFetch } from '@/lib/spotify'
import { getValidAccessToken } from '@/lib/session'
import type {
  RecentPlay,
  SpotifyArtistLite,
  SpotifyTrackLite,
  StatsPayload,
  TimeRange,
} from '@/lib/types'

// Raw Spotify Web API shapes (only the fields we read)
interface RawImage {
  url: string
  width: number | null
}
interface RawArtist {
  id: string
  name: string
  images?: RawImage[]
  genres?: string[]
  popularity?: number
  followers?: { total: number }
  external_urls?: { spotify?: string }
}
interface RawTrack {
  id: string
  name: string
  artists: { name: string }[]
  album: { name: string; images?: RawImage[]; release_date?: string }
  duration_ms: number
  explicit: boolean
  popularity?: number
  external_urls?: { spotify?: string }
}
interface RawUser {
  id: string
  display_name?: string
  images?: RawImage[]
  followers?: { total: number }
}
interface Paged<T> {
  items: T[]
}
interface RawPlayHistory {
  items: { track: RawTrack; played_at: string }[]
}

// Prefer the mid-size image (~300px); fall back to whatever exists
function pickImage(images?: RawImage[]): string | null {
  if (!images?.length) return null
  return (images[1] ?? images[0]).url
}

function slimArtist(a: RawArtist): SpotifyArtistLite {
  return {
    id: a.id,
    name: a.name,
    imageUrl: pickImage(a.images),
    genres: a.genres ?? [],
    popularity: a.popularity ?? 0,
    followers: a.followers?.total ?? 0,
    spotifyUrl: a.external_urls?.spotify ?? `https://open.spotify.com/artist/${a.id}`,
  }
}

function slimTrack(t: RawTrack): SpotifyTrackLite {
  return {
    id: t.id,
    name: t.name,
    artists: t.artists.map((a) => a.name),
    albumName: t.album.name,
    albumImageUrl: pickImage(t.album.images),
    releaseDate: t.album.release_date ?? '',
    durationMs: t.duration_ms,
    explicit: t.explicit,
    popularity: t.popularity ?? 0,
    spotifyUrl: t.external_urls?.spotify ?? `https://open.spotify.com/track/${t.id}`,
  }
}

const RANGES: TimeRange[] = ['short_term', 'medium_term', 'long_term']

export async function GET() {
  const token = await getValidAccessToken()
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const [user, recent, ...ranged] = await Promise.all([
      spotifyFetch<RawUser>('/me', token),
      spotifyFetch<RawPlayHistory>('/me/player/recently-played?limit=50', token),
      ...RANGES.map((range) =>
        spotifyFetch<Paged<RawArtist>>(`/me/top/artists?time_range=${range}&limit=50`, token)
      ),
      ...RANGES.map((range) =>
        spotifyFetch<Paged<RawTrack>>(`/me/top/tracks?time_range=${range}&limit=50`, token)
      ),
    ])

    const artistPages = ranged.slice(0, 3) as Paged<RawArtist>[]
    const trackPages = ranged.slice(3) as Paged<RawTrack>[]

    const payload: StatsPayload = {
      user: {
        id: user.id,
        displayName: user.display_name ?? user.id,
        imageUrl: pickImage(user.images),
        followers: user.followers?.total ?? 0,
      },
      artists: {
        short_term: artistPages[0].items.map(slimArtist),
        medium_term: artistPages[1].items.map(slimArtist),
        long_term: artistPages[2].items.map(slimArtist),
      },
      tracks: {
        short_term: trackPages[0].items.map(slimTrack),
        medium_term: trackPages[1].items.map(slimTrack),
        long_term: trackPages[2].items.map(slimTrack),
      },
      recent: recent.items.map(
        (item): RecentPlay => ({
          trackId: item.track.id,
          trackName: item.track.name,
          artistName: item.track.artists.map((a) => a.name).join(', '),
          albumImageUrl: pickImage(item.track.album.images),
          durationMs: item.track.duration_ms,
          playedAt: item.played_at,
        })
      ),
    }

    return NextResponse.json(payload, {
      headers: { 'Cache-Control': 'private, max-age=300' },
    })
  } catch (error) {
    console.error('Failed to build stats payload:', error)
    return NextResponse.json({ error: 'Failed to fetch Spotify data' }, { status: 502 })
  }
}
