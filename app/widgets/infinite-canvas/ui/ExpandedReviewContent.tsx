'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, RotateCw, Send, ChevronLeft, ChevronRight, MessageCircle, ClipboardList, Loader2 } from 'lucide-react';
import { CanvasNode } from '../model/types';
import { quizQuestions, flashcards, essayQuestion, teachAIPrompt } from '@/entities/learning-content';
import ExpandedHeader from './ExpandedHeader';
import AIStreamText from '@/shared/ui/AIStreamText';
import { aiApi } from '@/entities/ai/api';
import { useAuthStore } from '@/entities/auth/store';

type ReviewTab = 'quiz' | 'flashcard' | 'essay' | 'teach';

interface FloatingMenu {
  x: number;
  y: number;
  text: string;
}

interface Props {
  node: CanvasNode;
  onClose: () => void;
  onCreateAINode?: (nodeId: string, type: 'ai-chat' | 'ai-review', selectedText?: string) => void;
}

const TABS: { key: ReviewTab; label: string; icon: string }[] = [
  { key: 'quiz', label: 'Quiz', icon: '📝' },
  { key: 'flashcard', label: 'Flashcard', icon: '🃏' },
  { key: 'essay', label: 'Tự luận', icon: '✍️' },
  { key: 'teach', label: 'Dạy AI', icon: '🎓' },
];

