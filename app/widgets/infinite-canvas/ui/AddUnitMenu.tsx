'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { mindmapNodes, additionalUnits } from '@/entities/learning-content';
// Props định nghĩa các tham số mà component nhận vào, bao gồm vị trí hiển thị menu (x, y), vị trí trên canvas để thêm đơn vị mới (canvasX, canvasY), hàm callback khi người dùng chọn một đơn vị để thêm (onAddUnit), và hàm callback để đóng menu (onClose).
interface Props {
  x: number;
  y: number;
  canvasX: number;
  canvasY: number;
  onAddUnit: (unitId: string, unitLabel: string, cx: number, cy: number) => void;
  onClose: () => void;
}

// Menu hiển thị khi người dùng click vào canvas để thêm đơn vị bài học mới
export default function AddUnitMenu({ x, y, canvasX, canvasY, onAddUnit, onClose }: Props) {
  useEffect(() => {
    const close = () => onClose();
    setTimeout(() => document.addEventListener('click', close), 0);
    return () => document.removeEventListener('click', close);
  }, [onClose]);

  const allUnits = [
    ...mindmapNodes.map((n) => ({ id: n.id, label: n.label, subtitle: n.subtitle })),
    ...additionalUnits.map((u) => ({ id: u.id, label: u.label, subtitle: u.summary })),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.12 }}
      className="fixed z-[70] bg-white border-2 border-[#333333] rounded-xl shadow-2xl overflow-hidden"
      style={{ left: x, top: y, width: 280, maxHeight: 360 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-4 py-3 border-b border-[#CCCCCC] bg-[#F5F0EB]">
        <p className="text-[12px] font-bold text-[#2D2D2D]">Thêm đơn vị bài học</p>
        <p className="text-[10px] text-[#5A5C58]">Chọn để thêm vào canvas</p>
      </div>
      <div className="overflow-y-auto" style={{ maxHeight: 300 }}>
        {allUnits.map((unit) => (
          <button
            key={unit.id}
            className="w-full text-left px-4 py-3 hover:bg-[#F5F0EB] transition-colors border-b border-[#F1F1EC] last:border-0"
            onClick={() => { onAddUnit(unit.id, unit.label, canvasX, canvasY); onClose(); }}
          >
            <p className="text-[13px] font-semibold text-[#2D2D2D]">{unit.label}</p>
            <p className="text-[10px] text-[#5A5C58] leading-snug mt-0.5 line-clamp-2">{unit.subtitle}</p>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
