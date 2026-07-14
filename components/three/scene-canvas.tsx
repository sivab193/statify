'use client'

import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, Preload } from '@react-three/drei'
import { useEffect, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { hasWebGL, useIsMobile, useReducedMotion } from '@/lib/use-preferences'

interface SceneCanvasProps {
  children: ReactNode
  className?: string
  /** Rendered instead of the canvas when WebGL is unavailable or on mobile */
  fallback?: ReactNode
  camera?: { position: [number, number, number]; fov?: number }
}

export function SceneCanvas({ children, className, fallback = null, camera }: SceneCanvasProps) {
  const reducedMotion = useReducedMotion()
  const isMobile = useIsMobile()
  // Decide after mount so SSR markup never disagrees with the client
  const [webgl, setWebgl] = useState<boolean | null>(null)
  useEffect(() => setWebgl(hasWebGL()), [])

  if (webgl === null) return <div className={className} aria-hidden />
  if (!webgl || isMobile) return <>{fallback}</>

  return (
    <div className={cn('relative', className)}>
      <Canvas
        className="absolute inset-0"
        dpr={[1, 1.75]}
        camera={camera}
        frameloop={reducedMotion ? 'demand' : 'always'}
        gl={{ antialias: true, powerPreference: 'high-performance', alpha: true }}
      >
        <AdaptiveDpr pixelated />
        {children}
        <Preload all />
      </Canvas>
    </div>
  )
}

/** Loads an image as a THREE texture without suspending; null while loading or on CORS failure. */
export function useImageTexture(url: string | null) {
  const [texture, setTexture] = useState<import('three').Texture | null>(null)

  useEffect(() => {
    if (!url) return
    let disposed = false
    let loaded: import('three').Texture | null = null
    import('three').then(({ TextureLoader, SRGBColorSpace }) => {
      if (disposed) return
      new TextureLoader().load(
        url,
        (tex) => {
          tex.colorSpace = SRGBColorSpace
          loaded = tex
          if (!disposed) setTexture(tex)
        },
        undefined,
        () => {
          /* CORS or network failure — caller falls back to a solid color */
        }
      )
    })
    return () => {
      disposed = true
      loaded?.dispose()
      setTexture(null)
    }
  }, [url])

  return texture
}
