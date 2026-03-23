'use client';

import { Star } from 'lucide-react';

interface Props {
  quote: string;
  name: string;
  school: string;
  badge: string;
}

export default function TestimonialCard({ quote, name, school, badge }: Props) {
  return (
    <div className="flex flex-col gap-4 p-6 rounded-2xl transition-all hover:shadow-lg" style={{ background: '#FFFFFF', border: '2px solid #E5DDD5' }}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={13} fill="#F5C542" color="#F5C542" />)}
      </div>
      <p className="text-sm flex-1" style={{ color: '#5A5C58', lineHeight: 1.7 }}>&ldquo;{quote}&rdquo;</p>
      <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold" style={{ background: '#EDFAF4', color: '#1A6E3E', border: '1px solid #3DBE7A' }}>
        ✓ {badge}
      </div>
      <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: '#F0EBE3' }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: '#7C6FCD' }}>
          {name[0]}
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: '#2D2D2D' }}>{name}</p>
          <p className="text-xs" style={{ color: '#9CA3AF' }}>{school}</p>
        </div>
      </div>
    </div>
  );
}
