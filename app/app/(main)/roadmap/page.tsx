'use client';

import { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CalendarDays } from 'lucide-react';
import { useOmiLearnStore } from '@/entities/project';
import dynamic from 'next/dynamic';

const PlanSurveyModal = dynamic(() => import('@/features/plan-survey/ui/PlanSurveyModal'), { ssr: false });

// ─── Tree data ────────────────────────────────────────────────────────────────

interface LeafNode {
  id: string;
  label: string;
  done?: boolean;
}

interface BranchNode {
  id: string;
  label: string;
  done?: boolean;
  leaves: LeafNode[];
}

const TREE_DATA = {
  root: { label: 'DevOps là gì?' },
  branches: [
    {
      id: 'b1',
      label: 'Thực hành Linux & Shell',
      done: true,
      leaves: [
        { id: 'l1', label: 'DevOps là gì?', done: true },
        { id: 'l2', label: 'DevOps là gì?', done: true },
      ],
    },
    {
      id: 'b2',
      label: 'Thực hành Linux & Shell',
      leaves: [
        { id: 'l3', label: 'DevOps là gì?' },
        { id: 'l4', label: 'DevOps là gì?' },
      ],
    },
    {
      id: 'b3',
      label: 'Thực hành Linux & Shell',
      leaves: [
        { id: 'l5', label: 'DevOps là gì?' },
        { id: 'l6', label: 'DevOps là gì?' },
      ],
    },
  ] satisfies BranchNode[],
};

// ─── Constants ────────────────────────────────────────────────────────────────

const BRANCH_H = 148;   // height per branch row (px)
const LEAF_H   = 52;    // height per leaf pill (px)
const LEAF_GAP = 12;    // gap between leaves (px)

// total height of the leaf group for a branch
const leafGroupH = (count: number) => count * LEAF_H + (count - 1) * LEAF_GAP;

