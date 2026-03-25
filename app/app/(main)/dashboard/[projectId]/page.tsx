'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, TrendingUp, Sparkles, Brain, Lightbulb, FileSearch, Users, Calendar } from 'lucide-react';
import { SUBJECTS, DAYS, TIME_SLOTS, SCHEDULE, SubjectKey } from '@/entities/schedule';
import { useOmiLearnStore } from '@/entities/project';
import AIStreamText from '@/shared/ui/AIStreamText';

const ANALYSIS_TEXT = `Phân tích tiến độ — Hệ Điều Hành và Linux

Điểm mạnh: Bạn nắm vững Khái Niệm Cơ Bản (95%) và Kiến Trúc Hệ Thống (88%). Phần quản lý tiến trình và bộ nhớ cũng khá tốt.

Cần cải thiện: Lập Trình Shell (35%) — bạn mới chỉ hoàn thành phần lý thuyết, cần thêm thực hành viết script. Phần Debug và Khởi Động (20%) chưa bắt đầu.

Tiến độ: 13/20 đơn vị hoàn thành. Dự kiến hoàn thành toàn bộ vào ngày 15 Tháng 4, 2025 nếu duy trì tốc độ hiện tại.

Gợi ý: Tập trung vào Shell scripting tuần này. Thử viết 1 script tự động backup file mỗi ngày để luyện tay. Sau đó chuyển sang phần Debug.

So với lớp: Bạn đang ở top 30% — giỏi hơn trung bình! Tiếp tục phát huy nhé.`;

const ANALYTICS_CARDS = [
  { label: 'Analysis', tag: 'mindACTIVE', percentage: 85, bg: '#FECDD3', border: '#FDA4AF', icon: Brain },
  { label: 'Synthesis', tag: 'THINKING', percentage: 70, bg: '#FEF3C7', border: '#FCD34D', icon: Lightbulb },
  { label: 'Critique', tag: 'REVIEWER', percentage: 60, bg: '#D1FAE5', border: '#6EE7B7', icon: FileSearch },
  { label: 'Interviewing', tag: 'PHỎNG VẤN', percentage: 45, bg: '#D1FAE5', border: '#6EE7B7', icon: Users },
];

