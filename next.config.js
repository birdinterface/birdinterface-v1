/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'avatar.vercel.sh',
      'lh3.googleusercontent.com',
    ],
  },
  reactStrictMode: true,
  experimental: {
    serverActions: true,
  },
  // ... other config options
}

module.exports = nextConfig 