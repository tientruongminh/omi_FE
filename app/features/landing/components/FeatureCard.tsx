'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const, delay: i * 0.1 } }),
};

interface FeatureCardProps {
  title: string;
  caption: string;
  stat: string;
  children: React.ReactNode;
  tilt?: number;
  delay?: number;
  inView: boolean;
}

export default function FeatureCard({ title, caption, stat, children, tilt = 0, delay = 0, inView }: FeatureCardProps) {
  return (
    <motion.div custom={delay} variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'} className="flex flex-col gap-4 group" style={{ transformOrigin: 'center bottom' }}>
      <div
        className="rounded-2xl overflow-hidden transition-all duration-300 group-hover:shadow-2xl"
        style={{ transform: `rotate(${tilt}deg)`, border: '2px solid #E5DDD5', background: '#FFFFFF' }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'rotate(0deg) translateY(-4px)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = `rotate(${tilt}deg)`; }}
      >
        {children}
      </div>
      <div className="px-2">
        <p className="text-sm font-bold mb-1" style={{ color: '#2D2D2D' }}>{title}</p>
        <p className="text-xs leading-relaxed mb-2" style={{ color: '#5A5C58' }}>{caption}</p>
        <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: '#EDFAF4', color: '#1A6E3E' }}>{stat}</span>
      </div>
    </motion.div>
  );
}
