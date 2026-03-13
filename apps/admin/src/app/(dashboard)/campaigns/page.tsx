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

interface Campaign {
  id: string;
  title: string;
  description: string | null;
  discountRate: number | null;
  promoCode: string | null;
  status: 'ACTIVE' | 'EXPIRED' | 'HIDDEN';
  startDate: string | null;
  endDate: string | null;
  sourceUrl: string | null;
  createdAt: string;
  brand: { id: string; name: string } | null;
  category: { id: string; name: string } | null;
}

interface Brand {
  id: string;
  name: string;
  categoryId: string | null;
}

interface Category {
  id: string;
  name: string;
}

interface ListResponse {
  data: {
    items: Campaign[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  };
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  EXPIRED: 'bg-gray-100 text-gray-800',
  HIDDEN: 'bg-red-100 text-red-800',
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const { market } = useMarket();

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [page, setPage] = useState(1);

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editCampaign, setEditCampaign] = useState<Campaign | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', status: '', promoCode: '', startDate: '', endDate: '' });

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('market', market);
    if (statusFilter) params.set('status', statusFilter);
    if (categoryFilter) params.set('categoryId', categoryFilter);
    if (brandFilter) params.set('brandId', brandFilter);
    if (searchFilter) params.set('search', searchFilter);
    params.set('page', String(page));
    params.set('limit', '20');

    const [res, brandsRes, catsRes] = await Promise.all([
      apiFetch<ListResponse>(`/admin/campaigns?${params}`),
      apiFetch<{ data: Brand[] }>(`/admin/brands?market=${market}`),
      apiFetch<{ data: Category[] }>('/admin/categories'),
    ]);
    setCampaigns(res.data.items);
    setMeta({ total: res.data.meta.total, page: res.data.meta.page, totalPages: res.data.meta.totalPages });
    setBrands(brandsRes.data);
    setCategories(catsRes.data);
    setSelectedIds(new Set());
    setLoading(false);
  }, [market, statusFilter, categoryFilter, brandFilter, searchFilter, page]);

  useEffect(() => { load(); }, [load]);

  const filteredBrands = categoryFilter
    ? brands.filter((b) => b.categoryId === categoryFilter)
    : brands;

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
    if (selectedIds.size === campaigns.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(campaigns.map((c) => c.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    await apiFetch('/admin/campaigns/bulk-delete', {
      method: 'POST',
      body: { ids: Array.from(selectedIds) },
    });
    setDeleteDialogOpen(false);
    load();
  };

  const openEdit = (c: Campaign) => {
    setEditCampaign(c);
    setEditForm({
      title: c.title,
      description: c.description || '',
      status: c.status,
      promoCode: (c as any).promoCode || '',
      startDate: c.startDate ? c.startDate.slice(0, 10) : '',
      endDate: c.endDate ? c.endDate.slice(0, 10) : '',
    });
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!editCampaign) return;
    await apiFetch(`/admin/campaigns/${editCampaign.id}`, {
      method: 'PUT',
      body: {
        title: editForm.title,
        description: editForm.description || null,
        status: editForm.status,
        promoCode: editForm.promoCode || null,
        ...(editForm.startDate && { startDate: editForm.startDate }),
        ...(editForm.endDate && { endDate: editForm.endDate }),
      },
    });
    setEditOpen(false);
    load();
  };

  const handleHide = async (id: string) => {
    if (!confirm('Bu kampanyayi gizlemek istediginize emin misiniz?')) return;
    await apiFetch(`/admin/campaigns/${id}/hide`, { method: 'PUT' });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kampanyayi kalici olarak silmek istediginize emin misiniz?')) return;
    await apiFetch(`/admin/campaigns/${id}`, { method: 'DELETE' });
    load();
  };

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kampanyalar</h1>
        <span className="text-sm text-gray-500">Toplam: {meta.total}</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Kampanya ara..."
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
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setBrandFilter('');
            setPage(1);
          }}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="">Tum Kategoriler</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={brandFilter}
          onChange={(e) => { setBrandFilter(e.target.value); setPage(1); }}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="">Tum Markalar</option>
          {filteredBrands.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
          <span className="text-sm font-medium text-blue-800">
            {selectedIds.size} kampanya secildi
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
                  checked={campaigns.length > 0 && selectedIds.size === campaigns.length}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="text-left px-4 py-3 font-medium">Baslik</th>
              <th className="text-left px-4 py-3 font-medium">Marka</th>
              <th className="text-left px-4 py-3 font-medium">Kategori</th>
              <th className="text-left px-4 py-3 font-medium">Indirim</th>
              <th className="text-left px-4 py-3 font-medium">Kod</th>
              <th className="text-left px-4 py-3 font-medium">Durum</th>
              <th className="text-left px-4 py-3 font-medium">Tarihler</th>
              <th className="text-right px-4 py-3 font-medium">Islemler</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-gray-500">Yukleniyor...</td>
              </tr>
            ) : campaigns.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-gray-500">Kampanya bulunamadi</td>
              </tr>
            ) : (
              campaigns.map((c) => (
                <tr key={c.id} className={`hover:bg-gray-50 ${selectedIds.has(c.id) ? 'bg-blue-50' : ''}`}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(c.id)}
                      onChange={() => toggleSelect(c.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium max-w-xs truncate">{c.title}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.brand?.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{c.category?.name || '—'}</td>
                  <td className="px-4 py-3">
                    {c.discountRate ? (
                      <Badge variant="secondary">%{c.discountRate}</Badge>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono">
                    {c.promoCode ? (
                      <Badge variant="outline">{c.promoCode}</Badge>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[c.status] || ''}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {formatDate(c.startDate)} — {formatDate(c.endDate)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>Duzenle</Button>
                      {c.status !== 'HIDDEN' && (
                        <Button variant="ghost" size="sm" onClick={() => handleHide(c.id)}>Gizle</Button>
                      )}
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(c.id)}>Sil</Button>
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
            <AlertDialogTitle>Toplu Silme Onayı</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedIds.size} kampanyayı kalıcı olarak silmek istediğinize emin misiniz?
              Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {selectedIds.size} Kampanyayı Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kampanya Duzenle</DialogTitle>
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
            <div>
              <Label>Promo Kodu</Label>
              <Input
                placeholder="Ör: SAVE20, FREECARGO"
                value={editForm.promoCode}
                onChange={(e) => setEditForm({ ...editForm, promoCode: e.target.value })}
              />
            </div>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Baslangic Tarihi</Label>
                <Input type="date" value={editForm.startDate} onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })} />
              </div>
              <div>
                <Label>Bitis Tarihi</Label>
                <Input type="date" value={editForm.endDate} onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })} />
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
