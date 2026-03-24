'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface Crumb {
  label: string;
  href?: string;
}

interface Props {
  crumbs: Crumb[];
}

export default function Breadcrumb({ crumbs }: Props) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-[#5A5C58] mb-6 flex-wrap">
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {crumb.href ? (
            <Link href={crumb.href} className="hover:text-[#2D2D2D] transition-colors">{crumb.label}</Link>
          ) : (
            <span className="text-[#6B2D3E] font-semibold">{crumb.label}</span>
          )}
          {i < crumbs.length - 1 && <ChevronRight size={14} className="text-[#9CA3AF]" />}
        </span>
      ))}
    </div>
  );
}
