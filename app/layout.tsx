import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Newsreader, JetBrains_Mono, Noto_Sans_Hebrew } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import MotionProvider from './components/MotionProvider';
import './globals.css';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  axes: ['opsz'],
  weight: 'variable',
});

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  style: ['normal', 'italic'],
  axes: ['opsz'],
  weight: 'variable',
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

export const metadata: Metadata = {
  title: 'Trippy - Friendly Trip Planner',
  description: 'AI-powered collaborative trip planner with hour-by-hour itinerary planning.',
  manifest: '/manifest.json',
  icons: { icon: '/icon.svg', apple: '/apple-icon.png' },
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      style={{ height: '100%' }}
      className={`${bricolage.variable} ${newsreader.variable} ${jetbrainsMono.variable} ${hebrewFont.variable}`}
    >
      <body style={{ height: '100%' }}>
        <MotionProvider>
          {children}
        </MotionProvider>
        <Analytics />
      </body>
    </html>
  );
}
