// Display helpers for the upload dashboard.

export function formatHours(ms: number): string {
  const hours = ms / 3_600_000
  if (hours >= 1000) return `${(hours / 1000).toFixed(1)}k`
  if (hours >= 100) return Math.round(hours).toLocaleString()
  return hours.toFixed(1)
}

export function formatMinutes(minutes: number): string {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60)
    const m = Math.round(minutes % 60)
    return m ? `${h}h ${m}m` : `${h}h`
  }
  return `${Math.round(minutes)}m`
}

export function formatNumber(n: number): string {
  return n.toLocaleString()
}

export function formatPercent(fraction: number): string {
  return `${Math.round(fraction * 100)}%`
}

export function hourLabel(h: number): string {
  const period = h < 12 ? 'AM' : 'PM'
  const display = h % 12 === 0 ? 12 : h % 12
  return `${display} ${period}`
}

export function formatDay(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

export function minutesToHours(minutes: number): string {
  return formatHours(minutes * 60_000)
}
