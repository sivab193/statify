// Tiny counter backed by Vercel KV / Upstash Redis over their REST API. Reads
// its config from the env vars a Vercel KV integration injects
// (`KV_REST_API_URL` + `KV_REST_API_TOKEN`). When those are absent — e.g. no
// store attached yet — every call resolves to null so callers degrade to
// "no data" instead of erroring. No fake numbers are ever invented.

const URL_ENV = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
const TOKEN_ENV = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN

export const COUNTER_KEYS = {
  visits: 'statify:visits',
  connected: 'statify:connected',
  uploads: 'statify:uploads',
} as const

export type CounterName = keyof typeof COUNTER_KEYS

export function counterConfigured(): boolean {
  return Boolean(URL_ENV && TOKEN_ENV)
}

async function command<T>(path: string): Promise<T | null> {
  if (!URL_ENV || !TOKEN_ENV) return null
  try {
    const res = await fetch(`${URL_ENV}/${path}`, {
      headers: { Authorization: `Bearer ${TOKEN_ENV}` },
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = (await res.json()) as { result: T }
    return data.result
  } catch {
    return null
  }
}

/** Atomically increment a counter; returns the new value, or null if unconfigured. */
export function incr(name: CounterName): Promise<number | null> {
  return command<number>(`incr/${encodeURIComponent(COUNTER_KEYS[name])}`)
}

/** Read all counters at once. Missing keys come back as 0; unconfigured → null. */
export async function readAll(): Promise<Record<CounterName, number> | null> {
  const keys = Object.values(COUNTER_KEYS).map(encodeURIComponent).join('/')
  const result = await command<(string | null)[]>(`mget/${keys}`)
  if (!result) return null
  const [visits, connected, uploads] = result.map((v) => Number(v ?? 0))
  return { visits, connected, uploads }
}
