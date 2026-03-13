'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { apiFetch } from '@/lib/api';
import { useMarket } from '@/lib/market';

interface CrawlLog {
  id: string;
  sourceId: string;
  status: string;
  jobsFound: number;
  jobsNew: number;
  jobsUpdated: number;
  errorMessage: string | null;
  durationMs: number | null;
  createdAt: string;
  source: {
    name: string;
    companyId: string;
    company: {
      name: string;
      sector: string | null;
    };
  };
}

interface Company {
  id: string;
  name: string;
  sector: string | null;
}

export default function CrawlLogsPage() {
  const [logs, setLogs] = useState<CrawlLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Reference data
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);

  const { market } = useMarket();

  // Filters
  const [filterSector, setFilterSector] = useState<string>('all');
  const [filterCompany, setFilterCompany] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Load companies on mount
  useEffect(() => {
    async function loadRefs() {
      try {
        const res = await apiFetch<{ data: Company[] }>(`/admin/companies?market=${market}`);
        setAllCompanies(res.data);
      } catch (err) {
        console.error('Ref data load error:', err);
      }
    }
    loadRefs();
  }, [market]);

  // Companies filtered by selected sector
  const filteredCompanies = useMemo(() => {
    if (filterSector === 'all') return allCompanies;
    return allCompanies.filter((c) => c.sector === filterSector);
  }, [allCompanies, filterSector]);

  // Sectors list for filter
  const sectors = useMemo(() => {
    const set = new Set<string>();
    allCompanies.forEach((c) => { if (c.sector) set.add(c.sector); });
    return Array.from(set).sort();
  }, [allCompanies]);

  // Reset company filter when sector changes
  const handleSectorChange = useCallback((val: string) => {
    setFilterSector(val);
    setFilterCompany('all');
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '200' });
      params.set('market', market);
      if (filterSector !== 'all') params.set('sector', filterSector);
      if (filterCompany !== 'all') params.set('companyId', filterCompany);
      if (filterStatus !== 'all') params.set('status', filterStatus);
      params.set('sortOrder', sortOrder);

      const res = await apiFetch<{ data: CrawlLog[] }>(`/admin/crawl/logs?${params}`);
      setLogs(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [market, filterSector, filterCompany, filterStatus, sortOrder]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === logs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(logs.map((l) => l.id)));
    }
  };

  const handleDelete = async () => {
    if (selectedIds.size === 0) return;
    setDeleting(true);
    try {
      await apiFetch('/admin/crawl/logs', {
        method: 'DELETE',
        body: { ids: Array.from(selectedIds) },
      });
      setSelectedIds(new Set());
      setShowDeleteDialog(false);
      await load();
    } finally {
      setDeleting(false);
    }
  };

  const statusColors: Record<string, string> = {
    SUCCESS: 'bg-green-100 text-green-700',
    PARTIAL: 'bg-yellow-100 text-yellow-700',
    FAILED: 'bg-red-100 text-red-700',
    RUNNING: 'bg-blue-100 text-blue-700',
  };

  const statusIcons: Record<string, string> = {
    SUCCESS: '✓',
    PARTIAL: '⚠',
    FAILED: '✕',
    RUNNING: '⟳',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Crawl Logları</h1>
        <Button variant="outline" onClick={load} disabled={loading}>
          {loading ? 'Yükleniyor...' : 'Yenile'}
        </Button>
      </div>

      {/* Filters & Actions Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Sector Filter */}
        <Select value={filterSector} onValueChange={handleSectorChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sektor filtrele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tum Sektorler</SelectItem>
            {sectors.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Company Filter (depends on sector) */}
        <Select value={filterCompany} onValueChange={setFilterCompany}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Firma filtrele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tum Firmalar</SelectItem>
            {filteredCompanies.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Durum filtrele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Durumlar</SelectItem>
            <SelectItem value="SUCCESS">Başarılı</SelectItem>
            <SelectItem value="FAILED">Hatalı</SelectItem>
            <SelectItem value="RUNNING">Çalışıyor</SelectItem>
            <SelectItem value="PARTIAL">Kısmi</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex-1" />

        {/* Selection actions */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{selectedIds.size} seçili</Badge>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              disabled={deleting}
            >
              Seçilenleri Sil
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
            >
              Seçimi Kaldır
            </Button>
          </div>
        )}
      </div>

      {/* Active filter summary */}
      {(filterSector !== 'all' || filterCompany !== 'all' || filterStatus !== 'all') && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Filtreler:</span>
          {filterSector !== 'all' && (
            <Badge variant="outline">{filterSector}</Badge>
          )}
          {filterCompany !== 'all' && (
            <Badge variant="outline">
              {filteredCompanies.find((c) => c.id === filterCompany)?.name || 'Firma'}
            </Badge>
          )}
          {filterStatus !== 'all' && (
            <Badge variant="outline">{filterStatus}</Badge>
          )}
          <button
            className="text-xs text-blue-600 hover:underline ml-2"
            onClick={() => { setFilterSector('all'); setFilterCompany('all'); setFilterStatus('all'); }}
          >
            Temizle
          </button>
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 pr-2 w-8">
                    <input
                      type="checkbox"
                      checked={logs.length > 0 && selectedIds.size === logs.length}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="pb-3 font-medium">Kaynak</th>
                  <th className="pb-3 font-medium">Firma</th>
                  <th className="pb-3 font-medium">Sektör</th>
                  <th className="pb-3 font-medium">Durum</th>
                  <th className="pb-3 font-medium text-right">Bulundu</th>
                  <th className="pb-3 font-medium text-right">Yeni</th>
                  <th className="pb-3 font-medium text-right">Güncellendi</th>
                  <th className="pb-3 font-medium text-right">Süre</th>
                  <th
                    className="pb-3 font-medium cursor-pointer select-none hover:text-orange-600"
                    onClick={() => setSortOrder((prev) => prev === 'desc' ? 'asc' : 'desc')}
                  >
                    Tarih {sortOrder === 'desc' ? '↓' : '↑'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const rowClick = () => setExpandedLogId(expandedLogId === log.id ? null : log.id);
                  return (
                    <React.Fragment key={log.id}>
                      <tr
                        className={`border-b last:border-0 hover:bg-gray-50 cursor-pointer ${
                          log.errorMessage ? 'bg-red-50/50' : ''
                        } ${selectedIds.has(log.id) ? 'bg-blue-50' : ''}`}
                      >
                        <td className="py-3 pr-2" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(log.id)}
                            onChange={() => toggleSelect(log.id)}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="py-3 font-medium" onClick={rowClick}>{log.source.name}</td>
                        <td className="py-3 text-gray-500" onClick={rowClick}>{log.source.company.name}</td>
                        <td className="py-3 text-gray-400 text-xs" onClick={rowClick}>
                          {log.source.company.sector || '-'}
                        </td>
                        <td className="py-3" onClick={rowClick}>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[log.status] || ''}`}>
                            {statusIcons[log.status]} {log.status}
                          </span>
                        </td>
                        <td className="py-3 text-right" onClick={rowClick}>{log.jobsFound}</td>
                        <td className="py-3 text-right text-green-600 font-medium" onClick={rowClick}>{log.jobsNew}</td>
                        <td className="py-3 text-right" onClick={rowClick}>{log.jobsUpdated}</td>
                        <td className="py-3 text-right text-gray-500" onClick={rowClick}>
                          {log.durationMs ? `${(log.durationMs / 1000).toFixed(1)}s` : '-'}
                        </td>
                        <td className="py-3 text-gray-500 text-xs" onClick={rowClick}>
                          {new Date(log.createdAt).toLocaleString('tr-TR')}
                        </td>
                      </tr>
                      {expandedLogId === log.id && (
                        <tr className="bg-gray-50">
                          <td colSpan={10} className="px-4 py-3">
                            <div className="text-xs space-y-2">
                              <div className="flex gap-6">
                                <span><strong>Log ID:</strong> {log.id}</span>
                                <span><strong>Source ID:</strong> {log.sourceId}</span>
                              </div>
                              {log.errorMessage ? (
                                <div className="bg-red-50 border border-red-200 rounded p-3">
                                  <strong className="text-red-700">Hata:</strong>
                                  <pre className="mt-1 text-red-600 whitespace-pre-wrap break-words font-mono text-xs">
                                    {log.errorMessage}
                                  </pre>
                                </div>
                              ) : (
                                <div className="text-gray-500">Hata mesajı yok.</div>
                              )}
                              <div className="flex gap-4 text-gray-500">
                                <span>Bulundu: {log.jobsFound}</span>
                                <span>Yeni: {log.jobsNew}</span>
                                <span>Güncellendi: {log.jobsUpdated}</span>
                                <span>Süre: {log.durationMs ? `${(log.durationMs / 1000).toFixed(1)}s` : 'N/A'}</span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
            {logs.length === 0 && !loading && (
              <p className="text-center text-gray-500 py-8">Henüz crawl logu yok.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Log count summary */}
      {logs.length > 0 && (
        <p className="text-sm text-gray-400 text-right">
          Toplam {logs.length} log gösteriliyor
        </p>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Logları Sil</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedIds.size} crawl log kaydı silinecek. Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Siliniyor...' : `${selectedIds.size} Log Sil`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
