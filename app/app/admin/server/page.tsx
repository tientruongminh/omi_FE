'use client';

import { useEffect, useState } from 'react';
import { Loader2, RefreshCw, Save, Server, Terminal } from 'lucide-react';
import { adminApi, type RuntimeEnvResponse, type ServerStatusResponse } from '@/entities/admin/api';

const SERVICES = ['gateway', 'auth', 'admin', 'learning', 'teacher', 'ai', 'postgres', 'minio', 'omilearn-fe'];
const ENV_KEYS = ['OPENAI_API_KEY', 'OPENAI_BASE_URL', 'OPENAI_MODEL', 'OPENAI_EMBEDDING_API_KEY', 'ANTHROPIC_API_KEY', 'CLAUDE_MODEL'];

export default function AdminServerPage() {
  const [status, setStatus] = useState<ServerStatusResponse | null>(null);
  const [env, setEnv] = useState<RuntimeEnvResponse | null>(null);
  const [selectedService, setSelectedService] = useState('ai');
  const [logs, setLogs] = useState('');
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updates, setUpdates] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const loadStatus = async () => {
    const [serverStatus, runtimeEnv] = await Promise.all([
      adminApi.getServerStatus(),
      adminApi.getRuntimeEnv(),
    ]);
    setStatus(serverStatus);
    setEnv(runtimeEnv);
  };

  const loadLogs = async (service = selectedService) => {
    setLogsLoading(true);
    try {
      const res = await adminApi.getServerLogs(service, 250);
      setLogs(res.logs || '(empty logs)');
    } catch (e: unknown) {
      const err = e as { error?: string };
      setLogs(err?.error || 'Không tải được logs');
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadStatus()
      .then(() => loadLogs('ai'))
      .catch((e: unknown) => {
        const err = e as { error?: string };
        setError(err?.error || 'Không tải được server status');
      })
      .finally(() => setLoading(false));
  }, []);

  const saveEnv = async () => {
    const clean = Object.fromEntries(Object.entries(updates).filter(([, value]) => value.trim().length > 0));
    if (!Object.keys(clean).length) return;
    setSaving(true);
    try {
      await adminApi.updateRuntimeEnv(clean);
      setUpdates({});
      await loadStatus();
      alert('Đã lưu env. Cần rebuild/restart service liên quan để env có hiệu lực.');
    } catch (e: unknown) {
      const err = e as { error?: string };
      alert(err?.error || 'Lưu env thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="animate-spin text-[#6B2D3E]" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-black text-[#1A1A1A] flex items-center gap-2" style={{ fontFamily: 'Georgia, serif' }}>
            <Server size={24} className="text-[#6B2D3E]" /> Server Logs & Env
          </h1>
          <p className="text-[13px] text-[#5A5C58] mt-0.5">Theo dõi service Omilearn và set env runtime. Secret luôn được mask.</p>
        </div>
        <button onClick={() => loadStatus()} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border-2 border-[#E5E7EB] text-[13px] font-semibold">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <div className="lg:col-span-2 bg-white border-2 border-[#E5E7EB] rounded-2xl p-5">
          <h2 className="text-[15px] font-bold text-[#1A1A1A] mb-4">Service status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[...(status?.services ?? []), status?.frontend].filter(Boolean).map((svc: any) => (
              <div key={svc.name} className="rounded-xl border border-[#E5E7EB] bg-[#FAFAF8] p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-bold text-[#2D2D2D]">{svc.name}</span>
                  <span className={`text-[10px] font-black px-2 py-1 rounded-full ${String(svc.status).includes('Up') || svc.status === 'active' ? 'bg-[#D1FAE5] text-[#3B644E]' : 'bg-[#FEE2E2] text-[#DC2626]'}`}>{svc.status}</span>
                </div>
                {svc.ports && <p className="text-[10px] text-[#999] mt-1 truncate">{svc.ports}</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border-2 border-[#E5E7EB] rounded-2xl p-5">
          <h2 className="text-[15px] font-bold text-[#1A1A1A] mb-4">Masked env</h2>
          <div className="space-y-3">
            {ENV_KEYS.map((key) => (
              <div key={key}>
                <label className="text-[11px] font-bold text-[#5A5C58] block mb-1">{key}</label>
                <input
                  type="password"
                  placeholder={env?.env?.[key] || 'not set'}
                  value={updates[key] ?? ''}
                  onChange={(e) => setUpdates((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border-2 border-[#E5E7EB] text-[12px] focus:outline-none focus:border-[#6B2D3E]"
                />
              </div>
            ))}
            <button onClick={saveEnv} disabled={saving} className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#6B2D3E] text-white text-[13px] font-bold disabled:opacity-60">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Lưu env
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border-2 border-[#E5E7EB] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2"><Terminal size={18} className="text-[#6B2D3E]" /><h2 className="font-bold text-[#1A1A1A]">Logs</h2></div>
          <div className="flex items-center gap-2">
            <select value={selectedService} onChange={(e) => { setSelectedService(e.target.value); loadLogs(e.target.value); }} className="px-3 py-2 rounded-xl border-2 border-[#E5E7EB] text-[13px] bg-white">
              {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={() => loadLogs()} className="px-3 py-2 rounded-xl bg-[#F5F0EB] text-[13px] font-semibold">Reload</button>
          </div>
        </div>
        <pre className="h-[420px] overflow-auto bg-[#111827] text-[#D1FAE5] text-[11px] leading-relaxed p-4 whitespace-pre-wrap">
          {logsLoading ? 'Loading logs...' : logs}
        </pre>
      </div>
    </div>
  );
}
