'use client';

import { DashboardStat } from '@/shared/types';
import StatCard from './StatCard';

const STAT_ACCENTS = ['#4CD964', '#818CF8', '#F08080', '#F5A623'];

interface Props {
  stats: DashboardStat[];
}

export default function StatGrid({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, i) => (
        <StatCard key={stat.label} stat={stat} index={i} accentColor={STAT_ACCENTS[i] ?? stat.color} />
      ))}
    </div>
  );
}
