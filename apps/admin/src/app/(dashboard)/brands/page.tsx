'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch, apiUpload } from '@/lib/api';
import { useMarket, type Market } from '@/lib/market';

interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  isActive: boolean;
  market: Market;
  categoryId: string | null;
  category?: { id: string; name: string } | null;
}

interface Category {
  id: string;
  name: string;
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const { market } = useMarket();

  const load = useCallback(async () => {
    const [brandsRes, catsRes] = await Promise.all([
      apiFetch<{ data: Brand[] }>(`/admin/brands?market=${market}`),
      apiFetch<{ data: Category[] }>('/admin/categories'),
    ]);
    setBrands(brandsRes.data);
    setCategories(catsRes.data);
  }, [market]);

  useEffect(() => { load(); }, [load]);

  const filteredBrands = categoryFilter
    ? brands.filter((b) => b.categoryId === categoryFilter)
    : brands;

  const handleDelete = async (id: string) => {
    if (!confirm('Bu markayı silmek istediğinize emin misiniz?')) return;
    await apiFetch(`/admin/brands/${id}`, { method: 'DELETE' });
    load();
  };

  const handleLogoUpload = async (brandId: string, file: File) => {
    await apiUpload(`/upload/brands/${brandId}/logo`, file);
    load();
  };

  const handleLogoDelete = async (brandId: string) => {
    await apiFetch(`/upload/brands/${brandId}/logo`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Markalar</h1>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>+ Yeni Marka</Button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-3">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="">Tum Kategoriler</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBrands.map((b) => (
          <Card key={b.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <LogoThumbnail
                    url={b.logoUrl}
                    name={b.name}
                    onUpload={(file) => handleLogoUpload(b.id, file)}
                    onDelete={() => handleLogoDelete(b.id)}
                  />
                  <div>
                    <h3 className="font-semibold">{b.name}</h3>
                    <p className="text-xs text-gray-500">{b.slug}</p>
                    {b.category && <p className="text-xs text-blue-500">{b.category.name}</p>}
                    {b.websiteUrl && <p className="text-xs text-gray-400 truncate max-w-36">{b.websiteUrl}</p>}
                  </div>
                </div>
                <Badge variant={b.isActive ? 'default' : 'secondary'}>
                  {b.isActive ? 'Aktif' : 'Pasif'}
                </Badge>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => { setEditing(b); setDialogOpen(true); }}>
                  Düzenle
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(b.id)}>
                  Sil
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBrands.length === 0 && brands.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          Secilen kategoride marka bulunamadi.
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Marka Düzenle' : 'Yeni Marka'}</DialogTitle>
          </DialogHeader>
          <BrandForm
            brand={editing}
            categories={categories}
            onSaved={() => { setDialogOpen(false); load(); }}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LogoThumbnail({
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
        className="w-12 h-12 rounded-lg border bg-gray-50 flex items-center justify-center overflow-hidden cursor-pointer"
        onClick={() => fileRef.current?.click()}
      >
        {url ? (
          <img src={url} alt={name} className="w-full h-full object-contain" />
        ) : (
          <span className="text-lg font-bold text-gray-300">{name[0]}</span>
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
          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs hidden group-hover:flex items-center justify-center"
        >
          x
        </button>
      )}
    </div>
  );
}

function BrandForm({
  brand, categories, onSaved, onCancel,
}: {
  brand: Brand | null;
  categories: Category[];
  onSaved: () => void;
  onCancel: () => void;
}) {
  const { market: currentMarket } = useMarket();
  const [name, setName] = useState(brand?.name || '');
  const [slug, setSlug] = useState(brand?.slug || '');
  const [websiteUrl, setWebsiteUrl] = useState(brand?.websiteUrl || '');
  const [categoryId, setCategoryId] = useState(brand?.categoryId || '');
  const [brandMarket, setBrandMarket] = useState<Market>(brand?.market || currentMarket);
  const [isActive, setIsActive] = useState(brand?.isActive ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name || !slug) { setError('Ad ve slug gereklidir.'); return; }
    setLoading(true);
    try {
      const body = {
        name,
        slug,
        websiteUrl: websiteUrl || null,
        categoryId: categoryId || null,
        market: brandMarket,
        isActive,
      };
      if (brand) {
        await apiFetch(`/admin/brands/${brand.id}`, { method: 'PUT', body });
      } else {
        await apiFetch('/admin/brands', { method: 'POST', body });
      }
      onSaved();
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded">{error}</div>}
      <div className="space-y-2">
        <Label>Ad</Label>
        <Input value={name} onChange={(e) => { setName(e.target.value); if (!brand) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9ğüşöçı]/gi, '-')); }} />
      </div>
      <div className="space-y-2"><Label>Slug</Label><Input value={slug} onChange={(e) => setSlug(e.target.value)} /></div>
      <div className="space-y-2"><Label>Website URL</Label><Input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://..." /></div>
      <div className="space-y-2">
        <Label>Kategori</Label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full border rounded-md px-3 py-2 text-sm bg-white"
        >
          <option value="">Kategorisiz</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label>Market</Label>
        <select
          value={brandMarket}
          onChange={(e) => setBrandMarket(e.target.value as Market)}
          className="w-full border rounded-md px-3 py-2 text-sm bg-white"
        >
          <option value="TR">🇹🇷 Türkiye</option>
          <option value="US">🇺🇸 USA</option>
          <option value="DE">🇩🇪 Germany</option>
          <option value="UK">🇬🇧 United Kingdom</option>
          <option value="IN">🇮🇳 India</option>
          <option value="BR">🇧🇷 Brazil</option>
        </select>
      </div>
      <div className="flex items-center gap-2"><input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded" /><Label>Aktif</Label></div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel}>Vazgeç</Button>
        <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Kaydediliyor...' : brand ? 'Güncelle' : 'Oluştur'}</Button>
      </div>
    </div>
  );
}
