import type { MarketConfig } from '@/data/markets';
import type { UIStrings } from '@/data/ui-strings';

interface Props {
  config: MarketConfig;
  strings: UIStrings;
}

const FEATURE_ICONS = [
  // Jobs/Briefcase
  <svg key="jobs" viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2}><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>,
  // Globe/Countries
  <svg key="countries" viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
  // Clock/Daily
  <svg key="daily" viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  // Grid/Sectors
  <svg key="sectors" viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
];

export default function Features({ strings }: Props) {
  const features = [
    { icon: FEATURE_ICONS[0], title: strings.jobsCount, desc: strings.jobsDesc },
    { icon: FEATURE_ICONS[1], title: strings.countriesCount, desc: strings.countriesDesc },
    { icon: FEATURE_ICONS[2], title: strings.dailyUpdates, desc: strings.dailyUpdatesDesc },
    { icon: FEATURE_ICONS[3], title: strings.sectorsCount, desc: strings.sectorsDesc },
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
              className="flex gap-4 p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors"
            >
              <div className="text-blue-600 shrink-0">{feature.icon}</div>
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
