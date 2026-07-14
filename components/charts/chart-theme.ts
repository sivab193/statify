// Shared chart tokens. Single-series charts use the brand green; the genre
// galaxy's cluster palette below is categorical and was validated with the
// dataviz six-checks (all-pairs CVD ΔE 25.5 on the dark card surface).
export const chart = {
  /** brand green — the one hue for single-series marks */
  accent: 'var(--color-primary)',
  accentDim: 'color-mix(in oklch, var(--color-primary) 35%, transparent)',
  grid: 'var(--color-border)',
  axis: 'var(--color-muted-foreground)',
  deemphasis: 'oklch(0.35 0.01 106)',
}

/** Fixed genre→color order; assigned in sequence, never cycled. */
export const GENRE_COLORS = ['#6aa36c', '#348dcf', '#c0851f', '#9b5472', '#9e4421']
export const GENRE_OTHER_COLOR = '#5c5b57'

export const tooltipStyle = {
  backgroundColor: 'var(--color-popover)',
  border: '1px solid var(--color-border)',
  borderRadius: '0.5rem',
  fontSize: '0.75rem',
  color: 'var(--color-popover-foreground)',
} as const

export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return `${n}`
}
