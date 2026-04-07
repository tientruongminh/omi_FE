'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, MessageCircle, ClipboardList } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AIStreamText from '@/shared/ui/AIStreamText';
import { CanvasNode } from '../model/types';
import ExpandedHeader from './ExpandedHeader';
import { aiApi } from '@/entities/ai/api';
import { useAuthStore } from '@/entities/auth/store';

interface Props {
  node: CanvasNode;
  onClose: () => void;
  onCreateAINode?: (nodeId: string, type: 'ai-chat' | 'ai-review', selectedText?: string) => void;
}

type ChatMsg = { id: string; role: 'ai' | 'user'; text: string };

interface FloatingMenu {
  x: number;
  y: number;
  text: string;
}

export default function ExpandedAIContent({ node, onClose, onCreateAINode }: Props) {
  const user = useAuthStore((s) => s.user);
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState<ChatMsg[]>([{ id: 'init', role: 'ai', text: node.content ?? node.title }]);
  const [streaming, setStreaming] = useState(false);
  const [floatingMenu, setFloatingMenu] = useState<FloatingMenu | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const isChat = node.type === 'ai-chat';
  const headerBg = isChat ? '#D1FAE5' : '#FEE2E2';
  const accentColor = isChat ? '#065F46' : '#991B1B';
  const borderColor = isChat ? '#34D399' : '#F87171';

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const send = async () => {
    if (!input.trim() || streaming) return;
    const query = input.trim();
    const userMsgId = Date.now() + '-u';
    const aiMsgId = Date.now() + '-ai';
    setMsgs((prev) => [
      ...prev,
      { id: userMsgId, role: 'user', text: query },
      { id: aiMsgId, role: 'ai', text: '' },
    ]);
    setInput('');
    setStreaming(true);
    try {
      const userId = user?.user_id ?? 'anonymous';
      const contextPrompt = node.content
        ? `Tài liệu: ${node.content.slice(0, 500)}\n\nCâu hỏi: ${query}`
        : query;
      const res = await aiApi.chat(userId, contextPrompt, 'vi');
      setMsgs((prev) =>
        prev.map((m) => m.id === aiMsgId ? { ...m, text: res.response } : m)
      );
    } catch {
      setMsgs((prev) =>
        prev.map((m) => m.id === aiMsgId ? { ...m, text: 'Xin lỗi, không thể kết nối AI lúc này.' } : m)
      );
    } finally {
      setStreaming(false);
    }
  };

  // Right-click / selection handling in chat
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onCreateAINode) return;

    const selection = window.getSelection();
    const text = selection?.toString().trim() ?? '';
    const containerRect = chatRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    setFloatingMenu({
      x: e.clientX - containerRect.left,
      y: e.clientY - containerRect.top,
      text,
    });
  }, [onCreateAINode]);

  const handleMouseUp = useCallback(() => {
    if (!onCreateAINode) return;
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
      const containerRect = chatRef.current?.getBoundingClientRect();
      if (!containerRect) return;
      setFloatingMenu({
        x: rect.left + rect.width / 2 - containerRect.left,
        y: rect.top - containerRect.top - 8,
        text,
      });
    }, 10);
  }, [onCreateAINode]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (floatingMenu && chatRef.current && !chatRef.current.contains(e.target as Node)) {
        setFloatingMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [floatingMenu]);

  const handleAction = useCallback((type: 'ai-chat' | 'ai-review') => {
    const text = floatingMenu?.text || undefined;
    onCreateAINode?.(node.id, type, text);
    setFloatingMenu(null);
    window.getSelection()?.removeAllRanges();
  }, [floatingMenu, node.id, onCreateAINode]);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: headerBg }}>
      <ExpandedHeader
        icon={isChat ? '💬' : '📋'}
        title={isChat ? 'AI Hỏi đáp' : 'AI Ôn tập'}
        onClose={onClose}
      />

      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto px-5 py-4 space-y-3 relative select-text"
        onContextMenu={handleContextMenu}
        onMouseUp={handleMouseUp}
      >
        {msgs.map((m, idx) => (
          <div key={m.id} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {m.role === 'ai' && (
              <div className="w-7 h-7 rounded-xl flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
                style={{ backgroundColor: 'white', border: `1px solid ${borderColor}` }}>
                {isChat ? '💬' : '📋'}
              </div>
            )}
            <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-[12.5px] leading-relaxed ${m.role === 'user' ? 'bg-[#6B2D3E] text-white rounded-tr-sm' : 'bg-white border border-[#E5E5DF] text-[#2D2D2D] rounded-tl-sm'}`}>
              {idx === 0 && m.role === 'ai' ? <AIStreamText text={m.text} speed={18} startDelay={200} /> : m.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />

        {/* Floating AI menu on selection/right-click */}
        <AnimatePresence>
          {floatingMenu && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 flex flex-col bg-[#2D2D2D] rounded-xl shadow-2xl overflow-hidden"
              style={{ left: floatingMenu.x, top: floatingMenu.y, transform: 'translate(-50%, -100%)', minWidth: 180 }}
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

      {/* Chat input */}
      <div className="px-5 py-3 border-t bg-white/40 flex-shrink-0" style={{ borderColor: `${borderColor}33` }}>
        <div className="flex gap-2 items-center bg-white border-2 rounded-full px-4 py-2 focus-within:border-[#6B2D3E] transition-colors" style={{ borderColor: '#E5E5DF' }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
            placeholder="Hỏi tiếp..." className="flex-1 text-[13px] text-[#2D2D2D] bg-transparent outline-none placeholder-[#9CA3AF]" />
          <button onClick={send} disabled={!input.trim() || streaming} className="w-7 h-7 rounded-full flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer"
            style={{ backgroundColor: input.trim() && !streaming ? '#6B2D3E' : '#E5E5DF' }}>
            <Send size={12} className={input.trim() && !streaming ? 'text-white' : 'text-[#9CA3AF]'} />
          </button>
        </div>
      </div>

      {/* Footer: create another AI node */}
      {onCreateAINode && (
        <div className="flex gap-2.5 px-5 py-3 border-t bg-white/40 flex-shrink-0" style={{ borderColor: `${borderColor}33` }}>
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
      )}
    </div>
  );
}