// Calendar week data
function getWeekDays(offset: number) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay() + 1 + offset * 7); // Monday
  const days = [];
  const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const isToday = d.toDateString() === now.toDateString();
    days.push({ key: dayNames[i], date: d.getDate(), isToday, isWeekend: i >= 5 });
  }
  return days;
}

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default function ProjectDashboardPage({ params }: PageProps) {
  const { projectId } = use(params);
  const storeProjects = useOmiLearnStore((s) => s.projects);
  const project = storeProjects.find((p) => p.id === projectId);
  const projectTitle = project?.title ?? 'Mastering UI/UX Design';
  const projectDesc = project?.description ?? 'Hành trình trở thành chuyên gia thiết kế sẽ bắt đầu từ con số không. Tiếp tục bài học về Wireframing.';
  const unitsComplete = 8;
  const unitsTotal = 12;
  const progressPercent = Math.round((unitsComplete / unitsTotal) * 100);

  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisKey, setAnalysisKey] = useState(0);
  const [weekOffset, setWeekOffset] = useState(0);
  const router = useRouter();

  const weekDays = getWeekDays(weekOffset);

  const handleAnalysis = () => {
    if (showAnalysis) setAnalysisKey((k) => k + 1);
    setShowAnalysis(true);
  };

  return (
    <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-8">

      {/* ── Hero Banner ──────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        {/* Left: title + description */}
        <div className="flex-1">
          <h1 className="text-3xl md:text-[38px] font-black text-[#2D2D2D] leading-[1.15] tracking-tight">
            {projectTitle}
          </h1>
          <p className="text-[#5A5C58] text-[14px] mt-3 max-w-md leading-relaxed">
            {projectDesc}
          </p>
        </div>

        {/* Right: progress card — compact like design */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white border-2 border-[#E5E7EB] rounded-2xl px-5 py-4 min-w-[180px] max-w-[200px] flex-shrink-0"
        >
          <p className="text-[9px] font-black text-[#5A5C58] uppercase tracking-widest mb-2">Tiến độ dự án</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-[#2D2D2D]">{unitsComplete}/{unitsTotal}</span>
            <span className="text-sm text-[#5A5C58]">Units</span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-2.5 rounded-full bg-[#E5E7EB] overflow-hidden mt-3">
            <motion.div
              className="h-full rounded-full bg-[#2D2D2D]"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
            />
          </div>
          <p className="text-[10px] text-[#5A5C58] mt-1.5 text-right">Hoàn thành {progressPercent}%</p>
        </motion.div>
      </div>

      {/* ── AI Analytics Grid ────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={16} className="text-[#2D2D2D]" />
          <h2 className="text-[15px] font-black text-[#2D2D2D]">AI Analytics Grid</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ANALYTICS_CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.35 }}
                className="rounded-2xl p-4 flex flex-col gap-2 border-2 hover:shadow-md transition-all cursor-default"
                style={{ backgroundColor: card.bg, borderColor: card.border }}
              >
                {/* Top row: icon + percentage */}
                <div className="flex items-center justify-between">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${card.border}40` }}
                  >
                    <Icon size={18} className="text-[#2D2D2D]" />
                  </div>
                  <span className="text-2xl font-black text-[#2D2D2D]">{card.percentage}%</span>
                </div>
                {/* Label + tag */}
                <div>
                  <p className="text-[13px] font-bold text-[#2D2D2D]">{card.label}</p>
                  <p className="text-[9px] font-black text-[#5A5C58]/60 uppercase tracking-wider mt-0.5">{card.tag}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Weekly Schedule (Calendar style) ──────────────────── */}
      <div className="bg-white border-2 border-[#E5E7EB] rounded-2xl overflow-hidden mb-8">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-[#2D2D2D]" />
            <h2 className="font-black text-[#2D2D2D] text-[15px]">Weekly Schedule (Lịch học)</h2>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setWeekOffset((w) => w - 1)}
              className="w-7 h-7 flex items-center justify-center rounded-full border border-[#E5E7EB] hover:bg-[#F5F0EB] text-[#5A5C58] transition-all cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              className="w-7 h-7 flex items-center justify-center rounded-full border border-[#E5E7EB] hover:bg-[#F5F0EB] text-[#5A5C58] transition-all cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Day bubbles */}
        <div className="px-5 py-4">
          <div className="flex items-center justify-between gap-2">
            {weekDays.map((day) => (
              <div key={day.key} className="flex flex-col items-center gap-1.5">
                <span className={`text-[9px] font-bold uppercase tracking-wider ${day.isWeekend ? 'text-[#DC2626]/50' : 'text-[#5A5C58]'}`}>
                  {day.key}
                </span>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    day.isToday
                      ? 'bg-[#2D2D2D] text-white shadow-md'
                      : day.isWeekend
                      ? 'bg-[#FEE2E2] text-[#DC2626]'
                      : 'bg-[#F5F0EB] text-[#2D2D2D]'
                  }`}
                >
                  {day.date}
                </div>
                {/* Activity dot */}
                {!day.isWeekend && (
                  <div className={`w-1.5 h-1.5 rounded-full ${day.isToday ? 'bg-[#4CD964]' : 'bg-[#D1D5DB]'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Next session bar */}
        <div className="px-5 py-3 border-t border-[#E5E7EB] flex items-center justify-between bg-[#FAFAF8]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#4CD964] flex items-center justify-center">
              <Calendar size={13} className="text-white" />
            </div>
            <div>
              <p className="text-[12px] font-bold text-[#2D2D2D]">Next Session: Psychology in UI</p>
              <p className="text-[10px] text-[#5A5C58]">Tomorrow, 10:00 AM – 11:30 AM</p>
            </div>
          </div>
          <Link
            href={`/learn?project=${projectId}`}
            className="text-[11px] font-bold text-[#6B2D3E] hover:underline"
          >
            View All
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
