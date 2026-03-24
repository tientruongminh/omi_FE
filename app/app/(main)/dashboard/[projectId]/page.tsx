'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Map, TrendingUp } from 'lucide-react';
import { dashboardStats, upcomingStudySessions } from '@/entities/dashboard';
import { useOmiLearnStore } from '@/entities/project';
import AIStreamText from '@/shared/ui/AIStreamText';

const ANALYSIS_TEXT = `Phân tích tiến độ — Hệ Điều Hành và Linux

Điểm mạnh: Bạn nắm vững Khái Niệm Cơ Bản (95%) và Kiến Trúc Hệ Thống (88%). Phần quản lý tiến trình và bộ nhớ cũng khá tốt.

Cần cải thiện: Lập Trình Shell (35%) — bạn mới chỉ hoàn thành phần lý thuyết, cần thêm thực hành viết script. Phần Debug và Khởi Động (20%) chưa bắt đầu.

Tiến độ: 13/20 đơn vị hoàn thành. Dự kiến hoàn thành toàn bộ vào ngày 15 Tháng 4, 2025 nếu duy trì tốc độ hiện tại.

Gợi ý: Tập trung vào Shell scripting tuần này. Thử viết 1 script tự động backup file mỗi ngày để luyện tay. Sau đó chuyển sang phần Debug.

So với lớp: Bạn đang ở top 30% — giỏi hơn trung bình! Tiếp tục phát huy nhé.`;

const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

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

      {/* Calendar + Sessions */}
      <div className="bg-[#F1F1EC] border-2 border-[#333333] rounded-2xl p-5 md:p-6 mb-8">
        <h2 className="font-bold text-[#2D2D2D] text-lg mb-4">Lịch học sắp tới</h2>
        
        {/* Mini week view */}
        <div className="grid grid-cols-7 gap-1.5 mb-6">
          {DAYS.map((day) => {
            const hasSession = upcomingStudySessions.some((s) => s.day === day);
            return (
              <div
                key={day}
                className={`rounded-xl p-2 text-center transition-all ${
                  hasSession
                    ? 'bg-[#2D2D2D] hover:bg-[#1a1a1a]'
                    : 'bg-white border border-[#CCCCCC] hover:border-[#6B2D3E]/40'
                }`}
              >
                <p className={`text-xs font-semibold ${hasSession ? 'text-white' : 'text-[#5A5C58]'}`}>{day}</p>
                {hasSession && <div className="w-1.5 h-1.5 rounded-full bg-[#4CD964] mx-auto mt-1" />}
              </div>
            );
          })}
        </div>

        {/* Sessions list */}
        <div className="space-y-3">
          {upcomingStudySessions.map((session) => (
            <Link
              key={session.id}
              href={session.unitId ? `/learn?unit=${session.unitId}&project=${projectId}` : `/learn?project=${projectId}`}
              className="flex items-center justify-between px-4 py-3 bg-white border border-[#CCCCCC] rounded-xl hover:border-[#6B2D3E] hover:bg-[#FFF8F9] hover:shadow-sm active:scale-[0.99] transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#818CF8]/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-[#818CF8]">{session.day}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#2D2D2D] group-hover:text-[#6B2D3E] transition-colors">{session.title}</p>
                  <p className="text-xs text-[#5A5C58]">{session.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[#5A5C58] bg-[#F1F1EC] px-2 py-1 rounded-full">
                  {session.duration}
                </span>
                <span className="text-xs text-[#6B2D3E] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Học →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick action: Tiếp tục học */}
        <div className="mt-4 pt-4 border-t border-dashed border-[#CCCCCC]">
          <Link
            href={`/learn?project=${projectId}`}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#2D2D2D] text-white text-sm font-semibold hover:bg-[#1a1a1a] active:scale-[0.99] transition-all"
          >
            Tiếp tục học
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
