'use client';

import Link from 'next/link';

interface Props {
  href?: string;
  className?: string;
  light?: boolean;
  children?: React.ReactNode;
}

export default function CTAButton({ href = '/', className = '', light = false, children }: Props) {
  return (
    <Link href={href}
      className={`inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold transition-all hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 ${className}`}
      style={{ background: light ? '#FFFFFF' : '#2D2D2D', color: light ? '#2D2D2D' : '#FFFFFF', willChange: 'transform' }}>
      {children ?? 'Bắt đầu miễn phí'}
    </Link>
  );
}
