/// <reference lib="webworker" />
// Runs off the main thread: unzips the Spotify export, parses the audio
// history JSON, and normalizes it into compact plays. Nothing here touches the
// network — the user's data never leaves the browser. Aggregation happens on
// the main thread so filter changes recompute instantly.
import { unzipSync, strFromU8 } from 'fflate'
import { normalize } from './aggregate'
import type {
  HistoryFormat,
  RawBasicPlay,
  RawPlay,
  WorkerRequest,
  WorkerResponse,
} from './types'

const ctx = self as unknown as DedicatedWorkerGlobalScope

function post(message: WorkerResponse) {
  ctx.postMessage(message)
}

/** Extended export: Streaming_History_Audio_2019-2020_0.json */
function isExtendedHistory(name: string): boolean {
  const base = name.split('/').pop() ?? name
  return /streaming_history_audio.*\.json$/i.test(base)
}

/**
 * Basic "Account data" export: StreamingHistory_music_0.json, or
 * StreamingHistory0.json on older exports. Podcast files use the same prefix
 * and hold no track plays, so they're excluded.
 */
function isBasicHistory(name: string): boolean {
  const base = name.split('/').pop() ?? name
  if (/podcast/i.test(base)) return false
  return /^streaminghistory(_music)?_?\d*\.json$/i.test(base)
}

function isHistory(name: string): boolean {
  return isExtendedHistory(name) || isBasicHistory(name)
}

ctx.onmessage = (event: MessageEvent<WorkerRequest>) => {
  try {
    const { files } = event.data
    const extended: string[] = []
    const basic: string[] = []

    files.forEach((file, i) => {
      const bytes = new Uint8Array(file.buffer)
      if (file.name.toLowerCase().endsWith('.zip')) {
        post({ type: 'progress', stage: 'Unzipping export…', percent: 10 })
        const entries = unzipSync(bytes, { filter: (f) => isHistory(f.name) })
        for (const [name, data] of Object.entries(entries)) {
          if (!data.length) continue
          ;(isExtendedHistory(name) ? extended : basic).push(strFromU8(data))
        }
      } else if (isHistory(file.name)) {
        ;(isExtendedHistory(file.name) ? extended : basic).push(strFromU8(bytes))
      }
      post({
        type: 'progress',
        stage: 'Reading files…',
        percent: 20 + Math.round(((i + 1) / files.length) * 30),
      })
    })

    if (extended.length === 0 && basic.length === 0) {
      post({
        type: 'error',
        message:
          'No streaming history found in that file. Make sure it’s the ZIP Spotify emailed you — the one containing Streaming_History_Audio_*.json or StreamingHistory_music_*.json.',
      })
      return
    }

    // Prefer the extended files when an export somehow carries both — they hold
    // the full history plus the context the basic ones drop.
    const format: HistoryFormat = extended.length ? 'extended' : 'basic'
    const jsonBlobs = extended.length ? extended : basic

    post({ type: 'progress', stage: 'Parsing plays…', percent: 60 })
    const rows: (RawPlay | RawBasicPlay)[] = []
    for (const blob of jsonBlobs) {
      const parsed = JSON.parse(blob)
      if (Array.isArray(parsed)) rows.push(...parsed)
    }

    post({ type: 'progress', stage: 'Crunching numbers…', percent: 85 })
    const { plays, meta } = normalize(rows as RawPlay[] | RawBasicPlay[], format)

    if (plays.length === 0) {
      post({ type: 'error', message: 'No music plays found in that export.' })
      return
    }

    post({ type: 'done', plays, meta })
  } catch (err) {
    post({
      type: 'error',
      message: err instanceof Error ? err.message : 'Could not read that file.',
    })
  }
}
