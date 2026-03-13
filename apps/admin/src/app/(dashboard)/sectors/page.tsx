'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';
import { useMarket } from '@/lib/market';

interface SectorStat {
  sector: string;
  companyCount: number;
  activeJobCount: number;
}

const SECTORS: { key: string; name: string; icon: string }[] = [
  { key: 'RETAIL', name: 'Perakende', icon: '🛒' },
  { key: 'LOGISTICS_TRANSPORTATION', name: 'Lojistik & Ulaşım', icon: '🚛' },
  { key: 'FOOD_BEVERAGE', name: 'Gıda & İçecek', icon: '🍽️' },
  { key: 'MANUFACTURING', name: 'Üretim & İmalat', icon: '🏭' },
  { key: 'CONSTRUCTION', name: 'İnşaat', icon: '🏗️' },
  { key: 'SECURITY_SERVICES', name: 'Güvenlik Hizmetleri', icon: '🛡️' },
  { key: 'HOSPITALITY_TOURISM', name: 'Otelcilik & Turizm', icon: '🏨' },
  { key: 'HEALTHCARE', name: 'Sağlık', icon: '🏥' },
  { key: 'CLEANING', name: 'Temizlik', icon: '🧹' },
  { key: 'ECOMMERCE_CARGO', name: 'E-Ticaret & Kargo', icon: '📦' },
  { key: 'AGRICULTURE', name: 'Tarım', icon: '🌾' },
  { key: 'MINING_ENERGY', name: 'Madencilik & Enerji', icon: '⛏️' },
  { key: 'AUTOMOTIVE', name: 'Otomotiv', icon: '🚗' },
  { key: 'TEXTILE', name: 'Tekstil', icon: '🧵' },
  { key: 'EDUCATION', name: 'Eğitim', icon: '🎓' },
  { key: 'CALL_CENTER', name: 'Çağrı Merkezi', icon: '📞' },
  { key: 'TECHNOLOGY', name: 'Teknoloji & Yazılım', icon: '💻' },
  { key: 'OTHER', name: 'Diğer', icon: '📋' },
];

export default function SectorsPage() {
  const { market } = useMarket();
  const [stats, setStats] = useState<Record<string, SectorStat>>({});
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<{ data: SectorStat[] }>(
        `/admin/sectors/stats?market=${market}`,
      );
      const map: Record<string, SectorStat> = {};
      for (const s of res.data) {
        map[s.sector] = s;
      }
      setStats(map);
    } catch {
      // API failed — show sectors with 0 counts
      setStats({});
    } finally {
      setLoading(false);
    }
  }, [market]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const totalCompanies = Object.values(stats).reduce((sum, s) => sum + s.companyCount, 0);
  const totalJobs = Object.values(stats).reduce((sum, s) => sum + s.activeJobCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sektörler</h1>
          <p className="text-sm text-gray-500 mt-1">
            Prisma enum olarak tanımlı sektör listesi (salt okunur).
            {!loading && (
              <span className="ml-2 text-gray-700 font-medium">
                Toplam: {totalCompanies} firma, {totalJobs} aktif ilan
              </span>
            )}
          </p>
        </div>
        <span className="text-sm text-gray-400">
          {SECTORS.length} sektör
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 18 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SECTORS.map((sector) => {
            const stat = stats[sector.key];
            const companyCount = stat?.companyCount ?? 0;
            const activeJobCount = stat?.activeJobCount ?? 0;

            return (
              <Card key={sector.key}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-50 border flex items-center justify-center text-2xl">
                      {sector.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm">{sector.name}</h3>
                      <p className="text-xs text-gray-400 font-mono truncate">{sector.key}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-blue-600 font-medium">
                          {companyCount} firma
                        </span>
                        <span className="text-xs text-emerald-600 font-medium">
                          {activeJobCount} aktif ilan
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
