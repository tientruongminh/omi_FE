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
  onCreateAINode: (nodeId: string, type: 'ai-chat' | 'ai-review', selectedText?: string) => void;
}

interface FloatingMenu {
  x: number;
  y: number;
  text: string;
}

export default function ExpandedDocContent({ node, onClose, onCreateAINode }: Props) {
  const [floatingMenu, setFloatingMenu] = useState<FloatingMenu | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const paragraphs = node.docType === 'text'
    ? (documentTextContent[node.docId ?? ''] ?? ['Nội dung đang được chuẩn bị.'])
    : [videoTranscripts[node.docId ?? ''] ?? '...nội dung video đang được tải...'];

  const chapterNode = mindmapNodes.find((n) => n.id === node.nodeId);
  const doc = chapterNode?.documents.find((d) => d.id === node.docId);

  // Show floating menu on text selection (mouseup) or right-click
  const showMenuForSelection = useCallback((clientX: number, clientY: number) => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (!text || text.length < 3) return false;

    const containerRect = contentRef.current?.getBoundingClientRect();
    if (!containerRect) return false;

    setFloatingMenu({
      x: clientX - containerRect.left,
      y: clientY - containerRect.top,
      text,
    });
    return true;
  }, []);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    setTimeout(() => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();
      if (!text || text.length < 3) {
        setFloatingMenu(null);
        return;
      }
      const range = selection?.getRangeAt(0);
      if (!range) return;
      const rect = range.getBoundingClientRect();
      const containerRect = contentRef.current?.getBoundingClientRect();
      if (!containerRect) return;
      setFloatingMenu({
        x: rect.left + rect.width / 2 - containerRect.left,
        y: rect.top - containerRect.top - 8,
        text,
      });
    }, 10);
  }, []);

  // Right-click on content: show AI menu (with selected text if any)
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const selection = window.getSelection();
    const text = selection?.toString().trim() ?? '';
    const containerRect = contentRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    setFloatingMenu({
      x: e.clientX - containerRect.left,
      y: e.clientY - containerRect.top,
      text,
    });
  }, []);

  // Dismiss on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (floatingMenu && contentRef.current && !contentRef.current.contains(e.target as Node)) {
        setFloatingMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [floatingMenu]);

  const handleAction = useCallback((type: 'ai-chat' | 'ai-review') => {
    const text = floatingMenu?.text || undefined;
    onCreateAINode(node.id, type, text);
    setFloatingMenu(null);
    window.getSelection()?.removeAllRanges();
  }, [floatingMenu, node.id, onCreateAINode]);

  return (
    <div className="flex flex-col h-full bg-[#F5F0EB]">
      <ExpandedHeader
        icon={node.docType === 'video' ? '▶' : '◎'}
        title={node.title}
        subtitle={doc ? `${node.docType === 'video' ? `Video • ${doc.duration}` : `PDF • ${doc.size}`}` : undefined}
        onClose={onClose}
      />

      {node.docType === 'text' && (
        <div
          className="flex-1 overflow-y-auto px-6 py-5 relative"
          ref={contentRef}
          onMouseUp={handleMouseUp}
          onContextMenu={handleContextMenu}
        >
          <div className="space-y-4 max-w-xl mx-auto">
            {paragraphs.map((para, i) => (
              <p key={i} className="text-[13.5px] text-[#2D2D2D] leading-[1.9] font-serif select-text">{para}</p>
            ))}
          </div>

          {/* Floating AI menu — appears on selection or right-click */}
          <AnimatePresence>
            {floatingMenu && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="absolute z-50 flex flex-col bg-[#2D2D2D] rounded-xl shadow-2xl overflow-hidden"
                style={{
                  left: floatingMenu.x,
                  top: floatingMenu.y,
                  transform: 'translate(-50%, -100%)',
                  minWidth: 180,
                }}
              >
                {floatingMenu.text && (
                  <div className="px-3 py-2 text-[10px] text-white/50 border-b border-white/10 truncate max-w-[220px]">
                    "{floatingMenu.text.slice(0, 50)}{floatingMenu.text.length > 50 ? '...' : ''}"
                  </div>
                )}
                <button
                  onMouseDown={(e) => { e.preventDefault(); handleAction('ai-chat'); }}
                  className="flex items-center gap-2 px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-white/15 transition-colors cursor-pointer text-left"
                >
                  <MessageCircle size={13} className="text-[#6EE7B7]" /> AI hỏi đáp
                </button>
                <button
                  onMouseDown={(e) => { e.preventDefault(); handleAction('ai-review'); }}
                  className="flex items-center gap-2 px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-white/15 transition-colors cursor-pointer text-left"
                >
                  <ClipboardList size={13} className="text-[#FCA5A5]" /> AI ôn tập
                </button>
                {/* Arrow */}
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-[#2D2D2D] rotate-45" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {node.docType === 'video' && (
        <div
          className="flex-1 overflow-y-auto px-5 py-4 relative"
          onContextMenu={handleContextMenu}
          onMouseUp={handleMouseUp}
          ref={contentRef}
        >
          <VideoPlayer node={node} />
          <div className="p-4 bg-white rounded-xl border border-[#E5E5DF]">
            <p className="text-[11px] font-bold text-[#5A5C58] uppercase tracking-wide mb-2">Nội dung chính</p>
            <p className="text-[13px] text-[#5A5C58] leading-relaxed italic select-text">{paragraphs[0]}</p>
          </div>

          {/* Floating AI menu — same as text view */}
          <AnimatePresence>
            {floatingMenu && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="absolute z-50 flex flex-col bg-[#2D2D2D] rounded-xl shadow-2xl overflow-hidden"
                style={{
                  left: floatingMenu.x,
                  top: floatingMenu.y,
                  transform: 'translate(-50%, -100%)',
                  minWidth: 180,
                }}
              >
                {floatingMenu.text && (
                  <div className="px-3 py-2 text-[10px] text-white/50 border-b border-white/10 truncate max-w-[220px]">
                    &ldquo;{floatingMenu.text.slice(0, 50)}{floatingMenu.text.length > 50 ? '...' : ''}&rdquo;
                  </div>
                )}
                <button
                  onMouseDown={(e) => { e.preventDefault(); handleAction('ai-chat'); }}
                  className="flex items-center gap-2 px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-white/15 transition-colors cursor-pointer text-left"
                >
                  <MessageCircle size={13} className="text-[#6EE7B7]" /> AI hỏi đáp
                </button>
                <button
                  onMouseDown={(e) => { e.preventDefault(); handleAction('ai-review'); }}
                  className="flex items-center gap-2 px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-white/15 transition-colors cursor-pointer text-left"
                >
                  <ClipboardList size={13} className="text-[#FCA5A5]" /> AI ôn tập
                </button>
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-[#2D2D2D] rotate-45" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Footer: AI actions for full document */}
      <div className="flex gap-2.5 px-5 py-3.5 border-t-2 border-[#333333]/15 bg-white/40 flex-shrink-0">
        <button
          onClick={() => onCreateAINode(node.id, 'ai-chat')}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#D1FAE5] border-2 border-[#6EE7B7] text-[#065F46] font-bold text-[12px] hover:bg-[#A7F3D0] transition-colors cursor-pointer"
        >
          <MessageCircle size={13} /> AI hỏi đáp
        </button>
        <button
          onClick={() => onCreateAINode(node.id, 'ai-review')}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#FEE2E2] border-2 border-[#FCA5A5] text-[#991B1B] font-bold text-[12px] hover:bg-[#FECACA] transition-colors cursor-pointer"
        >
          <ClipboardList size={13} /> Ôn tập
        </button>
      </div>
    </div>
  );
}
