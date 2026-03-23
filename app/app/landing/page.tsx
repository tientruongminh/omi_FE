'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion, Variants, useInView } from 'framer-motion';
import { ChevronDown, Menu, Star } from 'lucide-react';

// ─── Animation variants ──────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut', delay: i * 0.1 },
  }),
};

const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -28 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const fadeRight: Variants = {
  hidden: { opacity: 0, x: 28 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

// ─── Count-up hook ────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

// ─── CTA Button ──────────────────────────────────────────────────────────────

function CTAButton({ href = '/', className = '', light = false }: { href?: string; className?: string; light?: boolean }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold transition-all hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 ${className}`}
      style={{
        background: light ? '#FFFFFF' : '#2D2D2D',
        color: light ? '#2D2D2D' : '#FFFFFF',
        willChange: 'transform',
      }}
    >
      Bắt đầu miễn phí
    </Link>
  );
}

// ─── Demo Section ────────────────────────────────────────────────────────────

const DEMO_SUBJECTS = [
  {
    id: 'giai-tich',
    label: 'Giải Tích 1',
    chapters: ['Giới hạn và Liên tục', 'Đạo hàm', 'Tích phân', 'Chuỗi số'],
    stats: '4 chương • 12 bài • ~6 tuần',
  },
  {
    id: 'vat-ly',
    label: 'Vật Lý',
    chapters: ['Cơ học', 'Nhiệt động lực học', 'Điện từ', 'Quang học'],
    stats: '4 chương • 16 bài • ~8 tuần',
  },
  {
    id: 'ctdl',
    label: 'CTDL',
    chapters: ['Mảng & Danh sách', 'Stack & Queue', 'Cây & Đồ thị', 'Sắp xếp & Tìm kiếm'],
    stats: '4 chương • 14 bài • ~7 tuần',
  },
];

function InteractiveDemo() {
  type DEMO_SUBJECT = (typeof DEMO_SUBJECTS)[number];
  const [demoState, setDemoState] = useState<'idle' | 'loading' | 'result'>('idle');
  const [selectedSubject, setSelectedSubject] = useState<DEMO_SUBJECT | null>(null);
  const [typeText, setTypeText] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const handleSelectSubject = (subject: DEMO_SUBJECT) => {
    setSelectedSubject(subject);
    setDemoState('loading');
    setTypeText('');

    const text = `Đang phân tích tài liệu ${subject.label}...`;
    let i = 0;
    const interval = setInterval(() => {
      setTypeText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        setTimeout(() => setDemoState('result'), 600);
      }
    }, 40);
  };

  const handleReset = () => {
    setDemoState('idle');
    setSelectedSubject(null);
    setTypeText('');
  };

  return (
    <div
      className="w-full rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: '#FFFFFF',
        border: '2px solid #E5DDD5',
        boxShadow: '0 8px 40px rgba(0,0,0,0.07)',
        minHeight: 340,
      }}
    >
      {/* State: idle */}
      {demoState === 'idle' && (
        <div className="flex flex-col items-center justify-center p-8 gap-6 h-full" style={{ minHeight: 340 }}>
          <div
            className="w-full flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-8 px-4 transition-all"
            style={{
              borderColor: isDragOver ? '#3DBE7A' : '#C8C4BF',
              background: isDragOver ? '#EDFAF4' : '#F9F6F2',
              cursor: 'default',
            }}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragOver(false); }}
          >
            <span className="text-3xl">◎</span>
            <p className="text-sm font-semibold text-center" style={{ color: '#5A5C58' }}>
              Kéo thả tài liệu vào đây
            </p>
            <p className="text-xs text-center" style={{ color: '#9CA3AF' }}>PDF, PPTX, DOCX...</p>
          </div>

          <div className="flex flex-col items-center gap-3 w-full">
            <p className="text-xs" style={{ color: '#9CA3AF' }}>hoặc thử ngay với:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {DEMO_SUBJECTS.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => handleSelectSubject(subject)}
                  className="px-4 py-2 rounded-full text-xs font-semibold border transition-all hover:border-[#2D2D2D] hover:text-[#2D2D2D] hover:-translate-y-0.5 active:scale-95"
                  style={{ borderColor: '#E5DDD5', color: '#5A5C58', background: '#fff' }}
                >
                  {subject.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* State: loading */}
      {demoState === 'loading' && (
        <div className="flex flex-col items-center justify-center p-8 gap-5 h-full" style={{ minHeight: 340 }}>
          <motion.div
            className="w-12 h-12 rounded-full border-4"
            style={{ borderColor: '#E5DDD5', borderTopColor: '#2D2D2D' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-sm font-mono" style={{ color: '#5A5C58', minHeight: 24 }}>
            {typeText}
            <span className="animate-pulse">|</span>
          </p>
        </div>
      )}

      {/* State: result */}
      {demoState === 'result' && selectedSubject && (
        <motion.div
          className="flex flex-col gap-4 p-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: '#3DBE7A', color: '#fff' }}>✓</div>
              <p className="text-sm font-bold" style={{ color: '#2D2D2D' }}>
                Lộ trình: {selectedSubject.label}
              </p>
            </div>
            <button
              onClick={handleReset}
              className="text-xs px-3 py-1 rounded-full border transition-all hover:opacity-70"
              style={{ color: '#9CA3AF', borderColor: '#E5DDD5' }}
            >
              ← Thử lại
            </button>
          </div>

          <div
            className="flex flex-col gap-1.5 rounded-xl p-4"
            style={{ background: '#F9F6F2', border: '1px solid #E5DDD5' }}
          >
            {selectedSubject.chapters.map((ch, i) => (
              <motion.div
                key={ch}
                className="flex items-center gap-3 py-1.5"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.09, duration: 0.3, ease: 'easeOut' }}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                  style={{ background: '#3DBE7A', color: '#fff' }}
                >
                  {i + 1}
                </div>
                <span className="text-sm" style={{ color: '#2D2D2D' }}>{ch}</span>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1">
            <p className="text-xs font-semibold" style={{ color: '#9CA3AF' }}>
              {selectedSubject.stats}
            </p>
            <span
              className="text-xs px-2 py-1 rounded-full font-semibold"
              style={{ background: '#EDFAF4', color: '#1A6E3E' }}
            >
              Xong trong 30 giây
            </span>
          </div>

          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: '#2D2D2D' }}
          >
            Bắt đầu học ngay →
          </Link>
        </motion.div>
      )}
    </div>
  );
}

// ─── Mindmap Screenshot ───────────────────────────────────────────────────────

function MindmapScreenshot() {
  return (
    <div
      className="rounded-xl p-5 h-full flex flex-col gap-4"
      style={{ background: '#F9F6F2', border: '1px solid #E5DDD5', minHeight: 200 }}
    >
      <p className="text-xs font-bold" style={{ color: '#5A5C58' }}>Bản đồ tư duy — Giải Tích 1</p>
      <div className="flex flex-col items-center gap-3 flex-1 justify-center">
        <div
          className="px-5 py-2 rounded-full text-xs font-bold text-white text-center"
          style={{ background: '#7C6FCD' }}
        >
          Giải Tích 1
        </div>
        <div className="w-px h-3" style={{ background: '#C8C4BF' }} />
        <div className="grid grid-cols-2 gap-2 w-full">
          {['Giới hạn', 'Đạo hàm', 'Tích phân', 'Chuỗi số'].map((node, i) => (
            <div
              key={node}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-center"
              style={{
                background: i % 2 === 0 ? '#EDFAF4' : '#F0EEFF',
                border: `1.5px solid ${i % 2 === 0 ? '#3DBE7A' : '#7C6FCD'}`,
                color: i % 2 === 0 ? '#1A6E3E' : '#4B3FA0',
              }}
            >
              {node}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Flashcard Screenshot ─────────────────────────────────────────────────────

function FlashcardScreenshot() {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="rounded-xl p-5 h-full flex flex-col gap-4"
      style={{ background: '#F9F6F2', border: '1px solid #E5DDD5', minHeight: 200 }}
    >
      <p className="text-xs font-bold" style={{ color: '#5A5C58' }}>Flashcard — Đạo hàm cơ bản</p>
      <div
        className="flex-1 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:shadow-md p-4 text-center"
        style={{
          background: flipped ? '#2D2D2D' : '#FFFFFF',
          border: '2px solid #E5DDD5',
          minHeight: 100,
        }}
        onClick={() => setFlipped(!flipped)}
      >
        {!flipped ? (
          <>
            <p className="text-xs" style={{ color: '#9CA3AF' }}>Câu hỏi</p>
            <p className="text-sm font-bold" style={{ color: '#2D2D2D' }}>d/dx (sin x) = ?</p>
            <p className="text-[10px]" style={{ color: '#C8C4BF' }}>Nhấn để xem đáp án</p>
          </>
        ) : (
          <>
            <p className="text-xs" style={{ color: '#9CA3AF' }}>Đáp án</p>
            <p className="text-sm font-bold text-white">cos x</p>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.5)' }}>Nhấn để lật lại</p>
          </>
        )}
      </div>
      <div className="grid grid-cols-4 gap-1">
        {[
          { icon: 'Q', label: 'Quiz' },
          { icon: 'F', label: 'Flashcard' },
          { icon: 'T', label: 'Tự luận' },
          { icon: 'D', label: 'Dạy AI' },
        ].map((m, i) => (
          <div
            key={m.label}
            className="flex flex-col items-center gap-1 py-2 rounded-lg"
            style={{
              background: i === 1 ? '#2D2D2D' : '#FFFFFF',
              border: '1px solid #E5DDD5',
            }}
          >
            <span className="text-[10px] font-black" style={{ color: i === 1 ? '#fff' : '#5A5C58' }}>{m.icon}</span>
            <span className="text-[9px] font-semibold" style={{ color: i === 1 ? '#fff' : '#9CA3AF' }}>
              {m.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Chat Screenshot ──────────────────────────────────────────────────────────

function ChatScreenshot() {
  return (
    <div
      className="rounded-xl p-5 h-full flex flex-col gap-3"
      style={{ background: '#F9F6F2', border: '1px solid #E5DDD5', minHeight: 200 }}
    >
      <p className="text-xs font-bold" style={{ color: '#5A5C58' }}>AI Tutor — 24/7</p>
      <div className="flex flex-col gap-3 flex-1">
        <div className="flex justify-end">
          <div
            className="px-3 py-2 rounded-2xl rounded-tr-sm text-xs max-w-[80%]"
            style={{ background: '#2D2D2D', color: '#fff' }}
          >
            Giải thích giới hạn bằng tiếng Việt đơn giản nhất?
          </div>
        </div>
        <div className="flex justify-start gap-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 font-bold"
            style={{ background: '#7C6FCD', color: '#fff' }}
          >
            AI
          </div>
          <div
            className="px-3 py-2 rounded-2xl rounded-tl-sm text-xs max-w-[80%] leading-relaxed"
            style={{ background: '#FFFFFF', border: '1px solid #E5DDD5', color: '#2D2D2D' }}
          >
            Hãy tưởng tượng bạn đi dần đến một điểm mà không bao giờ đến hẳn — giới hạn là giá trị bạn &quot;tiến gần đến&quot;. 🎯
          </div>
        </div>
      </div>
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg"
        style={{ background: '#FFFFFF', border: '1px solid #E5DDD5' }}
      >
        <p className="text-xs flex-1" style={{ color: '#C8C4BF' }}>Hỏi bất cứ điều gì...</p>
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: '#2D2D2D' }}
        >
          <span className="text-[10px] text-white">→</span>
        </div>
      </div>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

interface ProductCardProps {
  title: string;
  caption: string;
  stat: string;
  children: React.ReactNode;
  tilt?: number;
  delay?: number;
  inView: boolean;
}

function ProductCard({ title, caption, stat, children, tilt = 0, delay = 0, inView }: ProductCardProps) {
  return (
    <motion.div
      custom={delay}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className="flex flex-col gap-4 group"
      style={{ transformOrigin: 'center bottom' }}
    >
      <div
        className="rounded-2xl overflow-hidden transition-all duration-300 group-hover:shadow-2xl"
        style={{
          transform: `rotate(${tilt}deg)`,
          border: '2px solid #E5DDD5',
          background: '#FFFFFF',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = 'rotate(0deg) translateY(-4px)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = `rotate(${tilt}deg)`;
        }}
      >
        {children}
      </div>
      <div className="px-2">
        <p className="text-sm font-bold mb-1" style={{ color: '#2D2D2D' }}>{title}</p>
        <p className="text-xs leading-relaxed mb-2" style={{ color: '#5A5C58' }}>{caption}</p>
        <span
          className="inline-block text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ background: '#EDFAF4', color: '#1A6E3E' }}
        >
          {stat}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

interface StatItemProps {
  value: number;
  suffix: string;
  label: string;
  inView: boolean;
}

function StatItem({ value, suffix, label, inView }: StatItemProps) {
  const count = useCountUp(value, 1600, inView);
  return (
    <div className="flex flex-col items-center gap-1 px-6 py-4">
      <span className="text-2xl md:text-3xl font-extrabold text-white">
        {count}{suffix}
      </span>
      <span className="text-xs md:text-sm text-center" style={{ color: 'rgba(255,255,255,0.6)' }}>
        {label}
      </span>
    </div>
  );
}

// ─── FAQ Accordion ────────────────────────────────────────────────────────────

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-xl overflow-hidden transition-all"
      style={{ border: '1.5px solid #E5DDD5', background: '#FFFFFF' }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left transition-colors hover:bg-[#F9F6F2]"
      >
        <span className="text-sm font-bold" style={{ color: '#2D2D2D' }}>{question}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="flex-shrink-0 ml-3"
        >
          <ChevronDown size={18} color="#9CA3AF" />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        style={{ overflow: 'hidden' }}
      >
        <p
          className="px-6 pb-5 text-sm leading-relaxed"
          style={{ color: '#5A5C58' }}
        >
          {answer}
        </p>
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const comparisonRef = useRef(null);
  const showcaseRef = useRef(null);
  const statsRef = useRef(null);
  const testimonialsRef = useRef(null);
  const manifestoRef = useRef(null);
  const faqRef = useRef(null);
  const ctaRef = useRef(null);

  const comparisonInView = useInView(comparisonRef, { once: true, margin: '-80px' });
  const showcaseInView = useInView(showcaseRef, { once: true, margin: '-80px' });
  const statsInView = useInView(statsRef, { once: true, margin: '-80px' });
  const testimonialsInView = useInView(testimonialsRef, { once: true, margin: '-80px' });
  const manifestoInView = useInView(manifestoRef, { once: true, margin: '-80px' });
  const faqInView = useInView(faqRef, { once: true, margin: '-80px' });
  const ctaInView = useInView(ctaRef, { once: true, margin: '-80px' });

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F5F0EB' }}>

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 w-full border-b border-black/8"
        style={{ background: 'rgba(245,240,235,0.94)', backdropFilter: 'blur(14px)' }}
      >
        <div className="max-w-[1100px] mx-auto px-5 h-[62px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-black/5 transition-colors"
              aria-label="Menu"
            >
              <Menu size={20} color="#2D2D2D" />
            </button>
          </div>

          <span
            className="text-xl italic"
            style={{ fontFamily: 'Georgia, serif', color: '#6B2D3E', letterSpacing: '-0.01em' }}
          >
            omilearn
          </span>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm font-semibold transition-all hover:opacity-70"
              style={{ color: '#5A5C58' }}
            >
              Đăng nhập
            </Link>
            <CTAButton className="text-xs py-2.5 px-5" />
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 1 — HERO: Strong hook + Interactive demo
      ══════════════════════════════════════════════════════════════════ */}
      <section className="w-full max-w-[1100px] mx-auto px-5 pt-16 pb-24 flex flex-col md:flex-row items-start gap-14 md:gap-10">

        {/* Left: text */}
        <motion.div
          className="flex-1 flex flex-col items-start pt-2"
          variants={fadeLeft}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-6"
            style={{ background: '#EDFAF4', color: '#1A6E3E', border: '1.5px solid #3DBE7A' }}
          >
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#3DBE7A' }} />
            AI đang thay đổi cách học
          </div>

          {/* Headline */}
          <h1
            className="font-extrabold leading-[1.2] mb-6"
            style={{ fontSize: 'clamp(34px, 4.5vw, 50px)', color: '#2D2D2D' }}
          >
            Sinh viên giỏi<br />
            không học nhiều hơn.<br />
            Họ học{' '}
            <span style={{ color: '#E8887A', fontStyle: 'italic' }}>thông minh hơn.</span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-base mb-8 leading-relaxed"
            style={{ color: '#5A5C58', maxWidth: 420 }}
          >
            Upload tài liệu → AI tạo lộ trình cá nhân → quiz, flashcard, mindmap sẵn sàng.{' '}
            <strong style={{ color: '#2D2D2D' }}>Trong 30 giây.</strong>
          </p>

          {/* CTA */}
          <CTAButton className="mb-4 text-base py-4 px-8" />

          {/* Trust line */}
          <p className="text-sm" style={{ color: '#9CA3AF' }}>
            Được sinh viên từ{' '}
            <strong style={{ color: '#5A5C58' }}>Bách Khoa</strong>,{' '}
            <strong style={{ color: '#5A5C58' }}>Kinh Tế</strong>,{' '}
            <strong style={{ color: '#5A5C58' }}>FPT</strong>... tin dùng
          </p>
        </motion.div>

        {/* Right: interactive demo */}
        <motion.div
          className="flex-shrink-0 w-full md:w-[420px]"
          variants={fadeRight}
          initial="hidden"
          animate="visible"
        >
          <InteractiveDemo />
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 2 — BEFORE vs AFTER
      ══════════════════════════════════════════════════════════════════ */}
      <section
        ref={comparisonRef}
        className="w-full max-w-[1100px] mx-auto px-5 pb-24"
      >
        <motion.div
          className="text-center mb-12"
          variants={fadeUp}
          initial="hidden"
          animate={comparisonInView ? 'visible' : 'hidden'}
        >
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3" style={{ color: '#2D2D2D' }}>
            Bạn đang ở bên nào?
          </h2>
          <p className="text-base" style={{ color: '#5A5C58' }}>
            Hai cách học. Hai kết quả khác nhau.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 items-start">

          {/* Left — Học kiểu cũ */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate={comparisonInView ? 'visible' : 'hidden'}
            className="rounded-2xl p-6 md:p-8 flex flex-col gap-4"
            style={{
              background: '#F5F5F5',
              border: '2px dashed #D1CCC6',
            }}
          >
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#9CA3AF' }}>
              Học kiểu cũ
            </p>
            <div className="flex flex-col gap-3">
              {[
                { icon: '—', text: 'Đọc 200 trang → 2 ngày' },
                { icon: '—', text: 'Tự tóm tắt → quên 80% sau 1 tuần' },
                { icon: '—', text: 'Tự làm flashcard → mất 3 tiếng' },
                { icon: '—', text: 'Ôn thi → không biết bắt đầu từ đâu' },
              ].map((item) => (
                <div key={item.text} className="flex items-start gap-3">
                  <span className="text-base flex-shrink-0 mt-0.5">{item.icon}</span>
                  <span className="text-sm" style={{ color: '#9CA3AF' }}>{item.text}</span>
                </div>
              ))}
            </div>
            <div
              className="mt-2 px-4 py-3 rounded-xl text-sm font-bold"
              style={{ background: '#EBEBEB', color: '#9CA3AF' }}
            >
              Kết quả: &quot;Hy vọng qua môn&quot;
            </div>
          </motion.div>

          {/* Right — Học với Omilearn */}
          <motion.div
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate={comparisonInView ? 'visible' : 'hidden'}
            className="rounded-2xl p-6 md:p-8 flex flex-col gap-4"
            style={{
              background: '#FFFFFF',
              border: '2px solid #3DBE7A',
              boxShadow: '0 4px 32px rgba(61,190,122,0.12)',
              transform: 'scale(1.02)',
            }}
          >
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#3DBE7A' }}>
              Học với Omilearn
            </p>
            <div className="flex flex-col gap-3">
              {[
                { icon: '→', text: 'AI tóm tắt 200 trang → 5 phút' },
                { icon: '→', text: 'Spaced repetition → nhớ 95% sau 1 tháng' },
                { icon: '→', text: 'Auto flashcard + quiz → sẵn sàng ngay' },
                { icon: '→', text: 'Lộ trình cá nhân → biết chính xác học gì' },
              ].map((item) => (
                <div key={item.text} className="flex items-start gap-3">
                  <span className="text-base flex-shrink-0 mt-0.5">{item.icon}</span>
                  <span className="text-sm font-medium" style={{ color: '#2D2D2D' }}>{item.text}</span>
                </div>
              ))}
            </div>
            <div
              className="mt-2 px-4 py-3 rounded-xl text-sm font-bold"
              style={{ background: '#EDFAF4', color: '#1A6E3E' }}
            >
              Kết quả: &quot;Top 10% lớp&quot;
            </div>
          </motion.div>
        </div>

        {/* CTA below comparison */}
        <motion.div
          className="text-center mt-10"
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate={comparisonInView ? 'visible' : 'hidden'}
        >
          <Link
            href="/"
            className="text-sm font-semibold transition-all hover:opacity-60"
            style={{ color: '#E8887A', textDecoration: 'underline', textUnderlineOffset: 4 }}
          >
            Chuyển sang bên phải →
          </Link>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 3 — PRODUCT SHOWCASE
      ══════════════════════════════════════════════════════════════════ */}
      <section
        ref={showcaseRef}
        className="w-full max-w-[1100px] mx-auto px-5 pb-24"
      >
        <motion.div
          className="text-center mb-14"
          variants={fadeUp}
          initial="hidden"
          animate={showcaseInView ? 'visible' : 'hidden'}
        >
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3" style={{ color: '#2D2D2D' }}>
            Mọi thứ bạn cần, trong một nơi.
          </h2>
          <p className="text-base" style={{ color: '#5A5C58', lineHeight: 1.7 }}>
            Đây là giao diện thật. Không phải mockup quảng cáo.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 items-start">
          <ProductCard
            title="Mindmap thông minh"
            caption="Tổ chức kiến thức trực quan"
            stat="Hiểu sâu hơn 3x"
            tilt={1}
            delay={0}
            inView={showcaseInView}
          >
            <MindmapScreenshot />
          </ProductCard>

          <ProductCard
            title="Ôn tập 4 cách"
            caption="Quiz • Flashcard • Tự luận • Dạy AI"
            stat="Nhớ lâu hơn 95%"
            tilt={-1}
            delay={1}
            inView={showcaseInView}
          >
            <FlashcardScreenshot />
          </ProductCard>

          <ProductCard
            title="AI Tutor riêng"
            caption="Hỏi bất cứ lúc nào, bất cứ điều gì"
            stat="Tiết kiệm 4 giờ/tuần"
            tilt={1}
            delay={2}
            inView={showcaseInView}
          >
            <ChatScreenshot />
          </ProductCard>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 4 — SOCIAL PROOF: Stats + Testimonials
      ══════════════════════════════════════════════════════════════════ */}

      {/* Stats bar */}
      <section ref={statsRef} className="w-full pb-16">
        <div
          className="w-full py-2"
          style={{ background: '#2D2D2D' }}
        >
          <div className="max-w-[1100px] mx-auto px-5">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
              <StatItem value={12} suffix="+" label="trường đại học" inView={statsInView} />
              <StatItem value={4} suffix=" giờ" label="tiết kiệm/tuần" inView={statsInView} />
              <StatItem value={98} suffix="%" label="muốn giới thiệu" inView={statsInView} />
              <StatItem value={10} suffix="%" label="top lớp trung bình" inView={statsInView} />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        ref={testimonialsRef}
        className="w-full max-w-[1100px] mx-auto px-5 pb-24"
      >
        <motion.div
          className="text-center mb-12"
          variants={fadeUp}
          initial="hidden"
          animate={testimonialsInView ? 'visible' : 'hidden'}
        >
          <h2 className="text-3xl md:text-4xl font-extrabold mb-2" style={{ color: '#2D2D2D' }}>
            Sinh viên thật. Kết quả thật.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              quote: 'Upload slide Giải Tích, 2 phút sau có lộ trình + flashcard. Trước mất cả buổi tối.',
              name: 'Minh Anh',
              school: 'Bách Khoa HN',
              badge: 'Từ 6.5 → 8.7 điểm thi',
            },
            {
              quote: 'Tính năng quiz tự động biến ôn thi thành game. Không thấy chán nữa.',
              name: 'Hoàng Nam',
              school: 'Kinh Tế QD',
              badge: 'GPA 2.8 → 3.5',
            },
            {
              quote: "'Dạy lại cho AI' — phải giải thích bằng lời mình, mới thấy chỗ nào chưa hiểu.",
              name: 'Thu Hà',
              school: 'Bách Khoa ĐN',
              badge: 'Đồ án nhóm 9.5/10',
            },
          ].map((t, i) => (
            <motion.div
              key={t.name}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={testimonialsInView ? 'visible' : 'hidden'}
              className="flex flex-col gap-4 p-6 rounded-2xl transition-all hover:shadow-lg"
              style={{
                background: '#FFFFFF',
                border: '2px solid #E5DDD5',
              }}
            >
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={13} fill="#F5C542" color="#F5C542" />
                ))}
              </div>

              <p className="text-sm flex-1" style={{ color: '#5A5C58', lineHeight: 1.7 }}>
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Green badge with result */}
              <div
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold"
                style={{ background: '#EDFAF4', color: '#1A6E3E', border: '1px solid #3DBE7A' }}
              >
                ✓ {t.badge}
              </div>

              <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: '#F0EBE3' }}>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: '#7C6FCD' }}
                >
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: '#2D2D2D' }}>{t.name}</p>
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>{t.school}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 5 — MANIFESTO: Tại sao bây giờ? (cinematic reveal)
      ══════════════════════════════════════════════════════════════════ */}
      <section
        ref={manifestoRef}
        className="w-full py-32 relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #F5F0EB 0%, #EDE5DB 50%, #F5F0EB 100%)' }}
      >
        {/* Decorative subtle lines */}
        <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.04 }}>
          <div className="absolute top-1/4 left-0 right-0 h-px bg-[#2D2D2D]" />
          <div className="absolute top-2/4 left-0 right-0 h-px bg-[#2D2D2D]" />
          <div className="absolute top-3/4 left-0 right-0 h-px bg-[#2D2D2D]" />
        </div>

        <div className="max-w-[780px] mx-auto px-5 text-center relative z-10">
          {(() => {
            const lines = [
              { text: 'Kỷ nguyên AI đã thay đổi mọi ngành nghề.', type: 'normal' as const },
              { text: 'Giáo dục là ngành tiếp theo.', type: 'normal' as const },
              { text: '', type: 'spacer' as const },
              { text: 'Sinh viên giỏi nhất không phải người học nhiều nhất.', type: 'normal' as const },
              { text: 'Mà là người biết dùng đúng công cụ.', type: 'bold' as const },
              { text: '', type: 'spacer' as const },
            ];
            return lines.map((line, i) => {
              if (line.type === 'spacer') return <div key={i} className="h-6" />;
              return (
                <motion.p
                  key={i}
                  className="italic"
                  style={{
                    fontFamily: 'Georgia, serif',
                    fontSize: 'clamp(20px, 2.5vw, 28px)',
                    color: '#2D2D2D',
                    lineHeight: 2,
                    fontWeight: line.type === 'bold' ? 600 : 400,
                  }}
                  initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
                  animate={manifestoInView ? {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    transition: { duration: 0.8, delay: i * 0.3, ease: 'easeOut' },
                  } : { opacity: 0, y: 30, filter: 'blur(8px)' }}
                >
                  {line.text}
                </motion.p>
              );
            });
          })()}

          {/* Last 2 lines with color highlights — extra delay */}
          <div className="h-6" />
          <motion.p
            className="italic"
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(20px, 2.5vw, 28px)',
              color: '#2D2D2D',
              lineHeight: 2,
            }}
            initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
            animate={manifestoInView ? {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              transition: { duration: 0.8, delay: 1.8, ease: 'easeOut' },
            } : { opacity: 0, y: 30, filter: 'blur(8px)' }}
          >
            Bạn có{' '}
            <motion.strong
              style={{ fontStyle: 'normal', color: '#E8887A', position: 'relative', display: 'inline-block' }}
              initial={{ opacity: 0 }}
              animate={manifestoInView ? {
                opacity: 1,
                transition: { duration: 0.5, delay: 2.4 },
              } : { opacity: 0 }}
            >
              168 giờ
              <motion.span
                className="absolute -bottom-1 left-0 h-[3px] rounded-full"
                style={{ background: '#E8887A' }}
                initial={{ width: '0%' }}
                animate={manifestoInView ? {
                  width: '100%',
                  transition: { duration: 0.6, delay: 2.7, ease: 'easeOut' },
                } : { width: '0%' }}
              />
            </motion.strong>{' '}
            mỗi tuần.
          </motion.p>

          <motion.p
            className="italic"
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(20px, 2.5vw, 28px)',
              color: '#2D2D2D',
              lineHeight: 2,
            }}
            initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
            animate={manifestoInView ? {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              transition: { duration: 0.8, delay: 2.1, ease: 'easeOut' },
            } : { opacity: 0, y: 30, filter: 'blur(8px)' }}
          >
            Omilearn giúp mỗi giờ đáng giá{' '}
            <motion.strong
              style={{ fontStyle: 'normal', color: '#3DBE7A', position: 'relative', display: 'inline-block' }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={manifestoInView ? {
                opacity: 1,
                scale: 1,
                transition: { duration: 0.5, delay: 3.0, ease: 'backOut' },
              } : { opacity: 0, scale: 0.8 }}
            >
              gấp đôi.
              <motion.span
                className="absolute -bottom-1 left-0 h-[3px] rounded-full"
                style={{ background: '#3DBE7A' }}
                initial={{ width: '0%' }}
                animate={manifestoInView ? {
                  width: '100%',
                  transition: { duration: 0.6, delay: 3.3, ease: 'easeOut' },
                } : { width: '0%' }}
              />
            </motion.strong>
          </motion.p>

          {/* CTA fades in last */}
          <motion.div
            className="mt-14"
            initial={{ opacity: 0 }}
            animate={manifestoInView ? {
              opacity: 1,
              transition: { duration: 0.6, delay: 3.6 },
            } : { opacity: 0 }}
          >
            <Link
              href="/"
              className="text-sm font-semibold transition-all hover:opacity-60"
              style={{ color: '#2D2D2D', textDecoration: 'underline', textUnderlineOffset: 4 }}
            >
              Bắt đầu miễn phí →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 6 — FAQ: Objection handler
      ══════════════════════════════════════════════════════════════════ */}
      <section
        ref={faqRef}
        className="w-full max-w-[720px] mx-auto px-5 pb-24"
      >
        <motion.div
          className="text-center mb-10"
          variants={fadeUp}
          initial="hidden"
          animate={faqInView ? 'visible' : 'hidden'}
        >
          <h2 className="text-3xl md:text-4xl font-extrabold" style={{ color: '#2D2D2D' }}>
            Câu hỏi thường gặp
          </h2>
        </motion.div>

        <motion.div
          className="flex flex-col gap-3"
          variants={fadeUp}
          initial="hidden"
          animate={faqInView ? 'visible' : 'hidden'}
          custom={1}
        >
          <FAQItem
            question="Tôi tự học cũng được mà?"
            answer='Được. Nhưng bạn có 168 giờ/tuần. AI giúp mỗi giờ hiệu quả gấp đôi. Câu hỏi không phải "có cần không" — mà là "tại sao chưa?"'
          />
          <FAQItem
            question="AI có thay thế việc học không?"
            answer="Không. Omilearn không học hộ bạn. Bạn vẫn đọc, hiểu, ôn. AI chỉ loại bỏ phần lãng phí — tổng hợp tài liệu, tạo flashcard, lập kế hoạch. Phần khó vẫn là của bạn."
          />
          <FAQItem
            question="Mình không giỏi công nghệ..."
            answer="Upload file. Bấm nút. Xong. Nếu biết dùng Zalo, biết dùng Omilearn."
          />
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 7 — FINAL CTA: Confident close
      ══════════════════════════════════════════════════════════════════ */}
      <section
        ref={ctaRef}
        className="w-full px-5 pb-24"
        style={{ background: 'linear-gradient(180deg, #F5F0EB 0%, #EDE5DB 100%)' }}
      >
        <div className="max-w-[1100px] mx-auto pt-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate={ctaInView ? 'visible' : 'hidden'}
            className="flex justify-center"
          >
            <div
              className="w-full max-w-[520px] rounded-3xl px-10 py-14 flex flex-col items-center text-center gap-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              style={{
                background: '#2D2D2D',
                boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
                willChange: 'transform',
              }}
            >
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                Sẵn sàng học thông minh hơn?
              </h2>

              <CTAButton light className="text-base py-4 px-8" />

              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Miễn phí. Không cần thẻ tín dụng.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer
        className="w-full border-t"
        style={{
          borderColor: '#E5DDD5',
          borderStyle: 'dashed',
          background: '#F5F0EB',
        }}
      >
        <div className="max-w-[1100px] mx-auto px-5 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span
              className="text-lg italic"
              style={{ fontFamily: 'Georgia, serif', color: '#6B2D3E' }}
            >
              omilearn
            </span>
            <p className="text-xs" style={{ color: '#9CA3AF' }}>
              © 2025 Omilearn. Mọi quyền được bảo lưu.
            </p>
          </div>

          <div className="flex items-center gap-5 flex-wrap justify-center">
            {['Chính sách bảo mật', 'Điều khoản', 'Liên hệ'].map((link) => (
              <a
                key={link}
                href="#"
                className="text-xs transition-colors hover:text-[#2D2D2D]"
                style={{ color: '#9CA3AF' }}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
