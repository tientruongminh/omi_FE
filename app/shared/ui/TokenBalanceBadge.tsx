'use client';

import { useCallback, useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { apiFetch } from '@/shared/api/client';
import { useAuthStore } from '@/entities/auth';
import { onTokenBalanceRefresh } from '@/shared/lib/tokenBalanceEvents';

type Balance = {
  monthly_quota_tokens: number;
  bonus_tokens: number;
  used_tokens: number;
  reserved_tokens: number;
  remaining_tokens: number;
  reset_at: string;
};

function compact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return `${n}`;
}

export default function TokenBalanceBadge() {
  const { isAuthenticated } = useAuthStore();
  const [balance, setBalance] = useState<Balance | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<Balance>('/tokens/balance');
      setBalance(data);
    } catch {
      // Avoid noisy UI if token service is temporarily unavailable.
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    void load();
    const timer = window.setInterval(load, 15_000);
    const off = onTokenBalanceRefresh(() => { void load(); });
    const onFocus = () => { void load(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      window.clearInterval(timer);
      off();
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [isAuthenticated, load]);

  if (!isAuthenticated || !balance) return null;
  const total = balance.monthly_quota_tokens + balance.bonus_tokens;
  const pct = total > 0 ? Math.max(0, Math.min(100, (balance.remaining_tokens / total) * 100)) : 0;
  const usedPct = total > 0 ? Math.max(0, Math.min(100, (balance.used_tokens / total) * 100)) : 0;

  return (
    <div className="fixed bottom-5 left-5 z-[70] hidden min-w-[190px] rounded-2xl border-2 border-[#1A1A1A] bg-white px-3 py-2 shadow-lg sm:block" title={`Đã dùng ${balance.used_tokens.toLocaleString('vi-VN')} / còn ${balance.remaining_tokens.toLocaleString('vi-VN')} AI tokens`}>
      <div className="flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-full bg-amber-100 text-amber-700"><Zap size={15} /></div>
        <div>
          <p className="text-[10px] font-black uppercase text-[#6B7280]">AI tokens</p>
          <p className="text-sm font-black text-[#111827]">{compact(balance.remaining_tokens)} còn lại</p>
          <p className="text-[10px] font-semibold text-[#6B7280]">Đã dùng {compact(balance.used_tokens)} ({usedPct.toFixed(2)}%)</p>
        </div>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E5E7EB]">
        <div className="h-full rounded-full bg-[#6B2D3E]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
