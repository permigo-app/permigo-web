import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  compress: true,

  async headers() {
    return [
      {
        source: '/src/data/:path*.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },

  experimental: {
    optimizePackageImports: ['@/components/signs'],
  },
};

export default nextConfig;
