/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack configuration
  turbopack: {},

  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    optimizePackageImports: ['@onflow/fcl', 'framer-motion'],
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.vercel.com',
      },
      {
        protocol: 'https',
        hostname: 'flow.com',
      },
      {
        protocol: 'https',
        hostname: 'quicknode.com',
      },
      {
        protocol: 'https',
        hostname: 'moonpay.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Compression and optimization
  compress: true,

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/app',
        destination: '/dashboard',
        permanent: true,
      },
    ];
  },

  // Environment variables for client
  env: {
    NEXT_PUBLIC_APP_ENV: process.env.NODE_ENV,
  },



  // TypeScript strict mode
  typescript: {
    tsconfigPath: './tsconfig.json',
  },

  // Output configuration for Vercel
  output: 'standalone',
};

module.exports = nextConfig;