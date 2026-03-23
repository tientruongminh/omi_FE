'use client';

import { MessageCircle, ClipboardList } from 'lucide-react';

interface Props {
  onAI: () => void;
  onReview: () => void;
}

export default function DocFooterActions({ onAI, onReview }: Props) {
  return (
    <div className="flex gap-2.5 px-5 py-3.5 border-t-2 border-[#333333]/15 bg-white/40 flex-shrink-0">
      <button
        onClick={onAI}
        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#D1FAE5] border-2 border-[#6EE7B7] text-[#065F46] font-bold text-[12px] hover:bg-[#A7F3D0] transition-colors cursor-pointer"
      >
        <MessageCircle size={13} /> AI hỏi đáp
      </button>
      <button
        onClick={onReview}
        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#FEE2E2] border-2 border-[#FCA5A5] text-[#991B1B] font-bold text-[12px] hover:bg-[#FECACA] transition-colors cursor-pointer"
      >
        <ClipboardList size={13} /> Ôn tập
      </button>
    </div>
  );
}
