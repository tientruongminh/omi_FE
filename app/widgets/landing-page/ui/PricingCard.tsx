'use client';

import { motion } from 'framer-motion';

interface PricingCardProps {
  title: string;
  price: string;
  subtext: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

export default function PricingCard({ title, price, subtext, features, cta, highlighted = false }: PricingCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="flex flex-col gap-5 p-7 rounded-2xl border-2 transition-all"
      style={{ background: highlighted ? '#2D2D2D' : '#FFFFFF', borderColor: highlighted ? '#2D2D2D' : '#E5DDD5' }}
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: highlighted ? 'rgba(255,255,255,0.5)' : '#9CA3AF' }}>{title}</p>
        <p className="text-3xl font-extrabold" style={{ color: highlighted ? '#FFFFFF' : '#2D2D2D' }}>{price}</p>
        <p className="text-sm mt-1" style={{ color: highlighted ? 'rgba(255,255,255,0.5)' : '#5A5C58' }}>{subtext}</p>
      </div>
      <div className="flex flex-col gap-2.5">
        {features.map((f) => (
          <div key={f} className="flex items-center gap-2">
            <span className="text-xs font-bold" style={{ color: highlighted ? '#4CD964' : '#3DBE7A' }}>✓</span>
            <span className="text-sm" style={{ color: highlighted ? 'rgba(255,255,255,0.85)' : '#2D2D2D' }}>{f}</span>
          </div>
        ))}
      </div>
      <button className="w-full py-3 rounded-full font-bold text-sm transition-all hover:opacity-90 cursor-pointer"
        style={{ background: highlighted ? '#4CD964' : '#2D2D2D', color: highlighted ? '#2D2D2D' : '#FFFFFF' }}>
        {cta}
      </button>
    </motion.div>
  );
}
