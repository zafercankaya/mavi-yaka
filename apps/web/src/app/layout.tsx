import type { Metadata } from 'next';
import { MARKETS } from '@/data/markets';
import './globals.css';

const BASE_URL = 'https://mavi-yaka-web.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Mavi Yaka - Blue-Collar Jobs in 31 Countries | 670,000+ Listings',
    template: '%s | Mavi Yaka',
  },
  description: 'Find blue-collar jobs across 31 countries. 670,000+ warehouse, factory, construction, logistics, and security jobs updated daily. Free on iOS and Android.',
  keywords: ['blue collar jobs', 'warehouse jobs', 'factory jobs', 'construction jobs', 'logistics jobs', 'security jobs', 'manual labor jobs', 'trade jobs'],
  openGraph: {
    type: 'website',
    siteName: 'Mavi Yaka',
    title: 'Mavi Yaka - Blue-Collar Jobs in 31 Countries',
    description: 'Find blue-collar jobs across 31 countries. 670,000+ warehouse, factory, construction, logistics, and security jobs.',
    url: BASE_URL,
    images: [{ url: '/images/og-image.png', width: 1200, height: 630, alt: 'Mavi Yaka - Blue Collar Jobs' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mavi Yaka - Blue-Collar Jobs in 31 Countries',
    description: 'Find blue-collar jobs across 31 countries. 670,000+ listings updated daily.',
  },
  alternates: {
    canonical: BASE_URL,
    languages: {
      'x-default': BASE_URL,
      ...Object.fromEntries(MARKETS.map(m => [m.locale, `${BASE_URL}/${m.slug}`])),
    },
  },
  other: {
    'google-play-app': 'app-id=com.maviyaka.app',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
