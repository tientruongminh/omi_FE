'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useOmiLearnStore } from '@/entities/project';
import { ChevronRight, Loader2, AlertCircle } from 'lucide-react';

export default function DashboardIndexPage() {
  const projects = useOmiLearnStore((s) => s.projects);
  const fetchProjects = useOmiLearnStore((s) => s.fetchProjects);
  const isLoading = useOmiLearnStore((s) => s.isLoadingProjects);
  const error = useOmiLearnStore((s) => s.projectsError);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-[#2D2D2D] mb-6">Tất cả dự án</h1>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-[#6B2D3E]" size={28} />
        </div>
      )}

      {error && !isLoading && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 mb-6">
          <AlertCircle size={18} />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!isLoading && !error && projects.length === 0 && (
        <div className="text-center py-16 text-[#5A5C58]">
          <p className="text-lg font-semibold mb-2">Chưa có dự án nào</p>
          <p className="text-sm">Nhấn &ldquo;Tạo dự án mới&rdquo; để bắt đầu.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {projects.map((p) => (
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
