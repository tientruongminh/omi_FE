'use client';

import { Plus, Minus, RotateCcw } from 'lucide-react';

interface Props {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export default function ZoomControls({ onZoomIn, onZoomOut, onReset }: Props) {
  const buttons = [
    { icon: <Plus size={13} />, action: onZoomIn, title: 'Phóng to' },
    { icon: <Minus size={13} />, action: onZoomOut, title: 'Thu nhỏ' },
    { icon: <RotateCcw size={12} />, action: onReset, title: 'Đặt lại' },
  ];

  return (
    <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
      {buttons.map(({ icon, action, title }) => (
        <button
          key={title}
          title={title}
          onClick={action}
          className="w-8 h-8 rounded-lg bg-white border-2 border-[#333333] flex items-center justify-center text-[#333333] hover:bg-[#F1F1EC] transition-colors shadow-sm cursor-pointer"
        >
          {icon}
        </button>
      ))}
    </div>
  );
}
