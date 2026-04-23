'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Play, FileEdit, Loader2, Check } from 'lucide-react';
import type { LearningUnitSource } from '@/entities/project/api/roadmap';

interface SidebarContext {
  id: string;
  title: string;
  description?: string | null;
}

interface Props {
  context: SidebarContext | null;
  sources: LearningUnitSource[];
  loading: boolean;
  applying: boolean;
  selectedSourceIds: string[];
  appliedSourceIds: string[];
  onClose: () => void;
  onToggleSource: (sourceId: string) => void;
  onApplySources: () => Promise<void> | void;
}

function sourceIcon(type: string) {
  if (type === 'youtube' || type === 'audio') {
    return <Play size={14} className="text-[#2563EB] fill-current" />;
  }
  if (type === 'web') {
    return <FileEdit size={14} className="text-[#D97706]" />;
  }
  return <FileText size={14} className="text-[#7C3AED]" />;
}

function sourceColor(type: string): { bg: string; border: string } {
  if (type === 'youtube' || type === 'audio') return { bg: '#DBEAFE', border: '#93C5FD' };
  if (type === 'web') return { bg: '#FEF3C7', border: '#FCD34D' };
  return { bg: '#D1FAE5', border: '#6EE7B7' };
}

function sourceMeta(source: LearningUnitSource) {
  const typeLabel = source.source_type === 'pdf'
    ? 'PDF'
    : source.source_type === 'web'
      ? 'Web'
      : source.source_type === 'youtube'
        ? 'Video'
        : source.source_type === 'audio'
          ? 'Audio'
          : 'Text';
  return `${typeLabel} - ${source.passage_count} trich doan`;
}

export function DocumentSidebar({
  context,
  sources,
  loading,
  applying,
  selectedSourceIds,
  appliedSourceIds,
  onClose,
  onToggleSource,
  onApplySources,
}: Props) {
  const hasSelection = selectedSourceIds.length > 0;

  return (
    <AnimatePresence mode="wait">
      {context ? (
        <motion.div
          key={context.id}
          initial={{ x: 380, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 380, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-[380px] flex-shrink-0 bg-[#F1F1EC] border-2 border-[#333333] rounded-2xl flex flex-col overflow-hidden"
          style={{ height: '100%' }}
        >
          <div className="p-5 border-b-2 border-[#333333]/20 bg-white/40">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-[#7CE6BB] flex-shrink-0" />
                  <span className="text-[11px] font-bold text-[#5A5C58] uppercase tracking-wider">Tai lieu hoc</span>
                </div>
                <h3 className="text-[15px] font-bold text-[#2D2D2D] leading-tight">{context.title}</h3>
                <p className="text-[12px] text-[#5A5C58] mt-1 leading-snug">
                  {context.description || 'Chon cac tai lieu lien quan roi bam Ap dung de tao node tai lieu tren workspace.'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white border-2 border-[#333333]/30 flex items-center justify-center hover:border-[#333333] transition-colors flex-shrink-0 cursor-pointer"
              >
                <X size={14} className="text-[#2D2D2D]" />
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-[#E5E5DF] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#6EE7B7] to-[#34D399] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (sources.length / 6) * 100)}%` }}
                />
              </div>
              <span className="text-[11px] text-[#5A5C58]">{sources.length} tai lieu</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {loading && (
              <div className="h-full min-h-[180px] flex items-center justify-center text-[#5A5C58] text-sm">
                <Loader2 size={16} className="animate-spin mr-2" />
                Dang tai tai lieu lien quan...
              </div>
            )}

            {!loading && sources.length === 0 && (
              <div className="h-full min-h-[180px] flex items-center justify-center text-center text-[#5A5C58] text-sm px-6">
                Chua co tai lieu nao duoc map evidence cho node nay.
              </div>
            )}

            {!loading && sources.map((source, idx) => {
              const isSelected = selectedSourceIds.includes(source.source_id);
              const isApplied = appliedSourceIds.includes(source.source_id);

              return (
                <motion.button
                  key={source.source_id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-white border-2 transition-all cursor-pointer group text-left"
                  style={{
                    borderColor: isSelected ? '#34D399' : '#E5E5DF',
                    boxShadow: isSelected ? '0 0 0 2px rgba(110,231,183,0.2)' : 'none',
                  }}
                  onClick={() => onToggleSource(source.source_id)}
                >
                  <div
                    className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                    style={{
                      borderColor: isSelected ? '#34D399' : '#CFCFC7',
                      backgroundColor: isSelected ? '#D1FAE5' : '#FFFFFF',
                    }}
                  >
                    {isSelected ? <Check size={12} className="text-[#065F46]" /> : null}
                  </div>

                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: sourceColor(source.source_type).bg }}
                  >
                    {sourceIcon(source.source_type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#2D2D2D] leading-tight truncate">{source.source_label}</p>
                    <p className="text-[11px] text-[#5A5C58] mt-0.5 truncate">{sourceMeta(source)}</p>
                  </div>

                  {isApplied ? (
                    <span className="px-2 py-1 rounded-full bg-[#EDFDF4] border border-[#6EE7B7] text-[10px] font-bold text-[#065F46] whitespace-nowrap">
                      Da them
                    </span>
                  ) : null}
                </motion.button>
              );
            })}
          </div>

          <div className="p-4 border-t-2 border-[#333333]/15 bg-white/60">
            <button
              onClick={() => void onApplySources()}
              disabled={!hasSelection || applying}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-[13px] transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                backgroundColor: hasSelection ? '#D1FAE5' : '#E5E5DF',
                borderColor: hasSelection ? '#6EE7B7' : '#D6D3D1',
                color: hasSelection ? '#065F46' : '#78716C',
              }}
            >
              {applying ? <Loader2 size={15} className="animate-spin" /> : null}
              {applying ? 'Dang ap dung...' : `Ap dung${hasSelection ? ` (${selectedSourceIds.length})` : ''}`}
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default DocumentSidebar;
