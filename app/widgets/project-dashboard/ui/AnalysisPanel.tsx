'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Loader2 } from 'lucide-react';
import AIStreamText from '@/shared/ui/AIStreamText';
import { projectApi, ProgressSummaryData } from '@/entities/project/api/project';
import { aiApi } from '@/entities/ai/api';
import { useAuthStore } from '@/entities/auth/store';

interface Props {
  projectId?: string;
}

export default function AnalysisPanel({ projectId }: Props) {
  const user = useAuthStore((s) => s.user);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisKey, setAnalysisKey] = useState(0);
  const [analysisText, setAnalysisText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalysis = async () => {
    if (showAnalysis) setAnalysisKey((k) => k + 1);
    setShowAnalysis(true);
    setIsLoading(true);

    try {
      let progressContext = '';

      if (projectId) {
        try {
          const progressRes = await projectApi.getProgressSummary(projectId);
          const s = progressRes.summary;
          progressContext = `Dự án: ${s.project_title ?? projectId}
Hoàn thành: ${s.completed_nodes ?? 0}/${s.total_nodes ?? 0} đơn vị (${s.completion_rate ?? 0}%)
Chuỗi học liên tiếp: ${s.streak ?? 0} ngày
Thời gian học tổng: ${s.total_time_minutes ?? 0} phút`;
        } catch {}
      }

      const userId = user?.user_id ?? 'anonymous';
      const prompt = progressContext
        ? `Phân tích sâu tiến độ học tập dựa trên dữ liệu sau và đưa ra gợi ý cụ thể:\n\n${progressContext}`
        : 'Phân tích và đưa ra gợi ý để cải thiện tiến độ học tập';

      const res = await aiApi.chat(userId, prompt, 'vi');
      setAnalysisText(res.response);
    } catch {
      // Fallback to static text
      setAnalysisText(`Phân tích tiến độ học tập

Đang phân tích dữ liệu của bạn... Hiện tại không thể kết nối với AI để lấy phân tích chi tiết. Vui lòng thử lại sau.

Gợi ý chung: Duy trì lịch học đều đặn mỗi ngày, tập trung vào các phần còn yếu, và thực hành nhiều hơn với bài tập thực tế.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#2D2D2D] text-white text-sm font-semibold hover:bg-[#1a1a1a] transition-colors cursor-pointer disabled:opacity-60"
        >
          {isLoading && <Loader2 size={14} className="animate-spin" />}
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
              {isLoading ? (
                <div className="flex items-center gap-2 text-[#5A5C58] text-sm">
                  <Loader2 size={14} className="animate-spin" />
                  Đang phân tích...
                </div>
              ) : (
                <AIStreamText
                  key={analysisKey}
                  text={analysisText}
                  speed={18}
                  className="text-sm text-[#2D2D2D] leading-relaxed whitespace-pre-line"
                />
              )}
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
  );
}
