'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/lib/auth';
import { useMarket, type Market } from '@/lib/market';

const MARKET_OPTIONS: { value: Market; flag: string; label: string }[] = [
  { value: 'TR', flag: '🇹🇷', label: 'Türkiye' },
  { value: 'US', flag: '🇺🇸', label: 'USA' },
  { value: 'DE', flag: '🇩🇪', label: 'Germany' },
  { value: 'UK', flag: '🇬🇧', label: 'UK' },
  { value: 'IN', flag: '🇮🇳', label: 'India' },
  { value: 'BR', flag: '🇧🇷', label: 'Brazil' },
  { value: 'ID', flag: '🇮🇩', label: 'Indonesia' },
  { value: 'RU', flag: '🇷🇺', label: 'Russia' },
  { value: 'MX', flag: '🇲🇽', label: 'Mexico' },
  { value: 'JP', flag: '🇯🇵', label: 'Japan' },
  { value: 'PH', flag: '🇵🇭', label: 'Philippines' },
  { value: 'TH', flag: '🇹🇭', label: 'Thailand' },
  { value: 'CA', flag: '🇨🇦', label: 'Canada' },
  { value: 'AU', flag: '🇦🇺', label: 'Australia' },
  { value: 'FR', flag: '🇫🇷', label: 'France' },
  { value: 'IT', flag: '🇮🇹', label: 'Italy' },
  { value: 'ES', flag: '🇪🇸', label: 'Spain' },
  { value: 'EG', flag: '🇪🇬', label: 'Egypt' },
  { value: 'SA', flag: '🇸🇦', label: 'Saudi Arabia' },
  { value: 'KR', flag: '🇰🇷', label: 'South Korea' },
  { value: 'AR', flag: '🇦🇷', label: 'Argentina' },
  { value: 'AE', flag: '🇦🇪', label: 'UAE' },
  { value: 'VN', flag: '🇻🇳', label: 'Vietnam' },
  { value: 'PL', flag: '🇵🇱', label: 'Poland' },
  { value: 'MY', flag: '🇲🇾', label: 'Malaysia' },
  { value: 'CO', flag: '🇨🇴', label: 'Colombia' },
  { value: 'ZA', flag: '🇿🇦', label: 'South Africa' },
  { value: 'PT', flag: '🇵🇹', label: 'Portugal' },
  { value: 'NL', flag: '🇳🇱', label: 'Netherlands' },
  { value: 'PK', flag: '🇵🇰', label: 'Pakistan' },
  { value: 'SE', flag: '🇸🇪', label: 'Sweden' },
];

export function Header() {
  const { user, logout } = useAuth();
  const { market, setMarket } = useMarket();

  const current = MARKET_OPTIONS.find((o) => o.value === market);

  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-4">
        {/* Market Selector */}
        <Select value={market} onValueChange={(v) => setMarket(v as Market)}>
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue>
              {current ? `${current.flag} ${current.label}` : market}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {MARKET_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.flag} {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-sm text-gray-600">
          {user?.displayName || user?.email}
        </span>
        <Button variant="ghost" size="sm" onClick={logout}>
          Çıkış
        </Button>
      </div>
    </header>
  );
}
