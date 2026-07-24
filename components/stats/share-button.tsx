'use client'

import { useState } from 'react'
import { Share2, Check, Loader2 } from 'lucide-react'
import { shareCard, type ShareSpec } from '@/lib/share-card'
import { cn } from '@/lib/utils'

export function ShareButton({
  spec,
  filename,
  text,
  label,
  variant = 'icon',
  className,
}: {
  spec: () => ShareSpec
  filename?: string
  text?: string
  label?: string
  variant?: 'icon' | 'full'
  className?: string
}) {
  const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle')

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (state === 'busy') return
    setState('busy')
    try {
      await shareCard(spec(), { filename, text })
      setState('done')
    } catch {
      setState('idle')
      return
    }
    setTimeout(() => setState('idle'), 1600)
  }

  const Icon = state === 'busy' ? Loader2 : state === 'done' ? Check : Share2

  if (variant === 'full') {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-105 active:scale-95',
          className,
        )}
      >
        <Icon className={cn('h-4 w-4', state === 'busy' && 'animate-spin')} />
        {state === 'done' ? 'Ready!' : (label ?? 'Share')}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label ?? 'Share as image'}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card/60 text-muted-foreground opacity-0 backdrop-blur transition-all hover:border-primary hover:text-primary group-hover/card:opacity-100 focus-visible:opacity-100',
        state !== 'idle' && 'opacity-100 border-primary text-primary',
        className,
      )}
    >
      <Icon className={cn('h-4 w-4', state === 'busy' && 'animate-spin')} />
    </button>
  )
}
