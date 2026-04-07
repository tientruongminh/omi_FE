'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CalendarDays, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '@/shared/api/client';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  type NodeProps,
  type Node,
  type Edge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useOmiLearnStore } from '@/entities/project';
import { fetchRoadmapByProject, type Roadmap } from '@/entities/project/api/roadmap';
import dynamic from 'next/dynamic';

const PlanSurveyModal = dynamic(() => import('@/features/plan-survey/ui/PlanSurveyModal'), { ssr: false });

// ─── Layout constants ─────────────────────────────────────────────────────────

// Nodes tự co giãn theo nội dung — chỉ cần min/max width
const NODE_MIN_W = { root: 180, branch: 180, leaf: 160 };
const NODE_MAX_W = { root: 320, branch: 340, leaf: 300 };
const H_GAP = 80;   // horizontal gap between tiers
const V_GAP = 28;   // vertical gap between siblings

/**
 * Ước tính chiều rộng node dựa trên độ dài text.
 * Dùng cho layout positioning (buildGraph) vì ReactFlow cần tọa độ trước khi render.
 */
function estimateNodeWidth(text: string, type: 'root' | 'branch' | 'leaf'): number {
  const charWidth = type === 'root' ? 9 : 7.5;
  const padding = type === 'leaf' ? 50 : 56;
  const estimated = text.length * charWidth + padding;
  return Math.max(NODE_MIN_W[type], Math.min(NODE_MAX_W[type], estimated));
}

/** Ước tính chiều cao dựa trên text wrap */
function estimateNodeHeight(text: string, type: 'root' | 'branch' | 'leaf'): number {
  const w = estimateNodeWidth(text, type);
  const innerW = w - (type === 'leaf' ? 50 : 56);
  const charPerLine = Math.max(1, Math.floor(innerW / 7.5));
  const lines = Math.ceil(text.length / charPerLine);
  const lineH = type === 'root' ? 20 : 18;
  const paddingY = type === 'root' ? 36 : type === 'branch' ? 28 : 24;
  return Math.max(type === 'root' ? 56 : 40, lines * lineH + paddingY);
}

// ─── Custom node types ────────────────────────────────────────────────────────

function RootNode({ data }: NodeProps) {
  return (
    <>
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
      <div
        className="flex items-center justify-center text-center font-black text-sm px-5 py-4 leading-tight"
        style={{
          background: '#F5DF7A',
          border: '2.5px solid #1a1a1a',
          borderRadius: 16,
          boxShadow: '4px 4px 0px #1a1a1a',
          minWidth: NODE_MIN_W.root,
          maxWidth: NODE_MAX_W.root,
          width: 'fit-content',
          color: '#1a1a1a',
        }}
      >
        {data.label as string}
      </div>
    </>
  );
}

