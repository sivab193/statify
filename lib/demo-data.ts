// Hand-crafted demo profile: an indie/psych listener with enough variety to
// light up every insight card. Loaded lazily by StatsProvider in demo mode.
import type {
  RecentPlay,
  SpotifyArtistLite,
  SpotifyTrackLite,
  StatsPayload,
  TimeRange,
} from '@/lib/types'

function artist(
  id: string,
  name: string,
  genres: string[],
  popularity: number,
  followers: number,
  imageUrl: string | null = null
): SpotifyArtistLite {
  return {
    id,
    name,
    genres,
    popularity,
    followers,
    imageUrl,
    spotifyUrl: 'https://open.spotify.com',
  }
}

function track(
  id: string,
  name: string,
  artistName: string,
  albumName: string,
  releaseDate: string,
  popularity: number,
  durationMs: number,
  albumImageUrl: string | null = null
): SpotifyTrackLite {
  return {
    id,
    name,
    artists: [artistName],
    albumName,
    albumImageUrl,
    releaseDate,
    durationMs,
    explicit: false,
    popularity,
    spotifyUrl: 'https://open.spotify.com',
  }
}

// --- Artist pool ------------------------------------------------------------

const tameImpala = artist('a1', 'Tame Impala', ['psychedelic rock', 'neo-psychedelic', 'indie rock'], 82, 6_800_000, '/tame-impala-psychedelic.jpg')
const arcticMonkeys = artist('a2', 'Arctic Monkeys', ['indie rock', 'garage rock', 'british indie'], 88, 24_500_000, '/arctic-monkeys-band.jpg')
const macDeMarco = artist('a3', 'Mac DeMarco', ['indie rock', 'slacker rock', 'lo-fi'], 74, 2_900_000, '/mac-demarco-musician.jpg')
const mgmt = artist('a4', 'MGMT', ['indietronica', 'neo-psychedelic', 'synthpop'], 73, 3_600_000, '/mgmt-band-alternative.jpg')
const theStrokes = artist('a5', 'The Strokes', ['indie rock', 'garage rock', 'new york indie'], 79, 7_200_000, '/the-strokes-indie-rock.jpg')
const kingGizzard = artist('a6', 'King Gizzard & The Lizard Wizard', ['psychedelic rock', 'garage psych', 'experimental'], 65, 1_100_000)
const beachHouse = artist('a7', 'Beach House', ['dream pop', 'shoegaze', 'indie pop'], 72, 2_400_000)
const boyGenius = artist('a8', 'boygenius', ['indie folk', 'indie rock'], 68, 1_300_000)
const radiohead = artist('a9', 'Radiohead', ['art rock', 'alternative rock', 'experimental'], 81, 11_800_000)
const khruangbin = artist('a10', 'Khruangbin', ['psychedelic funk', 'thai funk', 'instrumental'], 70, 1_900_000)
const stereolab = artist('a11', 'Stereolab', ['post-rock', 'krautrock', 'indietronica'], 55, 480_000)
const alvvays = artist('a12', 'Alvvays', ['indie pop', 'jangle pop', 'dream pop'], 64, 890_000)
const cocteauTwins = artist('a13', 'Cocteau Twins', ['dream pop', 'ethereal wave', 'shoegaze'], 63, 1_050_000)
const fontainesDC = artist('a14', 'Fontaines D.C.', ['post-punk', 'irish indie', 'art punk'], 69, 950_000)
const wednesday = artist('a15', 'Wednesday', ['alt-country', 'shoegaze', 'indie rock'], 52, 84_000)
const duster = artist('a16', 'Duster', ['slowcore', 'space rock', 'lo-fi'], 58, 620_000)
const cindyLee = artist('a17', 'Cindy Lee', ['hypnagogic pop', 'lo-fi', 'experimental pop'], 45, 62_000)
const brokenSocial = artist('a18', 'Broken Social Scene', ['indie rock', 'canadian indie', 'baroque pop'], 54, 510_000)
const stella = artist('a19', 'Stella Donnelly', ['indie folk', 'australian indie'], 43, 178_000)
const mkgee = artist('a20', 'Mk.gee', ['bedroom pop', 'alt-r&b', 'lo-fi'], 61, 390_000)
const feeblLittleHorse = artist('a21', 'feeble little horse', ['noise pop', 'shoegaze', 'diy'], 44, 71_000)
const jockstrap = artist('a22', 'Jockstrap', ['art pop', 'glitch pop', 'experimental'], 51, 210_000)
const laMonteYoung = artist('a23', 'Water Damage', ['drone rock', 'krautrock', 'noise'], 28, 9_400)
const totalBlue = artist('a24', 'Total Blue', ['ambient jazz', 'balearic', 'new age'], 33, 12_800)

