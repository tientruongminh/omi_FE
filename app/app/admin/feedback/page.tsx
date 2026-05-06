'use client';

import { useEffect, useState } from 'react';
import { Bug, Loader2, MessageSquareReply, RefreshCw } from 'lucide-react';
import { adminApi, type FeedbackReport } from '@/entities/admin/api';

const STATUS_LABEL: Record<FeedbackReport['status'], string> = {
  open: 'Open',
  in_progress: 'In progress',
  fixed: 'Fixed',
  closed: 'Closed',
};

const STATUS_CLASS: Record<FeedbackReport['status'], string> = {
  open: 'bg-red-50 text-red-700 border-red-200',
  in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
  fixed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  closed: 'bg-slate-100 text-slate-700 border-slate-200',
};

export default function AdminFeedbackPage() {
  const [items, setItems] = useState<FeedbackReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState<FeedbackReport | null>(null);
  const [response, setResponse] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async (nextStatus = status) => {
    setLoading(true);
    try {
      const res = await adminApi.getAllFeedback(nextStatus);
      setItems(res.feedback ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load('all'); }, []);

  const openDetail = (item: FeedbackReport) => {
    setSelected(item);
    setResponse(item.admin_response || '');
  };

  const update = async (nextStatus?: FeedbackReport['status']) => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await adminApi.updateFeedback(selected.id, {
        status: nextStatus ?? selected.status,
        admin_response: response,
      });
      setSelected(res.feedback);
      setItems((prev) => prev.map((i) => i.id === res.feedback.id ? res.feedback : i));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-[28px] font-black text-[#1A1A1A]" style={{ fontFamily: 'Georgia, serif' }}>
            <Bug size={24} className="text-[#6B2D3E]" /> Feedback
          </h1>
          <p className="mt-0.5 text-[13px] text-[#5A5C58]">Theo dõi bug report, góp ý và phản hồi cho người dùng.</p>
        </div>
        <button onClick={() => load()} className="flex items-center gap-2 rounded-xl border-2 border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-bold">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {['all', 'open', 'in_progress', 'fixed', 'closed'].map((s) => (
          <button key={s} onClick={() => { setStatus(s); load(s); }} className={`rounded-xl px-4 py-2 text-xs font-black ${status === s ? 'bg-[#111827] text-white' : 'bg-white text-[#6B7280] border border-[#E5E7EB]'}`}>
            {s === 'all' ? 'All' : STATUS_LABEL[s as FeedbackReport['status']]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 overflow-hidden rounded-2xl border-2 border-[#E5E7EB] bg-white">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#6B2D3E]" /></div>
          ) : items.length === 0 ? (
            <div className="py-20 text-center text-sm text-[#999]">Chưa có feedback.</div>
          ) : (
            <div className="divide-y divide-[#F3F4F6]">
              {items.map((item) => (
                <button key={item.id} onClick={() => openDetail(item)} className={`block w-full p-5 text-left transition hover:bg-[#FAFAF8] ${selected?.id === item.id ? 'bg-[#F5F0EB]' : ''}`}>
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[15px] font-black text-[#111827]">{item.title}</p>
                      <p className="mt-1 text-xs text-[#6B7280]">{item.user_name || item.user_email || item.user_id} • {new Date(item.created_at).toLocaleString('vi-VN')}</p>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase ${STATUS_CLASS[item.status]}`}>{STATUS_LABEL[item.status]}</span>
                  </div>
                  <p className="line-clamp-2 text-sm text-[#4B5563]">{item.message}</p>
                  <div className="mt-3 flex items-center gap-2 text-[11px] text-[#9CA3AF]">
                    <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 font-bold uppercase">{item.type}</span>
                    {item.admin_response && <span>Đã phản hồi</span>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border-2 border-[#E5E7EB] bg-white p-5">
          {!selected ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center text-center text-[#9CA3AF]">
              <MessageSquareReply size={36} />
              <p className="mt-3 text-sm">Chọn một feedback để xem chi tiết và phản hồi.</p>
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <p className="text-lg font-black text-[#111827]">{selected.title}</p>
                <p className="mt-1 text-xs text-[#6B7280]">{selected.user_email}</p>
              </div>
              <div className="mb-4 rounded-xl bg-[#F9FAFB] p-3 text-sm leading-relaxed text-[#374151]">{selected.message}</div>
              <label className="mb-1 block text-xs font-bold text-[#5A5C58]">Status</label>
              <select value={selected.status} onChange={(e) => setSelected({ ...selected, status: e.target.value as FeedbackReport['status'] })} className="mb-4 w-full rounded-xl border-2 border-[#E5E7EB] px-3 py-2 text-sm">
                <option value="open">Open</option>
                <option value="in_progress">In progress</option>
                <option value="fixed">Fixed</option>
                <option value="closed">Closed</option>
              </select>
              <label className="mb-1 block text-xs font-bold text-[#5A5C58]">Response to user</label>
              <textarea value={response} onChange={(e) => setResponse(e.target.value)} rows={5} className="w-full resize-none rounded-xl border-2 border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#6B2D3E]" placeholder="Ví dụ: Lỗi này đã được fix ở bản deploy mới nhất..." />
              <button onClick={() => update(selected.status)} disabled={saving} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#6B2D3E] px-4 py-2.5 text-sm font-black text-white disabled:opacity-50">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <MessageSquareReply size={15} />} Lưu phản hồi
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
