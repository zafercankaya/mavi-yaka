'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { apiFetch } from '@/lib/api';
import { useMarket, type Market } from '@/lib/market';

interface Source {
  id: string;
  brandId: string;
  name: string;
  crawlMethod: string;
  seedUrls: string[];
  maxDepth: number;
  selectors: Record<string, string> | null;
  schedule: string;
  agingDays: number;
  isActive: boolean;
  market: Market;
  lastCrawledAt: string | null;
  brand: { name: string; categoryId: string | null };
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

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [crawlingId, setCrawlingId] = useState<string | null>(null);
  const [crawlingAll, setCrawlingAll] = useState(false);

  const { market } = useMarket();

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');

  const loadData = useCallback(async () => {
    const [s, b, c] = await Promise.all([
      apiFetch<{ data: Source[] }>(`/admin/sources?market=${market}`),
      apiFetch<{ data: Brand[] }>(`/admin/brands?market=${market}`),
      apiFetch<{ data: Category[] }>('/admin/categories'),
    ]);
    setSources(s.data);
    setBrands(b.data);
    setCategories(c.data);
  }, [market]);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredBrands = categoryFilter
    ? brands.filter((b) => b.categoryId === categoryFilter)
    : brands;

  const filteredSources = sources.filter((s) => {
    if (brandFilter && s.brandId !== brandFilter) return false;
    if (categoryFilter && !brandFilter && s.brand.categoryId !== categoryFilter) return false;
    return true;
  });

  const handleEdit = (source: Source) => {
    setEditingSource(source);
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditingSource(null);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kaynağı silmek istediğinize emin misiniz?')) return;
    await apiFetch(`/admin/sources/${id}`, { method: 'DELETE' });
    loadData();
  };

  const handleSaved = () => {
    setDialogOpen(false);
    setEditingSource(null);
    loadData();
  };

