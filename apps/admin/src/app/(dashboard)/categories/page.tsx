'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch, apiUpload } from '@/lib/api';

interface Category {
  id: string;
  name: string;
  nameEn: string | null;
  nameDe: string | null;
  slug: string;
  iconName: string | null;
  iconUrl: string | null;
  sortOrder: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const load = useCallback(async () => {
    const res = await apiFetch<{ data: Category[] }>('/admin/categories');
    setCategories(res.data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;
    await apiFetch(`/admin/categories/${id}`, { method: 'DELETE' });
    load();
  };

  const handleIconUpload = async (catId: string, file: File) => {
    await apiUpload(`/upload/categories/${catId}/icon`, file);
    load();
  };

  const handleIconDelete = async (catId: string) => {
    await apiFetch(`/upload/categories/${catId}/icon`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kategoriler</h1>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>+ Yeni Kategori</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.sort((a, b) => a.sortOrder - b.sortOrder).map((c) => (
          <Card key={c.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <IconThumbnail
                    url={c.iconUrl}
                    name={c.name}
                    onUpload={(file) => handleIconUpload(c.id, file)}
                    onDelete={() => handleIconDelete(c.id)}
                  />
                  <div>
                    <h3 className="font-semibold">{c.name}</h3>
                    {c.nameEn && <p className="text-xs text-blue-500">{c.nameEn}</p>}
                    {c.nameDe && <p className="text-xs text-emerald-600">{c.nameDe}</p>}
                    <p className="text-xs text-gray-500">{c.slug} · Sıra: {c.sortOrder}</p>
                    {c.iconName && <p className="text-xs text-gray-400">İkon: {c.iconName}</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setEditing(c); setDialogOpen(true); }}>Düzenle</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(c.id)}>Sil</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Kategori Düzenle' : 'Yeni Kategori'}</DialogTitle>
          </DialogHeader>
          <CategoryForm category={editing} onSaved={() => { setDialogOpen(false); load(); }} onCancel={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function IconThumbnail({
  url, name, onUpload, onDelete,
}: {
  url: string | null;
  name: string;
  onUpload: (file: File) => void;
  onDelete: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative group">
      <div
        className="w-10 h-10 rounded-lg border bg-gray-50 flex items-center justify-center overflow-hidden cursor-pointer"
        onClick={() => fileRef.current?.click()}
      >
        {url ? (
          <img src={url} alt={name} className="w-full h-full object-contain" />
        ) : (
          <span className="text-sm font-bold text-gray-300">{name[0]}</span>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onUpload(f);
          e.target.value = '';
        }}
      />
      {url && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] hidden group-hover:flex items-center justify-center"
        >
          x
        </button>
      )}
    </div>
  );
}

function CategoryForm({ category, onSaved, onCancel }: { category: Category | null; onSaved: () => void; onCancel: () => void }) {
  const [name, setName] = useState(category?.name || '');
  const [nameEn, setNameEn] = useState(category?.nameEn || '');
  const [nameDe, setNameDe] = useState(category?.nameDe || '');
  const [slug, setSlug] = useState(category?.slug || '');
  const [iconName, setIconName] = useState(category?.iconName || '');
  const [sortOrder, setSortOrder] = useState(category?.sortOrder ?? 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name || !slug) { setError('Ad ve slug gereklidir.'); return; }
    setLoading(true);
    try {
      const body = { name, nameEn: nameEn || null, nameDe: nameDe || null, slug, iconName: iconName || null, sortOrder };
      if (category) {
        await apiFetch(`/admin/categories/${category.id}`, { method: 'PUT', body });
      } else {
        await apiFetch('/admin/categories', { method: 'POST', body });
      }
      onSaved();
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded">{error}</div>}
      <div className="space-y-2"><Label>Ad (TR)</Label><Input value={name} onChange={(e) => { setName(e.target.value); if (!category) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9ğüşöçı]/gi, '-')); }} /></div>
      <div className="space-y-2"><Label>Name (EN)</Label><Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="Electronics, Fashion..." /></div>
      <div className="space-y-2"><Label>Name (DE)</Label><Input value={nameDe} onChange={(e) => setNameDe(e.target.value)} placeholder="Elektronik, Mode..." /></div>
      <div className="space-y-2"><Label>Slug</Label><Input value={slug} onChange={(e) => setSlug(e.target.value)} /></div>
      <div className="space-y-2"><Label>İkon Adı</Label><Input value={iconName} onChange={(e) => setIconName(e.target.value)} placeholder="shopping_cart" /></div>
      <div className="space-y-2"><Label>Sıra</Label><Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} /></div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel}>Vazgeç</Button>
        <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Kaydediliyor...' : category ? 'Güncelle' : 'Oluştur'}</Button>
      </div>
    </div>
  );
}
