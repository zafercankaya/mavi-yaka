import type { Metadata } from 'next';
import { MARKETS } from '@/data/markets';
import './globals.css';

const BASE_URL = 'https://maviyaka.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Deal Box - Deals & Discounts from 5,000+ Brands in 31 Countries',
    template: '%s | Deal Box',
  },
  description: 'Track deals, coupons, and discounts from over 5,000 brands across 31 countries. Free download on iOS and Android.',
  keywords: ['deals', 'coupons', 'discounts', 'offers', 'promo codes', 'sales', 'cashback', 'deal app'],
  openGraph: {
    type: 'website',
    siteName: 'Deal Box',
    title: 'Deal Box - Deals & Discounts from 5,000+ Brands',
    description: 'Track deals, coupons, and discounts from over 5,000 brands across 31 countries.',
    url: BASE_URL,
    images: [{ url: '/images/og-image.png', width: 1200, height: 630, alt: 'Deal Box' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Deal Box - Deals & Discounts from 5,000+ Brands',
    description: 'Track deals, coupons, and discounts from over 5,000 brands across 31 countries.',
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
