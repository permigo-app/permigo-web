import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  compress: true,

  async headers() {
    return [
      {
        // Photos de questions et cartes de théorie : fichiers WebP figés une
        // fois générés (un nom = un contenu, jamais réécrit en place) — cache
        // longue durée, immutable. Sans ça le navigateur revalide à chaque
        // fois qu'une même image revient (examen, turbo, révision, leçon).
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
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
