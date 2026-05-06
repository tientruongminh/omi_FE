'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  Copy,
  Database,
  Eye,
  EyeOff,
  HardDrive,
  KeyRound,
  Loader2,
  RefreshCw,
  Rocket,
  Save,
  Search,
  Server,
  Terminal,
  TriangleAlert,
} from 'lucide-react';
import { adminApi, type RuntimeEnvResponse, type ServerStatusResponse } from '@/entities/admin/api';

const SERVICES = ['gateway', 'auth', 'admin', 'learning', 'teacher', 'ai', 'postgres', 'minio', 'omilearn-fe'];
const ENV_KEYS = [
  'OPENAI_API_KEY',
  'OPENAI_BASE_URL',
  'OPENAI_MODEL',
  'OPENAI_EMBEDDING_API_KEY',
  'OPENAI_EMBEDDING_BASE_URL',
  'OPENAI_EMBEDDING_MODEL',
  'ANTHROPIC_API_KEY',
  'ANTHROPIC_BASE_URL',
  'CLAUDE_MODEL',
  'JWT_SECRET',
  'POSTGRES_PASSWORD',
  'MINIO_ROOT_PASSWORD',
  'SMTP_PASS',
];

type Tab = 'overview' | 'logs' | 'secrets' | 'deployments';

function isHealthy(status?: string) {
  const value = String(status || '').toLowerCase();
  return value.includes('up') || value === 'active' || value.includes('healthy') || value.includes('host-service');
}

function friendlyName(name: string) {
  return name.replace('omilearn-backend-', '').replace('-1', '');
}

function statusTone(status?: string) {
  if (isHealthy(status)) return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20';
  return 'bg-red-500/10 text-red-700 border-red-500/20';
}

