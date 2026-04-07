'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { AIStreamText } from '@/shared/ui/AIStreamText';
import { quizQuestions, flashcards, essayQuestion, teachAIPrompt } from '@/entities/learning-content';
import { aiApi } from '@/entities/ai';
import { useAuthStore } from '@/entities/auth/store';

type Tab = 'quiz' | 'flashcard' | 'essay' | 'teach';

interface Props {
  onBack?: () => void;
  title?: string;
  onClose?: () => void;
  standalone?: boolean;
  nodeContent?: string;
}

function QuizTab({ nodeContent }: { nodeContent?: string }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const question = quizQuestions[current];

  const handleSelect = (label: string, correct: boolean) => {
    if (selected) return;
    setSelected(label);
    if (correct) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (current < quizQuestions.length - 1) { setCurrent((c) => c + 1); setSelected(null); }
    else setDone(true);
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 py-8">
        <div className="text-6xl">🎉</div>
        <div className="text-2xl font-bold text-[#2D2D2D]">Điểm số: {score}/{quizQuestions.length}</div>
        <p className="text-[#5A5C58] text-center">
          {score === quizQuestions.length ? 'Xuất sắc! Bạn trả lời đúng tất cả câu hỏi!' : score >= 2 ? 'Khá tốt! Ôn lại phần chưa đúng nhé.' : 'Cần ôn luyện thêm. Đọc lại tài liệu và thử lại!'}
        </p>
        <button onClick={() => { setCurrent(0); setSelected(null); setScore(0); setDone(false); }} className="px-6 py-2.5 rounded-xl bg-[#6B2D3E] text-white font-bold text-sm hover:bg-[#5a2434] transition-colors cursor-pointer">
          Làm lại
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-2 bg-[#E5E5DF] rounded-full overflow-hidden">
          <div className="h-full bg-[#6B2D3E] rounded-full transition-all duration-500" style={{ width: `${((current + 1) / quizQuestions.length) * 100}%` }} />
        </div>
        <span className="text-[12px] text-[#5A5C58] font-medium whitespace-nowrap">{current + 1}/{quizQuestions.length}</span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={current} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }} className="flex-1 flex flex-col">
          <p className="text-[15px] font-bold text-[#2D2D2D] mb-4 leading-snug">{question.question}</p>
          <div className="grid grid-cols-1 gap-2.5 mb-4">
            {question.options.map((opt) => {
              let bg = 'bg-white border-[#E5E5DF]';
              let text = 'text-[#2D2D2D]';
              if (selected) {
                if (opt.correct) { bg = 'bg-[#D1FAE5] border-[#34D399]'; text = 'text-[#065F46]'; }
                else if (opt.label === selected && !opt.correct) { bg = 'bg-[#FEE2E2] border-[#FCA5A5]'; text = 'text-[#991B1B]'; }
                else { bg = 'bg-white border-[#E5E5DF] opacity-50'; }
              }
              return (
                <button key={opt.label} onClick={() => handleSelect(opt.label, opt.correct)} className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${bg} cursor-pointer disabled:cursor-not-allowed`} disabled={!!selected}>
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold border-2 flex-shrink-0 ${selected && opt.correct ? 'bg-[#34D399] border-[#059669] text-white' : selected && opt.label === selected && !opt.correct ? 'bg-[#FCA5A5] border-[#F87171] text-white' : 'bg-[#F1F1EC] border-[#CCCCCC] text-[#5A5C58]'}`}>{opt.label}</span>
                  <span className={`text-[13px] font-medium ${text}`}>{opt.text}</span>
                </button>
              );
            })}
          </div>
          <AnimatePresence>
            {selected && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-3.5 rounded-xl bg-[#EEF2FF] border-2 border-[#A5B4FC] mb-4">
                <p className="text-[12px] text-[#4338CA] leading-relaxed">— {question.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>
          {selected && (
            <button onClick={handleNext} className="mt-auto self-end px-5 py-2.5 rounded-xl bg-[#2D2D2D] text-white font-bold text-sm hover:bg-[#1a1a1a] transition-colors cursor-pointer">
              {current < quizQuestions.length - 1 ? 'Câu tiếp theo →' : 'Xem kết quả'}
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function FlashcardTab() {
  const cards = flashcards.slice(0, 5).map((fc) => ({ id: fc.id, front: fc.front, back: fc.back }));
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [remembered, setRemembered] = useState<Set<number>>(new Set());
  const card = cards[idx];

  const handleAction = (rem: boolean) => {
    if (rem) setRemembered((s) => new Set([...s, idx]));
    setFlipped(false);
    setTimeout(() => { if (idx < cards.length - 1) setIdx((i) => i + 1); else setIdx(0); }, 50);
  };

  return (
    <div className="flex flex-col items-center h-full gap-5">
      <div className="text-[13px] text-[#5A5C58] font-medium">
        {idx + 1}/{cards.length}
        {remembered.size > 0 && <span className="ml-2 text-[#34D399]">✓ {remembered.size} đã nhớ</span>}
      </div>
      <div className="w-full cursor-pointer" style={{ perspective: '1000px', height: 200 }} onClick={() => setFlipped((f) => !f)}>
        <motion.div className="relative w-full h-full" style={{ transformStyle: 'preserve-3d' }} animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-2 border-[#A5B4FC] bg-[#EEF2FF] p-6" style={{ backfaceVisibility: 'hidden' }}>
            <div className="text-[11px] font-bold text-[#818CF8] uppercase tracking-wider mb-3">Câu hỏi</div>
            <p className="text-[17px] font-bold text-[#2D2D2D] text-center leading-snug">{card.front}</p>
            <p className="text-[11px] text-[#5A5C58] mt-4">Nhấn để lật ➜</p>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-2 border-[#6EE7B7] bg-[#D1FAE5] p-6" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <div className="text-[11px] font-bold text-[#059669] uppercase tracking-wider mb-3">Đáp án</div>
            <p className="text-[14px] font-medium text-[#065F46] text-center leading-relaxed">{card.back}</p>
          </div>
        </motion.div>
      </div>
      <div className="flex gap-3 w-full">
        <button onClick={() => handleAction(false)} className="flex-1 py-2.5 rounded-xl border-2 border-[#FCA5A5] bg-[#FEE2E2] text-[#991B1B] font-bold text-sm hover:bg-[#FECACA] transition-colors cursor-pointer">❌ Chưa nhớ</button>
        <button onClick={() => handleAction(true)} className="flex-1 py-2.5 rounded-xl border-2 border-[#6EE7B7] bg-[#D1FAE5] text-[#065F46] font-bold text-sm hover:bg-[#A7F3D0] transition-colors cursor-pointer">✓ Đã nhớ</button>
      </div>
    </div>
  );
}

function EssayTab({ nodeContent }: { nodeContent?: string }) {
  const user = useAuthStore((s) => s.user);
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const question = essayQuestion.question;

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    setSubmitting(true);
    try {
      const userId = user?.user_id ?? 'anonymous';
      const res = await aiApi.evaluate(userId, question, answer);
      setFeedback(`${res.feedback}\n\nĐiểm: ${res.score}/10 ${res.grade}`);
      setSubmitted(true);
    } catch {
      setFeedback('Không thể kết nối với AI đánh giá. Vui lòng thử lại.');
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="p-3.5 rounded-xl bg-[#EEF2FF] border-2 border-[#A5B4FC]">
        <p className="text-[13px] text-[#2D2D2D] font-medium leading-relaxed">{question}</p>
      </div>
      <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} disabled={submitted || submitting} placeholder="Viết câu trả lời của bạn tại đây..." className="flex-1 w-full p-4 rounded-xl border-2 border-[#E5E5DF] bg-white text-[13px] text-[#2D2D2D] placeholder-[#9CA3AF] resize-none focus:outline-none focus:border-[#6B2D3E] transition-colors min-h-[180px]" />
      {!submitted && (
        <button onClick={handleSubmit} disabled={!answer.trim() || submitting} className="py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer disabled:cursor-not-allowed" style={{ backgroundColor: answer.trim() && !submitting ? '#6B2D3E' : '#E5E5DF', color: answer.trim() && !submitting ? 'white' : '#9CA3AF' }}>
          {submitting ? 'Đang chấm...' : 'Gửi bài'}
        </button>
      )}
      <AnimatePresence>
        {submitted && feedback && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-[#D1FAE5] border-2 border-[#6EE7B7]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-bold text-[#059669] uppercase tracking-wider">Phản hồi AI</span>
            </div>
            <p className="text-[13px] text-[#065F46] leading-relaxed">
              <AIStreamText text={feedback} speed={18} startDelay={300} />
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TeachAITab({ nodeContent }: { nodeContent?: string }) {
  const user = useAuthStore((s) => s.user);
  const [explanation, setExplanation] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const question = teachAIPrompt.aiQuestion;

  const handleSubmit = async () => {
    if (!explanation.trim()) return;
    setSubmitting(true);
    try {
      const userId = user?.user_id ?? 'anonymous';
      const res = await aiApi.evaluate(userId, question, explanation);
      setFeedback(`${res.feedback}\n\nĐiểm: ${res.score}/10 ${res.grade}`);
      setSubmitted(true);
    } catch {
      setFeedback('Không thể kết nối với AI đánh giá. Vui lòng thử lại.');
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] border-2 border-[#A5B4FC] flex items-center justify-center flex-shrink-0 text-lg">AI</div>
        <div className="flex-1 p-3.5 rounded-2xl rounded-tl-sm bg-[#EEF2FF] border-2 border-[#A5B4FC]">
          <p className="text-[13px] text-[#2D2D2D] leading-relaxed">{question}</p>
        </div>
      </div>
      <textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} disabled={submitted || submitting} placeholder="Giải thích cho AI hiểu..." className="flex-1 w-full p-4 rounded-xl border-2 border-[#E5E5DF] bg-white text-[13px] text-[#2D2D2D] placeholder-[#9CA3AF] resize-none focus:outline-none focus:border-[#6B2D3E] transition-colors min-h-[150px]" />
      {!submitted && (
        <button onClick={handleSubmit} disabled={!explanation.trim() || submitting} className="py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer disabled:cursor-not-allowed" style={{ backgroundColor: explanation.trim() && !submitting ? '#6B2D3E' : '#E5E5DF', color: explanation.trim() && !submitting ? 'white' : '#9CA3AF' }}>
          {submitting ? 'Đang đánh giá...' : 'Gửi'}
        </button>
      )}
      <AnimatePresence>
        {submitted && feedback && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#D1FAE5] border-2 border-[#6EE7B7] flex items-center justify-center flex-shrink-0 text-lg">AI</div>
            <div className="flex-1 p-3.5 rounded-2xl rounded-tl-sm bg-[#D1FAE5] border-2 border-[#6EE7B7]">
              <p className="text-[13px] text-[#065F46] leading-relaxed">
                <AIStreamText text={feedback} speed={18} startDelay={300} />
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function NodeReview({ onBack, title, onClose, standalone, nodeContent }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('quiz');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'quiz', label: 'Quiz' },
    { key: 'flashcard', label: 'Flashcard' },
    { key: 'essay', label: 'Tự luận' },
    { key: 'teach', label: 'Dạy AI' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#F5F0EB]">
      {standalone && (
        <div className="flex items-center gap-3 px-5 py-4 border-b-2 border-[#333333]/20 bg-white/40 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#FEE2E2] flex items-center justify-center text-base">📋</div>
          <div className="flex-1">
            <h2 className="font-bold text-[#2D2D2D] text-[14px]">{title ?? 'Ôn tập'}</h2>
          </div>
          {onClose && (
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white border-2 border-[#333333]/30 flex items-center justify-center hover:border-[#333333] transition-colors">
              <X size={14} />
            </button>
          )}
        </div>
      )}
      <div className="flex gap-1.5 px-5 py-3 bg-white/30 border-b border-[#333333]/10 flex-shrink-0">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className="flex-1 py-1.5 rounded-full text-[12px] font-bold transition-all cursor-pointer" style={{ backgroundColor: activeTab === tab.key ? '#2D2D2D' : 'transparent', color: activeTab === tab.key ? 'white' : '#5A5C58' }}>
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }} className="h-full">
            {activeTab === 'quiz' && <QuizTab nodeContent={nodeContent} />}
            {activeTab === 'flashcard' && <FlashcardTab />}
            {activeTab === 'essay' && <EssayTab nodeContent={nodeContent} />}
            {activeTab === 'teach' && <TeachAITab nodeContent={nodeContent} />}
          </motion.div>
        </AnimatePresence>
      </div>
      {!standalone && onBack && (
        <div className="px-5 pb-4 flex-shrink-0">
          <button onClick={onBack} className="text-[13px] text-[#5A5C58] hover:text-[#2D2D2D] transition-colors font-medium cursor-pointer">← Quay lại tài liệu</button>
        </div>
      )}
    </div>
  );
}

export default NodeReview;
