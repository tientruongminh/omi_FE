'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { AIStreamText } from '@/shared/ui/AIStreamText';
import { useOmiLearnStore } from '@/entities/project';
import { useRouter } from 'next/navigation';

const PLAN_TEXT = `📋 Kế hoạch học tập — Hệ Điều Hành và Linux
Thời gian: 8 tuần | 10 giờ/tuần

Tuần 1: Khái Niệm Cơ Bản
• Xem video: Tổng quan Hệ Điều Hành (2h)
• Đọc: Lịch sử phát triển HĐH (1.5h)
• Bài tập: Phân loại các HĐH phổ biến (1h)
• Quiz ôn tập (0.5h)

Tuần 2: Kiến Trúc Hệ Thống
• Xem video: Kernel và System Calls (2h)
• Đọc: Monolithic vs Microkernel (2h)
• Lab: Biên dịch Linux Kernel đơn giản (3h)
• Flashcard ôn tập (0.5h)

Tuần 3-4: Quản Lý Tài Nguyên
• Video: Process Management (2h)
• Video: Memory Management (2h)
• Đọc: Paging và Segmentation (2h)
• Lab: Sử dụng top, htop, ps (2h)
• Tự luận: So sánh các thuật toán scheduling (1h)

Tuần 5: Giao Diện Người Dùng
• Video: GUI vs CLI (1.5h)
• Đọc: Window Manager (1.5h)
• Thực hành: Cài đặt và tùy chỉnh i3wm (3h)

Tuần 6: Hệ Điều Hành Phổ Biến
• Đọc: Linux Distributions (2h)
• Lab: Cài đặt Ubuntu và Arch Linux (4h)
• Quiz so sánh (0.5h)

Tuần 7: Lập Trình Shell
• Video: Bash Scripting (3h)
• Lab: Viết 5 scripts thực tế (4h)
• Peer review scripts với nhóm (1h)

Tuần 8: Khởi Động và Debug + Ôn tập
• Video: Boot Process (1.5h)
• Lab: Debug với strace, gdb (2h)
• Ôn tập tổng: Quiz + Flashcard + Mô phỏng phỏng vấn (3h)
• Dạy lại cho AI để kiểm tra hiểu biết (1h)`;

type Step = 'q1' | 'q2' | 'q3' | 'q4' | 'calendar' | 'generating' | 'done';

