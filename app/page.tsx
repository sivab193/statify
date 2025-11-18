'use client'

import { Button } from '@/components/ui/button'
import { Music2 } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-chart-2/10 blur-3xl" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          {/* Logo/Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4 animate-scale-in">
            <Music2 className="w-10 h-10 text-primary" />
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance animate-fade-slide-up">
            Your Spotify Stats,{' '}
            <span className="text-primary">Anytime</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed animate-fade-slide-up" style={{ animationDelay: '0.1s' }}>
            Dive deep into your listening history with beautiful visualizations. 
            Track your top artists, songs, and genres across custom date ranges.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 animate-fade-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link href="/auth">
              <Button size="lg" className="text-lg px-8 h-14 font-semibold">
                Connect Spotify
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="text-lg px-8 h-14 font-semibold">
                View Demo
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-20 px-4">
          <div className="bg-card border border-border rounded-lg p-6 space-y-2 animate-fade-slide-up" style={{ animationDelay: '0.3s' }}>
            <h3 className="font-semibold text-lg text-card-foreground">Real-Time Stats</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Access your listening data anytime, not just during year-end recaps.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 space-y-2 animate-fade-slide-up" style={{ animationDelay: '0.4s' }}>
            <h3 className="font-semibold text-lg text-card-foreground">Custom Ranges</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Filter by week, month, year, or any custom date range you choose.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 space-y-2 animate-fade-slide-up" style={{ animationDelay: '0.5s' }}>
            <h3 className="font-semibold text-lg text-card-foreground">Beautiful Visuals</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Stunning animations and charts that bring your music taste to life.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
