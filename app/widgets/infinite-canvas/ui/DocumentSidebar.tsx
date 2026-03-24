'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Play, FileEdit, ChevronRight } from 'lucide-react';
import { mindmapNodes, type LearningDocument } from '@/entities/learning-content';

interface ContentNodeUI {
  id: string;
  label: string;
  icon: string;
  color: string;
  border: string;
  docId: string;
}

interface Props {
  nodeId: string | null;
  onClose: () => void;
  onApply: (nodeId: string, contentNodes: ContentNodeUI[]) => void;
  onOpenDocument: (docId: string, nodeId: string) => void;
}

function docIcon(type: LearningDocument['type']) {
  if (type === 'video') return <Play size={14} className="text-[#2563EB] fill-current" />;
  if (type === 'worksheet') return <FileEdit size={14} className="text-[#D97706]" />;
  return <FileText size={14} className="text-[#7C3AED]" />;
}

function docIconEmoji(type: LearningDocument['type']) {
  if (type === 'video') return '▶';
  if (type === 'worksheet') return '✎';
  return '◎';
}

function docColor(type: LearningDocument['type']): { bg: string; border: string } {
  if (type === 'video') return { bg: '#DBEAFE', border: '#93C5FD' };
  if (type === 'worksheet') return { bg: '#FEF3C7', border: '#FCD34D' };
  return { bg: '#D1FAE5', border: '#6EE7B7' };
}

function docMeta(doc: LearningDocument) {
  if (doc.type === 'video') return `Video • ${doc.duration}`;
  if (doc.type === 'worksheet') return `Worksheet • ${doc.size}`;
  return `PDF • ${doc.size}`;
}

export function DocumentSidebar({ nodeId, onClose, onApply, onOpenDocument }: Props) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [applied, setApplied] = useState(false);
  const node = mindmapNodes.find((n) => n.id === nodeId);

  const toggleCheck = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleApply = () => {
    if (!node || checked.size === 0) return;
    const contentNodes: ContentNodeUI[] = node.documents
      .filter((d) => checked.has(d.id))
      .map((d) => {
        const c = docColor(d.type);
        return { id: `cn-${d.id}`, label: d.title, icon: docIconEmoji(d.type), color: c.bg, border: c.border, docId: d.id };
      });
    onApply(node.id, contentNodes);
    setApplied(true);
    setTimeout(() => setApplied(false), 2000);
  };

  return (
    <AnimatePresence mode="wait">
      {nodeId && node ? (
        <motion.div
          key={nodeId}
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
                  <span className="text-[11px] font-bold text-[#5A5C58] uppercase tracking-wider">Tài Liệu Học</span>
                </div>
                <h3 className="text-[15px] font-bold text-[#2D2D2D] leading-tight">{node.label}</h3>
                <p className="text-[12px] text-[#5A5C58] mt-1 leading-snug">{node.subtitle}</p>
              </div>
              <button
                onClick={() => { setChecked(new Set()); setApplied(false); onClose(); }}
                className="w-8 h-8 rounded-full bg-white border-2 border-[#333333]/30 flex items-center justify-center hover:border-[#333333] transition-colors flex-shrink-0 cursor-pointer"
              >
                <X size={14} className="text-[#2D2D2D]" />
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-[#E5E5DF] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#6EE7B7] to-[#34D399] rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (node.documents.length / 6) * 100)}%` }} />
              </div>
              <span className="text-[11px] text-[#5A5C58]">{node.documents.length} tài liệu</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {node.documents.map((doc, idx) => {
              const isChecked = checked.has(doc.id);
              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white border-2 transition-all cursor-pointer group"
                  style={{ borderColor: isChecked ? '#6EE7B7' : '#E5E5DF', boxShadow: isChecked ? '0 0 0 2px rgba(110,231,183,0.2)' : 'none' }}
                  onClick={() => toggleCheck(doc.id)}
                >
                  <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all" style={{ borderColor: isChecked ? '#059669' : '#CCCCCC', backgroundColor: isChecked ? '#059669' : 'white' }}>
                    {isChecked && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: docColor(doc.type).bg }}>
                    {docIcon(doc.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#2D2D2D] leading-tight truncate">{doc.title}</p>
                    <p className="text-[11px] text-[#5A5C58] mt-0.5">{docMeta(doc)}</p>
                  </div>
                  <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-full bg-[#F1F1EC] flex items-center justify-center"
                    onClick={(e) => { e.stopPropagation(); if (nodeId) onOpenDocument(doc.id, nodeId); }}
                  >
                    <ChevronRight size={12} className="text-[#5A5C58]" />
                  </button>
                </motion.div>
              );
            })}
          </div>

          <div className="p-4 border-t-2 border-[#333333]/20 bg-white/40">
            {checked.size > 0 && <p className="text-[12px] text-[#5A5C58] mb-2 text-center">{checked.size} tài liệu được chọn</p>}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleApply}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all"
              style={{ backgroundColor: applied ? '#34D399' : checked.size > 0 ? '#4CD964' : '#E5E5DF', color: checked.size > 0 ? '#0F5132' : '#9CA3AF', cursor: checked.size > 0 ? 'pointer' : 'not-allowed' }}
            >
              {applied ? '✓ Đã thêm vào mindmap!' : `Áp dụng${checked.size > 0 ? ` (${checked.size})` : ''}`}
            </motion.button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default DocumentSidebar;
