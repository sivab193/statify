'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshReflectorMaterial, PerformanceMonitor } from '@react-three/drei'
import { easing } from 'maath'
import type { Group } from 'three'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { SceneCanvas, useImageTexture } from './scene-canvas'
import { useStats } from '@/components/providers/stats-provider'
import { useCan3D, useReducedMotion } from '@/lib/use-preferences'
import type { SpotifyTrackLite } from '@/lib/types'

const COVER_COUNT = 12
const SPACING = 1.2
const SIDE_GAP = 0.55
const SIDE_TILT = 1.0

function Cover({
  track,
  index,
  focusIndex,
  onFocus,
}: {
  track: SpotifyTrackLite
  index: number
  focusIndex: number
  onFocus: (index: number) => void
}) {
  const texture = useImageTexture(track.albumImageUrl)
  const group = useRef<Group>(null)
  const reducedMotion = useReducedMotion()
  const focused = index === focusIndex

  useFrame((_, delta) => {
    if (!group.current) return
    const offset = index - focusIndex
    const side = Math.sign(offset)
    const target: [number, number, number] = [
      offset * SPACING + side * SIDE_GAP,
      focused ? 0.22 : 0,
      focused ? 1.1 : 0,
    ]
    const rotation: [number, number, number] = [0, focused ? 0 : -side * SIDE_TILT, 0]
    const scale = focused ? 1.45 : 1

    if (reducedMotion) {
      group.current.position.set(...target)
      group.current.rotation.set(...rotation)
      group.current.scale.setScalar(scale)
    } else {
      easing.damp3(group.current.position, target, 0.22, delta)
      easing.dampE(group.current.rotation, rotation, 0.22, delta)
      easing.damp3(group.current.scale, [scale, scale, scale], 0.22, delta)
    }
  })

  return (
    <group ref={group}>
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          if (focused) {
            window.open(track.spotifyUrl, '_blank', 'noopener')
          } else {
            onFocus(index)
          }
        }}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <planeGeometry args={[1.5, 1.5]} />
        {/* key-swap: adding a map to an already-compiled material is ignored by three */}
        <meshStandardMaterial
          key={texture ? 'textured' : 'plain'}
          map={texture ?? undefined}
          color={texture ? '#ffffff' : '#2b2b28'}
          roughness={0.4}
          metalness={0.05}
        />
      </mesh>
    </group>
  )
}

function WallScene({
  tracks,
  focusIndex,
  onFocus,
}: {
  tracks: SpotifyTrackLite[]
  focusIndex: number
  onFocus: (index: number) => void
}) {
  const [reflections, setReflections] = useState(true)

  return (
    <PerformanceMonitor onDecline={() => setReflections(false)}>
      <ambientLight intensity={1.4} />
      <pointLight position={[0, 4, 4]} intensity={50} />
      <group position={[0, 0.1, 0]}>
        {tracks.map((track, i) => (
          <Cover key={track.id} track={track} index={i} focusIndex={focusIndex} onFocus={onFocus} />
        ))}
      </group>
      {reflections && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.0, 0]}>
          <planeGeometry args={[40, 40]} />
          <MeshReflectorMaterial
            blur={[280, 80]}
            resolution={512}
            mixBlur={1}
            mixStrength={22}
            roughness={1}
            depthScale={1.1}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.3}
            color="#0b0b09"
            metalness={0.6}
            mirror={0.75}
          />
        </mesh>
      )}
    </PerformanceMonitor>
  )
}

export default function AlbumWall() {
  const { tracks } = useStats()
  const can3D = useCan3D()
  const covers = useMemo(() => {
    // Prefer covers with actual artwork; pad with the rest if scarce
    const withArt = tracks.filter((t) => t.albumImageUrl)
    const pool = withArt.length >= 5 ? withArt : tracks
    return pool.slice(0, COVER_COUNT)
  }, [tracks])
  const [focusIndex, setFocusIndex] = useState(0)

  const move = useCallback(
    (delta: number) => {
      setFocusIndex((i) => Math.min(Math.max(i + delta, 0), covers.length - 1))
    },
    [covers.length]
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') move(-1)
      if (e.key === 'ArrowRight') move(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [move])

  useEffect(() => {
    // Reset when the time range swaps the track list
    setFocusIndex(0)
  }, [covers])

  if (!can3D || covers.length === 0) return null
  const focused = covers[Math.min(focusIndex, covers.length - 1)]

  return (
    <Card className="p-6 space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Album Wall</h2>
        <p className="text-xs text-muted-foreground">
          Your top tracks as a cover-flow — arrow keys or the buttons to browse, click the front
          cover to open it in Spotify
        </p>
      </div>

      <div className="relative">
        <SceneCanvas className="h-[340px] rounded-lg overflow-hidden bg-background/60" camera={{ position: [0, 0.4, 4.4], fov: 45 }}>
          <WallScene tracks={covers} focusIndex={focusIndex} onFocus={setFocusIndex} />
        </SceneCanvas>

        <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-4">
          <Button
            size="icon"
            variant="outline"
            onClick={() => move(-1)}
            disabled={focusIndex === 0}
            aria-label="Previous album"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="text-center min-w-48">
            <p className="text-sm font-medium leading-tight">{focused.name}</p>
            <p className="text-xs text-muted-foreground">
              {focused.artists.join(', ')} · {focused.albumName}
            </p>
          </div>
          <Button
            size="icon"
            variant="outline"
            onClick={() => move(1)}
            disabled={focusIndex === covers.length - 1}
            aria-label="Next album"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
