'use client';

import { Suspense } from 'react';
import { ChevronRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import InfiniteCanvas from '@/widgets/infinite-canvas/ui/InfiniteCanvas';
import ChatBox from '@/widgets/chat-box/ui/ChatBox';
import FloatingNote from '@/features/floating-note/ui/FloatingNote';
import { useOmiLearnStore } from '@/entities/project';

function LearnContent() {
  const searchParams = useSearchParams();
  const projectParam = searchParams.get('project');
  const unitParam = searchParams.get('unit');

  const { projects } = useOmiLearnStore();
  const project = projects.find((p) => p.id === projectParam);
  const projectTitle = project?.title ?? 'Hệ Điều Hành và Linux';
  const projectId = projectParam ?? 'os-linux';
  const isB2B = project?.isB2B ?? false;

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 72px)', backgroundColor: '#F5F0EB' }}>
      {/* Breadcrumb */}
      <div className="px-6 py-3 border-b border-[#333333]/10 flex-shrink-0">
        <nav className="flex items-center gap-1.5 text-[12px] text-[#5A5C58]">
          <Link href="/" className="hover:text-[#2D2D2D] transition-colors font-medium">
            Dự án
          </Link>
          <ChevronRight size={12} />
          <Link href={`/dashboard/${projectId}`} className="hover:text-[#2D2D2D] transition-colors font-medium">
            {projectTitle}
          </Link>
          <ChevronRight size={12} />
          <Link href={`/roadmap?project=${projectId}`} className="hover:text-[#6B2D3E] transition-colors font-medium">
            Roadmap
          </Link>
          <ChevronRight size={12} />
          <span className="text-[#6B2D3E] font-bold">Học tập</span>
          {unitParam && (
            <>
              <ChevronRight size={12} />
              <span className="text-[#2D2D2D] font-medium text-[11px] px-2 py-0.5 bg-[#E8D5F5] rounded-full">
                {unitParam}
              </span>
            </>
          )}
        </nav>
      </div>

      {/* Infinite Canvas — fills remaining space */}
      <div className="flex-1 p-4 min-h-0 relative">
        <InfiniteCanvas unitId={unitParam ?? undefined} projectId={projectId} />
      </div>

      {/* Floating UI */}
      <ChatBox isB2B={isB2B} projectId={projectId} />
      <FloatingNote />
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen text-[#5A5C58]">
        Đang tải...
      </div>
    }>
      <LearnContent />
    </Suspense>
  );
}
