import { Button } from '@/components/ui/button'
import { Orbit, Radar, Clock3 } from 'lucide-react'
import Link from 'next/link'
import { LazyHeroScene } from '@/components/three/lazy'
import { LogoMark } from '@/components/brand/logo'
import { UsageStats } from '@/components/usage-stats'
import { SiteFooter } from '@/components/site-footer'

const FEATURES = [
  {
    icon: Orbit,
    title: 'Artist Galaxy',
    body: 'Your top artists as planets orbiting by genre — or by the year you found them — drag, spin, and click your way through your own musical universe.',
  },
  {
    icon: Radar,
    title: 'Insights Spotify hides',
    body: 'Obscurity score, era map, taste evolution, ride-or-die artists, binge sessions — computed live from your listening.',
  },
  {
    icon: Clock3,
    title: 'Any time, any range',
    body: 'Four weeks, six months, or all time — switch instantly, no year-end wait, no recap countdown.',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-6 relative overflow-hidden">
        {/* 3D hero backdrop */}
        <div className="absolute inset-0 opacity-80">
          <LazyHeroScene className="w-full h-full" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6 md:space-y-7 pointer-events-none">
          <LogoMark className="w-14 h-14 md:w-16 md:h-16 rounded-[26%] shadow-xl shadow-primary/30 animate-scale-in" />

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance animate-fade-slide-up">
            Your Spotify, <span className="text-primary">in 3D</span>
          </h1>

          <p
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed animate-fade-slide-up"
            style={{ animationDelay: '0.1s' }}
          >
            Statify turns your listening history into an explorable universe — orbiting genre
            galaxies, a cover-flow album wall, and insights Spotify never shows you.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2 animate-fade-slide-up pointer-events-auto"
            style={{ animationDelay: '0.2s' }}
          >
            <Button asChild size="lg" className="text-base sm:text-lg px-8 h-12 sm:h-14 font-semibold">
              <Link href="/auth">Connect Spotify</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base sm:text-lg px-8 h-12 sm:h-14 font-semibold">
              <Link href="/demo">Try the Demo</Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="text-base sm:text-lg px-8 h-12 sm:h-14 font-semibold">
              <Link href="/upload">Upload your data</Link>
            </Button>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto mt-10 md:mt-12 px-4">
          {FEATURES.map(({ icon: Icon, title, body }, i) => (
            <div
              key={title}
              className="bg-card/80 backdrop-blur border border-border rounded-lg p-5 space-y-2 animate-fade-slide-up"
              style={{ animationDelay: `${0.3 + i * 0.1}s` }}
            >
              <Icon className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-base sm:text-lg text-card-foreground">{title}</h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        <div className="relative z-10 mt-8 animate-fade-slide-up" style={{ animationDelay: '0.6s' }}>
          <UsageStats />
        </div>

        <p className="relative z-10 mt-6 pb-16 text-xs text-muted-foreground">
          Read-only access &middot; your data never leaves your session
        </p>

        <SiteFooter />
      </div>
    </div>
  )
}
