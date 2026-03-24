'use client';

import { useState } from 'react';
import { CanvasNode } from '../model/types';
import { documentTextContent, videoTranscripts, mindmapNodes } from '@/entities/learning-content';
import ExpandedHeader from './ExpandedHeader';
import DocFooterActions from './DocFooterActions';
import VideoPlayer from './VideoPlayer';
import NodeAIChat from '@/features/node-ai-chat/ui/NodeAIChat';
import NodeReview from '@/features/node-review/ui/NodeReview';

interface Props {
  node: CanvasNode;
  onClose: () => void;
  onCreateAINode: (nodeId: string, type: 'ai-response' | 'review') => void;
}

export default function ExpandedDocContent({ node, onClose, onCreateAINode }: Props) {
  const [view, setView] = useState<'content' | 'ai' | 'review'>('content');

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

      {view === 'content' && node.docType === 'text' && (
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-4 max-w-xl mx-auto">
            {paragraphs.map((para, i) => (
              <p key={i} className="text-[13.5px] text-[#2D2D2D] leading-[1.9] font-serif">{para}</p>
            ))}
          </div>
        </div>
      )}

      {view === 'content' && node.docType === 'video' && (
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <VideoPlayer node={node} />
          <div className="p-4 bg-white rounded-xl border border-[#E5E5DF]">
            <p className="text-[11px] font-bold text-[#5A5C58] uppercase tracking-wide mb-2">Nội dung chính</p>
            <p className="text-[13px] text-[#5A5C58] leading-relaxed italic">{paragraphs[0]}</p>
          </div>
        </div>
      )}

      {view === 'ai' && (
        <div className="flex-1 overflow-hidden">
          <NodeAIChat docId={node.docId ?? null} paragraphs={paragraphs} docTitle={node.title} onBack={() => setView('content')} />
        </div>
      )}

      {view === 'review' && (
        <div className="flex-1 overflow-hidden">
          <NodeReview onBack={() => setView('content')} />
        </div>
      )}

      {view === 'content' && <DocFooterActions onAI={() => setView('ai')} onReview={() => setView('review')} />}
    </div>
  );
}
