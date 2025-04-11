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
    serverActions: {
      // You can add configuration options here if needed
      // For now, an empty object enables it with defaults
    },
  },
  // ... other config options
}

module.exports = nextConfig 