import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

// In production we drop 'unsafe-eval' to avoid AV/EDR false-positive triggers on
// eval-like webpack patterns in the compiled bundle. Next.js 14+ does not need
// eval at runtime; it only appears in dev fast-refresh.
const scriptSrc = isProd
  ? "script-src 'self' 'strict-dynamic' https://va.vercel-scripts.com"
  : "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com";

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control',  value: 'on' },
  { key: 'X-Frame-Options',          value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options',   value: 'nosniff' },
  { key: 'Referrer-Policy',          value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',       value: 'camera=(), microphone=(), geolocation=(self)' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      scriptSrc,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://maps.googleapis.com https://places.googleapis.com https://weather.googleapis.com https://api.open-meteo.com https://open.er-api.com https://maps.geoapify.com",
      "frame-src 'none'",
      "frame-ancestors 'none'",
    ].join('; '),
  },
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