// long_term = the canon; short_term rotates in new obsessions and drops old flames
const artists: Record<TimeRange, SpotifyArtistLite[]> = {
  long_term: [
    tameImpala, arcticMonkeys, radiohead, theStrokes, macDeMarco, mgmt,
    beachHouse, kingGizzard, cocteauTwins, brokenSocial, khruangbin, stereolab,
    duster, alvvays, boyGenius, stella,
  ],
  medium_term: [
    tameImpala, beachHouse, arcticMonkeys, khruangbin, macDeMarco, fontainesDC,
    kingGizzard, mgmt, alvvays, duster, theStrokes, wednesday, mkgee, cindyLee,
    boyGenius, feeblLittleHorse,
  ],
  // stereolab jumps from long_term #12 into the short top — a "Rising" pick
  short_term: [
    tameImpala, stereolab, mkgee, cindyLee, beachHouse, wednesday, khruangbin,
    feeblLittleHorse, arcticMonkeys, duster, jockstrap, kingGizzard, totalBlue,
    laMonteYoung, alvvays, macDeMarco,
  ],
}

// --- Track pool ---------------------------------------------------------------

const trackPool: SpotifyTrackLite[] = [
  track('t1', 'Let It Happen', 'Tame Impala', 'Currents', '2015-07-17', 84, 467_000, '/currents-tame-impala.jpg'),
  track('t2', 'The Less I Know The Better', 'Tame Impala', 'Currents', '2015-07-17', 89, 216_000, '/currents-tame-impala.jpg'),
  track('t3', 'Do I Wanna Know?', 'Arctic Monkeys', 'AM', '2013-09-09', 90, 272_000, '/arctic-monkeys-album-art.jpg'),
  track('t4', '505', 'Arctic Monkeys', 'Favourite Worst Nightmare', '2007-04-23', 88, 253_000),
  track('t5', 'Chamber Of Reflection', 'Mac DeMarco', 'Salad Days', '2014-04-01', 82, 231_000, '/mac-demarco-salad-days.jpg'),
  track('t6', 'Ode To Viceroy', 'Mac DeMarco', '2', '2012-10-16', 71, 217_000),
  track('t7', 'Electric Feel', 'MGMT', 'Oracular Spectacular', '2007-12-14', 85, 229_000, '/mgmt-oracular-spectacular.jpg'),
  track('t8', 'Little Dark Age', 'MGMT', 'Little Dark Age', '2018-02-09', 86, 299_000),
  track('t9', 'Reptilia', 'The Strokes', 'Room On Fire', '2003-10-28', 84, 219_000, '/strokes-room-on-fire.jpg'),
  track('t10', 'Someday', 'The Strokes', 'Is This It', '2001-07-30', 83, 187_000),
  track('t11', 'Space Song', 'Beach House', 'Depression Cherry', '2015-08-28', 87, 320_000),
  track('t12', 'Myth', 'Beach House', 'Bloom', '2012-05-15', 79, 418_000),
  track('t13', 'Weightless', 'Radiohead', 'In Rainbows', '2007-10-10', 76, 263_000),
  track('t14', 'Let Down', 'Radiohead', 'OK Computer', '1997-05-21', 81, 299_000),
  track('t15', 'Texas Sun', 'Khruangbin', 'Texas Sun', '2020-02-07', 72, 252_000),
  track('t16', 'Robot Stop', 'King Gizzard & The Lizard Wizard', 'Nonagon Infinity', '2016-04-29', 62, 274_000),
  track('t17', 'Cherry-coloured Funk', 'Cocteau Twins', 'Heaven or Las Vegas', '1990-09-17', 68, 193_000),
  track('t18', 'Anthems For A Seventeen Year-Old Girl', 'Broken Social Scene', 'You Forgot It in People', '2002-10-15', 63, 275_000),
  track('t19', 'French Disko', 'Stereolab', 'Refried Ectoplasm', '1995-07-24', 55, 205_000),
  track('t20', 'Inside Out', 'Duster', 'Stratosphere', '1998-02-24', 60, 194_000),
  track('t21', 'Archie, Marry Me', 'Alvvays', 'Alvvays', '2014-07-22', 74, 192_000),
  track('t22', 'Not Strong Enough', 'boygenius', 'the record', '2023-03-31', 78, 245_000),
  track('t23', 'Boys Will Be Boys', 'Stella Donnelly', 'Beware of the Dogs', '2019-03-08', 41, 205_000),
  track('t24', 'Are You Looking Up', 'Mk.gee', 'Two Star & The Dream Police', '2024-02-09', 67, 175_000),
  track('t25', 'Chosen to Deserve', 'Wednesday', 'Rat Saw God', '2023-04-07', 53, 258_000),
  track('t26', 'Freak', 'feeble little horse', 'Girl with Fish', '2023-06-09', 46, 132_000),
  track('t27', 'Concrete Over Water', 'Jockstrap', 'I Love You Jennifer B', '2022-09-09', 52, 274_000),
  track('t28', 'Diamond Jubilee', 'Cindy Lee', 'Diamond Jubilee', '2024-04-20', 48, 234_000),
  track('t29', 'In the Aeroplane Over the Sea', 'Neutral Milk Hotel', 'In the Aeroplane Over the Sea', '1998-02-10', 73, 202_000),
  track('t30', 'Pink Moon', 'Nick Drake', 'Pink Moon', '1972-02-25', 70, 125_000),
  track('t31', 'Here Comes The Sun', 'The Beatles', 'Abbey Road', '1969-09-26', 91, 185_000),
  track('t32', 'Dreams', 'Fleetwood Mac', 'Rumours', '1977-02-04', 90, 257_000),
  track('t33', 'Age of Consent', 'New Order', 'Power, Corruption & Lies', '1983-05-02', 69, 328_000),
  track('t34', 'This Must Be The Place', 'Talking Heads', 'Speaking in Tongues', '1983-06-01', 82, 296_000),
  track('t35', 'Just Like Honey', 'The Jesus and Mary Chain', 'Psychocandy', '1985-11-18', 71, 179_000),
  track('t36', 'Fade Into You', 'Mazzy Star', 'So Tonight That I Might See', '1993-09-27', 83, 295_000),
  track('t37', 'Starburned and Unkissed', 'Caroline Polachek', 'I Saw the TV Glow OST', '2024-05-24', 58, 289_000),
  track('t38', 'Romantic Piano', 'Girl Ray', 'Prestige', '2023-08-04', 39, 213_000),
]

