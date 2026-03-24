'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Map, TrendingUp, ChevronLeft } from 'lucide-react';
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

// Accent stripe colors for stat cards
const STAT_ACCENTS = ['#4CD964', '#818CF8', '#F08080', '#F5A623'];

// Circular progress SVG
function CircularProgress({ percentage, units, total }: { percentage: number; units: number; total: number }) {
  const radius = 78;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 196, height: 196 }}>
      <svg width="196" height="196" className="-rotate-90">
        {/* Track */}
        <circle cx="98" cy="98" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="14" />
        {/* Progress */}
        <motion.circle
          cx="98"
          cy="98"
          r={radius}
          fill="none"
          stroke="#4CD964"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-[#2D2D2D]">{percentage}%</span>
        <span className="text-sm text-[#5A5C58] mt-1">{units}/{total} units</span>
      </div>
    </div>
  );
}

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default function ProjectDashboardPage({ params }: PageProps) {
  const { projectId } = use(params);
  const storeProjects = useOmiLearnStore((s) => s.projects);
  const project = storeProjects.find((p) => p.id === projectId);
  const projectTitle = project?.title ?? 'Hệ Điều Hành và Linux';
  const progress = project?.progress ?? 60;

  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisKey, setAnalysisKey] = useState(0);
  const [weekOffset, setWeekOffset] = useState(0);
  const router = useRouter();

  const handleAnalysis = () => {
    if (showAnalysis) {
      setAnalysisKey((k) => k + 1);
    }
    setShowAnalysis(true);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-[#5A5C58] mb-6 flex-wrap">
        <Link href="/" className="hover:text-[#2D2D2D] transition-colors">Dự án</Link>
        <ChevronRight size={14} />
        <span className="text-[#2D2D2D] font-semibold">{projectTitle}</span>
        <ChevronRight size={14} />
        <span className="text-[#6B2D3E]">Dashboard</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#2D2D2D]">{projectTitle}</h1>
          <p className="text-[#5A5C58] mt-1">Theo dõi tiến độ học tập của bạn</p>
        </div>
        <Link
          href={`/roadmap?project=${projectId}`}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#F1F1EC] border-2 border-[#333333] rounded-full hover:border-[#6B2D3E] hover:text-[#6B2D3E] active:scale-95 transition-all text-sm font-semibold text-[#2D2D2D] self-start"
        >
          <Map size={16} />
          Xem Roadmap
        </Link>
      </div>

      {/* Progress + Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        {/* Circular progress */}
        <div className="md:col-span-2 bg-[#F1F1EC] border-2 border-[#333333] rounded-2xl p-6 flex flex-col items-center justify-center hover:border-[#6B2D3E]/40 transition-colors">
          <p className="text-xs text-[#5A5C58] uppercase tracking-wider mb-4">Tiến độ tổng thể</p>
          <CircularProgress percentage={progress} units={13} total={20} />
        </div>

        {/* Stats cards */}
        <div className="md:col-span-3 grid grid-cols-2 gap-4">
          {dashboardStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="bg-[#F1F1EC] border-2 border-[#333333] rounded-2xl p-4 flex flex-col gap-3 overflow-hidden relative hover:border-[#6B2D3E]/40 hover:shadow-md transition-all"
            >
              {/* Accent stripe at top */}
              <div
                className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                style={{ backgroundColor: STAT_ACCENTS[i] ?? stat.color }}
              />
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm font-semibold text-[#2D2D2D]">{stat.label}</span>
                <span className="text-lg font-bold" style={{ color: stat.color }}>{stat.percentage}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#E5E7EB] overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: stat.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.percentage}%` }}
                  transition={{ duration: 0.9, delay: 0.5 + i * 0.1, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Schedule Grid — from /schedule */}
      <div className="bg-[#F1F1EC] border-2 border-[#333333] rounded-2xl overflow-hidden mb-8">
        {/* Schedule header */}
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-[#333333]">
          <h2 className="font-bold text-[#2D2D2D] text-lg">Lịch học tuần này</h2>
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

        {/* Legend + "Tiếp tục học" */}
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

      {/* Deep analysis — smooth accordion */}
      <div className="bg-[#F1F1EC] border-2 border-[#333333] rounded-2xl p-5 md:p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-[#2D2D2D] text-lg flex items-center gap-2">
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
              Nhấn "Phân tích sâu" để AI đánh giá tiến độ học tập và đưa ra gợi ý cá nhân hóa.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
