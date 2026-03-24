'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Youtube, Globe, Plus } from 'lucide-react';

export type ResourceType = 'youtube' | 'website';

export interface Resource {
  id: string;
  type: ResourceType;
  url: string;
  title: string;
}

interface TypeSelectorProps {
  current: ResourceType;
  onChange: (t: ResourceType) => void;
}

export function TypeSelector({ current, onChange }: TypeSelectorProps) {
  const opts: { value: ResourceType; label: string; icon: React.ReactNode; color: string }[] = [
    { value: 'youtube', label: 'YouTube', icon: <Youtube size={13} />, color: '#DC2626' },
    { value: 'website', label: 'Website', icon: <Globe size={13} />, color: '#0891B2' },
  ];
  return (
    <div className="flex gap-1.5">
      {opts.map((o) => (
        <button key={o.value} onClick={() => onChange(o.value)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all cursor-pointer"
          style={{ borderColor: current === o.value ? o.color : '#E5E5DF', backgroundColor: current === o.value ? o.color + '15' : 'white', color: current === o.value ? o.color : '#5A5C58' }}>
          {o.icon}{o.label}
        </button>
      ))}
    </div>
  );
}

interface ResourceInputProps {
  resource: Resource;
  onUpdate: (id: string, field: keyof Resource, value: string) => void;
  onRemove: (id: string) => void;
}

export function ResourceInput({ resource, onUpdate, onRemove }: ResourceInputProps) {
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-2">
      <div className="bg-white border-2 border-[#E5E5DF] rounded-xl p-3 space-y-2.5">
        <div className="flex items-center gap-2">
          <TypeSelector current={resource.type} onChange={(t) => onUpdate(resource.id, 'type', t)} />
          <button onClick={() => onRemove(resource.id)} className="w-7 h-7 rounded-full bg-[#FEE2E2] flex items-center justify-center hover:bg-[#FECACA] transition-all cursor-pointer flex-shrink-0 ml-auto">
            <Trash2 size={11} className="text-red-500" />
          </button>
        </div>
        <input type="url" value={resource.url} onChange={(e) => onUpdate(resource.id, 'url', e.target.value)}
          placeholder={resource.type === 'youtube' ? 'https://youtube.com/watch?v=...' : 'https://example.com/article'}
          className="w-full px-3 py-2 rounded-lg border-2 border-[#E5E5DF] text-sm text-[#2D2D2D] outline-none focus:border-[#6B2D3E] transition-colors" />
        <input type="text" value={resource.title} onChange={(e) => onUpdate(resource.id, 'title', e.target.value)}
          placeholder="Tiêu đề (tùy chọn)"
          className="w-full px-3 py-2 rounded-lg border-2 border-[#E5E5DF] text-sm text-[#2D2D2D] outline-none focus:border-[#6B2D3E] transition-colors" />
      </div>
    </motion.div>
  );
}

interface ResourceListProps {
  resources: Resource[];
  onUpdate: (id: string, field: keyof Resource, value: string) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
}

export function ResourceList({ resources, onUpdate, onRemove, onAdd }: ResourceListProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-semibold text-[#2D2D2D]">Liên kết</label>
        <button onClick={onAdd} className="flex items-center gap-1 text-xs text-[#6B2D3E] font-semibold hover:opacity-80 transition-opacity cursor-pointer">
          <Plus size={12} /> Thêm liên kết
        </button>
      </div>
      <AnimatePresence>
        {resources.map((r) => (
          <ResourceInput key={r.id} resource={r} onUpdate={onUpdate} onRemove={onRemove} />
        ))}
      </AnimatePresence>
      {resources.length === 0 && <p className="text-xs text-[#9CA3AF] text-center py-3">Thêm YouTube, website hoặc bất kỳ URL nào</p>}
    </div>
  );
}
