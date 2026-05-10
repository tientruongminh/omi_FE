'use client';

import { motion } from 'framer-motion';
import ProgressBar from '@/shared/ui/ProgressBar';
import { DashboardStat } from '@/entities/dashboard';

interface Props {
  stat: DashboardStat;
  index: number;
  accentColor: string;
}

export default function StatCard({ stat, index, accentColor }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} // Start slightly below and transparent
      animate={{ opacity: 1, y: 0 }}  // Animate to original position and full opacity
      transition={{ delay: index * 0.1, // 
         duration: 0.4 }}  // Stagger the animation based on index
      className="relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-[#2D2D2D]/12 bg-[#F1F1EC] p-4 shadow-[0_2px_10px_rgba(45,45,45,0.06)] ring-1 ring-white/70 transition-all hover:border-[#6B2D3E]/25 hover:shadow-[0_8px_18px_rgba(45,45,45,0.12)]" 
    >
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl" style={{ backgroundColor: accentColor }} />
      <div className="flex items-center justify-between mt-1">
        <span className="text-sm font-semibold text-[#2D2D2D]">{stat.label}</span>
        <span className="text-lg font-bold" style={{ color: stat.color }}>{stat.percentage}%</span>
      </div>
      <ProgressBar value={stat.percentage} color={stat.color} height={8} delay={0.5 + index * 0.1} />
    </motion.div>
  );
}
