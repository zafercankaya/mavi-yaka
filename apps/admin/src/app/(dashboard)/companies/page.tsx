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

const SECTORS = [
  { value: 'RETAIL', label: 'Perakende' },
  { value: 'LOGISTICS_TRANSPORTATION', label: 'Lojistik & Ulaşım' },
  { value: 'FOOD_BEVERAGE', label: 'Gıda & İçecek' },
  { value: 'MANUFACTURING', label: 'Üretim' },
  { value: 'CONSTRUCTION', label: 'İnşaat' },
  { value: 'SECURITY_SERVICES', label: 'Güvenlik Hizmetleri' },
  { value: 'HOSPITALITY_TOURISM', label: 'Otelcilik & Turizm' },
  { value: 'HEALTHCARE', label: 'Sağlık' },
  { value: 'CLEANING', label: 'Temizlik' },
  { value: 'ECOMMERCE_CARGO', label: 'E-Ticaret & Kargo' },
  { value: 'AGRICULTURE', label: 'Tarım' },
  { value: 'MINING_ENERGY', label: 'Madencilik & Enerji' },
  { value: 'AUTOMOTIVE', label: 'Otomotiv' },
  { value: 'TEXTILE', label: 'Tekstil' },
  { value: 'EDUCATION', label: 'Eğitim' },
  { value: 'CALL_CENTER', label: 'Çağrı Merkezi' },
  { value: 'TECHNOLOGY', label: 'Teknoloji' },
  { value: 'OTHER', label: 'Diğer' },
] as const;

interface Company {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  isActive: boolean;
  market: Market;
  sector: string | null;
  description: string | null;
  employeeCount: string | null;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [sectorFilter, setSectorFilter] = useState('');
  const { market } = useMarket();

  const load = useCallback(async () => {
    const res = await apiFetch<{ data: Company[] }>(`/admin/companies?market=${market}`);
    setCompanies(res.data);
  }, [market]);

  useEffect(() => { load(); }, [load]);

  const filteredCompanies = sectorFilter
    ? companies.filter((c) => c.sector === sectorFilter)
    : companies;

  const handleDelete = async (id: string) => {
    if (!confirm('Bu firmayı silmek istediğinize emin misiniz?')) return;
    await apiFetch(`/admin/companies/${id}`, { method: 'DELETE' });
    load();
  };

  const handleLogoUpload = async (companyId: string, file: File) => {
    await apiUpload(`/upload/companies/${companyId}/logo`, file);
    load();
  };

  const handleLogoDelete = async (companyId: string) => {
    await apiFetch(`/upload/companies/${companyId}/logo`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Firmalar</h1>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>+ Yeni Firma</Button>
      </div>

      {/* Sector Filter */}
      <div className="flex flex-wrap gap-3">
        <select
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="">Tum Sektorler</option>
          {SECTORS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCompanies.map((c) => (
          <Card key={c.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <LogoThumbnail
                    url={c.logoUrl}
                    name={c.name}
                    onUpload={(file) => handleLogoUpload(c.id, file)}
                    onDelete={() => handleLogoDelete(c.id)}
                  />
                  <div>
                    <h3 className="font-semibold">{c.name}</h3>
                    <p className="text-xs text-gray-500">{c.slug}</p>
                    {c.sector && <p className="text-xs text-blue-500">{SECTORS.find((s) => s.value === c.sector)?.label || c.sector}</p>}
                    {c.websiteUrl && <p className="text-xs text-gray-400 truncate max-w-36">{c.websiteUrl}</p>}
                  </div>
                </div>
                <Badge variant={c.isActive ? 'default' : 'secondary'}>
                  {c.isActive ? 'Aktif' : 'Pasif'}
                </Badge>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => { setEditing(c); setDialogOpen(true); }}>
                  Duzenle
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(c.id)}>
                  Sil
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCompanies.length === 0 && companies.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          Secilen sektorde firma bulunamadi.
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Firma Duzenle' : 'Yeni Firma'}</DialogTitle>
          </DialogHeader>
          <CompanyForm
            company={editing}
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

function CompanyForm({
  company, onSaved, onCancel,
}: {
  company: Company | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const { market: currentMarket } = useMarket();
  const [name, setName] = useState(company?.name || '');
  const [slug, setSlug] = useState(company?.slug || '');
  const [websiteUrl, setWebsiteUrl] = useState(company?.websiteUrl || '');
  const [sector, setSector] = useState(company?.sector || '');
  const [description, setDescription] = useState(company?.description || '');
  const [employeeCount, setEmployeeCount] = useState(company?.employeeCount || '');
  const [companyMarket, setCompanyMarket] = useState<Market>(company?.market || currentMarket);
  const [isActive, setIsActive] = useState(company?.isActive ?? true);
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
        sector: sector || null,
        description: description || null,
        employeeCount: employeeCount || null,
        market: companyMarket,
        isActive,
      };
      if (company) {
        await apiFetch(`/admin/companies/${company.id}`, { method: 'PUT', body });
      } else {
        await apiFetch('/admin/companies', { method: 'POST', body });
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
        <Input value={name} onChange={(e) => { setName(e.target.value); if (!company) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9ğüşöçı]/gi, '-')); }} />
      </div>
      <div className="space-y-2"><Label>Slug</Label><Input value={slug} onChange={(e) => setSlug(e.target.value)} /></div>
      <div className="space-y-2"><Label>Website URL</Label><Input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://..." /></div>
      <div className="space-y-2">
        <Label>Sektor</Label>
        <select
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          className="w-full border rounded-md px-3 py-2 text-sm bg-white"
        >
          <option value="">Sektor Secin</option>
          {SECTORS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label>Aciklama</Label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded-md px-3 py-2 text-sm bg-white min-h-[80px] resize-y"
          placeholder="Firma hakkinda kisa aciklama..."
        />
      </div>
      <div className="space-y-2">
        <Label>Calisan Sayisi</Label>
        <Input value={employeeCount} onChange={(e) => setEmployeeCount(e.target.value)} placeholder="ör: 50-100, 500+" />
      </div>
      <div className="space-y-2">
        <Label>Market</Label>
        <select
          value={companyMarket}
          onChange={(e) => setCompanyMarket(e.target.value as Market)}
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
        <Button variant="outline" onClick={onCancel}>Vazgec</Button>
        <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Kaydediliyor...' : company ? 'Guncelle' : 'Olustur'}</Button>
      </div>
    </div>
  );
}
