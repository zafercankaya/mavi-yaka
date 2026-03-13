import type { MarketConfig } from '@/data/markets';
import type { UIStrings } from '@/data/ui-strings';

interface Props {
  config: MarketConfig;
  strings: UIStrings;
}

const FEATURE_ICONS = [
  // Brands
  <svg key="brands" viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  // Countries
  <svg key="countries" viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
  // Notifications
  <svg key="notif" viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  // Categories
  <svg key="categories" viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
];

export default function Features({ strings }: Props) {
  const features = [
    { icon: FEATURE_ICONS[0], title: strings.brandsCount, desc: strings.brandsDesc },
    { icon: FEATURE_ICONS[1], title: strings.countriesCount, desc: strings.countriesDesc },
    { icon: FEATURE_ICONS[2], title: strings.smartNotifications, desc: strings.smartNotificationsDesc },
    { icon: FEATURE_ICONS[3], title: strings.categoriesCount, desc: strings.categoriesDesc },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white" id="features">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          {strings.features}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className="flex gap-4 p-6 rounded-2xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/50 transition-colors"
            >
              <div className="text-orange-500 shrink-0">{feature.icon}</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