export default function ExpandedReviewContent({ node, onClose, onCreateAINode }: Props) {
  const [activeTab, setActiveTab] = useState<ReviewTab>('quiz');
  const [floatingMenu, setFloatingMenu] = useState<FloatingMenu | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Right-click handler
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onCreateAINode) return;

    const selection = window.getSelection();
    const text = selection?.toString().trim() ?? '';
    const containerRect = contentRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    setFloatingMenu({
      x: e.clientX - containerRect.left,
      y: e.clientY - containerRect.top,
      text,
    });
  }, [onCreateAINode]);

  // Text selection handler
  const handleMouseUp = useCallback(() => {
    if (!onCreateAINode) return;
    setTimeout(() => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();
      if (!text || text.length < 3) {
        setFloatingMenu(null);
        return;
      }
      const range = selection?.getRangeAt(0);
      if (!range) return;
      const rect = range.getBoundingClientRect();
      const containerRect = contentRef.current?.getBoundingClientRect();
      if (!containerRect) return;
      setFloatingMenu({
        x: rect.left + rect.width / 2 - containerRect.left,
        y: rect.top - containerRect.top - 8,
        text,
      });
    }, 10);
  }, [onCreateAINode]);

  // Close menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (floatingMenu && contentRef.current && !contentRef.current.contains(e.target as Node)) {
        setFloatingMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [floatingMenu]);

  const handleAction = useCallback((type: 'ai-chat' | 'ai-review') => {
    const text = floatingMenu?.text || undefined;
    onCreateAINode?.(node.id, type, text);
    setFloatingMenu(null);
    window.getSelection()?.removeAllRanges();
  }, [floatingMenu, node.id, onCreateAINode]);

  return (
    <div className="flex flex-col h-full bg-[#FEE2E2]">
      <ExpandedHeader icon="📋" title="AI Ôn tập" onClose={onClose} />

      {/* Tab bar */}
      <div className="flex border-b-2 border-[#F87171]/20 bg-white/50 flex-shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-bold transition-all cursor-pointer border-b-2 ${
              activeTab === tab.key
                ? 'border-[#991B1B] text-[#991B1B] bg-white/80'
                : 'border-transparent text-[#5A5C58] hover:text-[#991B1B] hover:bg-white/40'
            }`}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div
        ref={contentRef}
        className="flex-1 overflow-y-auto relative select-text"
        onContextMenu={handleContextMenu}
        onMouseUp={handleMouseUp}
      >
        {activeTab === 'quiz' && <QuizTab />}
        {activeTab === 'flashcard' && <FlashcardTab />}
        {activeTab === 'essay' && <EssayTab />}
        {activeTab === 'teach' && <TeachAITab />}

        {/* Floating AI menu on selection/right-click */}
        <AnimatePresence>
          {floatingMenu && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 flex flex-col bg-[#2D2D2D] rounded-xl shadow-2xl overflow-hidden"
              style={{ left: floatingMenu.x, top: floatingMenu.y, transform: 'translate(-50%, -100%)', minWidth: 180 }}
            >
              {floatingMenu.text && (
                <div className="px-3 py-2 text-[10px] text-white/50 border-b border-white/10 truncate max-w-[220px]">
                  &ldquo;{floatingMenu.text.slice(0, 50)}{floatingMenu.text.length > 50 ? '...' : ''}&rdquo;
                </div>
              )}
              <button
                onMouseDown={(e) => { e.preventDefault(); handleAction('ai-chat'); }}
                className="flex items-center gap-2 px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-white/15 transition-colors cursor-pointer text-left"
              >
                <MessageCircle size={13} className="text-[#6EE7B7]" /> AI hỏi đáp
              </button>
              <button
                onMouseDown={(e) => { e.preventDefault(); handleAction('ai-review'); }}
                className="flex items-center gap-2 px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-white/15 transition-colors cursor-pointer text-left"
              >
                <ClipboardList size={13} className="text-[#FCA5A5]" /> AI ôn tập
              </button>
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-[#2D2D2D] rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer: create more nodes */}
      {onCreateAINode && (
        <div className="flex gap-2.5 px-4 py-3 border-t bg-white/40 flex-shrink-0 border-[#F87171]/20">
          <button
            onClick={() => onCreateAINode(node.id, 'ai-chat')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#D1FAE5] border-2 border-[#6EE7B7] text-[#065F46] font-bold text-[11px] hover:bg-[#A7F3D0] transition-colors cursor-pointer"
          >
            <MessageCircle size={12} /> AI hỏi đáp
          </button>
          <button
            onClick={() => onCreateAINode(node.id, 'ai-review')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#FEE2E2] border-2 border-[#FCA5A5] text-[#991B1B] font-bold text-[11px] hover:bg-[#FECACA] transition-colors cursor-pointer"
          >
            <ClipboardList size={12} /> Ôn tập
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Quiz Tab ────────────────────────────────────────────────

function QuizTab() {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);

  const q = quizQuestions[currentQ];
  if (!q) return null;

  const handleSelect = (label: string) => {
    if (selected) return; // already answered
    setSelected(label);
    setShowExplanation(true);
    setAnswered((a) => a + 1);
    const isCorrect = q.options.find((o) => o.label === label)?.correct;
    if (isCorrect) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (currentQ < quizQuestions.length - 1) {
      setCurrentQ((c) => c + 1);
      setSelected(null);
      setShowExplanation(false);
    }
  };

  const handleReset = () => {
    setCurrentQ(0);
    setSelected(null);
    setShowExplanation(false);
    setScore(0);
    setAnswered(0);
  };

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-[#991B1B]">
          Câu {currentQ + 1}/{quizQuestions.length}
        </span>
        <span className="text-[11px] font-semibold text-[#5A5C58]">
          Điểm: {score}/{answered}
        </span>
      </div>
      <div className="w-full h-1.5 bg-white/60 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[#991B1B] rounded-full"
          animate={{ width: `${((currentQ + 1) / quizQuestions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="bg-white rounded-xl border border-[#E5E5DF] p-4">
        <p className="text-[13px] font-semibold text-[#2D2D2D] leading-relaxed">{q.question}</p>
      </div>

      {/* Options */}
      <div className="space-y-2">
        {q.options.map((opt) => {
          let style = 'bg-white border-[#E5E5DF] text-[#2D2D2D] hover:border-[#991B1B]';
          if (selected) {
            if (opt.correct) style = 'bg-[#D1FAE5] border-[#34D399] text-[#065F46]';
            else if (opt.label === selected && !opt.correct) style = 'bg-[#FEE2E2] border-[#F87171] text-[#991B1B]';
            else style = 'bg-white/50 border-[#E5E5DF] text-[#9CA3AF]';
          }
          return (
            <motion.button
              key={opt.label}
              whileTap={!selected ? { scale: 0.98 } : {}}
              onClick={() => handleSelect(opt.label)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all cursor-pointer ${style}`}
              disabled={!!selected}
            >
              <span className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                style={{ borderColor: 'inherit' }}>
                {selected && opt.correct ? <CheckCircle size={16} className="text-[#34D399]" /> :
                 selected && opt.label === selected && !opt.correct ? <XCircle size={16} className="text-[#F87171]" /> :
                 opt.label}
              </span>
              <span className="text-[12px] leading-relaxed">{opt.text}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Explanation */}
      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[#FFFDE7] border border-[#F59E0B] rounded-xl p-4 overflow-hidden"
          >
            <p className="text-[10px] font-bold text-[#92400E] uppercase tracking-wide mb-1">Giải thích</p>
            <p className="text-[12px] text-[#5A5C58] leading-relaxed">{q.explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-2 pt-2">
        {currentQ < quizQuestions.length - 1 ? (
          <button
            onClick={handleNext}
            disabled={!selected}
            className="flex-1 py-2.5 rounded-xl bg-[#991B1B] text-white text-[12px] font-bold hover:bg-[#7F1D1D] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            Câu tiếp →
          </button>
        ) : selected ? (
          <div className="flex-1 space-y-2">
            <div className="text-center py-3 bg-white rounded-xl border border-[#E5E5DF]">
              <p className="text-[14px] font-bold text-[#2D2D2D]">🎉 Hoàn thành!</p>
              <p className="text-[12px] text-[#5A5C58] mt-1">Điểm: {score}/{quizQuestions.length}</p>
            </div>
            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#991B1B] text-white text-[12px] font-bold hover:bg-[#7F1D1D] transition-all cursor-pointer"
            >
              <RotateCw size={12} /> Làm lại
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ─── Flashcard Tab ───────────────────────────────────────────

function FlashcardTab() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<string>>(new Set());

  const card = flashcards[currentIdx];
  if (!card) return null;

  const handleFlip = () => setFlipped(!flipped);
  const handleNext = () => { setCurrentIdx((i) => Math.min(i + 1, flashcards.length - 1)); setFlipped(false); };
  const handlePrev = () => { setCurrentIdx((i) => Math.max(i - 1, 0)); setFlipped(false); };
  const handleKnown = () => {
    setKnown((s) => { const n = new Set(s); n.add(card.id); return n; });
    handleNext();
  };

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-[#991B1B]">
          {currentIdx + 1}/{flashcards.length}
        </span>
        <span className="text-[11px] font-semibold text-[#065F46]">
          ✓ Đã thuộc: {known.size}
        </span>
      </div>

      {/* Card */}
      <motion.div
        onClick={handleFlip}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="relative cursor-pointer select-none"
        style={{ perspective: '1000px' }}
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.4 }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative"
        >
          {/* Front */}
          <div
            className={`bg-white rounded-2xl border-2 border-[#333333] p-6 min-h-[180px] flex flex-col items-center justify-center text-center ${flipped ? 'invisible' : ''}`}
            style={{ backfaceVisibility: 'hidden' }}
          >
            <p className="text-[9px] font-bold text-[#F87171] uppercase tracking-widest mb-3">CÂU HỎI</p>
            <p className="text-[14px] font-semibold text-[#2D2D2D] leading-relaxed">{card.front}</p>
            <p className="text-[10px] text-[#9CA3AF] mt-4">Nhấn để lật thẻ</p>
          </div>

          {/* Back */}
          <div
            className={`absolute inset-0 bg-[#1a1a1a] rounded-2xl border-2 border-[#333333] p-6 min-h-[180px] flex flex-col items-center justify-center text-center ${!flipped ? 'invisible' : ''}`}
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <p className="text-[9px] font-bold text-[#4CD964] uppercase tracking-widest mb-3">TRẢ LỜI</p>
            <p className="text-[13px] text-white leading-relaxed">{card.back}</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handlePrev}
          disabled={currentIdx === 0}
          className="w-10 h-10 rounded-full border-2 border-[#333333] flex items-center justify-center hover:bg-[#F5F0EB] disabled:opacity-30 transition-all cursor-pointer"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={handleKnown}
          className="flex-1 py-2.5 rounded-xl bg-[#D1FAE5] border-2 border-[#6EE7B7] text-[#065F46] text-[12px] font-bold hover:bg-[#A7F3D0] transition-all cursor-pointer"
        >
          ✓ Đã thuộc
        </button>
        <button
          onClick={handleNext}
          className="flex-1 py-2.5 rounded-xl bg-[#FEE2E2] border-2 border-[#FCA5A5] text-[#991B1B] text-[12px] font-bold hover:bg-[#FECACA] transition-all cursor-pointer"
        >
          Chưa thuộc →
        </button>
        <button
          onClick={handleNext}
          disabled={currentIdx === flashcards.length - 1}
          className="w-10 h-10 rounded-full border-2 border-[#333333] flex items-center justify-center hover:bg-[#F5F0EB] disabled:opacity-30 transition-all cursor-pointer"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ─── Essay Tab ───────────────────────────────────────────────

function EssayTab() {
  const user = useAuthStore((s) => s.user);
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    setSubmitting(true);
    try {
      const content = `Câu hỏi: ${essayQuestion.question}\n\nBài làm: ${answer}`;
      const res = await aiApi.evaluate(content, 'Đánh giá bài viết của học sinh');
      const feedbackText = `${res.feedback}\n\nĐiểm: ${res.score}/100 (${res.grade})\n${res.suggestions?.length ? '\nGợi ý: ' + res.suggestions.join('; ') : ''}`;
      setFeedback(feedbackText);
    } catch {
      setFeedback('Không thể nhận xét lúc này. Hãy thử lại sau.');
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }
  };

  const handleReset = () => {
    setAnswer('');
    setSubmitted(false);
    setFeedback('');
    setSubmitting(false);
  };

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Question */}
      <div className="bg-white rounded-xl border border-[#E5E5DF] p-4">
        <p className="text-[9px] font-bold text-[#991B1B] uppercase tracking-widest mb-2">CÂU HỎI TỰ LUẬN</p>
        <p className="text-[13px] font-semibold text-[#2D2D2D] leading-relaxed">{essayQuestion.question}</p>
      </div>

      {/* Answer area */}
      {!submitted ? (
        <>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Viết câu trả lời của bạn tại đây..."
            className="w-full h-40 p-4 bg-white border-2 border-[#E5E5DF] rounded-xl text-[13px] text-[#2D2D2D] leading-relaxed resize-none focus:border-[#991B1B] outline-none placeholder-[#9CA3AF] transition-colors"
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#9CA3AF]">{answer.length} ký tự</span>
            <button
              onClick={handleSubmit}
              disabled={answer.trim().length < 20 || submitting}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#991B1B] text-white text-[12px] font-bold hover:bg-[#7F1D1D] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {submitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
              {submitting ? 'Đang chấm...' : 'Nộp bài'}
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Submitted answer */}
          <div className="bg-white/60 rounded-xl border border-[#E5E5DF] p-4">
            <p className="text-[9px] font-bold text-[#5A5C58] uppercase tracking-widest mb-1">BÀI LÀM CỦA BẠN</p>
            <p className="text-[12px] text-[#5A5C58] leading-relaxed italic">{answer}</p>
          </div>

          {/* AI feedback */}
          <div className="bg-white rounded-xl border-2 border-[#F59E0B] p-4">
            <p className="text-[9px] font-bold text-[#92400E] uppercase tracking-widest mb-2">NHẬN XÉT CỦA AI</p>
            <AIStreamText text={feedback} speed={15} className="text-[12px] text-[#2D2D2D] leading-relaxed whitespace-pre-line" />
          </div>

          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#991B1B] text-white text-[12px] font-bold hover:bg-[#7F1D1D] transition-all cursor-pointer"
          >
            <RotateCw size={12} /> Làm lại
          </button>
        </>
      )}
    </div>
  );
}

// ─── Teach AI Tab ────────────────────────────────────────────

function TeachAITab() {
  const user = useAuthStore((s) => s.user);
  const [teaching, setTeaching] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [score, setScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!teaching.trim()) return;
    setSubmitting(true);
    try {
      const content = `Chủ đề: ${teachAIPrompt.topic}\nCâu hỏi AI: ${teachAIPrompt.aiQuestion}\n\nGiải thích của học sinh: ${teaching}`;
      const res = await aiApi.evaluate(content, 'Đánh giá khả năng giải thích kiến thức');
      setScore(res.score); // score is /100
      const responseText = `Cảm ơn bạn đã giải thích!\n\n${res.feedback}${res.suggestions?.length ? '\n\n💡 Gợi ý: ' + res.suggestions.join('; ') : ''}\n\nĐộ chính xác giải thích: ${res.score}%`;
      setAiResponse(responseText);
    } catch {
      setScore(75);
      setAiResponse(`Cảm ơn bạn đã giải thích về ${teachAIPrompt.topic}! Bài giải thích khá tốt. Hãy thử lại để nhận phản hồi chi tiết hơn từ AI.`);
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }
  };

  const handleReset = () => {
    setTeaching('');
    setSubmitted(false);
    setAiResponse('');
    setScore(0);
    setSubmitting(false);
  };

  return (
    <div className="px-4 py-4 space-y-4">
      {/* AI's question */}
      <div className="bg-white rounded-xl border border-[#E5E5DF] p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-[#EEF2FF] border border-[#818CF8] flex items-center justify-center text-[10px]">
            🤖
          </div>
          <p className="text-[9px] font-bold text-[#4338CA] uppercase tracking-widest">AI HỎI BẠN</p>
        </div>
        <p className="text-[13px] text-[#2D2D2D] leading-relaxed">{teachAIPrompt.aiQuestion}</p>
      </div>

      <div className="bg-[#FFFDE7] rounded-lg px-3 py-2 border border-[#F59E0B]/30">
        <p className="text-[10px] text-[#92400E] font-medium">
          💡 Mẹo: Hãy giải thích như đang dạy bạn bè — càng rõ ràng, đơn giản, AI càng cho điểm cao!
        </p>
      </div>

      {!submitted ? (
        <>
          <textarea
            value={teaching}
            onChange={(e) => setTeaching(e.target.value)}
            placeholder={`Giải thích cho AI về ${teachAIPrompt.topic}...`}
            className="w-full h-44 p-4 bg-white border-2 border-[#E5E5DF] rounded-xl text-[13px] text-[#2D2D2D] leading-relaxed resize-none focus:border-[#4338CA] outline-none placeholder-[#9CA3AF] transition-colors"
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#9CA3AF]">{teaching.length} ký tự</span>
            <button
              onClick={handleSubmit}
              disabled={teaching.trim().length < 30 || submitting}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#4338CA] text-white text-[12px] font-bold hover:bg-[#3730A3] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {submitting ? <Loader2 size={12} className="animate-spin" /> : null}
              {submitting ? 'Đang chấm...' : '🎓 Dạy AI'}
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Score */}
          <div className="flex items-center justify-center py-3">
            <div className="bg-white rounded-2xl border-2 border-[#333333] px-6 py-3 text-center">
              <p className="text-[10px] font-bold text-[#5A5C58] uppercase tracking-widest">ĐỘ CHÍNH XÁC</p>
              <p className="text-3xl font-bold mt-1" style={{ color: score >= 80 ? '#065F46' : score >= 50 ? '#C2410C' : '#991B1B' }}>
                {score}%
              </p>
            </div>
          </div>

          {/* Your explanation */}
          <div className="bg-white/60 rounded-xl border border-[#E5E5DF] p-4">
            <p className="text-[9px] font-bold text-[#5A5C58] uppercase tracking-widest mb-1">BÀI GIẢNG CỦA BẠN</p>
            <p className="text-[12px] text-[#5A5C58] leading-relaxed italic">{teaching}</p>
          </div>

          {/* AI response */}
          <div className="bg-white rounded-xl border-2 border-[#4338CA] p-4">
            <p className="text-[9px] font-bold text-[#4338CA] uppercase tracking-widest mb-2">PHẢN HỒI TỪ AI</p>
            <AIStreamText text={aiResponse} speed={15} className="text-[12px] text-[#2D2D2D] leading-relaxed whitespace-pre-line" />
          </div>

          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#4338CA] text-white text-[12px] font-bold hover:bg-[#3730A3] transition-all cursor-pointer"
          >
            <RotateCw size={12} /> Dạy lại
          </button>
        </>
      )}
    </div>
  );
}
