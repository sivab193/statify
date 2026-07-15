/// <reference lib="webworker" />
// Runs off the main thread: unzips the Spotify export, parses the audio
// history JSON, and normalizes it into compact plays. Nothing here touches the
// network — the user's data never leaves the browser. Aggregation happens on
// the main thread so filter changes recompute instantly.
import { unzipSync, strFromU8 } from 'fflate'
import { normalize } from './aggregate'
import type { RawPlay, WorkerRequest, WorkerResponse } from './types'

const ctx = self as unknown as DedicatedWorkerGlobalScope

function post(message: WorkerResponse) {
  ctx.postMessage(message)
}

/** Only the audio history files carry track plays. */
function isAudioHistory(name: string): boolean {
  const base = name.split('/').pop() ?? name
  return /streaming_history_audio.*\.json$/i.test(base)
}

ctx.onmessage = (event: MessageEvent<WorkerRequest>) => {
  try {
    const { files } = event.data
    const jsonBlobs: string[] = []

    files.forEach((file, i) => {
      const bytes = new Uint8Array(file.buffer)
      if (file.name.toLowerCase().endsWith('.zip')) {
        post({ type: 'progress', stage: 'Unzipping export…', percent: 10 })
        const entries = unzipSync(bytes, { filter: (f) => isAudioHistory(f.name) })
        for (const [, data] of Object.entries(entries)) {
          if (data.length) jsonBlobs.push(strFromU8(data))
        }
      } else if (isAudioHistory(file.name)) {
        jsonBlobs.push(strFromU8(bytes))
      }
      post({
        type: 'progress',
        stage: 'Reading files…',
        percent: 20 + Math.round(((i + 1) / files.length) * 30),
      })
    })

    if (jsonBlobs.length === 0) {
      post({
        type: 'error',
        message:
          'No streaming history found. Upload the ZIP from Spotify, or the Streaming_History_Audio_*.json files inside it.',
      })
      return
    }

    post({ type: 'progress', stage: 'Parsing plays…', percent: 60 })
    const rows: RawPlay[] = []
    for (const blob of jsonBlobs) {
      const parsed = JSON.parse(blob)
      if (Array.isArray(parsed)) rows.push(...(parsed as RawPlay[]))
    }

    post({ type: 'progress', stage: 'Crunching numbers…', percent: 85 })
    const { plays, meta } = normalize(rows)

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
