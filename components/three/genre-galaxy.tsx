'use client'

import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, OrbitControls, Stars } from '@react-three/drei'
import type { Group } from 'three'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink, X } from 'lucide-react'
import { SceneCanvas, useImageTexture } from './scene-canvas'
import { useStats } from '@/components/providers/stats-provider'
import { useCan3D, useReducedMotion } from '@/lib/use-preferences'
import { GENRE_COLORS, GENRE_OTHER_COLOR, formatCount } from '@/components/charts/chart-theme'
import type { SpotifyArtistLite } from '@/lib/types'

const MAX_ARTISTS = 20
const CLUSTER_COUNT = 5

interface GalaxyArtist {
  artist: SpotifyArtistLite
  rank: number
  cluster: number // index into clusters array
  angle: number
  y: number
}

interface Cluster {
  genre: string
  color: string
}

function buildGalaxy(artists: SpotifyArtistLite[]) {
  const top = artists.slice(0, MAX_ARTISTS)

  const genreWeight = new Map<string, number>()
  top.forEach((artist, i) => {
    for (const genre of artist.genres) {
      genreWeight.set(genre, (genreWeight.get(genre) ?? 0) + (top.length - i))
    }
  })
  const topGenres = [...genreWeight.entries()]
    .sort(([, a], [, b]) => b - a)
    .slice(0, CLUSTER_COUNT)
    .map(([genre]) => genre)

  const clusters: Cluster[] = topGenres.map((genre, i) => ({
    genre,
    color: GENRE_COLORS[i],
  }))
  clusters.push({ genre: 'other', color: GENRE_OTHER_COLOR })

  const perCluster = new Map<number, number>()
  const nodes: GalaxyArtist[] = top.map((artist, i) => {
    const clusterIdx = (() => {
      for (const genre of artist.genres) {
        const idx = topGenres.indexOf(genre)
        if (idx !== -1) return idx
      }
      return clusters.length - 1
    })()
    const n = perCluster.get(clusterIdx) ?? 0
    perCluster.set(clusterIdx, n + 1)
    return {
      artist,
      rank: i + 1,
      cluster: clusterIdx,
      // golden-angle spread keeps neighbors apart without randomness
      angle: n * 2.399963 + clusterIdx * 1.1,
      y: (((i * 37) % 11) - 5) * 0.14,
    }
  })

  return { clusters, nodes }
}

function ArtistSphere({
  node,
  position,
  color,
  onSelect,
  selected,
}: {
  node: GalaxyArtist
  position: [number, number, number]
  color: string
  onSelect: (artist: SpotifyArtistLite | null) => void
  selected: boolean
}) {
  const texture = useImageTexture(node.artist.imageUrl)
  const [hovered, setHovered] = useState(false)
  const radius = 0.24 + 0.4 * ((MAX_ARTISTS - node.rank + 1) / MAX_ARTISTS)

  return (
    <mesh
      position={position}
      scale={hovered || selected ? 1.18 : 1}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = 'auto'
      }}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(node.artist)
      }}
    >
      <sphereGeometry args={[radius, 32, 32]} />
      {/* key-swap: adding a map to an already-compiled material is ignored by three */}
      <meshStandardMaterial
        key={texture ? 'textured' : 'plain'}
        map={texture ?? undefined}
        color={texture ? '#ffffff' : color}
        roughness={0.5}
        metalness={0.1}
        emissive={hovered || selected ? color : '#000000'}
        emissiveIntensity={hovered || selected ? 0.35 : 0}
      />
      {(hovered || selected) && (
        <Html center distanceFactor={9} position={[0, radius + 0.35, 0]} style={{ pointerEvents: 'none' }}>
          <div className="px-2 py-1 rounded-md bg-popover/90 border border-border text-popover-foreground text-xs whitespace-nowrap">
            #{node.rank} {node.artist.name}
          </div>
        </Html>
      )}
    </mesh>
  )
}

