import { Button } from '@/components/ui/button'
import { Orbit, Radar, Clock3 } from 'lucide-react'
import Link from 'next/link'
import { LazyHeroScene } from '@/components/three/lazy'
import { LogoMark } from '@/components/brand/logo'
import { UsageStats } from '@/components/usage-stats'

const FEATURES = [
  {
    icon: Orbit,
    title: 'Genre Galaxy',
    body: 'Your top artists as planets orbiting by genre — drag, spin, and click your way through your own musical universe.',
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

        <footer className="w-full fixed bottom-0 left-0 right-0 z-50 bg-[#070913]/90 backdrop-blur-md border-t border-white/10 py-3.5 px-4 md:px-8">
          <div className="w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-center">
            <p className="text-xs md:text-sm text-slate-400 text-center">
              Build • Automate • Open Source
            </p>
            <div className="flex flex-row items-center justify-center gap-4 text-xs md:text-sm">
              <a
                href="https://siv19.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-indigo-400 font-medium transition"
              >
                siv19.dev
              </a>
              <a
                href="https://github.com/sivab193"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-slate-400 hover:text-indigo-400 transition"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/sivab193/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-slate-400 hover:text-indigo-400 transition"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/siv19.dev/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-slate-400 hover:text-indigo-400 transition"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
