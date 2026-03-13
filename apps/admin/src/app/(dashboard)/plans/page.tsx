'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch } from '@/lib/api';
import { useMarket, type Market } from '@/lib/market';

const CURRENCY_MAP: Record<Market, string> = {
  TR: 'TRY', US: 'USD', CA: 'CAD', AU: 'AUD', UK: 'GBP', JP: 'JPY', KR: 'KRW',
  DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR', PT: 'EUR',
  BR: 'BRL', MX: 'MXN', AR: 'ARS', CO: 'COP', RU: 'RUB', EG: 'EGP', SA: 'SAR', AE: 'AED',
  IN: 'INR', ID: 'IDR', PH: 'PHP', TH: 'THB', MY: 'MYR', VN: 'VND', PK: 'PKR',
  PL: 'PLN', SE: 'SEK', ZA: 'ZAR',
};
const CURRENCY_SYMBOL: Record<string, string> = {
  TRY: '₺', USD: '$', CAD: 'C$', AUD: 'A$', GBP: '£', JPY: '¥', KRW: '₩',
  EUR: '€', BRL: 'R$', MXN: 'MX$', ARS: 'AR$', RUB: '₽', EGP: 'E£', SAR: 'SR',
  INR: '₹', IDR: 'Rp', PHP: '₱', THB: '฿',
};

function currencySymbol(c: string): string {
  return CURRENCY_SYMBOL[c] || c;
}

interface Plan {
  id: string;
  name: string;
  market: Market;
  currency: string;
  priceMonthly: string | null;
  priceYearly: string | null;
  maxBrandFollows: number;
  maxCampaignFollows: number;
  dailyNotifLimit: number;
  hasAdvancedFilter: boolean;
  adFree: boolean;
  weeklyDigest: boolean;
  isActive: boolean;
}

