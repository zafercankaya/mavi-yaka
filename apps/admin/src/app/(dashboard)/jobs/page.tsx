'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch } from '@/lib/api';
import { useMarket } from '@/lib/market';

interface JobListing {
  id: string;
  title: string;
  description: string | null;
  sector: string | null;
  jobType: string | null;
  workMode: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  city: string | null;
  deadline: string | null;
  postedDate: string | null;
  status: 'ACTIVE' | 'EXPIRED' | 'HIDDEN';
  sourceUrl: string | null;
  createdAt: string;
  company: { id: string; name: string } | null;
}

interface Company {
  id: string;
  name: string;
}

interface ListResponse {
  data: {
    items: JobListing[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  };
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  EXPIRED: 'bg-gray-100 text-gray-800',
  HIDDEN: 'bg-red-100 text-red-800',
};

const SECTORS: { value: string; label: string }[] = [
  { value: 'RETAIL', label: 'Perakende' },
  { value: 'LOGISTICS_TRANSPORTATION', label: 'Lojistik / Ulasim' },
  { value: 'FOOD_BEVERAGE', label: 'Gida / Icecek' },
  { value: 'MANUFACTURING', label: 'Uretim' },
  { value: 'CONSTRUCTION', label: 'Insaat' },
  { value: 'SECURITY_SERVICES', label: 'Guvenlik Hizmetleri' },
  { value: 'HOSPITALITY_TOURISM', label: 'Konaklama / Turizm' },
  { value: 'HEALTHCARE', label: 'Saglik' },
  { value: 'CLEANING', label: 'Temizlik' },
  { value: 'ECOMMERCE_CARGO', label: 'E-Ticaret / Kargo' },
  { value: 'AGRICULTURE', label: 'Tarim' },
  { value: 'MINING_ENERGY', label: 'Madencilik / Enerji' },
  { value: 'AUTOMOTIVE', label: 'Otomotiv' },
  { value: 'TEXTILE', label: 'Tekstil' },
  { value: 'EDUCATION', label: 'Egitim' },
  { value: 'CALL_CENTER', label: 'Cagri Merkezi' },
  { value: 'TECHNOLOGY', label: 'Teknoloji' },
  { value: 'OTHER', label: 'Diger' },
];

const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: 'Tam Zamanli',
  PART_TIME: 'Yari Zamanli',
  CONTRACT: 'Sozlesmeli',
  SEASONAL: 'Mevsimlik',
  INTERNSHIP: 'Staj',
};