  const handleCrawlOne = async (sourceId: string) => {
    setCrawlingId(sourceId);
    try {
      const res = await apiFetch<{ data: { message: string } }>(`/admin/crawl/trigger/${sourceId}`, { method: 'POST' });
      alert(res.data.message);
      loadData();
    } catch (err: any) {
      alert('Crawl tetikleme basarisiz: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setCrawlingId(null);
    }
  };

  const handleCrawlAll = async () => {
    if (!confirm('Tum aktif kaynaklari crawl etmek istediginize emin misiniz?')) return;
    setCrawlingAll(true);
    try {
      const res = await apiFetch<{ data: { triggeredCount: number } }>('/admin/crawl/trigger-all', { method: 'POST' });
      alert(`${res.data.triggeredCount} kaynak icin crawl baslatildi.`);
      loadData();
    } catch (err: any) {
      alert('Crawl tetikleme basarisiz: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setCrawlingAll(false);
    }
  };

  const methodColors: Record<string, string> = {
    CAMPAIGN: 'bg-blue-100 text-blue-700',
    PRODUCT: 'bg-green-100 text-green-700',
    RSS: 'bg-purple-100 text-purple-700',
    FEED: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Crawl Kaynaklari</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCrawlAll} disabled={crawlingAll}>
            {crawlingAll ? 'Crawl ediliyor...' : 'Tumunu Crawl Et'}
          </Button>
          <Button onClick={handleNew}>+ Yeni Kaynak</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setBrandFilter('');
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
          onChange={(e) => setBrandFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="">Tum Markalar</option>
          {filteredBrands.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-4">
        {filteredSources.map((source) => (
          <Card key={source.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{source.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${methodColors[source.crawlMethod] || ''}`}>
                      {source.crawlMethod}
                    </span>
                    <Badge variant="outline">
                      {{ TR: '🇹🇷', US: '🇺🇸', DE: '🇩🇪', UK: '🇬🇧', IN: '🇮🇳', BR: '🇧🇷' }[source.market] || '🌍'} {source.market}
                    </Badge>
                    <Badge variant={source.isActive ? 'default' : 'secondary'}>
                      {source.isActive ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">Marka: {source.brand.name}</p>
                  <div className="text-xs text-gray-400 space-y-1">
                    {source.seedUrls.map((url, i) => (
                      <div key={i} className="truncate max-w-lg">🔗 {url}</div>
                    ))}
                  </div>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>Cron: {source.schedule}</span>
                    <span>Derinlik: {source.maxDepth}</span>
                    <span>Yaşlanma: {source.agingDays} gün</span>
                    {source.lastCrawledAt && (
                      <span>Son crawl: {new Date(source.lastCrawledAt).toLocaleString('tr-TR')}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleCrawlOne(source.id)}
                    disabled={crawlingId === source.id}
                  >
                    {crawlingId === source.id ? 'Crawl ediliyor...' : 'Crawl Et'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(source)}>
                    Duzenle
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(source.id)}>
                    Sil
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredSources.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              {sources.length === 0 ? 'Henüz kaynak yok. Yeni bir kaynak ekleyin.' : 'Secilen filtreye uygun kaynak bulunamadi.'}
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSource ? 'Kaynak Düzenle' : 'Yeni Kaynak'}</DialogTitle>
          </DialogHeader>
          <SourceForm
            source={editingSource}
            brands={brands}
            onSaved={handleSaved}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SourceForm({
  source, brands, onSaved, onCancel,
}: {
  source: Source | null;
  brands: Brand[];
  onSaved: () => void;
  onCancel: () => void;
}) {
  const { market: currentMarket } = useMarket();
  const [brandId, setBrandId] = useState(source?.brandId || '');
  const [name, setName] = useState(source?.name || '');
  const [crawlMethod, setCrawlMethod] = useState(source?.crawlMethod || 'CAMPAIGN');
  const [sourceMarket, setSourceMarket] = useState<Market>(source?.market || currentMarket);
  const [seedUrls, setSeedUrls] = useState(source?.seedUrls.join('\n') || '');
  const [maxDepth, setMaxDepth] = useState(source?.maxDepth ?? 2);
  const [selectorsJson, setSelectorsJson] = useState(
    source?.selectors ? JSON.stringify(source.selectors, null, 2) : ''
  );
  const [schedule, setSchedule] = useState(source?.schedule || '0 3 * * *');
  const [agingDays, setAgingDays] = useState(source?.agingDays ?? 7);
  const [isActive, setIsActive] = useState(source?.isActive ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    const urls = seedUrls.split('\n').map((u) => u.trim()).filter(Boolean);
    if (!brandId || !name || urls.length === 0) {
      setError('Marka, isim ve en az 1 URL gereklidir.');
      return;
    }

    let selectors = null;
    if (selectorsJson.trim()) {
      try {
        selectors = JSON.parse(selectorsJson);
      } catch {
        setError('Selectors JSON formatı geçersiz.');
        return;
      }
    }

    setLoading(true);
    try {
      const body = {
        brandId,
        name,
        crawlMethod,
        seedUrls: urls,
        maxDepth,
        selectors,
        schedule,
        agingDays,
        isActive,
        market: sourceMarket,
      };

      if (source) {
        await apiFetch(`/admin/sources/${source.id}`, { method: 'PUT', body });
      } else {
        await apiFetch('/admin/sources', { method: 'POST', body });
      }
      onSaved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded">{error}</div>}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Marka</Label>
          <Select value={brandId} onValueChange={setBrandId}>
            <SelectTrigger><SelectValue placeholder="Marka seçin" /></SelectTrigger>
            <SelectContent>
              {brands.map((b) => (
                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Crawl Yöntemi</Label>
          <Select value={crawlMethod} onValueChange={setCrawlMethod}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="CAMPAIGN">Genel Kampanya</SelectItem>
              <SelectItem value="PRODUCT">Ürün Listesi</SelectItem>
              <SelectItem value="RSS">RSS Feed</SelectItem>
              <SelectItem value="FEED">JSON/API Feed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Kaynak Adı</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ör: Trendyol Kampanyalar" />
        </div>
        <div className="space-y-2">
          <Label>Market</Label>
          <Select value={sourceMarket} onValueChange={(v) => setSourceMarket(v as Market)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="TR">🇹🇷 Türkiye</SelectItem>
              <SelectItem value="US">🇺🇸 USA</SelectItem>
              <SelectItem value="DE">🇩🇪 Germany</SelectItem>
              <SelectItem value="UK">🇬🇧 United Kingdom</SelectItem>
              <SelectItem value="IN">🇮🇳 India</SelectItem>
              <SelectItem value="BR">🇧🇷 Brazil</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>URL'ler (her satıra bir URL)</Label>
        <Textarea
          value={seedUrls}
          onChange={(e) => setSeedUrls(e.target.value)}
          placeholder="https://www.trendyol.com/kampanyalar&#10;https://www.trendyol.com/super-indirim"
          rows={4}
        />
      </div>

      {(crawlMethod === 'CAMPAIGN' || crawlMethod === 'PRODUCT') && (
        <div className="space-y-2">
          <Label>CSS Selectors (JSON)</Label>
          <Textarea
            value={selectorsJson}
            onChange={(e) => setSelectorsJson(e.target.value)}
            placeholder={`{
  "list": ".campaign-card",
  "link": "a.card-link",
  "title": "h1.title",
  "description": ".desc",
  "image": "img.main",
  "endDate": ".end-date",
  "discountRate": ".discount"
}`}
            rows={8}
            className="font-mono text-sm"
          />
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Cron Schedule</Label>
          <Input value={schedule} onChange={(e) => setSchedule(e.target.value)} placeholder="0 3 * * *" />
        </div>
        <div className="space-y-2">
          <Label>Max Derinlik</Label>
          <Input type="number" min={1} max={3} value={maxDepth} onChange={(e) => setMaxDepth(Number(e.target.value))} />
        </div>
        <div className="space-y-2">
          <Label>Yaşlanma (gün)</Label>
          <Input type="number" min={1} max={90} value={agingDays} onChange={(e) => setAgingDays(Number(e.target.value))} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="rounded"
        />
        <Label htmlFor="isActive">Aktif</Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>Vazgeç</Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Kaydediliyor...' : source ? 'Güncelle' : 'Oluştur'}
        </Button>
      </div>
    </div>
  );
}
