// Spotify API configuration and helper functions
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize'
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'
const SPOTIFY_API_URL = 'https://api.spotify.com/v1'

// Required scopes for reading user data
export const SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-top-read',
  'user-read-recently-played',
].join(' ')

export interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  scope: string
}

function basicAuthHeader() {
  return `Basic ${Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString('base64')}`
}

async function tokenRequest(body: URLSearchParams): Promise<TokenResponse> {
  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: basicAuthHeader(),
    },
    body,
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data.access_token) {
    throw new Error(
      `Spotify token request failed (${response.status}): ${JSON.stringify(data)}`
    )
  }
  return data as TokenResponse
}

export function buildAuthorizeUrl(params: {
  redirectUri: string
  state: string
  codeChallenge: string
}) {
  const query = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    response_type: 'code',
    redirect_uri: params.redirectUri,
    scope: SCOPES,
    state: params.state,
    code_challenge_method: 'S256',
    code_challenge: params.codeChallenge,
  })
  return `${SPOTIFY_AUTH_URL}?${query.toString()}`
}

export function exchangeCode(code: string, redirectUri: string, codeVerifier: string) {
  return tokenRequest(
    new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    })
  )
}

export function refreshAccessToken(refreshToken: string) {
  return tokenRequest(
    new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    })
  )
}

// Spotify API calls
export async function spotifyFetch<T = unknown>(
  endpoint: string,
  accessToken: string,
  retried = false
): Promise<T> {
  const response = await fetch(`${SPOTIFY_API_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (response.status === 429 && !retried) {
    const retryAfter = Number(response.headers.get('Retry-After') ?? '1')
    await new Promise((resolve) => setTimeout(resolve, Math.min(retryAfter, 5) * 1000))
    return spotifyFetch<T>(endpoint, accessToken, true)
  }

  if (!response.ok) {
    throw new Error(`Spotify API error: ${response.status} on ${endpoint}`)
  }

  return response.json() as Promise<T>
}
