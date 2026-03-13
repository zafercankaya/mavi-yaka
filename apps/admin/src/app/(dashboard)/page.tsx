'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';
import { useMarket } from '@/lib/market';

interface DashboardStats {
  totalUsers: number;
  activeFollows: number;
  activeCampaigns: number;
  expiredCampaigns: number;
  hiddenCampaigns: number;
  totalCampaigns: number;
  todayCampaigns: number;
  weekCampaigns: number;
  totalBrands: number;
  totalCategories: number;
  totalSources: number;
  totalFavorites: number;
  recentCrawls: Array<{
    id: string;
    status: string;
    campaignsFound: number;
    campaignsNew: number;
    campaignsUpdated: number;
    createdAt: string;
    source: { name: string; brand: { name: string } };
  }>;
}

interface TopBrand {
  id: string;
  name: string;
  logoUrl: string | null;
  activeCampaigns: number;
  followers: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topBrands, setTopBrands] = useState<TopBrand[]>([]);
  const { market } = useMarket();

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, brandsRes] = await Promise.all([
          apiFetch<{ data: DashboardStats }>(`/admin/dashboard/stats?market=${market}`),
          apiFetch<{ data: TopBrand[] }>(`/admin/dashboard/top-brands?market=${market}`),
        ]);
        setStats(statsRes.data);
        setTopBrands(brandsRes.data);
      } catch (err) {
        console.error('Dashboard load error:', err);
      }
    }
    load();
  }, [market]);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Aktif Kampanyalar" value={stats.activeCampaigns} icon="🎯" color="text-green-600" />
        <StatCard title="Toplam Kampanya" value={stats.totalCampaigns} icon="📢" />
        <StatCard title="Markalar" value={stats.totalBrands} icon="🏷️" />
        <StatCard title="Kullanicilar" value={stats.totalUsers} icon="👥" color="text-blue-600" />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="Kategoriler" value={stats.totalCategories} icon="📂" color="text-purple-600" />
        <StatCard title="Bugun Eklenen" value={stats.todayCampaigns} icon="📅" color="text-orange-500" />
        <StatCard title="Bu Hafta" value={stats.weekCampaigns} icon="📆" />
        <StatCard title="Takipler" value={stats.activeFollows} icon="❤️" color="text-red-500" />
        <StatCard title="Favoriler" value={stats.totalFavorites} icon="⭐" color="text-yellow-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Brands */}
        <Card>
          <CardHeader>
            <CardTitle>En Populer Markalar</CardTitle>
          </CardHeader>
          <CardContent>
            {topBrands.length === 0 ? (
              <p className="text-gray-500 text-sm">Henuz marka yok.</p>
            ) : (
              <div className="space-y-3">
                {topBrands.map((brand, i) => (
                  <div
                    key={brand.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-400 w-5">{i + 1}</span>
                      {brand.logoUrl ? (
                        <img src={brand.logoUrl} alt={brand.name} className="w-8 h-8 rounded object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600">
                          {brand.name[0]}
                        </div>
                      )}
                      <span className="font-medium text-sm">{brand.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{brand.activeCampaigns} kampanya</span>
                      <span>{brand.followers} takipci</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Crawls */}
        <Card>
          <CardHeader>
            <CardTitle>Son Crawl Islemleri</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentCrawls.length === 0 ? (
              <p className="text-gray-500 text-sm">Henuz crawl islemi yok.</p>
            ) : (
              <div className="space-y-3">
                {stats.recentCrawls.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                  >
                    <div>
                      <p className="font-medium text-sm">{log.source.name}</p>
                      <p className="text-xs text-gray-500">{log.source.brand.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">
                        {log.campaignsFound} bulundu, {log.campaignsNew} yeni
                      </span>
                      <StatusBadge status={log.status} />
                      <span className="text-xs text-gray-400">
                        {new Date(log.createdAt).toLocaleString('tr-TR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Campaign Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Kampanya Durumlari</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-gray-600">Aktif: <strong>{stats.activeCampaigns}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              <span className="text-sm text-gray-600">Suresi Dolmus: <strong>{stats.expiredCampaigns}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <span className="text-sm text-gray-600">Gizli: <strong>{stats.hiddenCampaigns}</strong></span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: string; color?: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className={`text-3xl font-bold ${color || ''}`}>{value}</p>
          </div>
          <span className="text-3xl">{icon}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    SUCCESS: 'bg-green-100 text-green-700',
    PARTIAL: 'bg-yellow-100 text-yellow-700',
    FAILED: 'bg-red-100 text-red-700',
    RUNNING: 'bg-blue-100 text-blue-700',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}
