'use client'

// next/dynamic with ssr:false must live in a client component (Next 15+);
// server pages import the scenes from here.
import dynamic from 'next/dynamic'
import { CardSkeleton } from '@/components/dashboard/card-skeleton'

export const LazyHeroScene = dynamic(() => import('./hero-scene'), {
  ssr: false,
  loading: () => <div className="w-full h-full" aria-hidden />,
})

export const LazyGenreGalaxy = dynamic(() => import('./genre-galaxy'), {
  ssr: false,
  loading: () => <CardSkeleton className="h-[520px]" />,
})

export const LazyAlbumWall = dynamic(() => import('./album-wall'), {
  ssr: false,
  loading: () => <CardSkeleton className="h-[440px]" />,
})
