'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import AIStreamText from '@/shared/ui/AIStreamText';

const ANALYSIS_TEXT = `Phân tích tiến độ — Hệ Điều Hành và Linux

Điểm mạnh: Bạn nắm vững Khái Niệm Cơ Bản (95%) và Kiến Trúc Hệ Thống (88%). Phần quản lý tiến trình và bộ nhớ cũng khá tốt.

Cần cải thiện: Lập Trình Shell (35%) — bạn mới chỉ hoàn thành phần lý thuyết, cần thêm thực hành viết script. Phần Debug và Khởi Động (20%) chưa bắt đầu.

Tiến độ: 13/20 đơn vị hoàn thành. Dự kiến hoàn thành toàn bộ vào ngày 15 Tháng 4, 2025 nếu duy trì tốc độ hiện tại.

Gợi ý: Tập trung vào Shell scripting tuần này. Thử viết 1 script tự động backup file mỗi ngày để luyện tay. Sau đó chuyển sang phần Debug.

So với lớp: Bạn đang ở top 30% — giỏi hơn trung bình! Tiếp tục phát huy nhé.`;

export default function AnalysisPanel() {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisKey, setAnalysisKey] = useState(0);

  const handleAnalysis = () => {
    if (showAnalysis) setAnalysisKey((k) => k + 1);
    setShowAnalysis(true);
  };

  return (
    <div className="bg-[#F1F1EC] border-2 border-[#333333] rounded-2xl p-5 md:p-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-bold text-[#2D2D2D] text-lg flex items-center gap-2">
          <TrendingUp size={20} className="text-[#6B2D3E]" />
          Phân tích sâu
        </h2>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={handleAnalysis}
          className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#2D2D2D] text-white text-sm font-semibold hover:bg-[#1a1a1a] transition-colors cursor-pointer">
          {showAnalysis ? 'Phân tích lại' : 'Phân tích sâu'}
        </motion.button>
      </div>
      <AnimatePresence initial={false}>
        {showAnalysis ? (
          <motion.div key="analysis" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: 'easeOut' }} className="overflow-hidden">
            <div className="mt-4 bg-white border-2 border-[#CCCCCC] rounded-xl p-5">
              <AIStreamText key={analysisKey} text={ANALYSIS_TEXT} speed={18} className="text-sm text-[#2D2D2D] leading-relaxed whitespace-pre-line" />
            </div>
          </motion.div>
        ) : (
          <motion.p key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm text-[#5A5C58] mt-2">
            Nhấn "Phân tích sâu" để AI đánh giá tiến độ học tập và đưa ra gợi ý cá nhân hóa.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
