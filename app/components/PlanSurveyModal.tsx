'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import AIStreamText from './AIStreamText';
import { useOmiLearnStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

const PLAN_TEXT = `📋 Kế hoạch học tập — Hệ Điều Hành và Linux

Tuần 1-2: Khái Niệm Cơ Bản
• Đọc: Giới thiệu về Hệ Điều Hành (2 giờ)
• Video: Lịch sử phát triển OS (1 giờ)
• Bài tập: Cài đặt Linux VM (3 giờ)

Tuần 3-4: Kiến Trúc Hệ Thống
• Đọc: Kernel và System Calls (3 giờ)
• Lab: Phân tích process management (2 giờ)

Tuần 5-6: Quản Lý Tài Nguyên
• Video: Memory management deep dive (2 giờ)
• Thực hành: Monitoring tools (3 giờ)

Tuần 7-8: Giao Diện Người Dùng
• Đọc: Desktop Environment overview (1.5 giờ)
• Thực hành: Cấu hình GNOME/KDE (2 giờ)

Tuần 9-10: Hệ Điều Hành Phổ Biến
• Video: Ubuntu vs Fedora vs Arch (2 giờ)
• Bài tập: Cài đặt và so sánh (4 giờ)

Tuần 11-12: Lập Trình Shell
• Đọc: Bash scripting guide (3 giờ)
• Thực hành: Viết 10 script tự động hóa (5 giờ)

Tuần 13-14: Khởi Động và Debug
• Đọc: GRUB và systemd (2 giờ)
• Lab: Debug boot issues (3 giờ)
• Dự án cuối: Tùy chỉnh Linux hoàn chỉnh (6 giờ)`;

type Step = 'q1' | 'q2' | 'q3' | 'q4' | 'generating' | 'done';

export default function PlanSurveyModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const setPlanComplete = useOmiLearnStore((s) => s.setPlanComplete);

  const [step, setStep] = useState<Step>('q1');
  const [answers, setAnswers] = useState({ q1: '', q2: '', q3: '', q4: '' });
  const [planText, setPlanText] = useState(PLAN_TEXT);
  const [modifyInput, setModifyInput] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [streamKey, setStreamKey] = useState(0);

  const handleNext = (currentStep: Step, nextStep: Step) => {
    setStep(nextStep);
    if (nextStep === 'generating') {
      // Simulate AI generation
      setTimeout(() => setStep('done'), 500);
    }
  };

  const handleModify = () => {
    if (!modifyInput.trim()) return;
    setIsRegenerating(true);
    const mod = modifyInput.trim();
    setModifyInput('');
    setTimeout(() => {
      setPlanText(PLAN_TEXT + `\n\n✏️ Đã cập nhật theo yêu cầu: "${mod}"\n• Mỗi tuần đã thêm 1 giờ thực hành bổ sung`);
      setStreamKey((k) => k + 1);
      setIsRegenerating(false);
    }, 800);
  };

  const handleComplete = () => {
    setPlanComplete();
    onClose();
    router.push('/schedule');
  };

  const slideVariants = {
    enter: { opacity: 0, x: 40 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  };

  const LEVEL_OPTIONS = ['Mới bắt đầu', 'Có kiến thức cơ bản', 'Nâng cao'];
  const STYLE_OPTIONS = ['Video', 'Đọc tài liệu', 'Thực hành', 'Kết hợp'];

  const streamDone = useCallback(() => {}, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full max-w-xl bg-[#F5F0EB] border-2 border-[#333333] rounded-2xl shadow-2xl overflow-hidden"
        style={{ maxHeight: '88vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-dashed border-[#CCCCCC]">
          <div>
            <p className="text-xs text-[#5A5C58] uppercase tracking-widest">Lập kế hoạch học tập</p>
            <h2 className="font-bold text-[#2D2D2D]">Hệ Điều Hành và Linux</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border-2 border-[#333333] flex items-center justify-center hover:bg-[#2D2D2D] hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: 'calc(88vh - 80px)' }}>
          <AnimatePresence mode="wait">
            {/* Q1 */}
            {step === 'q1' && (
              <motion.div key="q1" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="p-6 space-y-4">
                <div className="text-xs text-[#5A5C58] uppercase tracking-wider">Câu 1 / 4</div>
                <h3 className="text-lg font-bold text-[#2D2D2D]">Bạn có bao nhiêu thời gian mỗi tuần cho dự án này?</h3>
                <input
                  type="text"
                  value={answers.q1}
                  onChange={(e) => setAnswers({ ...answers, q1: e.target.value })}
                  placeholder="Ví dụ: 5 giờ/tuần"
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#333333] bg-white text-[#2D2D2D] outline-none focus:border-[#6B2D3E] transition-colors"
                />
                <button
                  onClick={() => handleNext('q1', 'q2')}
                  disabled={!answers.q1.trim()}
                  className="w-full py-3 rounded-full bg-[#2D2D2D] text-white font-semibold hover:bg-[#1a1a1a] transition-colors disabled:opacity-40"
                >
                  Tiếp tục →
                </button>
              </motion.div>
            )}

            {/* Q2 */}
            {step === 'q2' && (
              <motion.div key="q2" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="p-6 space-y-4">
                <div className="text-xs text-[#5A5C58] uppercase tracking-wider">Câu 2 / 4</div>
                <h3 className="text-lg font-bold text-[#2D2D2D]">Trình độ hiện tại của bạn về chủ đề này?</h3>
                <div className="space-y-2">
                  {LEVEL_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setAnswers({ ...answers, q2: opt })}
                      className={`w-full px-4 py-3 rounded-xl border-2 text-left font-medium transition-all ${
                        answers.q2 === opt
                          ? 'border-[#2D2D2D] bg-[#2D2D2D] text-white'
                          : 'border-[#CCCCCC] bg-white text-[#2D2D2D] hover:border-[#333333]'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handleNext('q2', 'q3')}
                  disabled={!answers.q2}
                  className="w-full py-3 rounded-full bg-[#2D2D2D] text-white font-semibold hover:bg-[#1a1a1a] transition-colors disabled:opacity-40"
                >
                  Tiếp tục →
                </button>
              </motion.div>
            )}

            {/* Q3 */}
            {step === 'q3' && (
              <motion.div key="q3" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="p-6 space-y-4">
                <div className="text-xs text-[#5A5C58] uppercase tracking-wider">Câu 3 / 4</div>
                <h3 className="text-lg font-bold text-[#2D2D2D]">Bạn thích học theo phong cách nào?</h3>
                <div className="grid grid-cols-2 gap-2">
                  {STYLE_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setAnswers({ ...answers, q3: opt })}
                      className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                        answers.q3 === opt
                          ? 'border-[#2D2D2D] bg-[#2D2D2D] text-white'
                          : 'border-[#CCCCCC] bg-white text-[#2D2D2D] hover:border-[#333333]'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handleNext('q3', 'q4')}
                  disabled={!answers.q3}
                  className="w-full py-3 rounded-full bg-[#2D2D2D] text-white font-semibold hover:bg-[#1a1a1a] transition-colors disabled:opacity-40"
                >
                  Tiếp tục →
                </button>
              </motion.div>
            )}

            {/* Q4 */}
            {step === 'q4' && (
              <motion.div key="q4" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="p-6 space-y-4">
                <div className="text-xs text-[#5A5C58] uppercase tracking-wider">Câu 4 / 4</div>
                <h3 className="text-lg font-bold text-[#2D2D2D]">Mong muốn sau khi hoàn thành?</h3>
                <textarea
                  value={answers.q4}
                  onChange={(e) => setAnswers({ ...answers, q4: e.target.value })}
                  placeholder="Mô tả mục tiêu bạn muốn đạt được..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#333333] bg-white text-[#2D2D2D] outline-none focus:border-[#6B2D3E] transition-colors resize-none"
                />
                <button
                  onClick={() => handleNext('q4', 'generating')}
                  disabled={!answers.q4.trim()}
                  className="w-full py-3 rounded-full bg-[#6B2D3E] text-white font-semibold hover:bg-[#5a2535] transition-colors disabled:opacity-40"
                >
                  Tạo kế hoạch học tập 🚀
                </button>
              </motion.div>
            )}

            {/* Generating */}
            {step === 'generating' && (
              <motion.div key="gen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full border-4 border-[#6B2D3E] border-t-transparent animate-spin mx-auto" />
                <p className="font-semibold text-[#2D2D2D]">AI đang lên kế hoạch...</p>
              </motion.div>
            )}

            {/* Done — show plan */}
            {step === 'done' && (
              <motion.div key="done" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="p-6 space-y-4">
                <div className="bg-white border-2 border-[#333333] rounded-xl p-4 max-h-72 overflow-y-auto">
                  <AIStreamText
                    key={streamKey}
                    text={planText}
                    speed={15}
                    onComplete={streamDone}
                    className="text-sm text-[#2D2D2D] leading-relaxed font-mono whitespace-pre-line"
                  />
                </div>

                {/* Modify input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={modifyInput}
                    onChange={(e) => setModifyInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleModify()}
                    placeholder='Ví dụ: "Thêm phần thực hành cho mỗi tuần"'
                    className="flex-1 px-4 py-2.5 rounded-full border-2 border-[#333333] bg-white text-sm outline-none focus:border-[#6B2D3E] transition-colors"
                    disabled={isRegenerating}
                  />
                  <button
                    onClick={handleModify}
                    disabled={isRegenerating || !modifyInput.trim()}
                    className="px-4 py-2 rounded-full bg-[#2D2D2D] text-white text-sm font-medium hover:bg-[#1a1a1a] transition-colors disabled:opacity-40"
                  >
                    {isRegenerating ? '...' : 'Cập nhật'}
                  </button>
                </div>

                <button
                  onClick={handleComplete}
                  className="w-full py-3.5 rounded-full bg-[#4CD964] text-[#2D2D2D] font-bold hover:bg-[#3bc453] transition-colors shadow-md"
                >
                  OK, hoàn thành ✓
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
