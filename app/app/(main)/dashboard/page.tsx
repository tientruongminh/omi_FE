'use client';

import Link from 'next/link';
import { useOmiLearnStore } from '@/shared/lib/store';
import { projects } from '@/features/projects/data/projects-data';
import { ChevronRight } from 'lucide-react';

export default function DashboardIndexPage() {
  const storeProjects = useOmiLearnStore((s) => s.projects);
  const allProjects = storeProjects.length > 0 ? storeProjects : projects;

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-[#2D2D2D] mb-6">Tất cả dự án</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {allProjects.map((p) => (
          <Link
            key={p.id}
            href={`/dashboard/${p.id}`}
            className="flex items-center justify-between px-6 py-4 bg-[#F1F1EC] border-2 border-[#333333] rounded-2xl hover:border-[#6B2D3E] transition-all group"
          >
            <div>
              <p className="font-bold text-[#2D2D2D] group-hover:text-[#6B2D3E] transition-colors">{p.title}</p>
              <p className="text-xs text-[#5A5C58] mt-0.5">{p.date}</p>
            </div>
            <ChevronRight size={18} className="text-[#5A5C58] group-hover:text-[#2D2D2D]" />
          </Link>
        ))}
      </div>
    </div>
  );
}
