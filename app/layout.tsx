import type { Metadata, Viewport } from 'next';
import { DM_Sans, Instrument_Serif, JetBrains_Mono, Assistant } from 'next/font/google';
import { cookies } from 'next/headers';
import { Analytics } from '@vercel/analytics/next';
import MotionProvider from './components/MotionProvider';
import ServiceWorkerRegistrar from './components/ServiceWorkerRegistrar';
import SplashRemover from './components/SplashRemover';
import './globals.css';

const SPLASH_CSS = `
#trippy-splash {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: oklch(98% 0.010 75);
  transition: opacity 0.5s cubic-bezier(0.25,0,0,1);
}
html[data-dark="true"] #trippy-splash {
  background: oklch(10% 0.008 55);
}
#trippy-splash-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  opacity: 0;
  animation: ts-in 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.08s forwards;
}
@keyframes ts-in {
  from { opacity: 0; transform: translateY(10px); filter: blur(5px); }
  to   { opacity: 1; transform: translateY(0);    filter: blur(0);   }
}
#trippy-splash svg {
  width: 88px;
  height: 88px;
  overflow: visible;
}
#trippy-compass-needle {
  transform-box: fill-box;
  transform-origin: center;
  animation: ts-seek 3s ease-in-out infinite;
}
@keyframes ts-seek {
  0%, 100% { transform: rotate(-14deg); }
  50%       { transform: rotate(14deg); }
}
#trippy-compass-ring {
  stroke: oklch(13% 0.012 55);
}
#trippy-compass-hub {
  fill: oklch(13% 0.012 55);
}
html[data-dark="true"] #trippy-compass-ring {
  stroke: oklch(86% 0.012 75);
}
html[data-dark="true"] #trippy-compass-hub {
  fill: oklch(86% 0.012 75);
}
#trippy-splash-eyebrow {
  font-family: ui-monospace, 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: oklch(42% 0.092 155);
  margin: 0;
}
#trippy-splash-tag {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 16px;
  font-style: italic;
  color: oklch(28% 0.018 55);
  margin: 0;
  line-height: 1.4;
  text-align: center;
}
html[data-dark="true"] #trippy-splash-eyebrow {
  color: oklch(76% 0.095 155);
}
html[data-dark="true"] #trippy-splash-tag {
  color: oklch(82% 0.010 75);
}
`;

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  axes: ['opsz'],
  weight: 'variable',
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  style: ['normal', 'italic'],
  weight: '400',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  // Used only for small eyebrow/mono labels - no need to block first paint on it.
  preload: false,
  weight: ['400', '500', '600'],
});

const assistant = Assistant({
  subsets: ['hebrew', 'latin'],
  variable: '--font-friendly',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://letsexploring.com'),
  title: {
    default: 'Trippy - Free Group Trip Planner | Plan Together',
    template: '%s | Trippy',
  },
  description: 'Plan your group trip for free - shared itinerary, interactive map, group budget, and packing list. Invite friends in seconds.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Trippy',
  },
  openGraph: {
    title: 'Trippy - Free Group Trip Planner',
    description: 'Plan your group trip for free - shared itinerary, interactive map, group budget, and packing list.',
    url: 'https://letsexploring.com',
    siteName: 'Trippy',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Trippy - Group Trip Planner' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trippy - Free Group Trip Planner',
    description: 'Plan your group trip for free - shared itinerary, interactive map, group budget, and packing list.',
    images: ['/og-image.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F4EFE8' },
    { media: '(prefers-color-scheme: dark)', color: '#0E0B09' },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const locale = (cookieStore.get('Trippy-locale')?.value === 'he') ? 'he' : 'en';
  const dir = locale === 'he' ? 'rtl' : 'ltr';
  // Read resolved dark value from cookie so the server renders the correct theme
  // on every page load - prevents the flash without any client-side script.
  // AppShell's useEffect writes this cookie whenever the resolved theme changes.
  const darkCookie = cookieStore.get('Trippy-dark')?.value;
  const isDark = darkCookie === 'true';
  // Explicitly set data-dark="false" when the user has chosen light so the
  // prefers-color-scheme:dark media query in globals.css doesn't override it.
  const darkAttr = isDark ? 'true' : darkCookie === 'false' ? 'false' : undefined;

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      data-dark={darkAttr}
      style={{ height: '100%' }}
      className={`${dmSans.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} ${assistant.variable}`}
    >
      <head>
        {/* eslint-disable-next-line react/no-danger */}
        <style dangerouslySetInnerHTML={{ __html: SPLASH_CSS }} />
      </head>
      <body className="grain" style={{ minHeight: '100%' }}>
        <div id="trippy-splash" aria-hidden="true">
          <div id="trippy-splash-inner">
            <svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle id="trippy-compass-ring" cx="120" cy="120" r="92" fill="none" strokeWidth="4" />
              <g id="trippy-compass-needle">
                <path d="M120 36 L138 120 L120 124 L102 120 Z" fill="#C4714A" />
                <path d="M120 204 L102 120 L120 116 L138 120 Z" fill="#3B6E52" />
                <path d="M204 120 L120 102 L116 120 L120 138 Z" fill="#C8944A" />
                <path d="M36 120 L120 138 L124 120 L120 102 Z" fill="#C8944A" opacity="0.55" />
              </g>
              <circle id="trippy-compass-hub" cx="120" cy="120" r="6" />
            </svg>
            <p id="trippy-splash-eyebrow">Trippy</p>
            <p id="trippy-splash-tag">Together, the easy way.</p>
          </div>
        </div>
        <SplashRemover />
        <MotionProvider>
          {children}
        </MotionProvider>
        <ServiceWorkerRegistrar />
        <Analytics />
      </body>
    </html>
  );
}