// ─── Icons ────────────────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
      <circle cx="8" cy="8" r="8" fill="#4CD964" />
      <path d="M4.5 8.5l2.5 2.5 4.5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronIcon({ open, dark }: { open: boolean; dark?: boolean }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 14 14" fill="none"
      style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s ease' }}
    >
      <path d="M3 5l4 4 4-4" stroke={dark ? '#1a1a1a' : 'white'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Leaf node ────────────────────────────────────────────────────────────────

function LeafNodeBox({ node, onClick }: { node: LeafNode; onClick?: () => void }) {
  return (
    <div className="relative" style={{ paddingRight: 13 }}>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        className="flex items-center px-5 text-sm font-semibold text-[#1a1a1a] cursor-pointer whitespace-nowrap"
        style={{
          background: '#fff',
          border: '1.5px solid #1a1a1a',
          borderRadius: '999px',
          height: LEAF_H,
        }}
      >
        {node.label}
      </motion.button>
      {node.done && (
        <span className="absolute top-1/2 -translate-y-1/2" style={{ right: 4 }}>
          <CheckIcon />
        </span>
      )}
    </div>
  );
}

// ─── Branch row (with toggle) ─────────────────────────────────────────────────

function BranchRow({
  branch,
  isOpen,
  onToggle,
  onLeafClick,
  animDelay,
}: {
  branch: BranchNode;
  isOpen: boolean;
  onToggle: () => void;
  onLeafClick: (id: string) => void;
  animDelay: number;
}) {
  const leavesH = leafGroupH(branch.leaves.length);
  // vertical positions of each leaf center relative to the leaf group top
  const leafCenters = branch.leaves.map((_, i) => i * (LEAF_H + LEAF_GAP) + LEAF_H / 2);
  const topLeafY    = leafCenters[0];
  const botLeafY    = leafCenters[leafCenters.length - 1];

  return (
    <div className="flex items-center" style={{ height: BRANCH_H }}>
      {/* Branch pill */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: animDelay, duration: 0.32 }}
        className="shrink-0"
      >
        <button
          onClick={onToggle}
          className="relative flex items-center gap-2 px-5 py-3 text-sm font-bold text-[#1a1a1a] cursor-pointer"
          style={{
            background: branch.done ? '#b8f0c0' : '#3a7a5a',
            border: '1.5px solid #1a1a1a',
            borderRadius: '999px',
            minWidth: 210,
            boxShadow: '2px 2px 0px #1a1a1a',
            color: branch.done ? '#1a1a1a' : '#fff',
          }}
        >
          {branch.label}
          <span className="ml-auto">
            <ChevronIcon open={isOpen} dark={branch.done} />
          </span>
          {branch.done && (
            <span className="absolute -right-3 top-1/2 -translate-y-1/2">
              <CheckIcon />
            </span>
          )}
        </button>
      </motion.div>

      {/* Connector branch → leaves + leaves (animated) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="flex items-center overflow-hidden"
            style={{ height: BRANCH_H }}
          >
            {/* SVG connector: vertical spine + horizontals to each leaf */}
            <svg
              width="56"
              height={BRANCH_H}
              className="shrink-0"
              style={{ overflow: 'visible' }}
            >
              {/* offset to align leaf group vertically centered in row */}
              {(() => {
                const offsetY = (BRANCH_H - leavesH) / 2;
                const absTop  = offsetY + topLeafY;
                const absBot  = offsetY + botLeafY;
                return (
                  <>
                    {/* Vertical spine */}
                    <line x1="28" y1={absTop} x2="28" y2={absBot} stroke="#1a1a1a" strokeWidth="1.5" />
                    {/* Horizontals to each leaf */}
                    {leafCenters.map((cy, i) => (
                      <line
                        key={i}
                        x1="28" y1={offsetY + cy}
                        x2="56" y2={offsetY + cy}
                        stroke="#1a1a1a" strokeWidth="1.5"
                      />
                    ))}
                    {/* Arrow heads */}
                    {leafCenters.map((cy, i) => (
                      <polygon
                        key={`arr-${i}`}
                        points={`48,${offsetY + cy - 4} 56,${offsetY + cy} 48,${offsetY + cy + 4}`}
                        fill="#1a1a1a"
                      />
                    ))}
                  </>
                );
              })()}
            </svg>

            {/* Leaf pills */}
            <div
              className="flex flex-col shrink-0"
              style={{ gap: LEAF_GAP }}
            >
              {branch.leaves.map((leaf, li) => (
                <motion.div
                  key={leaf.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ delay: li * 0.06, duration: 0.22 }}
                >
                  <LeafNodeBox
                    node={leaf}
                    onClick={() => onLeafClick(leaf.id)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function RoadmapContent() {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const projectId   = searchParams.get('project') ?? 'os-linux';
  const { projects, isPlanModalOpen, hasPlan, openPlanModal, closePlanModal } = useOmiLearnStore();

  const project      = projects.find((p) => p.id === projectId);
  const projectTitle = project?.title ?? 'DevOps';

  // open state per branch
  const [openBranches, setOpenBranches] = useState<Record<string, boolean>>(
    Object.fromEntries(TREE_DATA.branches.map((b) => [b.id, true]))
  );
  const toggle = (id: string) =>
    setOpenBranches((prev) => ({ ...prev, [id]: !prev[id] }));

  const totalH = BRANCH_H * TREE_DATA.branches.length;

  return (
    <div
      className="min-h-screen flex flex-col items-center"
      style={{ background: '#FAF9F7', paddingBottom: 80 }}
    >
      {/* ── Header ── */}
      <div className="w-full max-w-175 flex flex-col items-center pt-14 pb-10 px-6 text-center relative">
        <img
          src="/image6.png"
          alt=""
          className="absolute object-contain"
          style={{ width: 140, height: 140, top: 40, left: -10, opacity: 0.55 }}
        />
        <h1
          className="font-black uppercase mb-3"
          style={{ fontSize: 'clamp(26px, 5vw, 40px)', letterSpacing: '0.02em', lineHeight: 1.15, color: '#6B2D3E' }}
        >
          Lộ trình học tập<br />{projectTitle}
        </h1>
        <p className="text-sm text-center max-w-105" style={{ color: '#6b7280', lineHeight: 1.6 }}>
          Khám phá hành trình chinh phục công nghệ của bạn thông qua các mốc quan trọng được thiết kế riêng.
        </p>
      </div>

      {/* ── Tree ── */}
      <div className="w-full px-6 overflow-x-auto">
        <div className="flex items-center justify-center" style={{ minHeight: totalH, overflow: 'visible' }}>

          {/* Root node */}
          <div className="shrink-0 flex items-center" style={{ height: totalH }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="px-6 py-4 font-black text-[#1a1a1a] text-sm text-center"
              style={{
                background: '#F5DF7A',
                border: '2px solid #1a1a1a',
                borderRadius: '14px',
                boxShadow: '3px 3px 0px #1a1a1a',
                minWidth: 130,
              }}
            >
              {TREE_DATA.root.label}
            </motion.div>
          </div>

          {/* SVG: root → branches connector */}
          <svg
            width="60"
            height={totalH}
            className="shrink-0"
            style={{ overflow: 'visible' }}
          >
            {/* Horizontal from root to spine */}
            <line x1="0" y1={totalH / 2} x2="30" y2={totalH / 2} stroke="#1a1a1a" strokeWidth="1.5" />
            {/* Vertical spine */}
            <line
              x1="30" y1={BRANCH_H * 0.5}
              x2="30" y2={BRANCH_H * (TREE_DATA.branches.length - 0.5)}
              stroke="#1a1a1a" strokeWidth="1.5"
            />
            {/* Horizontal arm to each branch */}
            {TREE_DATA.branches.map((_, i) => (
              <g key={i}>
                <line
                  x1="30" y1={BRANCH_H * (i + 0.5)}
                  x2="60" y2={BRANCH_H * (i + 0.5)}
                  stroke="#1a1a1a" strokeWidth="1.5"
                />
                {/* Arrow head */}
                <polygon
                  points={`52,${BRANCH_H * (i + 0.5) - 4} 60,${BRANCH_H * (i + 0.5)} 52,${BRANCH_H * (i + 0.5) + 4}`}
                  fill="#1a1a1a"
                />
              </g>
            ))}
          </svg>

          {/* Branches + leaves */}
          <div className="flex flex-col shrink-0">
            {TREE_DATA.branches.map((branch, i) => (
              <BranchRow
                key={branch.id}
                branch={branch}
                isOpen={openBranches[branch.id] ?? true}
                onToggle={() => toggle(branch.id)}
                onLeafClick={(leafId) =>
                  router.push(`/learn?unit=${leafId}&project=${projectId}`)
                }
                animDelay={0.1 + i * 0.1}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="mt-14 flex items-end gap-6">
        <div style={{ width: 72, height: 72 }} />
        <div className="flex flex-col items-center">
          {hasPlan ? (
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
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={openPlanModal}
              className="flex items-center gap-3 font-bold text-white transition-all cursor-pointer"
              style={{
                background: '#7d3f55',
                border: '2px solid #1a1a1a',
                borderRadius: '14px',
                boxShadow: '4px 4px 0px #1a1a1a',
                fontSize: 15,
                padding: '14px 36px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              <CalendarDays size={18} />
              Lập kế hoạch học tập
            </motion.button>
          )}
        </div>
        <img
          src="/image.png"
          alt=""
          style={{ width: 72, height: 72, objectFit: 'contain', transform: 'rotate(-15deg)' }}
        />
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
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Đang tải...</div>}>
      <RoadmapContent />
    </Suspense>
  );
}
