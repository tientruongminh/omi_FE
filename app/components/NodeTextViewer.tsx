'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, MessageCircle, ClipboardList } from 'lucide-react';
import { mindmapNodes, documentTextContent } from '@/lib/learning-data';
import NodeAIChat from './NodeAIChat';
import NodeReview from './NodeReview';

interface Props {
  docId: string | null;
  nodeId: string | null;
  onClose: () => void;
}

export default function NodeTextViewer({ docId, nodeId, onClose }: Props) {
  const [view, setView] = useState<'text' | 'ai' | 'review'>('text');

  // Reset when doc changes
  useEffect(() => {
    setView('text');
  }, [docId]);

  const node = mindmapNodes.find((n) => n.id === nodeId);
  const doc = node?.documents.find((d) => d.id === docId);
  const paragraphs = documentTextContent[docId ?? ''] ?? [
    'Nội dung tài liệu này đang được chuẩn bị. Vui lòng quay lại sau.',
  ];

  if (!doc || !docId) return null;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
        onClick={onClose}
      >
        <motion.div
          key="panel"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="bg-[#F5F0EB] rounded-2xl border-2 border-[#333333] shadow-2xl overflow-hidden flex flex-col"
          style={{
            width: view === 'ai' ? '90vw' : '760px',
            maxWidth: view === 'ai' ? '1100px' : '760px',
            height: '82vh',
            maxHeight: 680,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b-2 border-[#333333]/20 bg-white/40 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-[#D1FAE5] flex items-center justify-center">
              <BookOpen size={16} className="text-[#065F46]" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-[#2D2D2D] text-[15px] leading-tight truncate">
                {doc.title}
              </h2>
              <p className="text-[11px] text-[#5A5C58]">PDF • {doc.size}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white border-2 border-[#333333]/30 flex items-center justify-center hover:border-[#333333] transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* Body */}
          {view === 'text' && (
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {/* Decorative book-style header */}
              <div className="text-center mb-6">
                <div className="inline-block px-4 py-1 rounded-full bg-[#E0E0F8] border border-[#A5B4FC] text-[12px] text-[#4338CA] font-medium mb-3">
                  {node?.label}
                </div>
                <h1 className="text-xl font-bold text-[#2D2D2D] leading-tight">{doc.title}</h1>
                <div className="mt-3 h-px bg-gradient-to-r from-transparent via-[#333333]/20 to-transparent" />
              </div>

              <div className="space-y-5 max-w-2xl mx-auto">
                {paragraphs.map((para, i) => (
                  <p
                    key={i}
                    className="text-[14px] text-[#2D2D2D] leading-[1.8] font-serif"
                    style={{ textIndent: i === 0 ? 0 : '1.5em' }}
                  >
                    {para}
                  </p>
                ))}
              </div>

              {/* Page indicator */}
              <div className="mt-8 text-center text-[12px] text-[#5A5C58]">
                — Trang 1 / {doc.size?.split(' ')[0] ?? 1} —
              </div>
            </div>
          )}

          {view === 'ai' && (
            <div className="flex-1 overflow-hidden">
              <NodeAIChat
                docId={docId}
                paragraphs={paragraphs}
                docTitle={doc.title}
                onBack={() => setView('text')}
              />
            </div>
          )}

          {view === 'review' && (
            <div className="flex-1 overflow-hidden">
              <NodeReview onBack={() => setView('text')} />
            </div>
          )}

          {/* Footer */}
          {view === 'text' && (
            <div className="flex gap-3 px-6 py-4 border-t-2 border-[#333333]/20 bg-white/40 flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setView('ai')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#D1FAE5] border-2 border-[#6EE7B7] text-[#065F46] font-bold text-sm hover:bg-[#A7F3D0] transition-colors"
              >
                <MessageCircle size={14} />
                AI hỏi đáp
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setView('review')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#FEE2E2] border-2 border-[#FCA5A5] text-[#991B1B] font-bold text-sm hover:bg-[#FECACA] transition-colors"
              >
                <ClipboardList size={14} />
                Ôn tập
              </motion.button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
