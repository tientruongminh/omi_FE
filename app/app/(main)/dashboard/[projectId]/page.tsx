'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, TrendingUp, Sparkles } from 'lucide-react';
import { dashboardStats } from '@/entities/dashboard';
import { SUBJECTS, DAYS, TIME_SLOTS, SCHEDULE, SubjectKey } from '@/entities/schedule';
import { useOmiLearnStore } from '@/entities/project';
import AIStreamText from '@/shared/ui/AIStreamText';

const ANALYSIS_TEXT = `Phân tích tiến độ — Hệ Điều Hành và Linux

Điểm mạnh: Bạn nắm vững Khái Niệm Cơ Bản (95%) và Kiến Trúc Hệ Thống (88%). Phần quản lý tiến trình và bộ nhớ cũng khá tốt.

Cần cải thiện: Lập Trình Shell (35%) — bạn mới chỉ hoàn thành phần lý thuyết, cần thêm thực hành viết script. Phần Debug và Khởi Động (20%) chưa bắt đầu.

Tiến độ: 13/20 đơn vị hoàn thành. Dự kiến hoàn thành toàn bộ vào ngày 15 Tháng 4, 2025 nếu duy trì tốc độ hiện tại.

Gợi ý: Tập trung vào Shell scripting tuần này. Thử viết 1 script tự động backup file mỗi ngày để luyện tay. Sau đó chuyển sang phần Debug.

So với lớp: Bạn đang ở top 30% — giỏi hơn trung bình! Tiếp tục phát huy nhé.`;