function reorder(pool: SpotifyTrackLite[], order: number[]): SpotifyTrackLite[] {
  return order.map((i) => pool[i])
}

const tracks: Record<TimeRange, SpotifyTrackLite[]> = {
  // Recent taste: new discoveries up top, classics still hanging on
  short_term: reorder(trackPool, [27, 23, 36, 24, 25, 10, 0, 26, 37, 14, 19, 28, 33, 21, 4, 16, 35, 7, 1, 20, 11, 2, 32, 13, 30]),
  medium_term: reorder(trackPool, [10, 0, 23, 1, 4, 21, 14, 24, 7, 2, 35, 11, 19, 25, 16, 27, 3, 33, 8, 31, 12, 17, 5, 36, 29]),
  long_term: reorder(trackPool, [1, 2, 0, 4, 10, 6, 8, 3, 13, 9, 11, 16, 30, 31, 17, 5, 12, 18, 19, 33, 34, 20, 35, 28, 29]),
}

// --- Recent plays: a night-owl week -------------------------------------------

// (daysAgo, startHour, trackCount) — evening/night heavy for the Listening Clock
const sessionTemplates: [number, number, number][] = [
  [0, 22, 14],
  [1, 21, 9],
  [1, 13, 5],
  [2, 23, 11],
  [2, 8, 4],
  [3, 20, 7],
]

function buildRecent(): RecentPlay[] {
  const plays: RecentPlay[] = []
  const source = tracks.short_term
  let cursor = 0

  for (const [daysAgo, startHour, count] of sessionTemplates) {
    const start = new Date()
    start.setDate(start.getDate() - daysAgo)
    start.setHours(startHour, 12, 0, 0)

    for (let i = 0; i < count; i++) {
      const t = source[cursor % source.length]
      cursor++
      const playedAt = new Date(start.getTime() + i * (t.durationMs + 15_000))
      plays.push({
        trackId: t.id,
        trackName: t.name,
        artistName: t.artists[0],
        albumImageUrl: t.albumImageUrl,
        durationMs: t.durationMs,
        playedAt: playedAt.toISOString(),
      })
    }
  }

  return plays
    .sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime())
    .slice(0, 50)
}

export function buildDemoStats(): StatsPayload {
  return {
    user: {
      id: 'demo',
      displayName: 'Demo Listener',
      imageUrl: null,
      followers: 42,
    },
    artists,
    tracks,
    recent: buildRecent(),
  }
}
