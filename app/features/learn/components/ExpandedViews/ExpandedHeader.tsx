'use client';

import { X } from 'lucide-react';

interface Props {
  icon: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
  background?: string;
  borderColor?: string;
}

export default function ExpandedHeader({ icon, title, subtitle, onClose, background = 'white/40', borderColor = '#333333' }: Props) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5 border-b-2 border-[#333333]/15 bg-white/40 flex-shrink-0">
      <span className="text-lg">{icon}</span>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-[#2D2D2D] text-[14px] truncate">{title}</h3>
        {subtitle && <p className="text-[11px] text-[#5A5C58]">{subtitle}</p>}
      </div>
      <button
        onClick={onClose}
        className="w-7 h-7 rounded-full bg-white border border-[#333333]/20 flex items-center justify-center hover:border-[#333333] transition-colors cursor-pointer flex-shrink-0"
      >
        <X size={13} />
      </button>
    </div>
  );
}
