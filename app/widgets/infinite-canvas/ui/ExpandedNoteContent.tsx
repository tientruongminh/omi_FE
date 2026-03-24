'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';
import { CanvasNode } from '../model/types';
import ExpandedHeader from './ExpandedHeader';

interface Props {
  node: CanvasNode;
  onClose: () => void;
  onUpdateContent?: (nodeId: string, content: string) => void;
}

export default function ExpandedNoteContent({ node, onClose, onUpdateContent }: Props) {
  const [content, setContent] = useState(node.content ?? '');
  const [isPolishing, setIsPolishing] = useState(false);
  const [polished, setPolished] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setContent(node.content ?? '');
    setPolished(false);
  }, [node.id, node.content]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.max(200, el.scrollHeight) + 'px';
    }
  }, [content]);

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setPolished(false);
    onUpdateContent?.(node.id, newContent);
  }, [node.id, onUpdateContent]);

  const handleAIPolish = useCallback(async () => {
    if (!content.trim() || isPolishing) return;
    setIsPolishing(true);
    
    // Simulate AI polishing (in real app, call API)
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Simple polish: clean up, add structure
    const lines = content.split('\n').filter((l) => l.trim());
    const polishedLines = lines.map((line) => {
      let l = line.trim();
      // Capitalize first letter
      if (l.length > 0) l = l[0].toUpperCase() + l.slice(1);
      // Add period if missing
      if (l.length > 5 && !l.endsWith('.') && !l.endsWith('!') && !l.endsWith('?') && !l.endsWith(':')) l += '.';
      return l;
    });
    
    const polishedText = polishedLines.join('\n');
    setContent(polishedText);
    onUpdateContent?.(node.id, polishedText);
    setIsPolishing(false);
    setPolished(true);
    setTimeout(() => setPolished(false), 3000);
  }, [content, isPolishing, node.id, onUpdateContent]);

  return (
    <div className="flex flex-col h-full bg-[#FFFDE7]">
      <ExpandedHeader icon="✎" title={node.title} onClose={onClose} />
      
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          placeholder="Ghi chú ý tưởng, insight của bạn tại đây..."
          className="w-full bg-transparent text-[14px] text-[#78350F] leading-[1.9] font-serif resize-none outline-none placeholder:text-[#C4A35A]/50 min-h-[200px]"
          style={{ border: 'none' }}
        />
      </div>

      {/* AI Polish Button */}
      <div className="px-6 py-4 border-t border-[#F59E0B]/20 flex items-center justify-between">
        <span className="text-[11px] text-[#92400E]/60">
          {content.length} ký tự
        </span>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAIPolish}
          disabled={isPolishing || !content.trim()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all disabled:opacity-40"
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
