'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CanvasNode } from '../model/types';
import { documentTextContent, videoTranscripts, mindmapNodes } from '@/entities/learning-content';
import ExpandedHeader from './ExpandedHeader';
import VideoPlayer from './VideoPlayer';
import { MessageCircle, ClipboardList } from 'lucide-react';

interface Props {
  node: CanvasNode;
  onClose: () => void;
  onCreateAINode: (nodeId: string, type: 'ai-response' | 'review', selectedText?: string) => void;
}

interface SelectionToolbar {
  x: number;
  y: number;
  text: string;
}

export default function ExpandedDocContent({ node, onClose, onCreateAINode }: Props) {
  const [selectionToolbar, setSelectionToolbar] = useState<SelectionToolbar | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const paragraphs = node.docType === 'text'
    ? (documentTextContent[node.docId ?? ''] ?? ['Nội dung đang được chuẩn bị.'])
    : [videoTranscripts[node.docId ?? ''] ?? '...nội dung video đang được tải...'];

  const chapterNode = mindmapNodes.find((n) => n.id === node.nodeId);
  const doc = chapterNode?.documents.find((d) => d.id === node.docId);

  // Detect text selection via mouseup
  const handleMouseUp = useCallback(() => {
    // Small delay so selection is finalized
    setTimeout(() => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();
      if (!text || text.length < 3) {
        setSelectionToolbar(null);
        return;
      }

      const range = selection?.getRangeAt(0);
      if (!range) return;

      const rect = range.getBoundingClientRect();
      const containerRect = contentRef.current?.getBoundingClientRect();
      if (!containerRect) return;

      setSelectionToolbar({
        x: rect.left + rect.width / 2 - containerRect.left,
        y: rect.top - containerRect.top - 8,
        text,
      });
    }, 10);
  }, []);

  // Dismiss toolbar when clicking outside or selection changes
  useEffect(() => {
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.toString().trim().length < 3) {
        setSelectionToolbar(null);
      }
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  const handleToolbarAction = useCallback((type: 'ai-response' | 'review') => {
    if (selectionToolbar) {
      onCreateAINode(node.id, type, selectionToolbar.text);
      setSelectionToolbar(null);
      window.getSelection()?.removeAllRanges();
    }
  }, [selectionToolbar, node.id, onCreateAINode]);

  return (
    <div className="flex flex-col h-full bg-[#F5F0EB]">
      <ExpandedHeader
        icon={node.docType === 'video' ? '▶' : '◎'}
        title={node.title}
        subtitle={doc ? `${node.docType === 'video' ? `Video • ${doc.duration}` : `PDF • ${doc.size}`}` : undefined}
        onClose={onClose}
      />

      {node.docType === 'text' && (
        <div className="flex-1 overflow-y-auto px-6 py-5 relative" ref={contentRef} onMouseUp={handleMouseUp}>
          <div className="space-y-4 max-w-xl mx-auto">
            {paragraphs.map((para, i) => (
              <p key={i} className="text-[13.5px] text-[#2D2D2D] leading-[1.9] font-serif select-text">{para}</p>
            ))}
          </div>

          {/* Selection floating toolbar */}
          <AnimatePresence>
            {selectionToolbar && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="absolute z-50 flex items-center gap-1.5 p-1.5 bg-[#2D2D2D] rounded-xl shadow-2xl"
                style={{
                  left: selectionToolbar.x,
                  top: selectionToolbar.y,
                  transform: 'translate(-50%, -100%)',
                }}
              >
                <button
                  onMouseDown={(e) => { e.preventDefault(); handleToolbarAction('ai-response'); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white hover:bg-white/15 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <MessageCircle size={12} /> AI hỏi đáp
                </button>
                <div className="w-px h-4 bg-white/20" />
                <button
                  onMouseDown={(e) => { e.preventDefault(); handleToolbarAction('review'); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white hover:bg-white/15 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <ClipboardList size={12} /> Ôn tập
                </button>
                {/* Arrow */}
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-[#2D2D2D] rotate-45" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {node.docType === 'video' && (
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <VideoPlayer node={node} />
          <div className="p-4 bg-white rounded-xl border border-[#E5E5DF]">
            <p className="text-[11px] font-bold text-[#5A5C58] uppercase tracking-wide mb-2">Nội dung chính</p>
            <p className="text-[13px] text-[#5A5C58] leading-relaxed italic">{paragraphs[0]}</p>
          </div>
        </div>
      )}

      {/* Footer: AI actions for full document */}
      <div className="flex gap-2.5 px-5 py-3.5 border-t-2 border-[#333333]/15 bg-white/40 flex-shrink-0">
        <button
          onClick={() => onCreateAINode(node.id, 'ai-response')}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#D1FAE5] border-2 border-[#6EE7B7] text-[#065F46] font-bold text-[12px] hover:bg-[#A7F3D0] transition-colors cursor-pointer"
        >
          <MessageCircle size={13} /> AI hỏi đáp
        </button>
        <button
          onClick={() => onCreateAINode(node.id, 'review')}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#FEE2E2] border-2 border-[#FCA5A5] text-[#991B1B] font-bold text-[12px] hover:bg-[#FECACA] transition-colors cursor-pointer"
        >
          <ClipboardList size={13} /> Ôn tập
        </button>
      </div>
    </div>
  );
}
