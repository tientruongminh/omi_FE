'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { SelectionToolbarState } from '../model/types';

interface Props {
  toolbar: SelectionToolbarState;
  onCreate: () => void;
  onClose: () => void;
}

export default function SelectionToolbar({ toolbar, onCreate, onClose }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.15 }}
      className="fixed z-[75] flex items-center gap-1 bg-[#2D2D2D] rounded-full px-3 py-1.5 shadow-xl"
      style={{ left: toolbar.x - 80, top: toolbar.y - 40 }}
    >
      <span className="text-white text-[11px] font-medium">Văn bản đã chọn</span>
      <button
        onClick={() => { onCreate(); onClose(); }}
        className="ml-1 px-2.5 py-1 bg-[#6B2D3E] text-white text-[11px] font-bold rounded-full hover:bg-[#5a2434] transition-colors cursor-pointer"
      >
        + Tạo node mới
      </button>
      <button onClick={onClose} className="ml-0.5 text-white/60 hover:text-white transition-colors cursor-pointer">
        <X size={11} />
      </button>
    </motion.div>
  );
}
