// Every card can be shared as an image. The specs are built from the common
// view model, so a card shares identically whether the numbers came from the
// Spotify API or a ZIP export.
import type { ShareSpec, ShareRow } from '@/lib/share-card'
import type { HighlightData, TileData, UnifiedStats } from '@/lib/unified/types'

export const SHARE_TEXT = 'My Spotify, decoded 🎧 → made with Statify'

export function recapSpec(stats: UnifiedStats): ShareSpec {
  return {
    variant: 'story',
    eyebrow: `My Spotify · ${stats.scopeLabel}`,
    title: 'The Recap',
    bigValue: `${stats.hero.value}${stats.hero.suffix}`,
    bigCaption: stats.hero.caption,
    rows: stats.artists.slice(0, 5).map((artist) => ({
      rank: artist.rank,
      primary: artist.name,
      value: artist.value,
    })),
    stats: stats.tiles.slice(4, 8).map((tile) => ({ label: tile.label, value: tile.value })),
  }
}

export function tileSpec(tile: TileData, scopeLabel: string): ShareSpec {
  return {
    variant: 'tile',
    eyebrow: scopeLabel,
    title: tile.label,
    bigValue: tile.value,
    bigCaption: tile.hint,
  }
}

export function highlightSpec(highlight: HighlightData): ShareSpec {
  return {
    variant: 'tile',
    eyebrow: highlight.eyebrow,
    title: highlight.title,
    bigValue: highlight.shareValue,
    bigCaption: highlight.subtitle,
  }
}

export function rankedSpec(eyebrow: string, title: string, rows: ShareRow[]): ShareSpec {
  return { variant: 'tile', eyebrow, title, rows: rows.slice(0, 5) }
}

export function valueSpec(
  eyebrow: string,
  title: string,
  bigValue: string,
  bigCaption: string,
): ShareSpec {
  return { variant: 'tile', eyebrow, title, bigValue, bigCaption }
}
