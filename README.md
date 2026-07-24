# Statify — Your Spotify, in 3D

Turn your Spotify listening into an explorable universe: an **Artist Galaxy** of your
top artists as orbiting planets, a cover-flow **Album Wall**, and insight cards Spotify
never shows you — plus an **in-browser data-export mode** that computes your all-time
recap with no login at all.

**Live at [sst.siv19.dev](https://sst.siv19.dev)** · try it without an account at `/demo`.

## One dashboard, three sources

Sign-in, demo, and ZIP-export mode all render the **same dashboard**: the same 3D scenes,
the same card layout, and a share-as-image button on every card. Each source fills the
common view model (`lib/unified/`) with what it can answer, and cards it can't answer
simply don't appear — the API knows genres, popularity and artwork; the export knows
every play you ever made.

| | Sign in / Demo | ZIP export |
|---|---|---|
| Artist Galaxy rings | by genre | by the year you discovered the artist |
| Album Wall covers | real artwork | generated sleeves (drawn locally) |
| Top artists / tracks / albums, Listening Clock, Session Patterns, Taste Evolution, Ride or Die, DNA + meter card, highlights, sharing | ✅ | ✅ |
| Genre DNA · Mainstream Meter · Era Explorer · Underground Finds | ✅ | — |
| Total hours · streaks · record day · yearly & monthly trends · seasons · devices · countries · Artist DNA · Obsession Meter · Repeat Offenders | — | ✅ |

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

## Feature highlights

- **Artist Galaxy** — top 20 artists as image-textured planets clustered into orbital rings (three.js / react-three-fiber). Drag to explore, click a planet for details.
- **Album Wall** — cover-flow of your top albums with floor reflections; arrow keys to browse.
- **Insights Spotify hides**: Mainstream Meter (obscurity), Era Explorer (decade histogram),
  Listening Clock, Taste Evolution, Genre DNA (Shannon-entropy diversity), Ride or Die,
  Session Patterns, Underground Finds.
- Instant time-range switching (4 weeks / 6 months / all time) — one aggregate fetch, zero refetches.
- Full demo mode with bundled sample data — no Spotify account needed.
- 2D fallbacks and reduced-motion support; 3D scenes are skipped on mobile/no-WebGL.

## Setup

1. Create an app at the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and register **both** redirect URIs:
   - `https://sst.siv19.dev/api/auth/callback` (production)
   - `http://127.0.0.1:3000/api/auth/callback` (local dev — Spotify rejects `localhost`, so develop at `http://127.0.0.1:3000`)
2. Copy `.env.example` to `.env.local` and fill in `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET`.
   In production also set `APP_URL=https://sst.siv19.dev`.
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
- **One view model**: `lib/unified/types.ts` describes every card the dashboard can draw; `from-spotify.ts` and `from-local.ts` adapt each source into it, leaving unanswerable sections `null`. `components/stats/*` renders that model and nothing else, so both paths get the same cards, layout and share buttons for free.
- **Live data**: one aggregate route (`app/api/spotify/stats`) fans out 7 Spotify calls (top artists/tracks × 3 ranges + recently played) and returns a slim payload; `RemoteStatsProvider` fetches it once and serves every card.
- **Upload data**: a Web Worker (`lib/streaming-history/worker.ts`) unzips (fflate) and normalizes plays off-thread; `LocalStatsProvider` re-aggregates on every filter change via `aggregate()` (`lib/streaming-history/aggregate.ts`). Share cards are drawn on a canvas (`lib/share-card.ts`) so the app's oklch theme never breaks the PNG export.
- **Insights**: pure functions in `lib/insights.ts` (API payloads) and `lib/streaming-history/aggregate.ts` (exports), computed client-side.
- **3D**: `components/three/*`, dynamically imported with `ssr: false`, with adaptive DPR and a performance monitor that drops reflections under load.
- **Brand**: logo mark in `components/brand/logo.tsx` / `public/icon.svg`.
