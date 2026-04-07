'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Link2, Check } from 'lucide-react';
import { CanvasNode } from '../model/types';
import ExpandedHeader from './ExpandedHeader';
import { aiApi } from '@/entities/ai';
import { useAuthStore } from '@/entities/auth/store';

interface Props {
  node: CanvasNode;
  onClose: () => void;
  onUpdateContent?: (nodeId: string, content: string) => void;
}

export default function ExpandedNoteContent({ node, onClose, onUpdateContent }: Props) {
  const user = useAuthStore((s) => s.user);
  const [content, setContent] = useState(node.content ?? '');
  const [title, setTitle] = useState(node.title);
  const [isPolishing, setIsPolishing] = useState(false);
  const [polished, setPolished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setContent(node.content ?? '');
    setTitle(node.title);
    setPolished(false);
  }, [node.id, node.content, node.title]);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.max(200, el.scrollHeight) + 'px';
    }
  }, [content]);

  useEffect(() => {
    setTimeout(() => textareaRef.current?.focus(), 300);
  }, [node.id]);

  // Debounced save to backend
  const saveToBackend = useCallback((newContent: string) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        setIsSaving(true);
        await aiApi.updateNodeContent(node.id, newContent);
        setSavedOk(true);
        setTimeout(() => setSavedOk(false), 2000);
      } catch {
        // Silently fail — local state still updated
      } finally {
        setIsSaving(false);
      }
    }, 1200);
  }, [node.id]);

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setPolished(false);
    onUpdateContent?.(node.id, newContent);
    saveToBackend(newContent);
  }, [node.id, onUpdateContent, saveToBackend]);

  const handleAIPolish = useCallback(async () => {
    if (!content.trim() || isPolishing) return;
    setIsPolishing(true);

    try {
      const userId = user?.user_id ?? 'anonymous';
      const res = await aiApi.chat(
        userId,
        `Hãy hoàn thiện và cải thiện đoạn ghi chú sau, giữ nguyên ý nghĩa, sửa lỗi chính tả và văn phong. Chỉ trả về nội dung đã hoàn thiện, không thêm chú thích:\n\n${content}`,
      );
      const polishedText = res.response;
      setContent(polishedText);
      onUpdateContent?.(node.id, polishedText);
      saveToBackend(polishedText);
      setPolished(true);
      setTimeout(() => setPolished(false), 3000);
    } catch {
      // Fallback: basic local polish
      const lines = content.split('\n').filter((l) => l.trim());
      const polishedLines = lines.map((line) => {
        let l = line.trim();
        if (l.length > 0) l = l[0].toUpperCase() + l.slice(1);
        if (l.length > 5 && !l.endsWith('.') && !l.endsWith('!') && !l.endsWith('?') && !l.endsWith(':')) l += '.';
        return l;
      });
      const polishedText = polishedLines.join('\n');
      setContent(polishedText);
      onUpdateContent?.(node.id, polishedText);
      setPolished(true);
      setTimeout(() => setPolished(false), 3000);
    } finally {
      setIsPolishing(false);
    }
  }, [content, isPolishing, node.id, onUpdateContent, user, saveToBackend]);

  return (
    <div className="flex flex-col h-full bg-[#FFFDE7]">
      <ExpandedHeader icon="✎" title={title} onClose={onClose} />

      {/* Editable title */}
      <div className="px-6 pt-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-transparent text-[16px] font-bold text-[#78350F] outline-none border-b border-[#F59E0B]/30 pb-2 placeholder:text-[#C4A35A]/40"
          placeholder="Tiêu đề ghi chú..."
        />
      </div>

      {/* Editable content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          placeholder="Ghi chú ý tưởng, insight của bạn tại đây...

VD: Khái niệm process scheduling rất giống cách quản lý hàng đợi ở quầy giao dịch ngân hàng — priority queue...

Nối node ghi chú này với node khác (kéo từ dấu chấm) để AI dựa trên nội dung đó trả lời câu hỏi."
          className="w-full bg-transparent text-[14px] text-[#78350F] leading-[1.9] font-serif resize-none outline-none placeholder:text-[#C4A35A]/40 min-h-[200px]"
          style={{ border: 'none' }}
        />
      </div>

      {/* Connection hint */}
      <div className="px-6 py-2 flex items-center gap-2 text-[11px] text-[#92400E]/50">
        <Link2 size={12} />
        <span>Kéo từ dấu chấm để nối với node khác — AI sẽ dựa nội dung đã nối để trả lời</span>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[#F59E0B]/20 flex items-center justify-between">
        <span className="text-[11px] text-[#92400E]/60 flex items-center gap-2">
          {isSaving && <Loader2 size={10} className="animate-spin" />}
          {savedOk && <Check size={10} className="text-green-600" />}
          {content.length} ký tự
        </span>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAIPolish}
          disabled={isPolishing || !content.trim()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all disabled:opacity-40 cursor-pointer"
          style={{
            backgroundColor: polished ? '#34D399' : '#FEF3C7',
            color: polished ? '#065F46' : '#92400E',
            border: `1px solid ${polished ? '#10B981' : '#F59E0B'}`,
          }}
        >
          <AnimatePresence mode="wait">
            {isPolishing ? (
              <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Loader2 size={14} className="animate-spin" />
              </motion.span>
            ) : polished ? (
              <motion.span key="done" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}>✓</motion.span>
            ) : (
              <motion.span key="icon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Sparkles size={14} />
              </motion.span>
            )}
          </AnimatePresence>
          {isPolishing ? 'Đang hoàn thiện...' : polished ? 'Đã hoàn thiện!' : 'AI hoàn thiện ý tưởng'}
        </motion.button>
      </div>
    </div>
  );
}
