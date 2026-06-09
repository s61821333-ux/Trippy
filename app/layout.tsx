import type { Metadata, Viewport } from 'next';
import { DM_Sans, Instrument_Serif, JetBrains_Mono, Noto_Sans_Hebrew, Assistant } from 'next/font/google';
import { cookies } from 'next/headers';
import { Analytics } from '@vercel/analytics/next';
import MotionProvider from './components/MotionProvider';
import './globals.css';

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
  weight: ['400', '500', '600'],
});

const hebrewFont = Noto_Sans_Hebrew({
  subsets: ['hebrew'],
  variable: '--font-hebrew',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const assistant = Assistant({
  subsets: ['hebrew', 'latin'],
  variable: '--font-friendly',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Trippy — Free Group Trip Planner | Plan Together',
  description: 'Plan your group trip in one shared space. Live itinerary, group budget, interactive map, and packing list — all free.',
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
    title: 'Trippy — Free Group Trip Planner',
    description: 'Plan your group trip in one shared space. Live itinerary, group budget, interactive map, and packing list — all free.',
    url: 'https://trippy.app',
    siteName: 'Trippy',
    type: 'website',
    images: [{ url: 'https://trippy.app/og-image.png', width: 1200, height: 630, alt: 'Trippy — Group Trip Planner' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trippy — Free Group Trip Planner',
    description: 'Plan your group trip in one shared space. Live itinerary, group budget, interactive map, and packing list — all free.',
    images: ['https://trippy.app/og-image.png'],
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
  const locale = (cookieStore.get('trippy-locale')?.value === 'he') ? 'he' : 'en';
  const dir = locale === 'he' ? 'rtl' : 'ltr';
  // Read resolved dark value from cookie so the server renders the correct theme
  // on every page load — prevents the flash without any client-side script.
  // AppShell's useEffect writes this cookie whenever the resolved theme changes.
  const darkCookie = cookieStore.get('trippy-dark')?.value;
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
      className={`${dmSans.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} ${hebrewFont.variable} ${assistant.variable}`}
    >
      <body className="grain" style={{ minHeight: '100%' }}>
        <MotionProvider>
          {children}
        </MotionProvider>
        <Analytics />
      </body>
    </html>
  );
}
