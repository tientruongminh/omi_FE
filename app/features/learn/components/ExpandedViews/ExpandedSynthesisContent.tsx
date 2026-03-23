'use client';

import { CanvasNode } from '../InfiniteCanvas/types';
import ExpandedHeader from './ExpandedHeader';

interface Props {
  node: CanvasNode;
  allNodes: CanvasNode[];
  onClose: () => void;
}

export default function ExpandedSynthesisContent({ node, allNodes, onClose }: Props) {
  const sourceDocs = (node.synthSourceIds ?? [])
    .map((id) => allNodes.find((n) => n.id === id))
    .filter(Boolean) as CanvasNode[];

  return (
    <div className="flex flex-col h-full bg-white">
      <div
        className="flex items-center gap-3 px-5 py-3.5 border-b-2 border-[#333333]/10 flex-shrink-0"
        style={{ background: 'linear-gradient(to right, #F5F3FF, #ECFDF5)' }}
      >
        <span className="text-lg">⬡</span>
        <div className="flex-1">
          <h3 className="font-bold text-[#2D2D2D] text-[14px]">{node.title}</h3>
          <p className="text-[11px] text-[#5A5C58]">Tổng hợp từ {sourceDocs.length} nguồn</p>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-full bg-white border border-[#333333]/20 flex items-center justify-center cursor-pointer">
          <span className="text-xs">✕</span>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {sourceDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="text-4xl">⬡</div>
            <p className="text-[#5A5C58] text-[13px] leading-relaxed max-w-xs">
              Kéo các node khác vào đây để tổng hợp kiến thức từ nhiều nguồn.
            </p>
          </div>
        ) : (
          sourceDocs.map((src) => (
            <div key={src.id} className="p-4 bg-[#F5F0EB] rounded-xl border border-[#E5E5DF]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">{src.docType === 'video' ? '▶' : src.type === 'ai-response' ? 'AI' : '◎'}</span>
                <p className="text-[13px] font-bold text-[#2D2D2D]">{src.title}</p>
              </div>
              {src.content && <p className="text-[12px] text-[#5A5C58] leading-relaxed line-clamp-3">{src.content}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
