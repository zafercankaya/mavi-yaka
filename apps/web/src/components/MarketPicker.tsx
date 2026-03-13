import Link from 'next/link';
import type { MarketConfig } from '@/data/markets';

interface Props {
  markets: MarketConfig[];
}

export default function MarketPicker({ markets }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {markets.map((market) => (
        <Link
          key={market.slug}
          href={`/${market.slug}`}
          className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-orange-400 hover:bg-orange-50 transition-colors"
        >
          <span className="text-3xl">{market.flag}</span>
          <div>
            <p className="font-medium text-gray-900">{market.countryName}</p>
            <p className="text-sm text-gray-500">{market.appName}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
