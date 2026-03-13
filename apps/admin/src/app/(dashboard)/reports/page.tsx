'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiFetch } from '@/lib/api';

interface DailyReportSummary {
  id: string;
  date: string;
  totalSources: number;
  sourcesSuccess: number;
  sourcesFailed: number;
  campaignsFound: number;
  campaignsNew: number;
  campaignsUpdated: number;
  campaignsExpired: number;
  crawlDurationMs: number;
  maintenanceActions: number;
  maintenanceErrors: number;
}

interface MarketStat {
  market: string;
  sources: number;
  success: number;
  failed: number;
  found: number;
  new: number;
  updated: number;
}

interface MaintenanceTask {
  name: string;
  status: 'OK' | 'SKIPPED' | 'ERROR';
  count: number;
  duration: number;
  details?: string;
}

interface DailyReportDetail extends DailyReportSummary {
  marketStats: MarketStat[];
  maintenanceTasks: MaintenanceTask[];
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  const mins = Math.floor(ms / 60_000);
  const secs = Math.round((ms % 60_000) / 1000);
  return `${mins}dk ${secs}s`;
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function ReportsPage() {
  const [reports, setReports] = useState<DailyReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<DailyReportDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'markets' | 'maintenance'>('markets');

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<{ data: DailyReportSummary[] }>('/admin/reports/daily?limit=30');
      setReports(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setDetail(null);
      return;
    }
    setExpandedId(id);
    setActiveTab('markets');
    setDetailLoading(true);
    try {
      const res = await apiFetch<{ data: DailyReportDetail }>(`/admin/reports/daily/${id}`);
      setDetail(res.data);
    } finally {
      setDetailLoading(false);
    }
  };

