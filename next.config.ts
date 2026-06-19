import type { NextConfig } from "next";

// CSP is set per-request in middleware.ts (with a per-request nonce for
// strict-dynamic). Only non-CSP security headers live here.
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control',  value: 'on' },
  { key: 'X-Frame-Options',          value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options',   value: 'nosniff' },
  { key: 'Referrer-Policy',          value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',       value: 'camera=(), microphone=(), geolocation=(self)' },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: [
      'framer-motion',
      '@supabase/supabase-js',
      '@supabase/ssr',
      'zustand',
      'zod',
      'clsx',
      'tailwind-merge',
    ],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        // Immutable cache for Next.js static assets (hashed filenames)
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Long cache for public static files (fonts, icons, manifest, sw)
        source: '/(.*\\.(?:svg|png|ico|webp|avif|woff2?|ttf|otf))',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        // Security headers on all routes
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
