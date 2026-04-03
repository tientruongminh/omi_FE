'use client';

import Link from 'next/link';
import { Users, ChevronRight, Plus } from 'lucide-react';
import { sharedCourses, projectMembers } from '@/entities/project';
import { useOmiLearnStore } from '@/entities/project';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import dynamic from 'next/dynamic';

const CreateProjectModal = dynamic(() => import('@/features/create-project/ui/CreateProjectModal'), { ssr: false });

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.32, ease: 'easeOut' as const },
  }),
};

const rowVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + i * 0.07, duration: 0.28, ease: 'easeOut' as const },
  }),
};

// Dark photo-style avatar stack (matches design)
function AvatarStack({ count = 2 }: { count?: number }) {
  const shown = projectMembers.slice(0, Math.min(count, projectMembers.length));
  const gradients = [
    'linear-gradient(135deg, #2a4a4a 0%, #0e2a2e 100%)',
    'linear-gradient(135deg, #1a3a4a 0%, #0a1e2e 100%)',
    'linear-gradient(135deg, #2a3a4a 0%, #0e1e2a 100%)',
  ];
  return (
    <div className="flex -space-x-3">
      {shown.map((m, i) => (
        <div
          key={m.id}
          className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
          style={{
            background: gradients[i] ?? gradients[0],
            border: '2px solid #1a1a1a',
          }}
        >
          {m.initials}
        </div>
      ))}
      {count > shown.length && (
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
          style={{
            background: 'linear-gradient(135deg, #2a3a2a 0%, #0e1e0e 100%)',
            border: '2px solid #1a1a1a',
            color: '#fff',
          }}
        >
          +{count - shown.length}
        </div>
      )}
    </div>
  );
}

export default function ProjectPage() {
  const { projects, isCreateModalOpen, openCreateModal, closeCreateModal } = useOmiLearnStore();

  return (
    <div className="max-w-230 mx-auto px-6 py-10">

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1
            className="font-bold text-[#1a1a1a] mb-1.5"
            style={{ fontSize: 'clamp(28px, 4vw, 42px)', letterSpacing: '-0.02em', lineHeight: 1.1 }}
          >
            Project Hub
          </h1>
          <p className="text-sm" style={{ color: '#6b7280', lineHeight: 1.5 }}>
            Your creative space for intentional &quot;wiggles&quot; and<br className="hidden sm:block" /> professional craftsmanship.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2.5 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 shrink-0"
          style={{
            background: '#2d5a3d',
            borderRadius: '999px',
            border: '2px solid #1a1a1a',
            boxShadow: '3px 3px 0px #1a1a1a',
          }}
        >
          <span
            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
            style={{ border: '1.5px solid rgba(255,255,255,0.5)' }}
          >
            <Plus size={11} strokeWidth={3} />
          </span>
          New Project
        </button>
      </div>

      {/* ── My Projects ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 mb-5">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
        <h2 className="text-lg font-bold text-[#1a1a1a]">My Projects</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
        {projects.map((project, i) => (
          <motion.div
            key={project.id}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <Link
              href={`/dashboard/${project.id}`}
              className="flex flex-col bg-white transition-all hover:-translate-y-0.5 active:scale-[0.99] group"
              style={{
                border: '1.5px solid #1a1a1a',
                borderRadius: '16px',
                padding: '20px',
                minHeight: 190,
              }}
            >
              {/* Title + desc */}
              <div className="flex-1 mb-4">
                <h3
                  className="font-black text-[#1a1a1a] mb-2 leading-snug"
                  style={{ fontSize: '20px' }}
                >
                  {project.title}
                </h3>
                <p className="text-[14px] leading-relaxed line-clamp-2" style={{ color: '#6b7280' }}>
                  {project.description}
                </p>
              </div>

              {/* Dashed separator */}
              <div className="border-t border-dashed mb-3" style={{ borderColor: '#d1d5db' }} />

              {/* Footer */}
              <div className={`flex justify-between gap-0.5 ${project.isComplete ? 'flex-row items-center' : 'flex-col'}`}>
                <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>
                  {project.date}
                </div>

                {project.isComplete ? (
                  <span
                    className="text-[11px] px-2.5 py-1 rounded-full font-semibold"
                    style={{ background: '#dcfce7', color: '#16a34a' }}
                  >
                    complete
                  </span>
                ) : (
                  <div className="flex items-center gap-3">
                    {/* Progress bar */}
                    <div className="w-35 h-3.5 rounded-full overflow-hidden border" style={{ background: '#e5e7eb' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: '#4CD964' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${project.progress ?? 0}%` }}
                        transition={{ duration: 0.8, delay: 0.2 + i * 0.1, ease: 'easeOut' }}
                      />
                    </div>
                    <AvatarStack count={3} />
                  </div>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* ── Courses Shared with Me ───────────────────────────────────── */}
      <div className="flex items-center gap-2.5 mb-5">
        <Users size={20} style={{ color: '#6b7280' }} />
        <h2 className="text-lg font-bold text-[#1a1a1a]">Courses shared with Me</h2>
      </div>

      <div className="flex flex-col gap-3">
        {sharedCourses.map((course, i) => (
          <motion.div
            key={course.id}
            custom={i}
            variants={rowVariants}
            initial="hidden"
            animate="visible"
          >
            <Link
              href="/learn"
              className="flex items-center justify-between transition-all hover:brightness-95 group"
              style={{
                background: '#f5f0eb',
                border: '1.5px solid #1a1a1a',
                borderRadius: '14px',
                padding: '16px 20px',
              }}
            >
              <div>
                <p className="font-bold text-[#1a1a1a]" style={{ fontSize: '15px' }}>
                  {course.title}
                </p>
                <p className="text-[12px] mt-0.5" style={{ color: '#9ca3af' }}>
                  Shared by {course.sharedBy} • {course.timeAgo}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <AvatarStack count={i === 0 ? 3 : i === 1 ? 2 : 1} />
                <ChevronRight size={18} style={{ color: '#9ca3af' }} />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Create Project Modal */}
      <AnimatePresence>
        {isCreateModalOpen && <CreateProjectModal onClose={closeCreateModal} />}
      </AnimatePresence>
    </div>
  );
}