export function PlanSurveyModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const setPlanComplete = useOmiLearnStore((s) => s.setPlanComplete);

  const [step, setStep] = useState<Step>('q1');
  const [answers, setAnswers] = useState({ q1: '', q2: '', q3: '', q4: '' });
  const [planText, setPlanText] = useState(PLAN_TEXT);
  const [modifyInput, setModifyInput] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [streamKey, setStreamKey] = useState(0);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [calendarConnecting, setCalendarConnecting] = useState(false);

  const handleNext = (nextStep: Step) => {
    setStep(nextStep);
    if (nextStep === 'generating') setTimeout(() => setStep('done'), 500);
  };

  const handleConnectCalendar = () => {
    setCalendarConnecting(true);
    setTimeout(() => { setCalendarConnected(true); setCalendarConnecting(false); }, 1200);
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

  const slideVariants = { enter: { opacity: 0, x: 40 }, center: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -40 } };
  const LEVEL_OPTIONS = ['Mới bắt đầu', 'Có kiến thức cơ bản', 'Nâng cao'];
  const STYLE_OPTIONS = ['Video', 'Đọc tài liệu', 'Thực hành', 'Kết hợp'];
  const streamDone = useCallback(() => {}, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full max-w-xl bg-[#F5F0EB] border-2 border-[#333333] rounded-2xl shadow-2xl overflow-hidden"
        style={{ maxHeight: '88vh' }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-dashed border-[#CCCCCC]">
          <div>
            <p className="text-xs text-[#5A5C58] uppercase tracking-widest">Lập kế hoạch học tập</p>
            <h2 className="font-bold text-[#2D2D2D]">Hệ Điều Hành và Linux</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full border-2 border-[#333333] flex items-center justify-center hover:bg-[#2D2D2D] hover:text-white transition-colors cursor-pointer"><X size={14} /></button>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: 'calc(88vh - 80px)' }}>
          <AnimatePresence mode="wait">
            {step === 'q1' && (
              <motion.div key="q1" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="p-6 space-y-4">
                <div className="text-xs text-[#5A5C58] uppercase tracking-wider">Câu 1 / 4</div>
                <h3 className="text-lg font-bold text-[#2D2D2D]">Bạn có bao nhiêu thời gian mỗi tuần cho dự án này?</h3>
                <input type="text" value={answers.q1} onChange={(e) => setAnswers({ ...answers, q1: e.target.value })} placeholder="Ví dụ: 5 giờ/tuần" className="w-full px-4 py-3 rounded-xl border-2 border-[#333333] bg-white text-[#2D2D2D] outline-none focus:border-[#6B2D3E] transition-colors" />
                <button onClick={() => handleNext('q2')} disabled={!answers.q1.trim()} className="w-full py-3 rounded-full bg-[#2D2D2D] text-white font-semibold hover:bg-[#1a1a1a] transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed">Tiếp tục →</button>
              </motion.div>
            )}
            {step === 'q2' && (
              <motion.div key="q2" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="p-6 space-y-4">
                <div className="text-xs text-[#5A5C58] uppercase tracking-wider">Câu 2 / 4</div>
                <h3 className="text-lg font-bold text-[#2D2D2D]">Trình độ hiện tại của bạn về chủ đề này?</h3>
                <div className="space-y-2">
                  {LEVEL_OPTIONS.map((opt) => (
                    <button key={opt} onClick={() => setAnswers({ ...answers, q2: opt })} className={`w-full px-4 py-3 rounded-xl border-2 text-left font-medium transition-all cursor-pointer ${answers.q2 === opt ? 'border-[#2D2D2D] bg-[#2D2D2D] text-white' : 'border-[#CCCCCC] bg-white text-[#2D2D2D] hover:border-[#333333]'}`}>{opt}</button>
                  ))}
                </div>
                <button onClick={() => handleNext('q3')} disabled={!answers.q2} className="w-full py-3 rounded-full bg-[#2D2D2D] text-white font-semibold hover:bg-[#1a1a1a] transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed">Tiếp tục →</button>
              </motion.div>
            )}
            {step === 'q3' && (
              <motion.div key="q3" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="p-6 space-y-4">
                <div className="text-xs text-[#5A5C58] uppercase tracking-wider">Câu 3 / 4</div>
                <h3 className="text-lg font-bold text-[#2D2D2D]">Bạn thích học theo phong cách nào?</h3>
                <div className="grid grid-cols-2 gap-2">
                  {STYLE_OPTIONS.map((opt) => (
                    <button key={opt} onClick={() => setAnswers({ ...answers, q3: opt })} className={`px-4 py-3 rounded-xl border-2 font-medium transition-all cursor-pointer ${answers.q3 === opt ? 'border-[#2D2D2D] bg-[#2D2D2D] text-white' : 'border-[#CCCCCC] bg-white text-[#2D2D2D] hover:border-[#333333]'}`}>{opt}</button>
                  ))}
                </div>
                <button onClick={() => handleNext('q4')} disabled={!answers.q3} className="w-full py-3 rounded-full bg-[#2D2D2D] text-white font-semibold hover:bg-[#1a1a1a] transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed">Tiếp tục →</button>
              </motion.div>
            )}
            {step === 'q4' && (
              <motion.div key="q4" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="p-6 space-y-4">
                <div className="text-xs text-[#5A5C58] uppercase tracking-wider">Câu 4 / 4</div>
                <h3 className="text-lg font-bold text-[#2D2D2D]">Mong muốn sau khi hoàn thành?</h3>
                <textarea value={answers.q4} onChange={(e) => setAnswers({ ...answers, q4: e.target.value })} placeholder="Mô tả mục tiêu bạn muốn đạt được..." rows={4} className="w-full px-4 py-3 rounded-xl border-2 border-[#333333] bg-white text-[#2D2D2D] outline-none focus:border-[#6B2D3E] transition-colors resize-none" />
                <button onClick={() => handleNext('calendar')} disabled={!answers.q4.trim()} className="w-full py-3 rounded-full bg-[#6B2D3E] text-white font-semibold hover:bg-[#5a2535] transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed">Tạo kế hoạch học tập</button>
              </motion.div>
            )}
            {step === 'calendar' && (
              <motion.div key="calendar" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="p-6 space-y-5">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white border-2 border-[#333333] flex items-center justify-center mx-auto mb-4 text-3xl">⊘</div>
                  <h3 className="text-lg font-bold text-[#2D2D2D] mb-2">Kết nối Google Calendar</h3>
                  <p className="text-sm text-[#5A5C58]">Đồng bộ lịch học với Google Calendar để nhận nhắc nhở và quản lý thời gian hiệu quả hơn.</p>
                </div>
                {calendarConnected ? (
                  <div className="flex items-center gap-3 p-4 bg-[#ECFDF5] border-2 border-[#4CD964] rounded-xl">
                    <span className="text-2xl">✓</span>
                    <div>
                      <p className="font-semibold text-[#065F46]">Đã kết nối thành công!</p>
                      <p className="text-sm text-[#047857]">Google Calendar đã được liên kết với tài khoản của bạn.</p>
                    </div>
                  </div>
                ) : (
                  <button onClick={handleConnectCalendar} disabled={calendarConnecting} className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border-2 border-[#333333] bg-white hover:bg-[#F8F8F8] transition-colors font-semibold text-[#2D2D2D] disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed">
                    {calendarConnecting ? (
                      <><div className="w-5 h-5 rounded-full border-2 border-[#6B2D3E] border-t-transparent animate-spin" />Đang kết nối...</>
                    ) : (
                      <><svg viewBox="0 0 24 24" className="w-5 h-5" aria-label="Google Calendar"><rect x="3" y="3" width="18" height="18" rx="2" fill="#4285F4" /><rect x="3" y="3" width="18" height="6" rx="1" fill="#1A73E8" /><circle cx="8" cy="4.5" r="1.5" fill="white" /><circle cx="16" cy="4.5" r="1.5" fill="white" /><text x="12" y="16" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">G</text></svg>Kết nối Google Calendar</>
                    )}
                  </button>
                )}
                <button onClick={() => handleNext('generating')} className={`w-full py-3 rounded-full font-semibold transition-colors cursor-pointer ${calendarConnected ? 'bg-[#4CD964] text-[#2D2D2D] hover:bg-[#3bc453]' : 'bg-[#2D2D2D] text-white hover:bg-[#1a1a1a]'}`}>
                  {calendarConnected ? 'Tiếp tục tạo kế hoạch ✓' : 'Bỏ qua, tiếp tục →'}
                </button>
              </motion.div>
            )}
            {step === 'generating' && (
              <motion.div key="gen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full border-4 border-[#6B2D3E] border-t-transparent animate-spin mx-auto" />
                <p className="font-semibold text-[#2D2D2D]">AI đang lên kế hoạch...</p>
              </motion.div>
            )}
            {step === 'done' && (
              <motion.div key="done" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="p-6 space-y-4">
                <div className="bg-white border-2 border-[#333333] rounded-xl p-4 max-h-72 overflow-y-auto">
                  <AIStreamText key={streamKey} text={planText} speed={15} onComplete={streamDone} className="text-sm text-[#2D2D2D] leading-relaxed font-mono whitespace-pre-line" />
                </div>
                <div className="flex gap-2">
                  <input type="text" value={modifyInput} onChange={(e) => setModifyInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleModify()} placeholder='Ví dụ: "Thêm phần thực hành cho mỗi tuần"' className="flex-1 px-4 py-2.5 rounded-full border-2 border-[#333333] bg-white text-sm outline-none focus:border-[#6B2D3E] transition-colors" disabled={isRegenerating} />
                  <button onClick={handleModify} disabled={isRegenerating || !modifyInput.trim()} className="px-4 py-2 rounded-full bg-[#2D2D2D] text-white text-sm font-medium hover:bg-[#1a1a1a] transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed">
                    {isRegenerating ? '...' : 'Cập nhật'}
                  </button>
                </div>
                <button onClick={handleComplete} className="w-full py-3.5 rounded-full bg-[#4CD964] text-[#2D2D2D] font-bold hover:bg-[#3bc453] transition-colors shadow-md cursor-pointer">OK, hoàn thành ✓</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

export default PlanSurveyModal;
