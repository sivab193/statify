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
import { GENRE_COLORS, GENRE_OTHER_COLOR } from '@/components/charts/chart-theme'
import type { UnifiedArtist } from '@/lib/unified/types'

const MAX_ARTISTS = 20
const CLUSTER_COUNT = 5

interface GalaxyNode {
  artist: UnifiedArtist
  cluster: number
  angle: number
  y: number
}

interface Cluster {
  label: string
  color: string
}

/**
 * Rings come from whatever the source clusters by — genre on the API path,
 * discovery era on the export path. Anything outside the top rings shares one.
 */
function buildGalaxy(artists: UnifiedArtist[]) {
  const top = artists.slice(0, MAX_ARTISTS)

  const weight = new Map<string, number>()
  top.forEach((artist, i) => {
    weight.set(artist.cluster, (weight.get(artist.cluster) ?? 0) + (top.length - i))
  })

  const ranked = [...weight.entries()]
    .sort(([, a], [, b]) => b - a)
    .slice(0, CLUSTER_COUNT)
    .map(([label]) => label)

  const clusters: Cluster[] = ranked.map((label, i) => ({ label, color: GENRE_COLORS[i] }))
  if (top.some((a) => !ranked.includes(a.cluster)) || clusters.length === 0) {
    clusters.push({ label: 'everything else', color: GENRE_OTHER_COLOR })
  }

  const perCluster = new Map<number, number>()
  const nodes: GalaxyNode[] = top.map((artist, i) => {
    const found = ranked.indexOf(artist.cluster)
    const cluster = found === -1 ? clusters.length - 1 : found
    const n = perCluster.get(cluster) ?? 0
    perCluster.set(cluster, n + 1)
    return {
      artist,
      cluster,
      // golden-angle spread keeps neighbors apart without randomness
      angle: n * 2.399963 + cluster * 1.1,
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
  node: GalaxyNode
  position: [number, number, number]
  color: string
  onSelect: (artist: UnifiedArtist | null) => void
  selected: boolean
}) {
  const texture = useImageTexture(node.artist.imageUrl)
  const [hovered, setHovered] = useState(false)
  const radius = 0.24 + 0.4 * ((MAX_ARTISTS - node.artist.rank + 1) / MAX_ARTISTS)

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
        <Html
          center
          distanceFactor={9}
          position={[0, radius + 0.35, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div className="whitespace-nowrap rounded-md border border-border bg-popover/90 px-2 py-1 text-xs text-popover-foreground">
            #{node.artist.rank} {node.artist.name}
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
  selectedKey,
}: {
  clusterIdx: number
  color: string
  nodes: GalaxyNode[]
  onSelect: (artist: UnifiedArtist | null) => void
  selectedKey: string | null
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
          key={node.artist.key}
          node={node}
          position={[Math.cos(node.angle) * radius, node.y, Math.sin(node.angle) * radius]}
          color={color}
          onSelect={onSelect}
          selected={selectedKey === node.artist.key}
        />
      ))}
    </group>
  )
}

function GalaxyScene({
  clusters,
  nodes,
  onSelect,
  selectedKey,
}: {
  clusters: Cluster[]
  nodes: GalaxyNode[]
  onSelect: (artist: UnifiedArtist | null) => void
  selectedKey: string | null
}) {
  const reducedMotion = useReducedMotion()
  return (
    <>
      <ambientLight intensity={0.9} />
      <pointLight position={[0, 6, 0]} intensity={60} color="#ffffff" />
      <pointLight position={[6, -4, 6]} intensity={25} color="#4dd07a" />
      <Stars
        radius={60}
        depth={30}
        count={1500}
        factor={3}
        saturation={0}
        fade
        speed={reducedMotion ? 0 : 0.6}
      />
      {clusters.map((cluster, i) => (
        <ClusterRing
          key={cluster.label}
          clusterIdx={i}
          color={cluster.color}
          nodes={nodes.filter((n) => n.cluster === i)}
          onSelect={onSelect}
          selectedKey={selectedKey}
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

export default function ArtistGalaxy() {
  const { stats } = useStats()
  const can3D = useCan3D()
  const artists = useMemo(() => stats?.artists ?? [], [stats])
  const { clusters, nodes } = useMemo(() => buildGalaxy(artists), [artists])
  const [selected, setSelected] = useState<UnifiedArtist | null>(null)

  if (!can3D || !stats || nodes.length === 0) return null

  return (
    <Card className="space-y-4 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Artist Galaxy</h2>
          <p className="text-xs text-muted-foreground">
            Your top {Math.min(artists.length, MAX_ARTISTS)} artists orbiting by{' '}
            {stats.clusterLabel.toLowerCase()} — drag to explore, click a planet for details
          </p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {clusters.map((cluster) => (
            <span
              key={cluster.label}
              className="flex items-center gap-1.5 text-xs capitalize text-muted-foreground"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: cluster.color }}
              />
              {cluster.label}
            </span>
          ))}
        </div>
      </div>

      <div className="relative">
        <SceneCanvas
          className="h-[440px] overflow-hidden rounded-lg bg-background/60"
          camera={{ position: [0, 4.5, 9], fov: 50 }}
        >
          <GalaxyScene
            clusters={clusters}
            nodes={nodes}
            onSelect={setSelected}
            selectedKey={selected?.key ?? null}
          />
        </SceneCanvas>

        {selected && (
          <div className="absolute right-3 top-3 w-60 space-y-2 rounded-lg border border-border bg-popover/95 p-4 backdrop-blur">
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold leading-tight">{selected.name}</p>
              <button
                onClick={() => setSelected(null)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs capitalize text-muted-foreground">{selected.cluster}</p>
            <p className="text-xs text-muted-foreground">
              #{selected.rank} · {selected.value}
            </p>
            <p className="text-xs text-muted-foreground">{selected.detail}</p>
            {selected.url && (
              <Button asChild size="sm" variant="outline" className="w-full gap-2">
                <a href={selected.url} target="_blank" rel="noreferrer">
                  Open in Spotify <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
