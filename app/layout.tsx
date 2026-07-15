import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  metadataBase: new URL('https://sst.siv19.dev'),
  title: 'Statify — Your Spotify, Visualized',
  description:
    'Explore your Spotify listening in 3D: genre galaxies, era maps, listening clocks, and insights Spotify never shows you. Or upload your data export for an all-time recap — no login required.',
  applicationName: 'Statify',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'Statify — Your Spotify, Visualized',
    description:
      'Your Spotify listening in 3D — genre galaxies, listening clocks, and a shareable all-time recap from your data export. No login required.',
    url: 'https://sst.siv19.dev',
    siteName: 'Statify',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Statify — Your Spotify, Visualized',
    description: 'Your Spotify listening in 3D, plus a shareable all-time recap from your data export.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
