'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Link2 } from 'lucide-react';
import { CanvasNode } from '../model/types';
import { aiApi } from '@/entities/ai/api';
import { useAuthStore } from '@/entities/auth/store';

interface Props {
  node: CanvasNode;
  allNodes: CanvasNode[];
  edges: { from: string; to: string }[];
  onClose: () => void;
  onUpdateContent?: (nodeId: string, content: string) => void;
}

export default function ExpandedSynthesisContent({ node, allNodes, edges, onClose, onUpdateContent }: Props) {
  const user = useAuthStore((s) => s.user);
  const [synthesizing, setSynthesizing] = useState(false);
  const [synthesized, setSynthesized] = useState(false);
  const [userPrompt, setUserPrompt] = useState('');

  // Find all connected nodes (via edges or synthSourceIds)
  const connectedIds = new Set([
    ...(node.synthSourceIds ?? []),
    ...edges.filter((e) => e.from === node.id || e.to === node.id).map((e) => e.from === node.id ? e.to : e.from),
  ]);
  
  const sourceDocs = allNodes.filter((n) => connectedIds.has(n.id));

  const handleSynthesize = useCallback(async () => {
    if (sourceDocs.length === 0 || synthesizing) return;
    setSynthesizing(true);

    try {
      const sourceTexts = sourceDocs.map((s) => `[${s.title}]: ${s.content ?? s.summary ?? '(không có nội dung)'}`).join('\n\n');
      const prompt = userPrompt.trim() || 'Tổng hợp các nội dung chính';
      const topic = `${prompt}\n\nNguồn:\n${sourceTexts}`;
      const res = await aiApi.research(topic, 'medium');
      const synthesizedContent = res.report;
      onUpdateContent?.(node.id, synthesizedContent);
      setSynthesized(true);
      setTimeout(() => setSynthesized(false), 3000);
    } catch {
      // Fallback: local synthesis
      const sourceTexts = sourceDocs.map((s) => `[${s.title}]: ${s.content ?? s.summary ?? '(không có nội dung)'}`).join('\n\n');
      const prompt = userPrompt.trim() || 'Tổng hợp các nội dung chính';
      const synthesizedContent = `📋 **${prompt}**\n\n` +
        `Dựa trên ${sourceDocs.length} nguồn:\n` +
        sourceDocs.map((s, i) => `${i + 1}. ${s.title}`).join('\n') +
        `\n\n---\n\n` +
        sourceDocs.map((s) => {
          const text = s.content ?? s.summary ?? '';
          return `▸ **${s.title}**: ${text.slice(0, 150)}${text.length > 150 ? '...' : ''}`;
        }).join('\n\n');
      onUpdateContent?.(node.id, synthesizedContent);
      setSynthesized(true);
      setTimeout(() => setSynthesized(false), 3000);
    } finally {
      setSynthesizing(false);
    }
  }, [sourceDocs, synthesizing, userPrompt, node.id, onUpdateContent, user]);

  return (
    <div className="flex flex-col h-full bg-white">
      <div
        className="flex items-center gap-3 px-5 py-3.5 border-b-2 border-[#333333]/10 flex-shrink-0"
        style={{ background: 'linear-gradient(to right, #F5F3FF, #ECFDF5)' }}
      >
        <span className="text-lg">⬡</span>
        <div className="flex-1">
          <h3 className="font-bold text-[#2D2D2D] text-[14px]">{node.title}</h3>
          <p className="text-[11px] text-[#5A5C58]">
            {sourceDocs.length > 0 ? `${sourceDocs.length} nguồn được kết nối` : 'Chưa có nguồn nào'}
          </p>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-full bg-white border border-[#333333]/20 flex items-center justify-center cursor-pointer">
          <span className="text-xs">✕</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {sourceDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <Link2 size={40} className="text-[#A855F7]/30" />
            <p className="text-[#5A5C58] text-[13px] leading-relaxed max-w-xs">
              Nối node tổng hợp này với các node khác (ghi chú, tài liệu, AI...) để tổng hợp kiến thức.
            </p>
            <p className="text-[11px] text-[#999]">
              Kéo cạnh từ node khác vào node này
            </p>
          </div>
        ) : (
          <>
            {/* Connected sources */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-[#5A5C58] uppercase tracking-wider">Nguồn kết nối</p>
              {sourceDocs.map((src) => (
                <div key={src.id} className="p-3 bg-[#F5F0EB] rounded-xl border border-[#E5E5DF]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">
                      {src.type === 'note' ? '✎' : (src.type === 'ai-chat' || src.type === 'ai-review') ? '🤖' : src.docType === 'video' ? '▶' : '◎'}
                    </span>
                    <p className="text-[13px] font-semibold text-[#2D2D2D]">{src.title}</p>
                  </div>
                  {(src.content || src.summary) && (
                    <p className="text-[11px] text-[#5A5C58] leading-relaxed line-clamp-2 ml-6">
                      {(src.content ?? src.summary ?? '').slice(0, 120)}...
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Synthesis prompt */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-[#5A5C58] uppercase tracking-wider">Yêu cầu tổng hợp</p>
              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="VD: Tóm tắt các điểm chính, so sánh nội dung, liệt kê câu hỏi ôn tập..."
                className="w-full p-3 rounded-xl border border-[#E5E5DF] bg-[#FAFAF8] text-[13px] text-[#2D2D2D] resize-none outline-none focus:border-[#A855F7] transition-colors min-h-[80px]"
              />
            </div>

            {/* Synthesized content */}
            {node.content && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-[#5A5C58] uppercase tracking-wider">Kết quả tổng hợp</p>
                <div className="p-4 bg-gradient-to-br from-[#F5F3FF] to-[#ECFDF5] rounded-xl border border-[#A855F7]/20">
                  <p className="text-[13px] text-[#2D2D2D] leading-relaxed whitespace-pre-wrap">{node.content}</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Synthesize button */}
      {sourceDocs.length > 0 && (
        <div className="px-6 py-4 border-t border-[#A855F7]/10">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSynthesize}
            disabled={synthesizing}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[13px] transition-all"
            style={{
              backgroundColor: synthesized ? '#34D399' : '#A855F7',
              color: 'white',
            }}
          >
            <AnimatePresence mode="wait">
              {synthesizing ? (
                <Loader2 size={14} className="animate-spin" />
              ) : synthesized ? (
                <motion.span initial={{ scale: 0.5 }} animate={{ scale: 1 }}>✓</motion.span>
              ) : (
                <Sparkles size={14} />
              )}
            </AnimatePresence>
            {synthesizing ? 'Đang tổng hợp...' : synthesized ? 'Đã tổng hợp!' : `Tổng hợp ${sourceDocs.length} nguồn`}
          </motion.button>
        </div>
      )}
    </div>
  );
}
