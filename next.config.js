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
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't include postgres module on the client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'perf_hooks': false,
        'pg-native': false,
      };
    }
    return config;
  },
  // ... other config options
}

module.exports = nextConfig 