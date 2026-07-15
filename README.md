# Statify — Your Spotify, in 3D

Turn your Spotify listening into an explorable universe: a **Genre Galaxy** of your
top artists as orbiting planets, a cover-flow **Album Wall**, and insight cards Spotify
never shows you — plus an **in-browser data-export mode** that computes your all-time
recap with no login at all.

**Live at [s19.vercel.app](https://s19.vercel.app)** · try it without an account at `/demo`.

## Two ways in

### 1. Connect Spotify (live)
OAuth into your account for top artists/tracks/genres across three time ranges, rendered
as 3D scenes and insight cards.

### 2. Upload your data export (no login) — `/upload`
Request your **Extended Streaming History** from Spotify, drop the ZIP, and Statify parses
your *entire* play history **100% in the browser** — nothing is uploaded to any server.
This is richer than the API exposes (all-time, every play), and every stat is shareable.

- **Filters** — slice by year, device/platform, and exclude-skips; re-aggregates instantly.
- **Share as image** — canvas-rendered PNG cards (a full-page story recap plus per-tile,
  per-list, and per-item cards) that open straight into the WhatsApp / Instagram share
  sheet on mobile, or download on desktop.
- **Insights** — total hours, top artists/tracks/albums by listen time, listening clock,
  yearly & monthly trends, seasons, weekday split, your #1 artist each year, new-artist
  discovery, longest listening streak, on-repeat champion, record day, and more.

> Getting the export: **spotify.com/account/privacy → Download your data → Extended
> streaming history.** Spotify says up to 30 days, but it often arrives in a few hours.

## Live-mode features

- **Genre Galaxy** — top 20 artists as image-textured planets clustered into orbital rings by genre (three.js / react-three-fiber). Drag to explore, click a planet for details.
- **Album Wall** — cover-flow of your top tracks with floor reflections; arrow keys to browse.
- **Insights Spotify hides**: Mainstream Meter (obscurity), Era Explorer (decade histogram),
  Listening Clock, Taste Evolution, Genre DNA (Shannon-entropy diversity), Ride or Die,
  Session Patterns, Underground Finds.
- Instant time-range switching (4 weeks / 6 months / all time) — one aggregate fetch, zero refetches.
- Full demo mode with bundled sample data — no Spotify account needed.
- 2D fallbacks and reduced-motion support; 3D scenes are skipped on mobile/no-WebGL.

## Setup

1. Create an app at the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and register **both** redirect URIs:
   - `https://s19.vercel.app/api/auth/callback` (production)
   - `http://127.0.0.1:3000/api/auth/callback` (local dev — Spotify rejects `localhost`, so develop at `http://127.0.0.1:3000`)
2. Copy `.env.example` to `.env.local` and fill in `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET`.
   In production also set `APP_URL=https://s19.vercel.app`.
3. ```bash
   pnpm install
   pnpm dev
   ```
   Open **http://127.0.0.1:3000** (not `localhost` — the OAuth redirect URI and cookies must match).

> **Note:** The `/upload` mode needs no setup or credentials — it runs entirely client-side.

### Optional: usage counters

The homepage shows live visit / connection / upload counts when a **Vercel KV** (Upstash
Redis) store is attached. Add one from the Vercel dashboard (Storage → KV) and it injects
`KV_REST_API_URL` / `KV_REST_API_TOKEN` automatically. Without a store the counters simply
stay hidden — no fake numbers, no errors. See `lib/counter.ts`.

## Architecture notes

- **OAuth**: authorization code + PKCE, built server-side (`app/api/auth/login`) with a `state` CSRF check; tokens live in httpOnly cookies; `lib/session.ts#getValidAccessToken` transparently refreshes and persists.
- **Live data**: one aggregate route (`app/api/spotify/stats`) fans out 7 Spotify calls (top artists/tracks × 3 ranges + recently played) and returns a slim payload; `StatsProvider` fetches it once and serves every card.
- **Upload data**: a Web Worker (`lib/streaming-history/worker.ts`) unzips (fflate) and normalizes plays off-thread; the main thread re-aggregates on every filter change via `aggregate()` (`lib/streaming-history/aggregate.ts`). Share cards are drawn on a canvas (`lib/streaming-history/share.ts`) so the app's oklch theme never breaks the PNG export.
- **Insights**: pure functions in `lib/insights.ts` (live) and `lib/streaming-history/aggregate.ts` (upload), computed client-side.
- **3D**: `components/three/*`, dynamically imported with `ssr: false`, with adaptive DPR and a performance monitor that drops reflections under load.
- **Brand**: logo mark in `components/brand/logo.tsx` / `public/icon.svg`.