function ClusterRing({
  clusterIdx,
  color,
  nodes,
  onSelect,
  selectedId,
}: {
  clusterIdx: number
  color: string
  nodes: GalaxyArtist[]
  onSelect: (artist: SpotifyArtistLite | null) => void
  selectedId: string | null
}) {
  const group = useRef<Group>(null)
  const reducedMotion = useReducedMotion()
  const radius = 2.1 + clusterIdx * 1.25
  const speed = (clusterIdx % 2 === 0 ? 1 : -1) * (0.05 + clusterIdx * 0.012)

  useFrame((_, delta) => {
    if (reducedMotion || !group.current) return
    group.current.rotation.y += speed * delta
  })

  return (
    <group ref={group}>
      {nodes.map((node) => (
        <ArtistSphere
          key={node.artist.id}
          node={node}
          position={[Math.cos(node.angle) * radius, node.y, Math.sin(node.angle) * radius]}
          color={color}
          onSelect={onSelect}
          selected={selectedId === node.artist.id}
        />
      ))}
    </group>
  )
}

function GalaxyScene({
  clusters,
  nodes,
  onSelect,
  selectedId,
}: {
  clusters: Cluster[]
  nodes: GalaxyArtist[]
  onSelect: (artist: SpotifyArtistLite | null) => void
  selectedId: string | null
}) {
  const reducedMotion = useReducedMotion()
  return (
    <>
      <ambientLight intensity={0.9} />
      <pointLight position={[0, 6, 0]} intensity={60} color="#ffffff" />
      <pointLight position={[6, -4, 6]} intensity={25} color="#4dd07a" />
      <Stars radius={60} depth={30} count={1500} factor={3} saturation={0} fade speed={reducedMotion ? 0 : 0.6} />
      {clusters.map((cluster, i) => (
        <ClusterRing
          key={cluster.genre}
          clusterIdx={i}
          color={cluster.color}
          nodes={nodes.filter((n) => n.cluster === i)}
          onSelect={onSelect}
          selectedId={selectedId}
        />
      ))}
      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={16}
        autoRotate={!reducedMotion}
        autoRotateSpeed={0.35}
        onStart={() => onSelect(null)}
      />
    </>
  )
}

export default function GenreGalaxy() {
  const { artists } = useStats()
  const can3D = useCan3D()
  const { clusters, nodes } = useMemo(() => buildGalaxy(artists), [artists])
  const [selected, setSelected] = useState<SpotifyArtistLite | null>(null)

  if (!can3D || nodes.length === 0) return null

  return (
    <Card className="p-6 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Genre Galaxy</h2>
          <p className="text-xs text-muted-foreground">
            Your top {Math.min(artists.length, MAX_ARTISTS)} artists orbiting by genre — drag to
            explore, click a planet for details
          </p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {clusters.map((cluster) => (
            <span key={cluster.genre} className="flex items-center gap-1.5 text-xs capitalize text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cluster.color }} />
              {cluster.genre}
            </span>
          ))}
        </div>
      </div>

      <div className="relative">
        <SceneCanvas className="h-[440px] rounded-lg overflow-hidden bg-background/60" camera={{ position: [0, 4.5, 9], fov: 50 }}>
          <GalaxyScene
            clusters={clusters}
            nodes={nodes}
            onSelect={setSelected}
            selectedId={selected?.id ?? null}
          />
        </SceneCanvas>

        {selected && (
          <div className="absolute top-3 right-3 w-60 rounded-lg border border-border bg-popover/95 backdrop-blur p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold leading-tight">{selected.name}</p>
              <button
                onClick={() => setSelected(null)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground capitalize">
              {selected.genres.slice(0, 3).join(' · ') || 'genre unknown'}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatCount(selected.followers)} followers · popularity {selected.popularity}/100
            </p>
            <Button asChild size="sm" variant="outline" className="w-full gap-2">
              <a href={selected.spotifyUrl} target="_blank" rel="noreferrer">
                Open in Spotify <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
