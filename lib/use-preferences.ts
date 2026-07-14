'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'

function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false
  )
}

export function useReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

export function useIsMobile() {
  return useMediaQuery('(max-width: 767px)')
}

/**
 * Whether to render a 3D scene at all: false on mobile or without WebGL,
 * null until mounted (SSR-safe — render nothing while null).
 */
export function useCan3D(): boolean | null {
  const isMobile = useIsMobile()
  const [webgl, setWebgl] = useState<boolean | null>(null)
  useEffect(() => setWebgl(hasWebGL()), [])
  return webgl === null ? null : webgl && !isMobile
}

let webglSupport: boolean | null = null

export function hasWebGL(): boolean {
  if (typeof window === 'undefined') return false
  if (webglSupport === null) {
    try {
      const canvas = document.createElement('canvas')
      webglSupport = !!(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
    } catch {
      webglSupport = false
    }
  }
  return webglSupport
}
