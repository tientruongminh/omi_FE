'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface Props {
  icon: React.ReactNode;
  onClick: () => void;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
}

export default function IconButton({ icon, onClick, title, className = '', style, disabled }: Props) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 ${className}`}
      style={style}
    >
      {icon}
    </motion.button>
  );
}