export default function PlansPage() {
  const { market } = useMarket();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);

  const load = useCallback(async () => {
    const res = await apiFetch<{ data: Plan[] }>(`/admin/subscription-plans?market=${market}`);
    setPlans(res.data);
  }, [market]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Abonelik Planları ({market})</h1>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>+ Yeni Plan</Button>
      </div>

      {plans.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {market} pazarı için henüz plan oluşturulmamış.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map((p) => {
          const sym = currencySymbol(p.currency);
          return (
            <Card key={p.id}>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{p.name}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{p.currency}</Badge>
                    <Badge variant={p.isActive ? 'default' : 'secondary'}>{p.isActive ? 'Aktif' : 'Pasif'}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-500">Aylık:</span> {p.priceMonthly ? `${sym}${p.priceMonthly}` : 'Ücretsiz'}</div>
                  <div><span className="text-gray-500">Yıllık:</span> {p.priceYearly ? `${sym}${p.priceYearly}` : '-'}</div>
                  <div><span className="text-gray-500">Marka Takip:</span> {p.maxBrandFollows === -1 ? 'Sınırsız' : p.maxBrandFollows}</div>
                  <div><span className="text-gray-500">Kampanya Takip:</span> {p.maxCampaignFollows === -1 ? 'Sınırsız' : p.maxCampaignFollows}</div>
                  <div><span className="text-gray-500">Bildirim/gün:</span> {p.dailyNotifLimit === -1 ? 'Sınırsız' : p.dailyNotifLimit}</div>
                  <div><span className="text-gray-500">Gelişmiş Filtre:</span> {p.hasAdvancedFilter ? '✅' : '❌'}</div>
                  <div><span className="text-gray-500">Reklamsız:</span> {p.adFree ? '✅' : '❌'}</div>
                  <div><span className="text-gray-500">Haftalık Bildirim:</span> {p.weeklyDigest ? '✅' : '❌'}</div>
                </div>
                <Button variant="outline" size="sm" onClick={() => { setEditing(p); setDialogOpen(true); }}>Düzenle</Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Plan Düzenle' : 'Yeni Plan'}</DialogTitle></DialogHeader>
          <PlanForm
            plan={editing}
            defaultMarket={market}
            onSaved={() => { setDialogOpen(false); load(); }}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PlanForm({
  plan,
  defaultMarket,
  onSaved,
  onCancel,
}: {
  plan: Plan | null;
  defaultMarket: Market;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(plan?.name || '');
  const [planMarket, setPlanMarket] = useState<Market>(plan?.market || defaultMarket);
  const [currency, setCurrency] = useState(plan?.currency || CURRENCY_MAP[defaultMarket]);
  const [priceMonthly, setPriceMonthly] = useState(plan?.priceMonthly || '');
  const [priceYearly, setPriceYearly] = useState(plan?.priceYearly || '');
  const [maxBrandFollows, setMaxBrandFollows] = useState(plan?.maxBrandFollows ?? 1);
  const [maxCampaignFollows, setMaxCampaignFollows] = useState(plan?.maxCampaignFollows ?? 1);
  const [dailyNotifLimit, setDailyNotifLimit] = useState(plan?.dailyNotifLimit ?? 3);
  const [hasAdvancedFilter, setHasAdvancedFilter] = useState(plan?.hasAdvancedFilter ?? false);
  const [adFree, setAdFree] = useState(plan?.adFree ?? false);
  const [weeklyDigest, setWeeklyDigest] = useState(plan?.weeklyDigest ?? false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync currency when market changes (only for new plans)
  const handleMarketChange = (m: Market) => {
    setPlanMarket(m);
    if (!plan) setCurrency(CURRENCY_MAP[m]);
  };

  const handleSubmit = async () => {
    if (!name) { setError('Plan adı gereklidir.'); return; }
    if (!currency) { setError('Para birimi gereklidir.'); return; }
    setLoading(true);
    try {
      const body = {
        name,
        market: planMarket,
        currency,
        priceMonthly: priceMonthly ? Number(priceMonthly) : null,
        priceYearly: priceYearly ? Number(priceYearly) : null,
        maxBrandFollows, maxCampaignFollows, dailyNotifLimit, hasAdvancedFilter, adFree, weeklyDigest,
      };
      if (plan) {
        await apiFetch(`/admin/subscription-plans/${plan.id}`, { method: 'PUT', body });
      } else {
        await apiFetch('/admin/subscription-plans', { method: 'POST', body });
      }
      onSaved();
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const sym = currencySymbol(currency);

  return (
    <div className="space-y-4">
      {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded">{error}</div>}
      <div className="space-y-2"><Label>Plan Adı</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Pazar (Market)</Label>
          <select
            value={planMarket}
            onChange={(e) => handleMarketChange(e.target.value as Market)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="TR">🇹🇷 Türkiye (TR)</option>
            <option value="US">🇺🇸 Amerika (US)</option>
            <option value="CA">🇨🇦 Kanada (CA)</option>
            <option value="AU">🇦🇺 Avustralya (AU)</option>
            <option value="UK">🇬🇧 İngiltere (UK)</option>
            <option value="JP">🇯🇵 Japonya (JP)</option>
            <option value="DE">🇩🇪 Almanya (DE)</option>
            <option value="FR">🇫🇷 Fransa (FR)</option>
            <option value="IT">🇮🇹 İtalya (IT)</option>
            <option value="BR">🇧🇷 Brezilya (BR)</option>
            <option value="MX">🇲🇽 Meksika (MX)</option>
            <option value="RU">🇷🇺 Rusya (RU)</option>
            <option value="IN">🇮🇳 Hindistan (IN)</option>
            <option value="ID">🇮🇩 Endonezya (ID)</option>
            <option value="PH">🇵🇭 Filipinler (PH)</option>
            <option value="TH">🇹🇭 Tayland (TH)</option>
            <option value="ES">🇪🇸 İspanya (ES)</option>
            <option value="EG">🇪🇬 Mısır (EG)</option>
            <option value="SA">🇸🇦 S.Arabistan (SA)</option>
            <option value="KR">🇰🇷 G.Kore (KR)</option>
            <option value="AR">🇦🇷 Arjantin (AR)</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label>Para Birimi</Label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="TRY">TRY (₺)</option>
            <option value="USD">USD ($)</option>
            <option value="CAD">CAD (C$)</option>
            <option value="AUD">AUD (A$)</option>
            <option value="GBP">GBP (£)</option>
            <option value="JPY">JPY (¥)</option>
            <option value="EUR">EUR (€)</option>
            <option value="BRL">BRL (R$)</option>
            <option value="MXN">MXN (MX$)</option>
            <option value="RUB">RUB (₽)</option>
            <option value="INR">INR (₹)</option>
            <option value="IDR">IDR (Rp)</option>
            <option value="PHP">PHP (₱)</option>
            <option value="THB">THB (฿)</option>
            <option value="KRW">KRW (₩)</option>
            <option value="ARS">ARS (AR$)</option>
            <option value="EGP">EGP (E£)</option>
            <option value="SAR">SAR (SR)</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Aylık Fiyat ({sym})</Label><Input type="number" value={priceMonthly} onChange={(e) => setPriceMonthly(e.target.value)} placeholder="0" /></div>
        <div className="space-y-2"><Label>Yıllık Fiyat ({sym})</Label><Input type="number" value={priceYearly} onChange={(e) => setPriceYearly(e.target.value)} placeholder="0" /></div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2"><Label>Marka Takip (-1=sınırsız)</Label><Input type="number" value={maxBrandFollows} onChange={(e) => setMaxBrandFollows(Number(e.target.value))} /></div>
        <div className="space-y-2"><Label>Kampanya Takip (-1=sınırsız)</Label><Input type="number" value={maxCampaignFollows} onChange={(e) => setMaxCampaignFollows(Number(e.target.value))} /></div>
        <div className="space-y-2"><Label>Bildirim/gün (-1=sınırsız)</Label><Input type="number" value={dailyNotifLimit} onChange={(e) => setDailyNotifLimit(Number(e.target.value))} /></div>
      </div>
      <div className="flex gap-6">
        <label className="flex items-center gap-2"><input type="checkbox" checked={hasAdvancedFilter} onChange={(e) => setHasAdvancedFilter(e.target.checked)} className="rounded" />Gelişmiş Filtre</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={adFree} onChange={(e) => setAdFree(e.target.checked)} className="rounded" />Reklamsız</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={weeklyDigest} onChange={(e) => setWeeklyDigest(e.target.checked)} className="rounded" />Haftalık Bildirim</label>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel}>Vazgeç</Button>
        <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Kaydediliyor...' : plan ? 'Güncelle' : 'Oluştur'}</Button>
      </div>
    </div>
  );
}
