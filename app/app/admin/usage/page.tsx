'use client';

import { useEffect, useState } from 'react';
import { Loader2, RefreshCw, Zap } from 'lucide-react';
import { apiFetch } from '@/shared/api/client';

type UsageSummary = {
  summary: { total_tokens: number; today_tokens: number; month_tokens: number; request_count: number };
  by_user: Array<{ user_id: string; total_tokens: number; requests: number }>;
  by_feature: Array<{ feature: string; total_tokens: number; requests: number }>;
};

function fmt(n: number) {
  return Number(n || 0).toLocaleString('vi-VN');
}

export default function AdminUsagePage() {
  const [data, setData] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setData(await apiFetch<UsageSummary>('/tokens/admin/summary'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-[28px] font-black text-[#1A1A1A]" style={{ fontFamily: 'Georgia, serif' }}>
            <Zap size={24} className="text-[#6B2D3E]" /> AI Usage
          </h1>
          <p className="mt-0.5 text-[13px] text-[#5A5C58]">Theo dõi tổng token Shop MMO/OpenAI-compatible đã dùng qua backend.</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 rounded-xl border-2 border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-bold">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="animate-spin text-[#6B2D3E]" /></div>
      ) : !data ? (
        <div className="rounded-2xl bg-white p-10 text-center text-sm text-[#999]">Không tải được usage.</div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {[
              ['Today', data.summary.today_tokens],
              ['This month', data.summary.month_tokens],
              ['All time', data.summary.total_tokens],
              ['Requests', data.summary.request_count],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border-2 border-[#E5E7EB] bg-white p-5">
                <p className="text-xs font-black uppercase text-[#6B7280]">{label}</p>
                <p className="mt-2 text-2xl font-black text-[#111827]">{fmt(value as number)}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <UsageTable title="Top users" rows={data.by_user.map((r) => ({ name: r.user_id, tokens: r.total_tokens, requests: r.requests }))} />
            <UsageTable title="Top features" rows={data.by_feature.map((r) => ({ name: r.feature, tokens: r.total_tokens, requests: r.requests }))} />
          </div>
        </div>
      )}
    </div>
  );
}

function UsageTable({ title, rows }: { title: string; rows: Array<{ name: string; tokens: number; requests: number }> }) {
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-[#E5E7EB] bg-white">
      <div className="border-b border-[#E5E7EB] px-5 py-4">
        <p className="font-black text-[#111827]">{title}</p>
      </div>
      {rows.length === 0 ? (
        <div className="p-8 text-center text-sm text-[#999]">Chưa có dữ liệu.</div>
      ) : (
        <div className="divide-y divide-[#F3F4F6]">
          {rows.map((row) => (
            <div key={row.name} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[#111827]">{row.name}</p>
                <p className="text-xs text-[#6B7280]">{fmt(row.requests)} requests</p>
              </div>
              <p className="shrink-0 text-sm font-black text-[#6B2D3E]">{fmt(row.tokens)} tokens</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