// AI Analytics card colors matching design
const ANALYTICS_CARDS = [
  { label: 'Analysis', labelVi: 'Phân tích', percentage: 85, bg: '#FECDD3', border: '#FDA4AF', tag: 'mindACTIVE', tagBg: '#FEE2E2' },
  { label: 'Synthesis', labelVi: 'Tổng hợp', percentage: 70, bg: '#FEF3C7', border: '#FCD34D', tag: 'CONNECTED', tagBg: '#FFFBEB' },
  { label: 'Critique', labelVi: 'Phản biện', percentage: 60, bg: '#D1FAE5', border: '#6EE7B7', tag: 'GROWING', tagBg: '#ECFDF5' },
  { label: 'Interviewing', labelVi: 'Phỏng vấn', percentage: 45, bg: '#D1FAE5', border: '#6EE7B7', tag: 'STARTER', tagBg: '#ECFDF5' },
];

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default function ProjectDashboardPage({ params }: PageProps) {
  const { projectId } = use(params);
  const storeProjects = useOmiLearnStore((s) => s.projects);
  const project = storeProjects.find((p) => p.id === projectId);
  const projectTitle = project?.title ?? 'Mastering UI/UX Design';
  const projectDesc = project?.description ?? 'Hành trình trở thành chuyên gia thiết kế sẽ có ai không. Tiếp tục bài học và #hilearning.';
  const progress = project?.progress ?? 67;
  const unitsComplete = 8;
  const unitsTotal = 12;

  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisKey, setAnalysisKey] = useState(0);
  const [weekOffset, setWeekOffset] = useState(0);
  const router = useRouter();

  const handleAnalysis = () => {
    if (showAnalysis) setAnalysisKey((k) => k + 1);
    setShowAnalysis(true);
  };

  return (
    <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-8">

      {/* ── Hero Banner ──────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        {/* Left: title + description */}
        <div className="flex-1">
          <h1 className="text-3xl md:text-[42px] font-black text-[#2D2D2D] leading-[1.15] tracking-tight">
            {projectTitle}
          </h1>
          <p className="text-[#5A5C58] text-[15px] mt-3 max-w-md leading-relaxed">
            {projectDesc}
          </p>
          <div className="flex items-center gap-3 mt-4">
            <Link
              href={`/learn?project=${projectId}`}
              className="px-5 py-2.5 bg-[#2D2D2D] text-white rounded-full text-sm font-bold hover:bg-[#1a1a1a] active:scale-95 transition-all"
            >
              Tiếp tục học →
            </Link>
            <Link
              href={`/roadmap?project=${projectId}`}
              className="px-5 py-2.5 bg-[#F1F1EC] border-2 border-[#333333] text-[#2D2D2D] rounded-full text-sm font-bold hover:border-[#6B2D3E] hover:text-[#6B2D3E] active:scale-95 transition-all"
            >
              Xem Roadmap
            </Link>
          </div>
        </div>

        {/* Right: progress card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[#ECFDF5] border-2 border-[#6EE7B7] rounded-2xl p-6 flex flex-col items-center gap-3 min-w-[200px]"
        >
          {/* Dot indicators */}
          <div className="flex gap-1.5">
            {Array.from({ length: unitsTotal }, (_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full transition-colors"
                style={{ backgroundColor: i < unitsComplete ? '#059669' : '#D1D5DB' }}
              />
            ))}
          </div>
          <div className="text-center">
            <span className="text-4xl font-black text-[#2D2D2D]">{unitsComplete}</span>
            <span className="text-xl text-[#5A5C58]">/{unitsTotal}</span>
            <span className="text-sm text-[#5A5C58] ml-1">Units</span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-3 rounded-full bg-[#D1D5DB] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-[#059669]"
              initial={{ width: 0 }}
              animate={{ width: `${(unitsComplete / unitsTotal) * 100}%` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
            />
          </div>
        </motion.div>
      </div>

      {/* ── AI Analytics Grid ────────────────────────────────── */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-5">
          <Sparkles size={18} className="text-[#6B2D3E]" />
          <h2 className="text-lg font-black text-[#2D2D2D] tracking-tight">AI Analytics Grid</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ANALYTICS_CARDS.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1, duration: 0.4 }}
              className="rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden border-2 hover:shadow-lg transition-all cursor-default"
              style={{ backgroundColor: card.bg, borderColor: card.border }}
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl md:text-4xl font-black text-[#2D2D2D]">{card.percentage}%</span>
              </div>
              <div>
                <p className="text-sm font-bold text-[#2D2D2D]">{card.label}</p>
                <p className="text-[11px] text-[#5A5C58]">{card.labelVi}</p>
              </div>
              <div
                className="inline-flex self-start px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider"
                style={{ backgroundColor: card.tagBg, color: '#5A5C58' }}
              >
                {card.tag}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Weekly Schedule ──────────────────────────────────── */}
      <div className="bg-[#F1F1EC] border-2 border-[#333333] rounded-2xl overflow-hidden mb-8">
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-[#333333]">
          <h2 className="font-black text-[#2D2D2D] text-lg">Weekly Schedule (Lịch học)</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekOffset((w) => w - 1)}
              className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-[#333333] hover:bg-[#2D2D2D] hover:text-white text-[#2D2D2D] transition-all cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-[#333333] hover:bg-[#2D2D2D] hover:text-white text-[#2D2D2D] transition-all cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid border-b-2 border-[#333333]" style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}>
          <div className="px-1 py-3 text-center border-r-2 border-[#333333]" />
          {DAYS.map((day) => (
            <div
              key={day.key}
              className={`px-1 py-2.5 text-center border-r border-[#E5E7EB] last:border-r-0 ${
                day.weekend ? 'bg-[#FEE2E2]' : day.today ? 'bg-[#FFF9E6]' : ''
              }`}
            >
              <div className={`text-[10px] font-black uppercase tracking-wider ${day.weekend ? 'text-[#DC2626]' : 'text-[#2D2D2D]'}`}>
                {day.label}
              </div>
              <div className={`text-xs font-bold mt-0.5 ${day.weekend ? 'text-[#DC2626]' : 'text-[#5A5C58]'}`}>
                {day.date}
              </div>
              {day.today && (
                <div className="mt-1 flex items-center justify-center">
                  <div className="bg-[#F5C542] text-[#2D2D2D] text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full">
                    HÔM NAY
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Time rows */}
        {TIME_SLOTS.map((slot, rowIdx) => (
          <div
            key={slot}
            className="grid border-b border-[#E5E7EB] last:border-b-0"
            style={{ gridTemplateColumns: '56px repeat(7, 1fr)', minHeight: '56px' }}
          >
            <div className="flex items-center justify-end pr-1.5 border-r-2 border-[#333333]">
              <span className="text-[9px] font-bold text-[#5A5C58] text-right leading-tight">{slot}</span>
            </div>
            {DAYS.map((day, colIdx) => {
              const subject = SCHEDULE[rowIdx][colIdx];
              const info = subject ? SUBJECTS[subject] : null;
              return (
                <div
                  key={day.key}
                  className={`flex items-center justify-center p-1 border-r border-[#E5E7EB] last:border-r-0 ${day.today ? 'bg-[#FFFBEB]/60' : ''}`}
                >
                  {info && subject && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        const unitId = info.unitId;
                        router.push(unitId ? `/learn?unit=${unitId}&project=${projectId}` : `/learn?project=${projectId}`);
                      }}
                      className="px-1.5 py-1 rounded-lg border-2 text-center cursor-pointer w-full transition-all hover:shadow-md"
                      style={{ borderColor: info.color, backgroundColor: info.bg }}
                    >
                      <span className="text-[9px] md:text-[10px] font-black uppercase tracking-wide leading-tight block" style={{ color: info.color }}>
                        {info.label}
                      </span>
                    </motion.button>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {/* Legend */}
        <div className="px-5 py-3 border-t-2 border-[#333333] flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            {(Object.entries(SUBJECTS) as [SubjectKey, typeof SUBJECTS[SubjectKey]][]).map(([key, info]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: info.dot }} />
                <span className="text-[10px] font-semibold" style={{ color: info.color }}>{info.label}</span>
              </div>
            ))}
          </div>
          <Link
            href={`/learn?project=${projectId}`}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#2D2D2D] text-white text-xs font-semibold hover:bg-[#1a1a1a] active:scale-95 transition-all"
          >
            Tiếp tục học →
          </Link>
        </div>
      </div>

      {/* ── Deep Analysis ────────────────────────────────────── */}
      <div className="bg-[#F1F1EC] border-2 border-[#333333] rounded-2xl p-5 md:p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-black text-[#2D2D2D] text-lg flex items-center gap-2">
            <TrendingUp size={20} className="text-[#6B2D3E]" />
            Phân tích sâu
          </h2>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleAnalysis}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#2D2D2D] text-white text-sm font-semibold hover:bg-[#1a1a1a] transition-colors cursor-pointer"
          >
            {showAnalysis ? 'Phân tích lại' : 'Phân tích sâu'}
          </motion.button>
        </div>

        <AnimatePresence initial={false}>
          {showAnalysis ? (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="mt-4 bg-white border-2 border-[#CCCCCC] rounded-xl p-5">
                <AIStreamText
                  key={analysisKey}
                  text={ANALYSIS_TEXT}
                  speed={18}
                  className="text-sm text-[#2D2D2D] leading-relaxed whitespace-pre-line"
                />
              </div>
            </motion.div>
          ) : (
            <motion.p
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-[#5A5C58] mt-2"
            >
              Nhấn &ldquo;Phân tích sâu&rdquo; để AI đánh giá tiến độ học tập và đưa ra gợi ý cá nhân hóa.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