const WORK_MODE_LABELS: Record<string, string> = {
  ON_SITE: 'Is Yerinde',
  REMOTE: 'Uzaktan',
  HYBRID: 'Hibrit',
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const { market } = useMarket();

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [page, setPage] = useState(1);

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editJob, setEditJob] = useState<JobListing | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    status: '',
    sector: '',
    jobType: '',
    workMode: '',
    salaryMin: '',
    salaryMax: '',
    city: '',
    deadline: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('market', market);
    if (statusFilter) params.set('status', statusFilter);
    if (sectorFilter) params.set('sector', sectorFilter);
    if (companyFilter) params.set('companyId', companyFilter);
    if (searchFilter) params.set('search', searchFilter);
    params.set('page', String(page));
    params.set('limit', '20');

    const [res, companiesRes] = await Promise.all([
      apiFetch<ListResponse>(`/admin/jobs?${params}`),
      apiFetch<{ data: Company[] }>(`/admin/companies?market=${market}`),
    ]);
    setJobs(res.data.items);
    setMeta({ total: res.data.meta.total, page: res.data.meta.page, totalPages: res.data.meta.totalPages });
    setCompanies(companiesRes.data);
    setSelectedIds(new Set());
    setLoading(false);
  }, [market, statusFilter, sectorFilter, companyFilter, searchFilter, page]);

  useEffect(() => { load(); }, [load]);

  // Selection handlers
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === jobs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(jobs.map((j) => j.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    await apiFetch('/admin/jobs/bulk-delete', {
      method: 'POST',
      body: { ids: Array.from(selectedIds) },
    });
    setDeleteDialogOpen(false);
    load();
  };

  const openEdit = (j: JobListing) => {
    setEditJob(j);
    setEditForm({
      title: j.title,
      description: j.description || '',
      status: j.status,
      sector: j.sector || '',
      jobType: j.jobType || '',
      workMode: j.workMode || '',
      salaryMin: j.salaryMin != null ? String(j.salaryMin) : '',
      salaryMax: j.salaryMax != null ? String(j.salaryMax) : '',
      city: j.city || '',
      deadline: j.deadline ? j.deadline.slice(0, 10) : '',
    });
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!editJob) return;
    await apiFetch(`/admin/jobs/${editJob.id}`, {
      method: 'PUT',
      body: {
        title: editForm.title,
        description: editForm.description || null,
        status: editForm.status,
        sector: editForm.sector || null,
        jobType: editForm.jobType || null,
        workMode: editForm.workMode || null,
        salaryMin: editForm.salaryMin ? Number(editForm.salaryMin) : null,
        salaryMax: editForm.salaryMax ? Number(editForm.salaryMax) : null,
        city: editForm.city || null,
        ...(editForm.deadline && { deadline: editForm.deadline }),
      },
    });
    setEditOpen(false);
    load();
  };

  const handleHide = async (id: string) => {
    if (!confirm('Bu ilani gizlemek istediginize emin misiniz?')) return;
    await apiFetch(`/admin/jobs/${id}/hide`, { method: 'PUT' });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu ilani kalici olarak silmek istediginize emin misiniz?')) return;
    await apiFetch(`/admin/jobs/${id}`, { method: 'DELETE' });
    load();
  };

  const formatDate = (d: string | null) => {
    if (!d) return '\u2014';
    return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatSalary = (min: number | null, max: number | null, currency: string | null) => {
    if (min == null && max == null) return '\u2014';
    const sym = currency === 'TRY' || !currency ? '\u20BA' : currency;
    const fmt = (n: number) => n.toLocaleString('tr-TR');
    if (min != null && max != null) return `${sym}${fmt(min)} - ${sym}${fmt(max)}`;
    if (min != null) return `${sym}${fmt(min)}+`;
    return `${sym}${fmt(max!)}`;
  };

  const sectorLabel = (sector: string | null) => {
    if (!sector) return '\u2014';
    const found = SECTORS.find((s) => s.value === sector);
    return found ? found.label : sector;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Is Ilanlari</h1>
        <span className="text-sm text-gray-500">Toplam: {meta.total}</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Is ilani ara..."
          value={searchFilter}
          onChange={(e) => { setSearchFilter(e.target.value); setPage(1); }}
          className="w-64"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="">Tum Durumlar</option>
          <option value="ACTIVE">Aktif</option>
          <option value="EXPIRED">Suresi Dolmus</option>
          <option value="HIDDEN">Gizli</option>
        </select>
        <select
          value={sectorFilter}
          onChange={(e) => {
            setSectorFilter(e.target.value);
            setPage(1);
          }}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="">Tum Sektorler</option>
          {SECTORS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select
          value={companyFilter}
          onChange={(e) => { setCompanyFilter(e.target.value); setPage(1); }}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="">Tum Firmalar</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
          <span className="text-sm font-medium text-blue-800">
            {selectedIds.size} ilan secildi
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
          >
            Secilenleri Sil
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedIds(new Set())}
          >
            Secimi Kaldir
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={jobs.length > 0 && selectedIds.size === jobs.length}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="text-left px-4 py-3 font-medium">Baslik</th>
              <th className="text-left px-4 py-3 font-medium">Firma</th>
              <th className="text-left px-4 py-3 font-medium">Sektor</th>
              <th className="text-left px-4 py-3 font-medium">Sehir</th>
              <th className="text-left px-4 py-3 font-medium">Maas</th>
              <th className="text-left px-4 py-3 font-medium">Is Tipi</th>
              <th className="text-left px-4 py-3 font-medium">Durum</th>
              <th className="text-left px-4 py-3 font-medium">Son Basvuru</th>
              <th className="text-right px-4 py-3 font-medium">Islemler</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={10} className="text-center py-8 text-gray-500">Yukleniyor...</td>
              </tr>
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-8 text-gray-500">Is ilani bulunamadi</td>
              </tr>
            ) : (
              jobs.map((j) => (
                <tr key={j.id} className={`hover:bg-gray-50 ${selectedIds.has(j.id) ? 'bg-blue-50' : ''}`}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(j.id)}
                      onChange={() => toggleSelect(j.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium max-w-xs truncate">{j.title}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{j.company?.name || '\u2014'}</td>
                  <td className="px-4 py-3 text-gray-600">{sectorLabel(j.sector)}</td>
                  <td className="px-4 py-3 text-gray-600">{j.city || '\u2014'}</td>
                  <td className="px-4 py-3">
                    {(j.salaryMin != null || j.salaryMax != null) ? (
                      <Badge variant="secondary">
                        {formatSalary(j.salaryMin, j.salaryMax, j.salaryCurrency)}
                      </Badge>
                    ) : '\u2014'}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {j.jobType ? JOB_TYPE_LABELS[j.jobType] || j.jobType : '\u2014'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[j.status] || ''}`}>
                      {j.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {formatDate(j.deadline)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(j)}>Duzenle</Button>
                      {j.status !== 'HIDDEN' && (
                        <Button variant="ghost" size="sm" onClick={() => handleHide(j.id)}>Gizle</Button>
                      )}
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(j.id)}>Sil</Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Onceki
          </Button>
          <span className="text-sm text-gray-600">
            Sayfa {meta.page} / {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= meta.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Sonraki
          </Button>
        </div>
      )}

      {/* Bulk Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Toplu Silme Onayi</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedIds.size} ilani kalici olarak silmek istediginize emin misiniz?
              Bu islem geri alinamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Vazgec</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {selectedIds.size} Ilani Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ilan Duzenle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Baslik</Label>
              <Input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
            </div>
            <div>
              <Label>Aciklama</Label>
              <textarea
                className="w-full border rounded-md px-3 py-2 text-sm min-h-[80px]"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Sektor</Label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={editForm.sector}
                  onChange={(e) => setEditForm({ ...editForm, sector: e.target.value })}
                >
                  <option value="">Seciniz</option>
                  {SECTORS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Is Tipi</Label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={editForm.jobType}
                  onChange={(e) => setEditForm({ ...editForm, jobType: e.target.value })}
                >
                  <option value="">Seciniz</option>
                  {Object.entries(JOB_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Calisma Sekli</Label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={editForm.workMode}
                  onChange={(e) => setEditForm({ ...editForm, workMode: e.target.value })}
                >
                  <option value="">Seciniz</option>
                  {Object.entries(WORK_MODE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Sehir</Label>
                <Input
                  placeholder="Or: Istanbul, Ankara"
                  value={editForm.city}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min Maas</Label>
                <Input
                  type="number"
                  placeholder="18000"
                  value={editForm.salaryMin}
                  onChange={(e) => setEditForm({ ...editForm, salaryMin: e.target.value })}
                />
              </div>
              <div>
                <Label>Max Maas</Label>
                <Input
                  type="number"
                  placeholder="22000"
                  value={editForm.salaryMax}
                  onChange={(e) => setEditForm({ ...editForm, salaryMax: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Durum</Label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <option value="ACTIVE">Aktif</option>
                  <option value="EXPIRED">Suresi Dolmus</option>
                  <option value="HIDDEN">Gizli</option>
                </select>
              </div>
              <div>
                <Label>Son Basvuru Tarihi</Label>
                <Input type="date" value={editForm.deadline} onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditOpen(false)}>Iptal</Button>
              <Button onClick={handleSave}>Kaydet</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
