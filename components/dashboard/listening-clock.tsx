'use client'

import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Clock3 } from 'lucide-react'
import { useStats } from '@/components/providers/stats-provider'
import { listeningClock } from '@/lib/insights'

const SIZE = 252
const CENTER = SIZE / 2
const INNER = 36
const OUTER = 96

function wedgePath(hour: number, value: number, max: number) {
  const startAngle = (hour / 24) * Math.PI * 2 - Math.PI / 2
  const endAngle = ((hour + 0.82) / 24) * Math.PI * 2 - Math.PI / 2
  const r = INNER + (max > 0 ? (value / max) * (OUTER - INNER) : 0)
  const point = (angle: number, radius: number) =>
    `${CENTER + Math.cos(angle) * radius},${CENTER + Math.sin(angle) * radius}`
  return [
    `M ${point(startAngle, INNER)}`,
    `L ${point(startAngle, r)}`,
    `A ${r} ${r} 0 0 1 ${point(endAngle, r)}`,
    `L ${point(endAngle, INNER)}`,
    `A ${INNER} ${INNER} 0 0 0 ${point(startAngle, INNER)}`,
    'Z',
  ].join(' ')
}

export function ListeningClock() {
  const { data } = useStats()
  const clock = useMemo(() => (data ? listeningClock(data.recent) : null), [data])

  if (!clock) return null

  const max = Math.max(...clock.bins.map((b) => b.plays))
  const hourLabel = (h: number) => {
    const period = h < 12 ? 'AM' : 'PM'
    const display = h % 12 === 0 ? 12 : h % 12
    return `${display} ${period}`
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Clock3 className="w-4 h-4 text-primary" /> Listening Clock
        </h2>
        <p className="text-xs text-muted-foreground">
          Your last 50 plays around a 24-hour dial, in your timezone
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="w-52 h-52 shrink-0"
          role="img"
          aria-label={`Radial chart of plays per hour; peak at ${hourLabel(clock.peakHour)}`}
        >
          <circle cx={CENTER} cy={CENTER} r={INNER - 4} fill="none" stroke="var(--color-border)" />
          {clock.bins.map(({ hour, plays }) => (
            <path
              key={hour}
              d={wedgePath(hour, plays, max)}
              fill="var(--color-primary)"
              opacity={hour === clock.peakHour ? 1 : plays > 0 ? 0.25 + (plays / max) * 0.45 : 0.08}
            >
              <title>{`${hourLabel(hour)} — ${plays} play${plays === 1 ? '' : 's'}`}</title>
            </path>
          ))}
          {[0, 6, 12, 18].map((h) => {
            const angle = (h / 24) * Math.PI * 2 - Math.PI / 2
            const x = CENTER + Math.cos(angle) * (OUTER + 12)
            const y = CENTER + Math.sin(angle) * (OUTER + 12)
            return (
              <text
                key={h}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="9"
                fill="var(--color-muted-foreground)"
              >
                {h === 0 ? '12AM' : h === 12 ? '12PM' : h < 12 ? `${h}AM` : `${h - 12}PM`}
              </text>
            )
          })}
        </svg>

        <div className="space-y-2 text-center sm:text-left">
          <p className="text-3xl font-semibold">{hourLabel(clock.peakHour)}</p>
          <p className="text-sm text-muted-foreground">is when your music peaks</p>
          <p className="text-sm">
            Verdict: <span className="text-primary font-medium">{clock.persona}</span>
          </p>
        </div>
      </div>
    </Card>
  )
}
