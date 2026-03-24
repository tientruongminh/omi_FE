'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = [
  { name: 'Xanh lá', bg: '#EDFAF4', border: '#3DBE7A' },
  { name: 'Tím', bg: '#E8D5F5', border: '#A855F7' },
  { name: 'Xanh dương', bg: '#DBEAFE', border: '#3B82F6' },
  { name: 'Cam', bg: '#FFF7ED', border: '#F97316' },
  { name: 'Hồng', bg: '#FCE7F3', border: '#EC4899' },
  { name: 'Vàng', bg: '#FFFDE7', border: '#F59E0B' },
  { name: 'Đỏ', bg: '#FEF2F2', border: '#EF4444' },
  { name: 'Xanh ngọc', bg: '#ECFDF5', border: '#10B981' },
  { name: 'Chàm', bg: '#EEF2FF', border: '#6366F1' },
  { name: 'Xám', bg: '#F3F4F6', border: '#6B7280' },
  { name: 'Nâu', bg: '#FDF4E7', border: '#A16207' },
  { name: 'Mint', bg: '#F0FDFA', border: '#14B8A6' },
];

interface Props {
  x: number;
  y: number;
  currentColor?: string;
  onSelectColor: (bg: string, border: string) => void;
  onClose: () => void;
}

export default function ColorPicker({ x, y, currentColor, onSelectColor, onClose }: Props) {
  return (
    <>
      <div className="fixed inset-0 z-[80]" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.15 }}
        className="fixed z-[85] bg-white border-2 border-[#333333] rounded-xl shadow-2xl p-3"
        style={{ left: x, top: y, width: 220 }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[11px] font-bold text-[#5A5C58] mb-2 uppercase tracking-wider">Đổi màu</p>
        <div className="grid grid-cols-4 gap-2">
          {COLORS.map((color) => (
            <button
              key={color.name}
              className="w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 flex items-center justify-center"
              style={{
                backgroundColor: color.bg,
                borderColor: currentColor === color.border ? '#333333' : color.border,
                boxShadow: currentColor === color.border ? '0 0 0 2px #333' : 'none',
              }}
              title={color.name}
              onClick={() => {
                onSelectColor(color.bg, color.border);
                onClose();
              }}
            >
              {currentColor === color.border && (
                <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
                  <path d="M1 5.5L5 9.5L13 1.5" stroke={color.border} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </motion.div>
    </>
  );
}
