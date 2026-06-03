import type { Metadata, Viewport } from 'next';
import { DM_Sans, Instrument_Serif, JetBrains_Mono, Noto_Sans_Hebrew, Heebo } from 'next/font/google';
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

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  variable: '--font-heebo',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Trippy - Friendly Trip Planner',
  description: 'AI-powered collaborative trip planner with hour-by-hour itinerary planning.',
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
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#F4EFE8',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const locale = (cookieStore.get('trippy-locale')?.value === 'he') ? 'he' : 'en';
  const dir = locale === 'he' ? 'rtl' : 'ltr';

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      style={{ height: '100%' }}
      className={`${dmSans.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} ${hebrewFont.variable} ${heebo.variable}`}
    >
      <head>
        {/* Inline script: apply dark-mode token BEFORE first paint so there is no theme flash.
            Reads themeMode from the Zustand-persist key in localStorage and applies data-dark
            to <html> synchronously. suppressHydrationWarning on <html> silences the mismatch. */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var s=localStorage.getItem('trippy-storage');var m=s?JSON.parse(s)?.state?.themeMode:null;var dark=m==='dark'||(m!=='light'&&window.matchMedia('(prefers-color-scheme:dark)').matches);if(dark)document.documentElement.dataset.dark='true';}catch(e){}})();` }} />
      </head>
      <body className="grain" style={{ height: '100%' }}>
        <MotionProvider>
          {children}
        </MotionProvider>
        <Analytics />
      </body>
    </html>
  );
}
