/** @type {import('next').NextConfig} */
const nextConfig = {
  // Local dev runs at 127.0.0.1 (Spotify rejects `localhost` redirect URIs);
  // Next 16.2+ blocks cross-origin dev assets unless the host is allowed.
  allowedDevOrigins: ['127.0.0.1'],
  images: {
    unoptimized: true,
  },
}

export default nextConfig
