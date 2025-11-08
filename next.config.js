/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure images for local and external covers
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'covers.openlibrary.org',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/covers/**',
      },
      {
        protocol: 'https',
        hostname: '**', // Allow any HTTPS domain for production (Railway)
        pathname: '/api/covers/**',
      }
    ]
  }
}

module.exports = nextConfig