'use client';

import { motion } from 'framer-motion';

interface Props {
  value: number; // 0–100
  color?: string;
  height?: number;
  delay?: number;
  className?: string;
}

export default function ProgressBar({ value, color = '#4CD964', height = 8, delay = 0, className = '' }: Props) {
  return (
    <div
      className={`rounded-full bg-[#E5E7EB] overflow-hidden ${className}`}
      style={{ height }}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.9, delay, ease: 'easeOut' }}
      />
    </div>
  );
}
