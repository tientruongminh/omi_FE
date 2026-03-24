'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { ChevronRight, Sparkles, BookOpen } from 'lucide-react';
import { defaultRoadmapNodes, defaultRoadmapEdges, RoadmapNode, RoadmapEdge } from '@/entities/node';
import { useOmiLearnStore } from '@/entities/project';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const RoadmapGraph = dynamic(() => import('@/widgets/roadmap-graph/ui/RoadmapGraph'), { ssr: false });
const PlanSurveyModal = dynamic(() => import('@/features/plan-survey/ui/PlanSurveyModal'), { ssr: false });

function RoadmapContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('project') ?? 'os-linux';
  const { projects, isPlanModalOpen, hasPlan, openPlanModal, closePlanModal } = useOmiLearnStore();

  const project = projects.find((p) => p.id === projectId);
  const projectTitle = project?.title ?? 'Hệ Điều Hành và Linux';

  const [nodes, setNodes] = useState<RoadmapNode[]>(defaultRoadmapNodes);
  const [edges, setEdges] = useState<RoadmapEdge[]>(defaultRoadmapEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const handleNodeClick = (unitId: string) => {
    setSelectedNodeId(unitId);
    // Navigate to learn page with unit context
    router.push(`/learn?unit=${unitId}&project=${projectId}`);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-[#5A5C58] mb-6">
        <Link href="/" className="hover:text-[#2D2D2D] transition-colors">Dự án</Link>
        <ChevronRight size={14} />
        <Link href={`/dashboard/${projectId}`} className="text-[#2D2D2D] font-medium hover:text-[#6B2D3E] transition-colors">
          {projectTitle}
        </Link>
        <ChevronRight size={14} />
        <span className="text-[#6B2D3E] font-semibold">Roadmap</span>
      </div>

      {/* Title */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#2D2D2D]">{projectTitle}</h1>
          <p className="text-[#5A5C58] mt-1">
            Click vào nút để học • Kéo để sắp xếp lộ trình • Chuột phải để chỉnh sửa
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#5A5C58]">{nodes.length} chủ đề</span>
          <div className="w-2 h-2 rounded-full bg-[#4CD964]" />
        </div>
      </div>

      {/* Node click hint */}
      <div className="mb-4 flex items-center gap-2 text-sm text-[#5A5C58] bg-[#F1F1EC] border border-[#CCCCCC] rounded-xl px-4 py-2.5">
        <BookOpen size={14} className="text-[#6B2D3E]" />
        <span>Nhấn vào chủ đề bất kỳ để bắt đầu học • Hoặc kéo thả để sắp xếp thứ tự</span>
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
            onNodeClick={handleNodeClick}
          />
        </div>
      </div>

      {/* Lập Plan button */}
      <div className="flex justify-center">
        {hasPlan ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-10 py-4 rounded-full bg-[#4CD964] text-[#2D2D2D] font-bold text-lg shadow-lg hover:bg-[#3bc453] hover:scale-105 active:scale-95 transition-all ring-4 ring-[#4CD964]/30"
            >
              Xem Dashboard
            </Link>
          </motion.div>
        ) : (
          <motion.button
            onClick={openPlanModal}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            className="btn-glow flex items-center gap-3 px-12 py-5 rounded-full bg-[#2D2D2D] text-white font-black text-xl ring-2 ring-[#4CD964] hover:bg-[#1a1a1a] transition-colors shadow-2xl"
          >
            <Sparkles size={22} className="text-[#4CD964]" />
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