  const successRate = (success: number, total: number) => {
    if (total === 0) return '-';
    return `${Math.round((success * 100) / total)}%`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gunluk Raporlar</h1>
        <Button variant="outline" onClick={load} disabled={loading}>
          {loading ? 'Yukleniyor...' : 'Yenile'}
        </Button>
      </div>

      {/* Summary cards */}
      {reports.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-gray-500">Bugunun Yeni Kampanyalari</p>
              <p className="text-2xl font-bold text-green-600">{reports[0]?.campaignsNew ?? '-'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-gray-500">Basari Orani</p>
              <p className="text-2xl font-bold">
                {reports[0] ? successRate(reports[0].sourcesSuccess, reports[0].totalSources) : '-'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-gray-500">Expire Olan</p>
              <p className="text-2xl font-bold text-orange-600">{reports[0]?.campaignsExpired ?? '-'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-gray-500">Bakim Islemleri</p>
              <p className="text-2xl font-bold">{reports[0]?.maintenanceActions ?? '-'}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reports table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium">Tarih</th>
                  <th className="pb-3 font-medium text-right">Kaynak</th>
                  <th className="pb-3 font-medium text-right">Basari</th>
                  <th className="pb-3 font-medium text-right">Hata</th>
                  <th className="pb-3 font-medium text-right">Bulunan</th>
                  <th className="pb-3 font-medium text-right">Yeni</th>
                  <th className="pb-3 font-medium text-right">Guncellenen</th>
                  <th className="pb-3 font-medium text-right">Expire</th>
                  <th className="pb-3 font-medium text-right">Bakim</th>
                  <th className="pb-3 font-medium text-right">Sure</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <React.Fragment key={r.id}>
                    <tr
                      className={`border-b last:border-0 hover:bg-gray-50 cursor-pointer ${
                        expandedId === r.id ? 'bg-orange-50' : ''
                      }`}
                      onClick={() => handleExpand(r.id)}
                    >
                      <td className="py-3 font-medium">
                        {new Date(r.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="py-3 text-right">{r.totalSources}</td>
                      <td className="py-3 text-right text-green-600">{r.sourcesSuccess}</td>
                      <td className="py-3 text-right text-red-600">{r.sourcesFailed}</td>
                      <td className="py-3 text-right">{formatNumber(r.campaignsFound)}</td>
                      <td className="py-3 text-right font-medium text-green-600">{r.campaignsNew}</td>
                      <td className="py-3 text-right">{r.campaignsUpdated}</td>
                      <td className="py-3 text-right text-orange-600">{r.campaignsExpired}</td>
                      <td className="py-3 text-right">
                        {r.maintenanceErrors > 0 ? (
                          <Badge variant="destructive" className="text-xs">{r.maintenanceActions}</Badge>
                        ) : (
                          <span className="text-gray-600">{r.maintenanceActions}</span>
                        )}
                      </td>
                      <td className="py-3 text-right text-gray-500">{formatDuration(r.crawlDurationMs)}</td>
                    </tr>

                    {/* Expanded detail */}
                    {expandedId === r.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={10} className="px-4 py-4">
                          {detailLoading ? (
                            <div className="text-center text-gray-400 py-4">Yukleniyor...</div>
                          ) : detail ? (
                            <div className="space-y-4">
                              {/* Tabs */}
                              <div className="flex gap-2">
                                <button
                                  className={`px-3 py-1 rounded text-sm font-medium ${
                                    activeTab === 'markets'
                                      ? 'bg-orange-100 text-orange-700'
                                      : 'text-gray-500 hover:bg-gray-100'
                                  }`}
                                  onClick={(e) => { e.stopPropagation(); setActiveTab('markets'); }}
                                >
                                  Market Detay ({(detail.marketStats as MarketStat[]).length})
                                </button>
                                <button
                                  className={`px-3 py-1 rounded text-sm font-medium ${
                                    activeTab === 'maintenance'
                                      ? 'bg-orange-100 text-orange-700'
                                      : 'text-gray-500 hover:bg-gray-100'
                                  }`}
                                  onClick={(e) => { e.stopPropagation(); setActiveTab('maintenance'); }}
                                >
                                  Bakim Gorevleri ({(detail.maintenanceTasks as MaintenanceTask[]).length})
                                </button>
                              </div>

                              {/* Market Stats Tab */}
                              {activeTab === 'markets' && (
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="border-b text-left">
                                      <th className="pb-2 font-medium">Market</th>
                                      <th className="pb-2 font-medium text-right">Kaynak</th>
                                      <th className="pb-2 font-medium text-right">Basari</th>
                                      <th className="pb-2 font-medium text-right">Hata</th>
                                      <th className="pb-2 font-medium text-right">Bulunan</th>
                                      <th className="pb-2 font-medium text-right">Yeni</th>
                                      <th className="pb-2 font-medium text-right">Guncellenen</th>
                                      <th className="pb-2 font-medium text-right">Basari %</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(detail.marketStats as MarketStat[]).map((ms) => (
                                      <tr key={ms.market} className="border-b last:border-0">
                                        <td className="py-2 font-medium">{ms.market}</td>
                                        <td className="py-2 text-right">{ms.sources}</td>
                                        <td className="py-2 text-right text-green-600">{ms.success}</td>
                                        <td className="py-2 text-right text-red-600">{ms.failed}</td>
                                        <td className="py-2 text-right">{ms.found}</td>
                                        <td className="py-2 text-right font-medium text-green-600">{ms.new}</td>
                                        <td className="py-2 text-right">{ms.updated}</td>
                                        <td className="py-2 text-right">
                                          {successRate(ms.success, ms.sources)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}

                              {/* Maintenance Tasks Tab */}
                              {activeTab === 'maintenance' && (
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="border-b text-left">
                                      <th className="pb-2 font-medium">Gorev</th>
                                      <th className="pb-2 font-medium">Durum</th>
                                      <th className="pb-2 font-medium text-right">Islem</th>
                                      <th className="pb-2 font-medium text-right">Sure</th>
                                      <th className="pb-2 font-medium">Detay</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(detail.maintenanceTasks as MaintenanceTask[]).map((t, i) => (
                                      <tr key={i} className="border-b last:border-0">
                                        <td className="py-2 font-medium">{t.name}</td>
                                        <td className="py-2">
                                          <Badge
                                            variant={t.status === 'ERROR' ? 'destructive' : 'secondary'}
                                            className={`text-xs ${
                                              t.status === 'OK' ? 'bg-green-100 text-green-700' :
                                              t.status === 'SKIPPED' ? 'bg-gray-100 text-gray-500' : ''
                                            }`}
                                          >
                                            {t.status}
                                          </Badge>
                                        </td>
                                        <td className="py-2 text-right">{t.count}</td>
                                        <td className="py-2 text-right text-gray-500">{formatDuration(t.duration)}</td>
                                        <td className="py-2 text-gray-500 truncate max-w-[200px]">
                                          {t.details || '-'}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            {reports.length === 0 && !loading && (
              <p className="text-center text-gray-500 py-8">Henuz rapor yok. Ilk rapor bugun 17:00 UTC&apos;de olusturulacak.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {reports.length > 0 && (
        <p className="text-sm text-gray-400 text-right">
          Son {reports.length} gun gosteriliyor
        </p>
      )}
    </div>
  );
}
