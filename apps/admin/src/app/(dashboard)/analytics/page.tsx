'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';

interface Summary {
  totalEvents: number;
  uniqueUsers: number;
  topEvent: string | null;
  topEventCount: number;
  days: number;
}

interface TopEvent {
  event: string;
  count: number;
}

interface DailyRow {
  day: string;
  count: number;
}

export default function AnalyticsPage() {
  const [days, setDays] = useState(7);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [topEvents, setTopEvents] = useState<TopEvent[]>([]);
  const [daily, setDaily] = useState<DailyRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [s, t, d] = await Promise.all([
          apiFetch<{ data: Summary }>(`/admin/analytics/summary?days=${days}`),
          apiFetch<{ data: TopEvent[] }>(`/admin/analytics/top-events?days=${days}`),
          apiFetch<{ data: DailyRow[] }>(`/admin/analytics/daily?days=${days}`),
        ]);
        setSummary(s.data);
        setTopEvents(t.data);
        setDaily(d.data);
      } catch (err) {
        console.error('Analytics fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [days]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Yükleniyor...</div>;
  }

  const maxCount = Math.max(...topEvents.map(e => e.count), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analitikler</h1>
        <div className="flex gap-2">
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1 rounded text-sm font-medium ${
                days === d
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {d} gün
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Toplam Event</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary?.totalEvents.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Tekil Kullanıcı</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary?.uniqueUsers.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">En Popüler Event</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{summary?.topEvent || '-'}</p>
            <p className="text-sm text-gray-500">{summary?.topEventCount.toLocaleString()} kez</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Günlük Ort.</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {summary ? Math.round(summary.totalEvents / summary.days).toLocaleString() : '-'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Chart (simple bar) */}
      <Card>
        <CardHeader>
          <CardTitle>Günlük Event Sayısı</CardTitle>
        </CardHeader>
        <CardContent>
          {daily.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Henüz veri yok</p>
          ) : (
            <div className="flex items-end gap-1 h-48">
              {daily.map((row) => {
                const dailyMax = Math.max(...daily.map(d => d.count), 1);
                const height = (row.count / dailyMax) * 100;
                return (
                  <div key={row.day} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-500">{row.count}</span>
                    <div
                      className="w-full bg-orange-400 rounded-t"
                      style={{ height: `${Math.max(height, 2)}%` }}
                    />
                    <span className="text-xs text-gray-400 rotate-[-45deg] origin-top-left whitespace-nowrap">
                      {row.day.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>Event Dağılımı (Son {days} gün)</CardTitle>
        </CardHeader>
        <CardContent>
          {topEvents.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Henüz veri yok</p>
          ) : (
            <div className="space-y-3">
              {topEvents.map((ev) => (
                <div key={ev.event} className="flex items-center gap-3">
                  <div className="w-40 text-sm font-medium truncate">{ev.event}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-orange-400 h-full rounded-full transition-all"
                      style={{ width: `${(ev.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <div className="w-16 text-right text-sm text-gray-600">
                    {ev.count.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