function BranchNode({ data }: NodeProps) {
  const completed = data.completed as boolean;
  const collapsed = data.collapsed as boolean;
  const hasLeaves = data.hasLeaves as boolean;
  const onToggle  = data.onToggle as () => void;
  return (
    <>
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
      <div
        onClick={hasLeaves ? onToggle : undefined}
        className="flex items-center justify-between gap-2 px-4 py-3 text-sm font-bold leading-tight select-none"
        style={{
          background: completed ? '#d1fae5' : '#2d6a4f',
          border: `2px solid ${completed ? '#059669' : '#1a1a1a'}`,
          borderRadius: 18,
          boxShadow: '3px 3px 0px ' + (completed ? '#059669' : '#1a1a1a'),
          minWidth: NODE_MIN_W.branch,
          maxWidth: NODE_MAX_W.branch,
          width: 'fit-content',
          color: completed ? '#065f46' : '#fff',
          cursor: hasLeaves ? 'pointer' : 'default',
        }}
      >
        <span className="flex-1">{data.label as string}</span>
        {completed && <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />}
        {hasLeaves && (
          <svg
            width="14" height="14" viewBox="0 0 14 14" fill="none"
            style={{ transition: 'transform 0.2s ease', transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)', flexShrink: 0 }}
          >
            <path d="M3 5l4 4 4-4" stroke={completed ? '#065f46' : 'white'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </>
  );
}

function LeafNode({ data }: NodeProps) {
  const completed = data.completed as boolean;
  const onClick = data.onClick as () => void;
  return (
    <>
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <motion.div
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={onClick}
        className="flex items-center justify-between gap-2 px-4 py-2.5 cursor-pointer text-sm font-semibold leading-tight"
        style={{
          background: completed ? '#ecfdf5' : '#ffffff',
          border: `1.5px solid ${completed ? '#10b981' : '#1a1a1a'}`,
          borderRadius: 18,
          boxShadow: '2px 2px 0px ' + (completed ? '#10b981' : '#d1d5db'),
          minWidth: NODE_MIN_W.leaf,
          maxWidth: NODE_MAX_W.leaf,
          width: 'fit-content',
          color: '#1a1a1a',
        }}
      >
        <span className="flex-1 leading-tight">{data.label as string}</span>
        {completed && <CheckCircle2 size={14} className="shrink-0 text-emerald-500" />}
      </motion.div>
    </>
  );
}

const nodeTypes = {
  root: RootNode,
  branch: BranchNode,
  leaf: LeafNode,
};

// ─── Build ReactFlow nodes + edges from roadmap data ─────────────────────────

function buildGraph(
  roadmap: Roadmap,
  projectId: string,
  router: ReturnType<typeof useRouter>,
  collapsed: Set<string>,
  onToggle: (id: string) => void,
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const root = roadmap.roadmap_nodes[0];
  if (!root) return { nodes, edges };

  const branches = root.children ?? [];
  const rootW = estimateNodeWidth(root.title, 'root');
  const rootH = estimateNodeHeight(root.title, 'root');

  // Tính chiều cao mỗi branch slot dựa trên nội dung thực
  const branchHeights = branches.map((b) => {
    const leaves = b.children ?? [];
    const branchH = estimateNodeHeight(b.title, 'branch');
    if (leaves.length === 0 || collapsed.has(b.id)) return branchH;
    const leavesH = leaves.reduce((sum, l) => sum + estimateNodeHeight(l.title, 'leaf'), 0);
    return Math.max(branchH, leavesH + (leaves.length - 1) * V_GAP);
  });
  const totalBranchH = branchHeights.reduce((s, h) => s + h, 0) + (branches.length - 1) * 40;
  const rootY = totalBranchH / 2 - rootH / 2;

  nodes.push({
    id: root.id,
    type: 'root',
    position: { x: 0, y: rootY },
    data: { label: root.title },
    draggable: false,
  });

  let branchOffsetY = 0;
  branches.forEach((branch, bi) => {
    const leaves      = branch.children ?? [];
    const isCollapsed = collapsed.has(branch.id);
    const branchH     = branchHeights[bi];
    const branchNodeH = estimateNodeHeight(branch.title, 'branch');
    const branchX     = rootW + H_GAP;
    const branchY     = branchOffsetY + branchH / 2 - branchNodeH / 2;
    const branchW     = estimateNodeWidth(branch.title, 'branch');

    nodes.push({
      id: branch.id,
      type: 'branch',
      position: { x: branchX, y: branchY },
      data: {
        label: branch.title,
        completed: branch.is_completed,
        collapsed: isCollapsed,
        hasLeaves: leaves.length > 0,
        onToggle: () => onToggle(branch.id),
      },
      draggable: false,
    });

    edges.push({
      id: `e-root-${branch.id}`,
      source: root.id,
      target: branch.id,
      type: 'smoothstep',
      style: { stroke: '#9ca3af', strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#9ca3af', width: 12, height: 12 },
    });

    if (leaves.length > 0 && !isCollapsed) {
      const leafX = branchX + branchW + H_GAP;
      let leafOffsetY = branchOffsetY;
      leaves.forEach((leaf) => {
        const leafH = estimateNodeHeight(leaf.title, 'leaf');
        nodes.push({
          id: leaf.id,
          type: 'leaf',
          position: { x: leafX, y: leafOffsetY },
          data: {
            label: leaf.title,
            completed: leaf.is_completed,
            onClick: () => router.push(`/learn?unit=${leaf.id}&project=${projectId}`),
          },
          draggable: false,
        });
        edges.push({
          id: `e-${branch.id}-${leaf.id}`,
          source: branch.id,
          target: leaf.id,
          type: 'smoothstep',
          style: { stroke: '#d1d5db', strokeWidth: 1.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#d1d5db', width: 10, height: 10 },
        });
        leafOffsetY += leafH + V_GAP;
      });
    }

    branchOffsetY += branchH + 40;
  });

  return { nodes, edges };
}

// ─── Flow canvas ──────────────────────────────────────────────────────────────

function RoadmapFlow({ roadmap, projectId }: { roadmap: Roadmap; projectId: string }) {
  const router = useRouter();

  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const onToggle = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const { nodes: builtNodes, edges: builtEdges } = useMemo(
    () => buildGraph(roadmap, projectId, router, collapsed, onToggle),
    [roadmap, projectId, collapsed],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(builtNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(builtEdges);

  // Sync nodes/edges khi collapsed thay đổi
  useEffect(() => {
    setNodes(builtNodes);
    setEdges(builtEdges);
  }, [builtNodes, builtEdges]);

  return (
    <div className="w-full overflow-hidden" style={{ height: 'calc(100vh - 280px)', minHeight: 500 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        minZoom={0.3}
        maxZoom={1.6}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={22} size={1} />
        <Controls showInteractive={false} className="border-[#e5e7eb]! shadow-sm!" />
        <MiniMap
          nodeColor={(n) =>
            n.type === 'root' ? '#F5DF7A' : n.type === 'branch' ? '#2d6a4f' : '#ffffff'
          }
          maskColor="rgba(250,250,248,0.7)"
          style={{ border: '1.5px solid #e5e7eb', borderRadius: 10 }}
        />
      </ReactFlow>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function RoadmapSkeleton() {
  return (
    <div className="min-h-screen flex flex-col items-center" style={{ background: '#FAF9F7', paddingBottom: 80 }}>
      <div className="w-full max-w-5xl flex flex-col items-center pt-14 pb-10 px-6 gap-3">
        <div className="animate-pulse rounded-xl bg-[#e5e7eb]" style={{ width: 280, height: 40 }} />
        <div className="animate-pulse rounded-lg bg-[#e5e7eb]" style={{ width: 360, height: 16 }} />
      </div>
      <div className="w-full max-w-5xl px-6">
        <div className="animate-pulse rounded-2xl bg-[#e5e7eb] w-full" style={{ height: 700 }} />
      </div>
    </div>
  );
}

// ─── Main content ─────────────────────────────────────────────────────────────

function RoadmapContent() {
  const searchParams = useSearchParams();
  const projectId    = searchParams.get('project') ?? '';

  const { projects, isPlanModalOpen, openPlanModal, closePlanModal } = useOmiLearnStore();
  const project = projects.find((p) => p.id === projectId);

  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [hasSchedule, setHasSchedule] = useState(false);

  useEffect(() => {
    if (!projectId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    fetchRoadmapByProject(projectId)
      .then(setRoadmap)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

    // Check if schedule already exists
    apiFetch<{ id: string }[]>(`/learning/schedule/${projectId}`)
      .then((entries) => setHasSchedule(entries.length > 0))
      .catch(() => setHasSchedule(false));
  }, [projectId]);

  const projectTitle = project?.title ?? roadmap?.title ?? 'Roadmap';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FAF9F7', paddingBottom: 80 }}>

      {/* ── Header ── */}
      <div className="w-full flex flex-col items-center pt-14 pb-8 px-6 text-center relative">
        <img
          src="/image6.png"
          alt=""
          className="absolute object-contain pointer-events-none"
          style={{ width: 120, height: 120, top: 32, left: 0, opacity: 0.45 }}
        />
        <h1
          className="font-black uppercase mb-3"
          style={{ fontSize: 'clamp(24px, 4vw, 36px)', letterSpacing: '0.02em', lineHeight: 1.15, color: '#6B2D3E' }}
        >
          Lộ trình học tập<br />{projectTitle}
        </h1>
        <p className="text-sm max-w-xl" style={{ color: '#6b7280', lineHeight: 1.6 }}>
          Khám phá hành trình chinh phục công nghệ của bạn thông qua các mốc quan trọng được thiết kế riêng.
        </p>
      </div>

      {/* ── Flow / States ── */}
      <div className="w-full px-4" style={{ flex: 1 }}>
        {loading && (
          <div className="animate-pulse rounded-2xl bg-[#e5e7eb] w-full" style={{ height: 'calc(100vh - 280px)', minHeight: 500 }} />
        )}

        {!loading && error && (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <p className="text-sm font-semibold" style={{ color: '#6B2D3E' }}>
              Không thể tải roadmap. Vui lòng thử lại.
            </p>
            <p className="text-xs text-gray-400">{error}</p>
          </div>
        )}

        {!loading && !error && !roadmap && (
          <p className="text-center py-20 text-sm text-gray-400">Chưa có roadmap cho project này.</p>
        )}

        {!loading && !error && roadmap && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <RoadmapFlow roadmap={roadmap} projectId={projectId} />
          </motion.div>
        )}
      </div>

      {/* ── CTA ── */}
      <div className="mt-12 w-full flex justify-center">
          {hasSchedule ? (
            <Link
              href={`/dashboard/${projectId}`}
              className="flex items-center gap-3 px-10 py-4 font-bold text-white transition-all hover:opacity-90 active:scale-95"
              style={{
                background: '#7d3f55',
                border: '2px solid #1a1a1a',
                borderRadius: '14px',
                boxShadow: '4px 4px 0px #1a1a1a',
                fontSize: 15,
              }}
            >
              <CalendarDays size={18} />
              Xem Dashboard
            </Link>
          ) : (
            <motion.button
              whileHover={{ scale: 1.06, boxShadow: '6px 6px 0px #1a1a1a' }}
              whileTap={{ scale: 0.95 }}
              animate={{
                boxShadow: [
                  '4px 4px 0px #1a1a1a',
                  '4px 4px 16px rgba(125,63,85,0.5)',
                  '4px 4px 0px #1a1a1a',
                ],
              }}
              transition={{
                boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
              }}
              onClick={openPlanModal}
              className="flex items-center gap-3 font-bold text-white cursor-pointer relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #7d3f55 0%, #a0526b 100%)',
                border: '2px solid #1a1a1a',
                borderRadius: '14px',
                boxShadow: '4px 4px 0px #1a1a1a',
                fontSize: 15,
                padding: '14px 36px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)',
                }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
              />
              <CalendarDays size={18} />
              Lap ke hoach hoc tap
            </motion.button>
          )}
      </div>

      {/* Plan Modal */}
      <AnimatePresence>
        {isPlanModalOpen && <PlanSurveyModal onClose={closePlanModal} projectId={projectId} />}
      </AnimatePresence>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RoadmapPage() {
  return (
    <Suspense fallback={<RoadmapSkeleton />}>
      <RoadmapContent />
    </Suspense>
  );
}
