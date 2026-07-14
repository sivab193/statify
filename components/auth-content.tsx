'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Music2, Loader2, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export function AuthContent() {
  const [isConnecting, setIsConnecting] = useState(false)
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
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="max-w-md w-full p-8 space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Music2 className="w-8 h-8 text-primary" />
          </div>
          
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

        <div className="space-y-4">
          <Button 
            onClick={handleSpotifyLogin}
            disabled={isConnecting}
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
            We only request read access to your listening history. 
            Your data is never stored or shared.
          </p>
        </div>
      </Card>
    </div>
  )
}
