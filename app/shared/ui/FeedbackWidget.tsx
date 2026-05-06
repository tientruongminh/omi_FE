'use client';

import { useEffect, useState } from 'react';
import { Bug, CheckCircle2, Lightbulb, Loader2, MessageCircle, Send, X } from 'lucide-react';
import { adminApi, type FeedbackReport } from '@/entities/admin/api';
import { useAuthStore } from '@/entities/auth';

const STATUS_LABEL: Record<FeedbackReport['status'], string> = {
  open: 'Đã nhận',
  in_progress: 'Đang xử lý',
  fixed: 'Đã sửa',
  closed: 'Đã đóng',
};

export default function FeedbackWidget() {
  const { user, isAuthenticated } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'bug' | 'feedback' | 'idea'>('bug');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [items, setItems] = useState<FeedbackReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const loadMine = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await adminApi.getMyFeedback();
      setItems(res.feedback ?? []);
    } catch {
      // Best effort only.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) loadMine();
  }, [open, isAuthenticated]);

  const submit = async () => {
    if (!title.trim() || !message.trim() || !isAuthenticated) return;
    setSending(true);
    try {
      const res = await adminApi.createFeedback({
        type,
        title: title.trim(),
        message: message.trim(),
        page_url: typeof window !== 'undefined' ? window.location.href : '',
        user_name: user?.name || user?.email || '',
      });
      setItems((prev) => [res.feedback, ...prev]);
      setTitle('');
      setMessage('');
    } finally {
      setSending(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-[80] flex items-center gap-2 rounded-full border-2 border-white bg-[#6B2D3E] px-4 py-3 text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-[#5A2534]"
        aria-label="Báo lỗi hoặc gửi feedback"
      >
        <Bug size={19} />
        <span className="text-sm font-black">Báo lỗi</span>
        <span className="hidden rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-bold sm:inline">Feedback</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[90] flex items-end justify-end bg-black/25 p-4 sm:p-6" onClick={() => setOpen(false)}>
          <div className="w-full max-w-[430px] overflow-hidden rounded-3xl border-2 border-[#1A1A1A] bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between bg-[#111827] px-5 py-4 text-white">
              <div>
                <p className="text-sm font-black">Report bug / Feedback</p>
                <p className="mt-1 text-xs text-slate-300">Gửi lỗi, góp ý và theo dõi trạng thái xử lý.</p>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1 hover:bg-white/10"><X size={18} /></button>
            </div>

            <div className="max-h-[75vh] overflow-auto p-5">
              <div className="mb-4 grid grid-cols-3 gap-2">
                {[
                  { id: 'bug', label: 'Bug', icon: Bug },
                  { id: 'feedback', label: 'Feedback', icon: MessageCircle },
                  { id: 'idea', label: 'Idea', icon: Lightbulb },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = type === item.id;
                  return (
                    <button key={item.id} onClick={() => setType(item.id as typeof type)} className={`flex items-center justify-center gap-1.5 rounded-xl border-2 px-2 py-2 text-xs font-bold transition ${active ? 'border-[#6B2D3E] bg-[#F5F0EB] text-[#6B2D3E]' : 'border-[#E5E7EB] text-[#6B7280]'}`}>
                      <Icon size={13} /> {item.label}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3">
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tiêu đề ngắn..." className="w-full rounded-xl border-2 border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#6B2D3E]" />
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Mô tả lỗi/góp ý càng cụ thể càng tốt..." rows={4} className="w-full resize-none rounded-xl border-2 border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#6B2D3E]" />
                <button onClick={submit} disabled={sending || !title.trim() || !message.trim()} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#6B2D3E] px-4 py-2.5 text-sm font-black text-white disabled:opacity-50">
                  {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Gửi feedback
                </button>
              </div>

              <div className="mt-6 border-t border-[#E5E7EB] pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-black text-[#111827]">Feedback của bạn</p>
                  <button onClick={loadMine} className="text-xs font-bold text-[#6B2D3E]">Refresh</button>
                </div>
                {loading ? (
                  <div className="flex justify-center py-6"><Loader2 className="animate-spin text-[#6B2D3E]" /></div>
                ) : items.length === 0 ? (
                  <p className="rounded-xl bg-[#F9FAFB] p-4 text-center text-xs text-[#6B7280]">Chưa có feedback nào.</p>
                ) : (
                  <div className="space-y-3">
                    {items.slice(0, 6).map((item) => (
                      <div key={item.id} className="rounded-xl border border-[#E5E7EB] bg-[#FAFAF8] p-3">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-bold text-[#111827]">{item.title}</p>
                          <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[10px] font-black text-[#6B2D3E]">{STATUS_LABEL[item.status]}</span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-[#6B7280]">{item.message}</p>
                        {item.admin_response && (
                          <div className="mt-2 rounded-lg bg-emerald-50 p-2 text-xs text-emerald-800">
                            <CheckCircle2 size={12} className="mr-1 inline" /> {item.admin_response}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
