import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'
import { refreshAccessToken, type TokenResponse } from '@/lib/spotify'

/**
 * The OAuth redirect URI must be byte-identical in the authorize and
 * token-exchange steps, so both derive it from this single helper.
 * APP_URL wins (stable behind proxies). Otherwise derive from the
 * forwarded/host headers — request.nextUrl.origin normalizes to the
 * server's bind hostname (e.g. `localhost` when the browser is on
 * `127.0.0.1`), which would break the redirect-URI match and cookies.
 */
export function resolveOrigin(request: NextRequest) {
  const fromEnv = process.env.APP_URL?.replace(/\/$/, '')
  if (fromEnv) return fromEnv

  const host =
    request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  if (!host) return request.nextUrl.origin

  const proto =
    request.headers.get('x-forwarded-proto') ??
    request.nextUrl.protocol.replace(':', '')
  return `${proto}://${host}`
}

export const COOKIE_ACCESS = 'spotify_access_token'
export const COOKIE_REFRESH = 'spotify_refresh_token'
export const COOKIE_AUTH_STATE = 'spotify_auth_state'
export const COOKIE_PKCE_VERIFIER = 'spotify_pkce_verifier'

const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

// Structural type so this works with both `await cookies()` (route handlers)
// and `response.cookies` (NextResponse)
interface CookieWriter {
  set(
    name: string,
    value: string,
    options?: {
      httpOnly?: boolean
      secure?: boolean
      sameSite?: 'lax' | 'strict' | 'none'
      path?: string
      maxAge?: number
    }
  ): unknown
  delete(name: string): unknown
}

function baseOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  } as const
}

export function setTokenCookies(store: CookieWriter, tokens: TokenResponse) {
  store.set(COOKIE_ACCESS, tokens.access_token, {
    ...baseOptions(),
    // Refresh slightly before Spotify's expiry to avoid using a just-expired token
    maxAge: Math.max(tokens.expires_in - 60, 60),
  })
  if (tokens.refresh_token) {
    store.set(COOKIE_REFRESH, tokens.refresh_token, {
      ...baseOptions(),
      maxAge: REFRESH_TOKEN_MAX_AGE,
    })
  }
}

export function clearTokenCookies(store: CookieWriter) {
  store.delete(COOKIE_ACCESS)
  store.delete(COOKIE_REFRESH)
}

/**
 * Returns a usable access token, refreshing (and persisting the refreshed
 * token as cookies) when the access-token cookie has expired.
 * Only call from Route Handlers or Server Actions — cookie writes are
 * not allowed during server-component rendering.
 */
export async function getValidAccessToken(): Promise<string | null> {
  const store = await cookies()

  const accessToken = store.get(COOKIE_ACCESS)?.value
  if (accessToken) return accessToken

  const refreshToken = store.get(COOKIE_REFRESH)?.value
  if (!refreshToken) return null

  try {
    const tokens = await refreshAccessToken(refreshToken)
    setTokenCookies(store, tokens)
    return tokens.access_token
  } catch (error) {
    console.error('Failed to refresh Spotify access token:', error)
    return null
  }
}
