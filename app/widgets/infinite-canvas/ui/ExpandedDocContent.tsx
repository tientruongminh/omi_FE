'use client';

import { useState } from 'react';
import { CanvasNode } from '../model/types';
import { documentTextContent, videoTranscripts, mindmapNodes } from '@/entities/learning-content';
import ExpandedHeader from './ExpandedHeader';
import VideoPlayer from './VideoPlayer';
import NodeAIChat from '@/features/node-ai-chat/ui/NodeAIChat';
import NodeReview from '@/features/node-review/ui/NodeReview';
import { MessageCircle, ClipboardList } from 'lucide-react';

interface Props {
  node: CanvasNode;
  onClose: () => void;
  onCreateAINode: (nodeId: string, type: 'ai-response' | 'review') => void;
}

export default function ExpandedDocContent({ node, onClose, onCreateAINode }: Props) {
  const paragraphs = node.docType === 'text'
    ? (documentTextContent[node.docId ?? ''] ?? ['Nội dung đang được chuẩn bị.'])
    : [videoTranscripts[node.docId ?? ''] ?? '...nội dung video đang được tải...'];

  const chapterNode = mindmapNodes.find((n) => n.id === node.nodeId);
  const doc = chapterNode?.documents.find((d) => d.id === node.docId);

  return (
    <div className="flex flex-col h-full bg-[#F5F0EB]">
      <ExpandedHeader
        icon={node.docType === 'video' ? '▶' : '◎'}
        title={node.title}
        subtitle={doc ? `${node.docType === 'video' ? `Video • ${doc.duration}` : `PDF • ${doc.size}`}` : undefined}
        onClose={onClose}
      />

      {node.docType === 'text' && (
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-4 max-w-xl mx-auto">
            {paragraphs.map((para, i) => (
              <p key={i} className="text-[13.5px] text-[#2D2D2D] leading-[1.9] font-serif">{para}</p>
            ))}
          </div>
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

      {/* Footer: AI actions create NEW nodes instead of switching tab */}
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
