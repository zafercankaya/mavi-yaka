'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch } from '@/lib/api';

interface AppConfigItem {
  key: string;
  value: string;
  label: string | null;
  updatedAt: string;
}

const CONFIG_LABELS: Record<string, string> = {
  referral_trial_days: 'Referral Premium Deneme Süresi (gün)',
};

export default function SettingsPage() {
  const [configs, setConfigs] = useState<AppConfigItem[]>([]);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await apiFetch<{ data: AppConfigItem[] }>('/admin/settings');
    setConfigs(res.data);
    const vals: Record<string, string> = {};
    res.data.forEach((c) => { vals[c.key] = c.value; });
    setEditValues(vals);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (key: string) => {
    setSaving(key);
    setMessage(null);
    try {
      await apiFetch('/admin/settings', {
        method: 'PUT',
        body: { key, value: editValues[key] },
      });
      setMessage(`"${CONFIG_LABELS[key] || key}" güncellendi.`);
      await load();
    } catch (err: any) {
      setMessage(`Hata: ${err.message}`);
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ayarlar</h1>
        <p className="text-sm text-gray-500">Uygulama genelinde ayarlanabilir parametreler</p>
      </div>

      {message && (
        <div className={`p-3 rounded-md text-sm ${message.startsWith('Hata') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message}
        </div>
      )}

      <div className="grid gap-4">
        {configs.map((config) => (
          <Card key={config.key}>
            <CardContent className="pt-6">
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <Label htmlFor={config.key} className="text-sm font-medium">
                    {CONFIG_LABELS[config.key] || config.label || config.key}
                  </Label>
                  <p className="text-xs text-gray-400 mb-2">key: {config.key}</p>
                  <Input
                    id={config.key}
                    value={editValues[config.key] || ''}
                    onChange={(e) =>
                      setEditValues((prev) => ({ ...prev, [config.key]: e.target.value }))
                    }
                    className="max-w-xs"
                  />
                </div>
                <Button
                  onClick={() => handleSave(config.key)}
                  disabled={saving === config.key || editValues[config.key] === config.value}
                  size="sm"
                >
                  {saving === config.key ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Son güncelleme: {new Date(config.updatedAt).toLocaleString('tr-TR')}
              </p>
            </CardContent>
          </Card>
        ))}

        {configs.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              Henüz ayar bulunmuyor.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
