import Link from 'next/link';
import { MARKETS } from '@/data/markets';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Mavi Yaka',
  description: 'Blue-collar job aggregator covering 31 countries with 670,000+ listings in warehouse, factory, construction, logistics, and security sectors.',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Android, iOS',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Mavi Yaka
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Blue-Collar Jobs in 31 Countries
          </p>
          <p className="text-lg text-gray-500">
            670,000+ warehouse, factory, construction, logistics & security jobs
          </p>
        </div>

        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Choose your country
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {MARKETS.map((market) => (
            <Link
              key={market.slug}
              href={`/${market.slug}`}
              className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <span className="text-3xl">{market.flag}</span>
              <div>
                <p className="font-medium text-gray-900">{market.countryName}</p>
                <p className="text-sm text-gray-500">{market.appName}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
