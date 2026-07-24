'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertCircle, ArrowLeft, Instagram, Loader2, Lock, Sparkles, UploadCloud } from 'lucide-react'
import Link from 'next/link'
import { LogoMark } from '@/components/brand/logo'
import { SiteFooter } from '@/components/site-footer'
import { UsageStats } from '@/components/usage-stats'
import { LazyHeroScene } from '@/components/three/lazy'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

const INSTAGRAM_URL = 'https://www.instagram.com/siv19.dev/'

export function AuthContent() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [showAccessNotice, setShowAccessNotice] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (!errorParam) return
    const messages: Record<string, string> = {
      access_denied: 'Access was denied. Please try again.',
      state_mismatch: 'The sign-in request expired or was tampered with. Please try again.',
      token_exchange_failed:
        'Spotify rejected the sign-in. Check that the redirect URI is registered in the Spotify dashboard and try again.',
      not_configured:
        'Spotify credentials are not configured. Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET.',
    }
    setError(messages[errorParam] ?? 'Authentication failed. Please try again.')
  }, [searchParams])

  const handleSpotifyLogin = () => {
    setIsConnecting(true)
    setError(null)
    window.location.href = '/api/auth/login'
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-16 pb-28 relative overflow-hidden">
      {/* 3D hero backdrop */}
      <div className="absolute inset-0 opacity-80">
        <LazyHeroScene className="w-full h-full" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <Card className="w-full p-8 space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <LogoMark className="w-16 h-16 rounded-[26%] shadow-lg shadow-primary/25" />

          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-card-foreground">Connect Your Spotify</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Sign in with your Spotify account to access your personalized listening stats and insights.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {showAccessNotice ? (
          <div className="space-y-4">
            {/* Spotify keeps solo-developer apps in development mode: only accounts
                added by hand can authorize, so most visitors can't sign in at all. */}
            <div className="space-y-3 rounded-lg border border-primary/25 bg-primary/5 p-4">
              <div className="flex items-start gap-3">
                <Lock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-card-foreground">
                    Spotify doesn&apos;t allow individual developers to open the API to other users
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Apps built by solo developers stay in Spotify&apos;s development mode — only
                    accounts added to the app by hand can sign in. Extended access is granted to
                    registered organizations only.
                  </p>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground">
                Want to try it with your own account? DM{' '}
                <span className="font-medium text-foreground">@siv19.dev</span>
                {' on Instagram and you’ll be added to the allowlist.'}
              </p>

              <Button asChild className="w-full gap-2" size="lg">
                <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
                  <Instagram className="h-4 w-4" /> DM @siv19.dev on Instagram
                </a>
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Or see everything right now
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button asChild variant="outline" className="gap-2">
                  <Link href="/upload">
                    <UploadCloud className="h-4 w-4" /> Upload your data
                  </Link>
                </Button>
                <Button asChild variant="outline" className="gap-2">
                  <Link href="/demo">
                    <Sparkles className="h-4 w-4" /> Try the demo
                  </Link>
                </Button>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                The upload mode reads your Spotify data export in your browser — no login, no
                allowlist, and a fuller history than the API even exposes.
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
              <button
                type="button"
                onClick={() => setShowAccessNotice(false)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
              <button
                type="button"
                onClick={handleSpotifyLogin}
                disabled={isConnecting}
                className="text-xs font-medium text-primary underline underline-offset-2 disabled:opacity-60"
              >
                {isConnecting ? 'Redirecting…' : 'Already on the allowlist? Continue'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Button
              onClick={() => setShowAccessNotice(true)}
              className="w-full h-12 text-base font-semibold"
              size="lg"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Continue with Spotify'
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              We only request read access to your listening history. Your data is never stored or
              shared.
            </p>
          </div>
        )}
        </Card>

        {/* Usage stats */}
        <div className="mt-8 flex justify-center">
          <UsageStats />
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
