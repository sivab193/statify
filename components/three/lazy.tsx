'use client'

// next/dynamic with ssr:false must live in a client component (Next 15+);
// server pages import the scenes from here.
import dynamic from 'next/dynamic'
import { CardSkeleton } from '@/components/stats/card-skeleton'

export const LazyHeroScene = dynamic(() => import('./hero-scene'), {
  ssr: false,
  loading: () => <div className="h-full w-full" aria-hidden />,
})

export const LazyArtistGalaxy = dynamic(() => import('./artist-galaxy'), {
  ssr: false,
  loading: () => <CardSkeleton className="h-[520px]" />,
})

export const LazyAlbumWall = dynamic(() => import('./album-wall'), {
  ssr: false,
  loading: () => <CardSkeleton className="h-[440px]" />,
})
