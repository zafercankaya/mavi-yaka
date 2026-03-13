import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MARKETS, MARKET_MAP } from '@/data/markets';
import { UI_STRINGS } from '@/data/ui-strings';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import DownloadCTA from '@/components/DownloadCTA';
import Footer from '@/components/Footer';

import trListing from '@/data/store-listing/tr.json';
import enListing from '@/data/store-listing/en.json';
import deListing from '@/data/store-listing/de.json';
import frListing from '@/data/store-listing/fr.json';
import itListing from '@/data/store-listing/it.json';
import ptListing from '@/data/store-listing/pt.json';
import esListing from '@/data/store-listing/es.json';
import idListing from '@/data/store-listing/id.json';
import ruListing from '@/data/store-listing/ru.json';
import jaListing from '@/data/store-listing/ja.json';
import thListing from '@/data/store-listing/th.json';
import arListing from '@/data/store-listing/ar.json';
import koListing from '@/data/store-listing/ko.json';
import viListing from '@/data/store-listing/vi.json';
import plListing from '@/data/store-listing/pl.json';
import msListing from '@/data/store-listing/ms.json';
import nlListing from '@/data/store-listing/nl.json';
import urListing from '@/data/store-listing/ur.json';
import svListing from '@/data/store-listing/sv.json';

const LISTINGS: Record<string, { title: string; shortDescription: string; fullDescription: string }> = {
  tr: trListing, en: enListing, de: deListing, fr: frListing, it: itListing,
  pt: ptListing, es: esListing, id: idListing, ru: ruListing, ja: jaListing,
  th: thListing, ar: arListing, ko: koListing, vi: viListing, pl: plListing,
  ms: msListing, nl: nlListing, ur: urListing, sv: svListing,
};

interface Props {
  params: Promise<{ market: string }>;
}

export async function generateStaticParams() {
  return MARKETS.map(m => ({ market: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { market: slug } = await params;
  const config = MARKET_MAP[slug];
  if (!config) return {};

  const listing = LISTINGS[config.storeListingFile];
  const BASE_URL = 'https://kampanyasepeti.com';

  return {
    title: `${config.appName} - ${listing.shortDescription}`,
    description: listing.shortDescription,
    keywords: config.seoKeywords.join(', '),
    openGraph: {
      title: config.appName,
      description: listing.shortDescription,
      type: 'website',
      locale: config.locale,
      url: `${BASE_URL}/${slug}`,
      siteName: config.appName,
      images: [{ url: `${BASE_URL}/images/og-image.png`, width: 1200, height: 630, alt: config.appName }],
    },
    twitter: {
      card: 'summary_large_image',
      title: config.appName,
      description: listing.shortDescription,
    },
    alternates: {
      canonical: `${BASE_URL}/${slug}`,
      languages: Object.fromEntries(
        MARKETS.map(m => [m.locale, `${BASE_URL}/${m.slug}`])
      ),
    },
    other: {
      'google-play-app': 'app-id=com.kampanyasepeti.app',
    },
  };
}

export default async function MarketPage({ params }: Props) {
  const { market: slug } = await params;
  const config = MARKET_MAP[slug];
  if (!config) notFound();

  const listing = LISTINGS[config.storeListingFile];
  const strings = UI_STRINGS[config.language] || UI_STRINGS.en;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: config.appName,
    description: listing.shortDescription,
    applicationCategory: 'ShoppingApplication',
    operatingSystem: 'Android, iOS',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang="${config.language}";document.documentElement.dir="${config.dir}";`,
        }}
      />
      <main className="min-h-screen bg-white">
        <Hero config={config} listing={listing} strings={strings} />
        <Features config={config} strings={strings} />
        <DownloadCTA config={config} strings={strings} />
        <Footer config={config} strings={strings} markets={MARKETS} />
      </main>
    </>
  );
}
