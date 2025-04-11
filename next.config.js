/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
      },
      {
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  reactStrictMode: true,
  experimental: {
    serverActions: true,
  },
  // ... other config options
}

module.exports = nextConfig 