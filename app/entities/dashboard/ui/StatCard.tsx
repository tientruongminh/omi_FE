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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="bg-[#F1F1EC] border-2 border-[#333333] rounded-2xl p-4 flex flex-col gap-3 overflow-hidden relative hover:border-[#6B2D3E]/40 hover:shadow-md transition-all"
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