export default function AdminServerPage() {
  const [status, setStatus] = useState<ServerStatusResponse | null>(null);
  const [env, setEnv] = useState<RuntimeEnvResponse | null>(null);
  const [selectedService, setSelectedService] = useState('ai');
  const [logs, setLogs] = useState('');
  const [logQuery, setLogQuery] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSecretInputs, setShowSecretInputs] = useState(false);
  const [updates, setUpdates] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const services = useMemo(() => {
    return [...(status?.services ?? []), status?.frontend].filter(Boolean) as Array<{ name: string; status: string; ports?: string }>;
  }, [status]);

  const healthyCount = services.filter((svc) => isHealthy(svc.status)).length;
  const deployTarget = services.find((svc) => svc.name.includes('ai'))?.status ?? 'unknown';

  const filteredLogs = useMemo(() => {
    if (!logQuery.trim()) return logs;
    return logs
      .split('\n')
      .filter((line) => line.toLowerCase().includes(logQuery.toLowerCase()))
      .join('\n');
  }, [logs, logQuery]);

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
      const res = await adminApi.getServerLogs(service, 300);
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

  const copyLogs = async () => {
    await navigator.clipboard.writeText(filteredLogs);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="animate-spin text-[#6B2D3E]" /></div>;
  }

  const tabs: Array<{ id: Tab; label: string; icon: typeof Activity }> = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'logs', label: 'Logs', icon: Terminal },
    { id: 'secrets', label: 'Secrets', icon: KeyRound },
    { id: 'deployments', label: 'Deployments', icon: Rocket },
  ];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[28px] border border-[#1F2937] bg-[#0B1020] p-6 text-white shadow-xl">
        <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-[#6B2D3E]/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_16px_#34d399]" />
              Omilearn production
            </div>
            <h1 className="text-[34px] font-black tracking-tight">Server Console</h1>
            <p className="mt-2 max-w-[680px] text-sm leading-relaxed text-slate-300">
              Theo dõi services, logs, secrets và deployment state theo phong cách cloud dashboard. Secrets luôn masked và chỉ admin role truy cập được.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => { loadStatus(); loadLogs(); }}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/15"
            >
              <RefreshCw size={14} /> Refresh
            </button>
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-100">
              {healthyCount}/{services.length} healthy
            </div>
          </div>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { label: 'Services', value: String(services.length), icon: Server, sub: `${healthyCount} healthy` },
          { label: 'Runtime', value: 'Docker', icon: HardDrive, sub: 'Compose on VPS' },
          { label: 'AI service', value: isHealthy(deployTarget) ? 'Live' : 'Check', icon: Database, sub: deployTarget },
          { label: 'Secrets', value: String(Object.keys(env?.env ?? {}).length), icon: KeyRound, sub: 'masked values' },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-2xl border-2 border-[#E5E7EB] bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5F0EB] text-[#6B2D3E]"><Icon size={19} /></div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">{card.label}</span>
              </div>
              <p className="text-2xl font-black text-[#111827]">{card.value}</p>
              <p className="mt-1 truncate text-xs text-[#6B7280]">{card.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border-2 border-[#E5E7EB] bg-white p-2">
        <div className="grid grid-cols-4 gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-bold transition ${active ? 'bg-[#111827] text-white shadow-sm' : 'text-[#6B7280] hover:bg-[#F5F0EB] hover:text-[#111827]'}`}
              >
                <Icon size={15} /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {services.map((svc) => (
            <button
              key={svc.name}
              onClick={() => { setSelectedService(friendlyName(svc.name)); setActiveTab('logs'); loadLogs(friendlyName(svc.name)); }}
              className="group rounded-2xl border-2 border-[#E5E7EB] bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-[#6B2D3E]/40 hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[15px] font-black text-[#111827]">{friendlyName(svc.name)}</p>
                  <p className="mt-1 text-[11px] text-[#9CA3AF]">{svc.name}</p>
                </div>
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase ${statusTone(svc.status)}`}>
                  {isHealthy(svc.status) ? 'healthy' : 'attention'}
                </span>
              </div>
              <p className="line-clamp-2 min-h-[34px] text-xs leading-relaxed text-[#6B7280]">{svc.status}</p>
              {svc.ports && <p className="mt-3 truncate rounded-lg bg-[#F9FAFB] px-2 py-1 text-[10px] text-[#6B7280]">{svc.ports}</p>}
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#6B2D3E] opacity-0 transition group-hover:opacity-100">
                View logs →
              </div>
            </button>
          ))}
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="overflow-hidden rounded-2xl border-2 border-[#111827] bg-[#0B1020] shadow-xl">
          <div className="flex flex-col gap-3 border-b border-white/10 bg-[#111827] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 text-white"><Terminal size={18} /><h2 className="font-black">Live logs</h2></div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={logQuery} onChange={(e) => setLogQuery(e.target.value)} placeholder="Filter logs..." className="w-[220px] rounded-xl border border-white/10 bg-white/10 py-2 pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-400" />
              </div>
              <select value={selectedService} onChange={(e) => { setSelectedService(e.target.value); loadLogs(e.target.value); }} className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-bold text-white outline-none">
                {SERVICES.map((s) => <option key={s} value={s} className="bg-[#111827]">{s}</option>)}
              </select>
              <button onClick={copyLogs} className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-bold text-white"><Copy size={13} /> Copy</button>
              <button onClick={() => loadLogs()} className="inline-flex items-center gap-1 rounded-xl bg-emerald-400 px-3 py-2 text-xs font-black text-[#052e1a]"><RefreshCw size={13} /> Reload</button>
            </div>
          </div>
          <pre className="h-[560px] overflow-auto p-5 font-mono text-[11px] leading-relaxed text-emerald-100 whitespace-pre-wrap">
            {logsLoading ? 'Loading logs...' : filteredLogs || '(no matching logs)'}
          </pre>
        </div>
      )}

      {activeTab === 'secrets' && (
        <div className="rounded-2xl border-2 border-[#E5E7EB] bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-black text-[#111827]">Secrets & runtime env</h2>
              <p className="mt-1 text-sm text-[#6B7280]">Giá trị hiện tại chỉ hiện masked. Nhập value mới vào ô password để update.</p>
            </div>
            <button onClick={() => setShowSecretInputs((v) => !v)} className="inline-flex items-center gap-2 rounded-xl border-2 border-[#E5E7EB] px-4 py-2 text-sm font-bold">
              {showSecretInputs ? <EyeOff size={15} /> : <Eye size={15} />} {showSecretInputs ? 'Hide inputs' : 'Edit secrets'}
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#E5E7EB]">
            <table className="w-full">
              <thead className="bg-[#F9FAFB]">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-[#6B7280]">Key</th>
                  <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-[#6B7280]">Current</th>
                  <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-[#6B7280]">New value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {ENV_KEYS.map((key) => (
                  <tr key={key}>
                    <td className="px-4 py-3 font-mono text-xs font-bold text-[#111827]">{key}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[#6B7280]">{env?.env?.[key] || 'not set'}</td>
                    <td className="px-4 py-3">
                      {showSecretInputs ? (
                        <input type="password" value={updates[key] ?? ''} onChange={(e) => setUpdates((prev) => ({ ...prev, [key]: e.target.value }))} className="w-full rounded-xl border-2 border-[#E5E7EB] px-3 py-2 text-xs outline-none focus:border-[#6B2D3E]" placeholder="Paste new secret" />
                      ) : (
                        <span className="text-xs text-[#9CA3AF]">Hidden</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex justify-end">
            <button onClick={saveEnv} disabled={saving || !Object.values(updates).some(Boolean)} className="inline-flex items-center gap-2 rounded-xl bg-[#6B2D3E] px-5 py-2.5 text-sm font-black text-white disabled:opacity-50">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save env changes
            </button>
          </div>
        </div>
      )}

      {activeTab === 'deployments' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border-2 border-[#E5E7EB] bg-white p-5">
            <h2 className="mb-4 text-lg font-black text-[#111827]">Deployment state</h2>
            <div className="space-y-3">
              {[
                { label: 'Frontend', value: 'omilearn-fe systemd', icon: CheckCircle2, tone: 'text-emerald-600' },
                { label: 'Backend', value: 'Docker Compose services', icon: CheckCircle2, tone: 'text-emerald-600' },
                { label: 'Branch flow', value: 'PR → merge main → deploy webhook', icon: Clock, tone: 'text-[#6B2D3E]' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-3 rounded-xl bg-[#F9FAFB] p-4">
                    <Icon size={18} className={item.tone} />
                    <div>
                      <p className="text-sm font-bold text-[#111827]">{item.label}</p>
                      <p className="text-xs text-[#6B7280]">{item.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-5">
            <div className="mb-3 flex items-center gap-2 text-amber-800"><TriangleAlert size={18} /><h2 className="font-black">Actions locked</h2></div>
            <p className="text-sm leading-relaxed text-amber-800">
              Restart/rebuild/rollback buttons chưa bật trên UI để tránh bấm nhầm phá production. Rule hiện tại: tạo branch, PR, merge main rồi auto deploy.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
