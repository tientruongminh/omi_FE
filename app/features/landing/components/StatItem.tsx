'use client';

import { useEffect, useState } from 'react';

function useCountUp(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

interface Props {
  value: number;
  suffix: string;
  label: string;
  inView: boolean;
}

export default function StatItem({ value, suffix, label, inView }: Props) {
  const count = useCountUp(value, 1600, inView);
  return (
    <div className="flex flex-col items-center gap-1 px-6 py-4">
      <span className="text-2xl md:text-3xl font-extrabold text-white">{count}{suffix}</span>
      <span className="text-xs md:text-sm text-center" style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</span>
    </div>
  );
}
