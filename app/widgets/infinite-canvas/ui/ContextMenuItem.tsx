'use client';

import { ChevronRight } from 'lucide-react';

interface Props {
  label: string;
  danger?: boolean;
  hasSubmenu?: boolean;
  onClick: () => void;
}

export default function ContextMenuItem({ label, danger, hasSubmenu, onClick }: Props) {
  return (
    <button
      className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-[#F1F1EC] transition-colors cursor-pointer flex items-center justify-between"
      style={{ color: danger ? '#DC2626' : '#2D2D2D' }}
      onClick={onClick}
    >
      <span>{label}</span>
      {hasSubmenu && <ChevronRight size={14} className="text-[#999]" />}
    </button>
  );
}
