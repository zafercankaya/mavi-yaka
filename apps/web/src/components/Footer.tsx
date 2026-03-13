import Link from 'next/link';
import type { MarketConfig } from '@/data/markets';
import type { UIStrings } from '@/data/ui-strings';

interface Props {
  config: MarketConfig;
  strings: UIStrings;
  markets: MarketConfig[];
}

export default function Footer({ config, strings, markets }: Props) {
  const otherMarkets = markets.filter(m => m.slug !== config.slug);

  return (
    <footer className="py-12 bg-gray-900 text-gray-300">
      <div className="max-w-4xl mx-auto px-4">
        <h3 className="text-lg font-semibold text-white mb-4">{strings.otherCountries}</h3>
        <div className="flex flex-wrap gap-2 mb-8">
          {otherMarkets.map((m) => (
            <Link
              key={m.slug}
              href={`/${m.slug}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors text-sm"
              title={m.countryName}
            >
              <span>{m.flag}</span>
              <span>{m.countryName}</span>
            </Link>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} {config.appName}. {strings.allRightsReserved}</p>
          <a
            href="https://mavi-yaka-api.onrender.com/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-300 transition-colors"
          >
            {strings.privacyPolicy}
          </a>
        </div>
      </div>
    </footer>
  );
}
