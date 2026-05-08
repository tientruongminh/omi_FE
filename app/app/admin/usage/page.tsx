'use client';

import { useEffect, useState } from 'react';
import { Loader2, RefreshCw, Save, Zap } from 'lucide-react';
import { apiFetch } from '@/shared/api/client';
import { adminApi, type AdminUser } from '@/entities/admin/api';

type UsageSummary = {
  summary: { total_tokens: number; today_tokens: number; month_tokens: number; request_count: number };
  by_user: Array<{ user_id: string; total_tokens: number; requests: number }>;
  by_feature: Array<{ feature: string; total_tokens: number; requests: number }>;
};

type WalletUser = {
  user_id: string;
  lifetime_quota_tokens: number;
  monthly_quota_tokens?: number;
  bonus_tokens: number;
  used_tokens: number;
  reserved_tokens: number;
  remaining_tokens: number;
  reset_at?: string;
  updated_at: string;
  requests: number;
};

type WalletResponse = { users: WalletUser[] };

function fmt(n: number) {
  return Number(n || 0).toLocaleString('vi-VN');
}

export default function AdminUsagePage() {
  const [data, setData] = useState<UsageSummary | null>(null);
  const [wallets, setWallets] = useState<WalletUser[]>([]);
  const [userDirectory, setUserDirectory] = useState<Record<string, AdminUser>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkQuota, setBulkQuota] = useState('500000');
  const [drafts, setDrafts] = useState<Record<string, { quota: string; bonus: string }>>({});

  const load = async () => {
    setLoading(true);
    try {
      const [summary, walletData, usersData] = await Promise.all([
        apiFetch<UsageSummary>('/tokens/admin/summary'),
        apiFetch<WalletResponse>('/tokens/admin/users'),
        adminApi.getUsers(500, 0),
      ]);
      setData(summary);
      setWallets(walletData.users ?? []);
      setUserDirectory(Object.fromEntries((usersData.users ?? []).map((u) => [u.user_id, u])));
      setDrafts(Object.fromEntries((walletData.users ?? []).map((u) => [u.user_id, {
        quota: String(u.lifetime_quota_tokens ?? u.monthly_quota_tokens ?? 500000),
        bonus: String(u.bonus_tokens),
      }])));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const saveWallet = async (userId: string) => {
    const draft = drafts[userId];
    if (!draft) return;
    setSavingId(userId);
    try {
      const res = await apiFetch<{ user: WalletUser }>(`/tokens/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({
          lifetime_quota_tokens: Number(draft.quota || 0),
          bonus_tokens: Number(draft.bonus || 0),
        }),
      });
      setWallets((prev) => prev.map((u) => u.user_id === userId ? { ...u, ...res.user } : u));
    } finally {
      setSavingId(null);
    }
  };

  const bulkUpdate = async () => {
    const quota = Number(bulkQuota);
    if (!quota || quota < 0) return;
    if (!confirm(`Bạn có chắc muốn đặt quota = ${fmt(quota)} tokens cho TẤT CẢ user?`)) return;
    setBulkSaving(true);
    try {
      await apiFetch('/tokens/admin/users-bulk', {
        method: 'PUT',
        body: JSON.stringify({ lifetime_quota_tokens: quota }),
      });
      await load();
    } finally {
      setBulkSaving(false);
    }
  };

  const getUserLabel = (userId: string) => {
    if (userId === 'anonymous') return { title: 'Anonymous request', subtitle: 'Không có user_id trong request', role: 'unknown' };
    const user = userDirectory[userId];
    if (!user) return { title: 'Unknown user', subtitle: userId, role: 'unknown' };
    return {
      title: user.name || user.email || userId,
      subtitle: `${user.email} • ${userId}`,
      role: user.role,
    };
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-[28px] font-black text-[#1A1A1A]" style={{ fontFamily: 'Georgia, serif' }}>
            <Zap size={24} className="text-[#6B2D3E]" /> AI Usage
          </h1>
          <p className="mt-0.5 text-[13px] text-[#5A5C58]">Theo dõi token Shop MMO và quản lý quota từng user.</p>
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

          <div className="rounded-2xl border-2 border-[#E5E7EB] bg-white">
            <div className="border-b border-[#E5E7EB] px-5 py-4">
              <p className="font-black text-[#111827]">Quản lý token từng user</p>
              <p className="mt-1 text-xs text-[#6B7280]">Lifetime quota mặc định: 500,000 tokens. Chỉnh quota/bonus cho từng user hoặc áp dụng tất cả.</p>
              <div className="mt-3 flex items-center gap-3">
                <label className="text-xs font-bold text-[#374151]">Đặt quota tất cả:</label>
                <input value={bulkQuota} onChange={(e) => setBulkQuota(e.target.value)} className="w-40 rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-sm" placeholder="500000" />
                <button onClick={bulkUpdate} disabled={bulkSaving} className="flex items-center gap-1.5 rounded-lg bg-[#1D4ED8] px-4 py-1.5 text-xs font-black text-white disabled:opacity-50">
                  {bulkSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Áp dụng tất cả
                </button>
              </div>
            </div>
            {wallets.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#999]">Chưa có wallet. User sẽ có wallet sau khi gọi AI hoặc mở token badge.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-sm">
                  <thead className="bg-[#FAFAF8] text-left text-xs uppercase text-[#6B7280]">
                    <tr>
                      <th className="px-5 py-3">User</th>
                      <th className="px-5 py-3">Used</th>
                      <th className="px-5 py-3">Remaining</th>
                      <th className="px-5 py-3">Lifetime quota</th>
                      <th className="px-5 py-3">Bonus</th>
                      <th className="px-5 py-3">Requests</th>
                      <th className="px-5 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6]">
                    {wallets.map((u) => {
                      const draft = drafts[u.user_id] || { quota: String(u.lifetime_quota_tokens ?? u.monthly_quota_tokens ?? 500000), bonus: String(u.bonus_tokens) };
                      return (
                        <tr key={u.user_id}>
                          <td className="max-w-[320px] px-5 py-4">
                            {(() => {
                              const label = getUserLabel(u.user_id);
                              return (
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="truncate font-bold text-[#111827]">{label.title}</p>
                                    <span className="rounded-full bg-[#EEF2FF] px-2 py-0.5 text-[10px] font-black uppercase text-[#4338CA]">{label.role}</span>
                                  </div>
                                  <p className="mt-0.5 truncate text-xs text-[#6B7280]">{label.subtitle}</p>
                                </div>
                              );
                            })()}
                          </td>
                          <td className="px-5 py-4 text-[#6B7280]">{fmt(u.used_tokens)}</td>
                          <td className="px-5 py-4 font-black text-[#6B2D3E]">{fmt(u.remaining_tokens)}</td>
                          <td className="px-5 py-4">
                            <input value={draft.quota} onChange={(e) => setDrafts((p) => ({ ...p, [u.user_id]: { ...draft, quota: e.target.value } }))} className="w-36 rounded-lg border border-[#E5E7EB] px-2 py-1 text-sm" />
                          </td>
                          <td className="px-5 py-4">
                            <input value={draft.bonus} onChange={(e) => setDrafts((p) => ({ ...p, [u.user_id]: { ...draft, bonus: e.target.value } }))} className="w-28 rounded-lg border border-[#E5E7EB] px-2 py-1 text-sm" />
                          </td>
                          <td className="px-5 py-4 text-[#6B7280]">{fmt(u.requests)}</td>
                          <td className="px-5 py-4">
                            <button onClick={() => saveWallet(u.user_id)} disabled={savingId === u.user_id} className="flex items-center gap-1.5 rounded-lg bg-[#6B2D3E] px-3 py-1.5 text-xs font-black text-white disabled:opacity-50">
                              {savingId === u.user_id ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Lưu
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <UsageTable title="Top users" rows={data.by_user.map((r) => {
              const label = getUserLabel(r.user_id);
              return { name: label.title, subtitle: label.subtitle, role: label.role, tokens: r.total_tokens, requests: r.requests };
            })} />
            <UsageTable title="Top features" rows={data.by_feature.map((r) => ({ name: r.feature, tokens: r.total_tokens, requests: r.requests }))} />
          </div>
        </div>
      )}
    </div>
  );
}

function UsageTable({ title, rows }: { title: string; rows: Array<{ name: string; subtitle?: string; role?: string; tokens: number; requests: number }> }) {
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
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-bold text-[#111827]">{row.name}</p>
                  {row.role && <span className="rounded-full bg-[#EEF2FF] px-2 py-0.5 text-[10px] font-black uppercase text-[#4338CA]">{row.role}</span>}
                </div>
                {row.subtitle && <p className="truncate text-xs text-[#6B7280]">{row.subtitle}</p>}
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
