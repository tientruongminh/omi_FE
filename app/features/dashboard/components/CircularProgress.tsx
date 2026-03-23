'use client';

import { motion } from 'framer-motion';

interface Props {
  percentage: number;
  units: number;
  total: number;
}

export default function CircularProgress({ percentage, units, total }: Props) {
  const radius = 78;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 196, height: 196 }}>
      <svg width="196" height="196" className="-rotate-90">
        <circle cx="98" cy="98" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="14" />
        <motion.circle cx="98" cy="98" r={radius} fill="none" stroke="#4CD964" strokeWidth="14" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-[#2D2D2D]">{percentage}%</span>
        <span className="text-sm text-[#5A5C58] mt-1">{units}/{total} units</span>
      </div>
    </div>
  );
}
