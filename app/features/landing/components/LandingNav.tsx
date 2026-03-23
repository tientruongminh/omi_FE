'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';
import CTAButton from './CTAButton';

export default function LandingNav() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-black/8" style={{ background: 'rgba(245,240,235,0.94)', backdropFilter: 'blur(14px)' }}>
      <div className="max-w-[1100px] mx-auto px-5 h-[62px] flex items-center justify-between">
        <button className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-black/5 transition-colors" aria-label="Menu">
          <Menu size={20} color="#2D2D2D" />
        </button>
        <span className="text-xl italic" style={{ fontFamily: 'Georgia, serif', color: '#6B2D3E', letterSpacing: '-0.01em' }}>omilearn</span>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm font-semibold transition-all hover:opacity-70" style={{ color: '#5A5C58' }}>Đăng nhập</Link>
          <CTAButton className="text-xs py-2.5 px-5" />
        </div>
      </div>
    </nav>
  );
}
