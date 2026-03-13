'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/reports', label: 'Gunluk Raporlar', icon: '📋' },
  { href: '/jobs', label: 'İş İlanları', icon: '💼' },
  { href: '/sources', label: 'Kaynaklar', icon: '🔗' },
  { href: '/companies', label: 'Firmalar', icon: '🏢' },
  { href: '/sectors', label: 'Sektörler', icon: '🏭' },
  { href: '/locations', label: 'Lokasyonlar', icon: '📍' },
  { href: '/plans', label: 'Planlar', icon: '💎' },
  { href: '/crawl-logs', label: 'Crawl Logları', icon: '📋' },
  { href: '/analytics', label: 'Analitikler', icon: '📈' },
  { href: '/settings', label: 'Ayarlar', icon: '⚙️' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-blue-600">MaviYaka.iş</h1>
        <p className="text-xs text-gray-500">Admin Panel</p>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
