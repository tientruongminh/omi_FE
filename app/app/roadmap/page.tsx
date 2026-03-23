'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronRight, Sparkles } from 'lucide-react';
import { defaultRoadmapNodes, defaultRoadmapEdges, RoadmapNode, RoadmapEdge } from '@/lib/data';
import { useOmiLearnStore } from '@/lib/store';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const RoadmapGraph = dynamic(() => import('@/components/RoadmapGraph'), { ssr: false });
const PlanSurveyModal = dynamic(() => import('@/components/PlanSurveyModal'), { ssr: false });

function RoadmapContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('project') ?? 'os-linux';
  const { projects, isPlanModalOpen, hasPlan, openPlanModal, closePlanModal } = useOmiLearnStore();

  const project = projects.find((p) => p.id === projectId);
  const projectTitle = project?.title ?? 'Hệ Điều Hành và Linux';

  const [nodes, setNodes] = useState<RoadmapNode[]>(defaultRoadmapNodes);
  const [edges, setEdges] = useState<RoadmapEdge[]>(defaultRoadmapEdges);

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-[#5A5C58] mb-6">
        <Link href="/" className="hover:text-[#2D2D2D] transition-colors">Dự án</Link>
        <ChevronRight size={14} />
        <span className="text-[#2D2D2D] font-medium">{projectTitle}</span>
        <ChevronRight size={14} />
        <span className="text-[#6B2D3E] font-semibold">Roadmap</span>
      </div>

      {/* Title */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#2D2D2D]">{projectTitle}</h1>
          <p className="text-[#5A5C58] mt-1">Kéo các nút để sắp xếp lộ trình học tập của bạn</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#5A5C58]">{nodes.length} chủ đề</span>
          <div className="w-2 h-2 rounded-full bg-[#4CD964]" />
        </div>
      </div>

      {/* Graph container */}
      <div className="bg-[#F1F1EC] border-2 border-[#333333] rounded-2xl p-6 mb-8 min-h-[600px] relative overflow-hidden">
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle, #CCCCCC 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative z-10">
          <RoadmapGraph
            nodes={nodes}
            edges={edges}
            onNodesChange={setNodes}
            onEdgesChange={setEdges}
          />
        </div>
      </div>

      {/* Lập Plan button */}
      <div className="flex justify-center">
        {hasPlan ? (
          <Link
            href="/schedule"
            className="flex items-center gap-3 px-10 py-4 rounded-full bg-[#4CD964] text-[#2D2D2D] font-bold text-lg shadow-lg hover:bg-[#3bc453] transition-all"
          >
            📅 Xem lịch học
          </Link>
        ) : (
          <motion.button
            onClick={openPlanModal}
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(76,217,100,0)',
                '0 0 0 12px rgba(76,217,100,0.3)',
                '0 0 0 24px rgba(76,217,100,0)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
            className="flex items-center gap-3 px-10 py-4 rounded-full bg-[#2D2D2D] text-white font-bold text-lg ring-2 ring-[#4CD964] hover:bg-[#1a1a1a] transition-all shadow-xl"
          >
            <Sparkles size={20} className="text-[#4CD964]" />
            Lập Plan
          </motion.button>
        )}
      </div>

      {/* Plan Modal */}
      <AnimatePresence>
        {isPlanModalOpen && <PlanSurveyModal onClose={closePlanModal} />}
      </AnimatePresence>
    </div>
  );
}

export default function RoadmapPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-[#5A5C58]">Đang tải...</div>}>
      <RoadmapContent />
    </Suspense>
  );
}
