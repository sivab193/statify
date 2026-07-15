'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { UploadDropzone } from '@/components/upload/upload-dropzone'
import { LocalStatsView } from '@/components/upload/local-stats-view'
import type { LocalStats } from '@/lib/streaming-history/types'
import { ArrowLeft, Music2 } from 'lucide-react'

export default function UploadPage() {
  const [stats, setStats] = useState<LocalStats | null>(null)

  if (stats) {
    return (
      <main className="min-h-screen bg-background">
        <LocalStatsView stats={stats} onReset={() => setStats(null)} />
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-xl space-y-10">
        <div className="space-y-4 text-center">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Music2 className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-balance">
            Your stats, <span className="text-primary">no login</span>
          </h1>
          <p className="mx-auto max-w-md text-pretty text-muted-foreground leading-relaxed">
            Upload the Spotify data export you requested from your account — Statify reads your full
            listening history right here in the browser. Richer than the API: all-time, every play.
          </p>
        </div>

        <UploadDropzone onReady={setStats} />

        <details className="mx-auto max-w-lg rounded-lg border border-border bg-card/50 px-4 py-3 text-sm">
          <summary className="cursor-pointer font-medium">How do I get my data?</summary>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-muted-foreground">
            <li>
              Go to{' '}
              <span className="font-mono text-xs">Spotify → Privacy Settings → Download your data</span>
              .
            </li>
            <li>
              Request <span className="font-medium">Extended streaming history</span> (email arrives
              in a few days).
            </li>
            <li>Drop the ZIP above — no need to unzip it first.</li>
          </ol>
        </details>

        <div className="text-center">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" /> Back home
            </Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
