# Statify — Your Spotify, in 3D

A Spotify stats dashboard that turns your listening history into an explorable universe:
a **Genre Galaxy** of your top artists as orbiting planets, a cover-flow **Album Wall**,
and insight cards Spotify never shows you.

Live at **https://sy.siv19.dev** · try it without an account at `/demo`.

## Features

- **Genre Galaxy** — top 20 artists as image-textured planets clustered into orbital rings by genre (three.js / react-three-fiber). Drag to explore, click a planet for details.
- **Album Wall** — cover-flow of your top tracks with floor reflections; arrow keys to browse.
- **Insights Spotify hides**:
  - *Mainstream Meter* — obscurity score from track popularity
  - *Era Explorer* — decade histogram + your "musical center of gravity"
  - *Listening Clock* — radial 24-hour dial of your recent plays (Night Owl / Early Bird)
  - *Taste Evolution* — new obsessions, rising, steady, and old flames (short vs. long term)
  - *Genre DNA* — rank-weighted genre shares + Shannon-entropy diversity score
  - *Ride or Die* — artists in your top list across every time range
  - *Session Patterns* — binge detection from recently-played gaps
  - *Underground Finds* — your artists with the fewest followers
- Instant time-range switching (4 weeks / 6 months / all time) — one aggregate fetch, zero refetches.
- Full demo mode with bundled sample data — no Spotify account needed.
- 2D fallbacks and reduced-motion support; 3D scenes are skipped on mobile/no-WebGL.

## Setup

1. Create an app at the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and register **both** redirect URIs:
   - `https://sy.siv19.dev/api/auth/callback` (production)
   - `http://127.0.0.1:3000/api/auth/callback` (local dev — Spotify rejects `localhost`, so develop at `http://127.0.0.1:3000`)
2. Copy `.env.example` to `.env.local` and fill in `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET`.
   In production also set `APP_URL=https://sy.siv19.dev`.
3. ```bash
   pnpm install
   pnpm dev
   ```
   Open **http://127.0.0.1:3000** (not `localhost` — the OAuth redirect URI and cookies must match).

## Architecture notes

- **OAuth**: authorization code + PKCE, built server-side (`app/api/auth/login`) with a `state` CSRF check; tokens live in httpOnly cookies; `lib/session.ts#getValidAccessToken` transparently refreshes and persists.
- **Data**: one aggregate route (`app/api/spotify/stats`) fans out 7 Spotify calls (top artists/tracks × 3 ranges + recently played) and returns a slim payload; `StatsProvider` fetches it once and serves every card.
- **Insights**: pure functions in `lib/insights.ts`, computed client-side per time range (shared by live and demo mode).
- **3D**: `components/three/*`, dynamically imported with `ssr: false`, with adaptive DPR and a performance monitor that drops reflections under load.
