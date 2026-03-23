'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion, Variants, useInView } from 'framer-motion';
import { Menu, Star } from 'lucide-react';

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

// ─── CTA Button ──────────────────────────────────────────────────────────────

function CTAButton({ href = '/', className = '' }: { href?: string; className?: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold text-white transition-all hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 ${className}`}
      style={{ background: '#2D2D2D', willChange: 'transform' }}
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
    label: 'Vật Lý Đại Cương',
    chapters: ['Cơ học', 'Nhiệt động lực học', 'Điện từ', 'Quang học'],
    stats: '4 chương • 16 bài • ~8 tuần',
  },
  {
    id: 'ctdl',
    label: 'Cấu Trúc Dữ Liệu',
    chapters: ['Mảng & Danh sách', 'Stack & Queue', 'Cây & Đồ thị', 'Sắp xếp & Tìm kiếm'],
    stats: '4 chương • 14 bài • ~7 tuần',
  },
];

function InteractiveDemo() {
  const [demoState, setDemoState] = useState<'idle' | 'loading' | 'result'>('idle');
  const [selectedSubject, setSelectedSubject] = useState<DEMO_SUBJECT | null>(null);
  const [typeText, setTypeText] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  type DEMO_SUBJECT = (typeof DEMO_SUBJECTS)[number];

  const handleSelectSubject = (subject: DEMO_SUBJECT) => {
    setSelectedSubject(subject);
    setDemoState('loading');
    setTypeText('');

    // Typewriter effect
    const text = `Đang phân tích tài liệu ${subject.label}...`;
    let i = 0;
    const interval = setInterval(() => {
      setTypeText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        // After typing completes, show result
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
        minHeight: 320,
      }}
    >
      {/* State: idle */}
      {demoState === 'idle' && (
        <div className="flex flex-col items-center justify-center p-8 gap-6 h-full" style={{ minHeight: 320 }}>
          {/* Drop zone */}
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
            <span className="text-3xl">📄</span>
            <p className="text-sm font-semibold text-center" style={{ color: '#5A5C58' }}>
              Kéo thả tài liệu vào đây
            </p>
          </div>

          {/* Quick demo */}
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
        <div className="flex flex-col items-center justify-center p-8 gap-5 h-full" style={{ minHeight: 320 }}>
          <motion.div
            className="w-12 h-12 rounded-full border-4 border-t-transparent"
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
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🧠</span>
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

          {/* Chapters */}
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

          {/* Stats + CTA */}
          <div className="flex items-center justify-between pt-1">
            <p className="text-xs font-semibold" style={{ color: '#9CA3AF' }}>
              📊 {selectedSubject.stats}
            </p>
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
      <p className="text-xs font-bold" style={{ color: '#5A5C58' }}>🗺️ Bản đồ tư duy — Giải Tích 1</p>
      {/* Mini mindmap */}
      <div className="flex flex-col items-center gap-3 flex-1 justify-center">
        {/* Root node */}
        <div
          className="px-5 py-2 rounded-full text-xs font-bold text-white text-center"
          style={{ background: '#7C6FCD' }}
        >
          Giải Tích 1
        </div>

        {/* Connector */}
        <div className="w-px h-3" style={{ background: '#C8C4BF' }} />

        {/* Children */}
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
      <p className="text-xs font-bold" style={{ color: '#5A5C58' }}>🃏 Flashcard — Đạo hàm cơ bản</p>

      {/* Flashcard */}
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
            <p className="text-sm font-bold" style={{ color: '#2D2D2D' }}>
              d/dx (sin x) = ?
            </p>
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

      {/* 4 methods */}
      <div className="grid grid-cols-4 gap-1">
        {[
          { icon: '📝', label: 'Quiz' },
          { icon: '🃏', label: 'Flashcard' },
          { icon: '✍️', label: 'Tự luận' },
          { icon: '🤖', label: 'Dạy AI' },
        ].map((m, i) => (
          <div
            key={m.label}
            className="flex flex-col items-center gap-1 py-2 rounded-lg"
            style={{
              background: i === 1 ? '#2D2D2D' : '#FFFFFF',
              border: '1px solid #E5DDD5',
            }}
          >
            <span className="text-sm">{m.icon}</span>
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
      <p className="text-xs font-bold" style={{ color: '#5A5C58' }}>💬 AI Tutor — 24/7</p>

      {/* Messages */}
      <div className="flex flex-col gap-3 flex-1">
        {/* User message */}
        <div className="flex justify-end">
          <div
            className="px-3 py-2 rounded-2xl rounded-tr-sm text-xs max-w-[80%]"
            style={{ background: '#2D2D2D', color: '#fff' }}
          >
            Giải thích giới hạn bằng tiếng Việt đơn giản nhất?
          </div>
        </div>

        {/* AI message */}
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
            Hãy tưởng tượng bạn đang đi dần đến một điểm mà không bao giờ đến hẳn — giới hạn là giá trị bạn &quot;tiến gần đến&quot;. 🎯
          </div>
        </div>
      </div>

      {/* Input bar */}
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
  children: React.ReactNode;
  tilt?: number;
  delay?: number;
  inView: boolean;
}

function ProductCard({ title, caption, children, tilt = 0, delay = 0, inView }: ProductCardProps) {
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
        <p className="text-xs leading-relaxed" style={{ color: '#5A5C58' }}>{caption}</p>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const showcaseRef = useRef(null);
  const testimonialsRef = useRef(null);
  const manifestoRef = useRef(null);
  const ctaRef = useRef(null);

  const showcaseInView = useInView(showcaseRef, { once: true, margin: '-80px' });
  const testimonialsInView = useInView(testimonialsRef, { once: true, margin: '-80px' });
  const manifestoInView = useInView(manifestoRef, { once: true, margin: '-80px' });
  const ctaInView = useInView(ctaRef, { once: true, margin: '-80px' });

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F5F0EB' }}>

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 w-full border-b border-black/8"
        style={{ background: 'rgba(245,240,235,0.94)', backdropFilter: 'blur(14px)' }}
      >
        <div className="max-w-[1100px] mx-auto px-5 h-[62px] flex items-center justify-between">
          {/* Left: hamburger */}
          <button
            className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-black/5 transition-colors"
            aria-label="Menu"
          >
            <Menu size={20} color="#2D2D2D" />
          </button>

          {/* Center: logo */}
          <span
            className="text-xl italic"
            style={{ fontFamily: 'Georgia, serif', color: '#6B2D3E', letterSpacing: '-0.01em' }}
          >
            omilearn
          </span>

          {/* Right: CTA */}
          <CTAButton className="text-xs py-2.5 px-5" />
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 1 — HERO: SHOW, DON'T TELL
      ══════════════════════════════════════════════════════════════════ */}
      <section className="w-full max-w-[1100px] mx-auto px-5 pt-16 pb-24 flex flex-col md:flex-row items-start gap-14 md:gap-10">

        {/* Left: text */}
        <motion.div
          className="flex-1 flex flex-col items-start pt-2"
          variants={fadeLeft}
          initial="hidden"
          animate="visible"
        >
          {/* Subtitle */}
          <p
            className="text-base italic mb-6"
            style={{ fontFamily: 'Georgia, serif', color: '#5A5C58' }}
          >
            Trợ lý học tập AI cho sinh viên Việt Nam
          </p>

          {/* Headline — 3 lines, each a step */}
          <h1 className="font-extrabold leading-[1.2] mb-8" style={{ fontSize: 'clamp(38px, 5vw, 52px)', color: '#2D2D2D' }}>
            Upload tài liệu.<br />
            AI tạo lộ trình.<br />
            Bạn chỉ cần học.
          </h1>

          {/* CTA */}
          <CTAButton className="mb-4 text-base py-4 px-8" />

          {/* Friction removers */}
          <p className="text-sm mb-2" style={{ color: '#5A5C58' }}>
            Miễn phí. Không cần thẻ tín dụng.
          </p>

          <p className="text-sm" style={{ color: '#9CA3AF' }}>
            Được 12 trường đại học tin dùng
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
          SECTION 2 — PRODUCT SHOWCASE: 3 FAKE SCREENSHOTS
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
            Xem trước khi dùng
          </h2>
          <p className="text-base" style={{ color: '#5A5C58', lineHeight: 1.7 }}>
            Đây là giao diện thật. Không phải mockup quảng cáo.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 items-start">
          <ProductCard
            title="Mindmap thông minh"
            caption="Kiến thức được tổ chức thành bản đồ tư duy. Click để đào sâu."
            tilt={1}
            delay={0}
            inView={showcaseInView}
          >
            <MindmapScreenshot />
          </ProductCard>

          <ProductCard
            title="Ôn tập 4 cách"
            caption="4 phương pháp ôn tập được khoa học chứng minh hiệu quả."
            tilt={-1}
            delay={1}
            inView={showcaseInView}
          >
            <FlashcardScreenshot />
          </ProductCard>

          <ProductCard
            title="AI Tutor riêng"
            caption="Hỏi bất cứ lúc nào. Không ngại hỏi. AI kiên nhẫn vô hạn."
            tilt={1}
            delay={2}
            inView={showcaseInView}
          >
            <ChatScreenshot />
          </ProductCard>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 3 — SOCIAL PROOF: HONEST AND HUMAN
      ══════════════════════════════════════════════════════════════════ */}
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
              quote: 'Mình upload slide Giải Tích lên, 2 phút sau có hẳn lộ trình + flashcard. Trước đó mất cả buổi tối để tổng hợp.',
              name: 'Minh Anh',
              school: 'Bách Khoa Hà Nội',
              metric: 'Tiết kiệm ~4 giờ mỗi chương',
            },
            {
              quote: 'Cái hay nhất là tính năng quiz tự động. Ôn thi mà như chơi game, không thấy chán.',
              name: 'Hoàng Nam',
              school: 'Kinh Tế Quốc Dân',
              metric: 'GPA tăng từ 2.8 → 3.5',
            },
            {
              quote: "Mình dùng 'Dạy lại cho AI' — phải giải thích bằng lời mình, mới thấy chỗ nào chưa hiểu.",
              name: 'Thu Hà',
              school: 'Bách Khoa Đà Nẵng',
              metric: 'Điểm đồ án nhóm: 9.5/10',
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
              {/* Stars */}
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={13} fill="#F5C542" color="#F5C542" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm flex-1" style={{ color: '#5A5C58', lineHeight: 1.7 }}>
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Metric */}
              <div
                className="px-3 py-2 rounded-lg text-xs font-semibold"
                style={{ background: '#EDFAF4', color: '#1A6E3E' }}
              >
                ✓ {t.metric}
              </div>

              {/* Author */}
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

        {/* University trust line */}
        <motion.p
          className="text-center text-sm mt-10"
          style={{ color: '#9CA3AF', lineHeight: 1.7 }}
          variants={fadeUp}
          initial="hidden"
          animate={testimonialsInView ? 'visible' : 'hidden'}
          custom={4}
        >
          Được sinh viên từ{' '}
          <strong style={{ color: '#5A5C58' }}>Bách Khoa</strong>,{' '}
          <strong style={{ color: '#5A5C58' }}>Kinh Tế</strong>,{' '}
          <strong style={{ color: '#5A5C58' }}>Y Dược</strong>,{' '}
          <strong style={{ color: '#5A5C58' }}>FPT</strong>... tin dùng
        </motion.p>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 4 — MANIFESTO: TẠI SAO BÂY GIỜ?
      ══════════════════════════════════════════════════════════════════ */}
      <section
        ref={manifestoRef}
        className="w-full max-w-[780px] mx-auto px-5 py-24"
      >
        <div className="text-center">
          <p
            className="italic leading-relaxed"
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(20px, 2.5vw, 28px)',
              color: '#2D2D2D',
              lineHeight: 1.75,
            }}
          >
            Kỷ nguyên AI đã thay đổi mọi ngành nghề.
            <br />Giáo dục là ngành tiếp theo.
            <br />
            <br />
            Sinh viên dùng AI không phải vì lười —
            <br />mà vì thông minh hơn.
            <br />
            <br />
            Câu hỏi không phải &ldquo;có nên dùng AI?&rdquo;
            <br />mà là &ldquo;dùng AI nào?&rdquo;
          </p>

          <div className="mt-12">
            <Link
              href="/"
              className="text-sm transition-all hover:opacity-60"
              style={{ color: '#5A5C58', textDecoration: 'underline', textUnderlineOffset: 4 }}
            >
              Thử Omilearn miễn phí →
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 5 — CTA BANNER: WARM AND CONFIDENT
      ══════════════════════════════════════════════════════════════════ */}
      <section
        ref={ctaRef}
        className="w-full px-5 pb-24"
        style={{
          background: 'linear-gradient(180deg, #F5F0EB 0%, #EDE5DB 100%)',
        }}
      >
        <div className="max-w-[1100px] mx-auto pt-16">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate={ctaInView ? 'visible' : 'hidden'}
            className="flex justify-center"
          >
            <div
              className="w-full max-w-[520px] rounded-3xl px-10 py-14 flex flex-col items-center text-center gap-6"
              style={{
                background: '#2D2D2D',
                boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
              }}
            >
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                Sẵn sàng thử?
              </h2>

              <Link
                href="/"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold text-[#2D2D2D] bg-white transition-all hover:opacity-90 hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
                style={{ willChange: 'transform' }}
              >
                Bắt đầu miễn phí
              </Link>

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
          {/* Logo + copyright */}
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

          {/* Links */}
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
