'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion, Variants, useInView } from 'framer-motion';
import { Menu, Star, ChevronDown, ChevronUp } from 'lucide-react';

// ─── Animation variants ──────────────────────────────────────────────────────

const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -32 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const fadeRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut', delay: i * 0.12 },
  }),
};

const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.78 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.38, ease: 'backOut' } },
};

// ─── Count-up hook ──────────────────────────────────────────────────────────

function useCountUp(target: string, duration = 1600, trigger: boolean) {
  const [display, setDisplay] = useState('0');
  useEffect(() => {
    if (!trigger) return;
    const num = parseFloat(target.replace(/[^0-9.]/g, ''));
    const suffix = target.replace(/[0-9.,]/g, '').trim();
    if (isNaN(num)) { setDisplay(target); return; }
    const startTime = performance.now();
    const raf = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * num;
      const formatted = num % 1 === 0
        ? Math.floor(current).toLocaleString('vi-VN')
        : current.toFixed(1);
      setDisplay(formatted + suffix);
      if (progress < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [trigger, target, duration]);
  return display;
}

// ─── Stat item ───────────────────────────────────────────────────────────────

function StatItem({ value, label }: { value: string; label: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const display = useCountUp(value, 1600, inView);
  return (
    <div ref={ref} className="flex flex-col items-center gap-1.5">
      <span className="text-white text-3xl md:text-4xl font-black tracking-tight">{display}</span>
      <span className="text-white/65 text-xs md:text-sm uppercase tracking-widest font-semibold text-center">
        {label}
      </span>
    </div>
  );
}

// ─── Robot Mascot ────────────────────────────────────────────────────────────

function RobotMascot() {
  return (
    <div className="relative flex justify-center items-center" style={{ minHeight: 340 }}>
      {/* Tilted card */}
      <motion.div
        className="relative w-[260px] h-[300px] md:w-[300px] md:h-[330px] rounded-3xl flex flex-col items-center justify-center gap-4 shadow-2xl"
        style={{
          background: 'linear-gradient(145deg, #FFFFFF 0%, #F0EBE3 100%)',
          border: '2.5px solid #E5DDD5',
        }}
        initial={{ opacity: 0, x: 48, rotate: 8 }}
        animate={{ opacity: 1, x: 0, rotate: 3 }}
        transition={{ duration: 0.65, delay: 0.15, ease: 'easeOut' }}
      >
        {/* Floating robot */}
        <motion.div
          className="text-8xl select-none"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ willChange: 'transform' }}
        >
          🤖
        </motion.div>

        {/* Sparkles */}
        <motion.span
          className="absolute top-5 right-7 text-2xl select-none"
          animate={{ opacity: [0.4, 1, 0.4], rotate: [0, 18, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >✨</motion.span>
        <motion.span
          className="absolute bottom-12 left-6 text-xl select-none"
          animate={{ opacity: [0.3, 1, 0.3], rotate: [0, -14, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >⭐</motion.span>
        <motion.span
          className="absolute top-12 left-5 text-lg select-none"
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        >✨</motion.span>

        {/* Name tag */}
        <div className="px-4 py-1.5 rounded-full" style={{ background: 'rgba(232,136,122,0.15)', border: '1.5px solid rgba(232,136,122,0.4)' }}>
          <span className="text-xs font-black tracking-wide" style={{ color: '#E8887A' }}>Omi — AI bạn học</span>
        </div>
      </motion.div>

      {/* Chat bubble */}
      <motion.div
        className="absolute -bottom-4 -left-6 md:-left-10 px-4 py-3 rounded-2xl rounded-bl-none shadow-lg text-sm font-bold whitespace-nowrap"
        style={{ background: '#E8887A', color: '#fff', zIndex: 10 }}
        initial={{ opacity: 0, scale: 0.65, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.4, ease: 'backOut' }}
      >
        Để mình giúp bạn ôn thi nhé! 🎯
        {/* Tail */}
        <div
          className="absolute -bottom-2 left-4 w-0 h-0"
          style={{
            borderLeft: '9px solid transparent',
            borderRight: '9px solid transparent',
            borderTop: '9px solid #E8887A',
          }}
        />
      </motion.div>
    </div>
  );
}

// ─── FAQ Accordion Item ──────────────────────────────────────────────────────

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-2xl border cursor-pointer overflow-hidden transition-all"
      style={{ background: '#FFFFFF', borderColor: open ? '#E8887A' : '#E5DDD5' }}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between px-6 py-4 gap-4">
        <p className="font-black text-sm md:text-base" style={{ color: '#2D2D2D' }}>{question}</p>
        {open
          ? <ChevronUp size={18} color="#E8887A" className="flex-shrink-0" />
          : <ChevronDown size={18} color="#5A5C58" className="flex-shrink-0" />
        }
      </div>
      {open && (
        <div className="px-6 pb-5">
          <p className="text-sm md:text-base leading-relaxed" style={{ color: '#5A5C58' }}>{answer}</p>
        </div>
      )}
    </div>
  );
}

// ─── Data ────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: '🗺️',
    accent: '#E8887A',
    bg: '#FEF1EE',
    accentBorder: 'rgba(232,136,122,0.3)',
    title: 'Lộ trình AI cá nhân hóa',
    desc: 'Upload tài liệu → AI phân tích → lộ trình học từng tuần. Không cần tự plan, AI hiểu bạn cần gì.',
  },
  {
    icon: '🧠',
    accent: '#3DBE7A',
    bg: '#EDFAF4',
    accentBorder: 'rgba(61,190,122,0.3)',
    title: 'Ôn tập thông minh 4-trong-1',
    desc: 'Quiz • Flashcard • Tự luận • Dạy lại cho AI. Bốn cách ôn, mỗi cách đều được nghiên cứu khoa học chứng minh hiệu quả.',
  },
  {
    icon: '💬',
    accent: '#7C6FCD',
    bg: '#F0EEFF',
    accentBorder: 'rgba(124,111,205,0.3)',
    title: 'AI Tutor riêng 24/7',
    desc: 'Hỏi bất cứ lúc nào, về bất cứ điều gì. Không ngại hỏi ngu, không sợ bị đánh giá. AI kiên nhẫn vô hạn.',
  },
];

const STEPS = [
  {
    num: '01',
    emoji: '📤',
    title: 'Tải tài liệu lên',
    desc: 'Kéo thả PDF, slide, video. Omi đọc hiểu tất cả trong 30 giây.',
  },
  {
    num: '02',
    emoji: '🗺️',
    title: 'AI tạo lộ trình',
    desc: 'Omi hỏi bạn vài câu: có bao lâu? trình độ? mục tiêu gì? Rồi tạo plan chi tiết.',
  },
  {
    num: '03',
    emoji: '🚀',
    title: 'Học. Ôn. Bứt phá.',
    desc: 'Mindmap, quiz, flashcard — mọi thứ sẵn sàng. Bạn chỉ cần ngồi vào và học.',
  },
];

const TESTIMONIALS = [
  {
    avatar: '👩‍🎓',
    name: 'Nguyễn Minh Anh',
    school: 'Bách Khoa Hà Nội, Khóa K67',
    quote: 'Mình từng mất 5 tiếng để tóm tắt 1 chương Giải Tích. Giờ upload slide lên, Omi tóm tắt + tạo quiz trong 2 phút. Điểm thi tăng từ 6.5 lên 8.7.',
  },
  {
    avatar: '👨‍💻',
    name: 'Trần Hoàng Nam',
    school: 'Kinh Tế Quốc Dân, năm 3',
    quote: 'Tính năng lộ trình AI thay đổi cách mình học. Thay vì ngồi hoang mang không biết bắt đầu từ đâu, giờ mình mở app → biết ngay hôm nay học gì. GPA từ 2.8 lên 3.5.',
  },
  {
    avatar: '👩‍💼',
    name: 'Lê Thu Hà',
    school: 'ĐH Bách Khoa Đà Nẵng, CNTT',
    quote: "Tính năng 'Dạy lại cho AI' là gamechanger. Khi mình phải giải thích khái niệm cho Omi bằng lời của mình, mình mới phát hiện chỗ nào hiểu lơ mơ. Điểm đồ án nhóm được 9.5.",
  },
];

const STATS_BAR = [
  { value: '47293', label: 'sinh viên' },
  { value: '12', label: 'trường đại học' },
  { value: '+0.7', label: 'GPA trung bình tăng' },
  { value: '98%', label: 'muốn giới thiệu bạn bè' },
];

const FAQ_ITEMS = [
  {
    question: '"Nhưng mình tự học cũng được mà?"',
    answer: 'Được. Nhưng bạn có 168 giờ/tuần. AI giúp bạn dùng mỗi giờ hiệu quả gấp 2.5 lần. Câu hỏi không phải "có cần không" mà là "sao lại không?"',
  },
  {
    question: '"AI có thay thế việc học không?"',
    answer: 'Không. Omilearn không học hộ bạn — nó giúp bạn HỌC ĐÚNG CÁCH. Bạn vẫn phải đọc, hiểu, và ôn. AI chỉ loại bỏ phần lãng phí thời gian.',
  },
  {
    question: '"Mình không giỏi công nghệ..."',
    answer: 'Upload file. Bấm nút. Xong. Nếu bạn biết dùng Zalo, bạn biết dùng Omilearn.',
  },
];

const FAKE_AVATARS = ['👩‍🎓', '👨‍💻', '👩‍🏫', '👨‍🎓'];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const comparisonRef = useRef(null);
  const featuresRef = useRef(null);
  const stepsRef = useRef(null);
  const testimonialsRef = useRef(null);
  const faqRef = useRef(null);
  const ctaRef = useRef(null);

  const comparisonInView = useInView(comparisonRef, { once: true, margin: '-80px' });
  const featuresInView = useInView(featuresRef, { once: true, margin: '-80px' });
  const stepsInView = useInView(stepsRef, { once: true, margin: '-80px' });
  const testimonialsInView = useInView(testimonialsRef, { once: true, margin: '-80px' });
  const faqInView = useInView(faqRef, { once: true, margin: '-80px' });
  const ctaInView = useInView(ctaRef, { once: true, margin: '-80px' });

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F5F0EB' }}>

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 w-full border-b border-black/10"
        style={{ background: 'rgba(245,240,235,0.94)', backdropFilter: 'blur(14px)' }}
      >
        <div className="max-w-[1100px] mx-auto px-5 h-[64px] flex items-center">
          <button
            className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-black/6 transition-colors"
            aria-label="Menu"
          >
            <Menu size={22} color="#2D2D2D" />
          </button>

          <div className="flex-1 flex justify-center">
            <span className="text-[#2D2D2D] text-xl font-black tracking-tight" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              Omilearn
            </span>
          </div>

          <Link
            href="/"
            className="px-5 py-2 rounded-full text-sm font-black text-white transition-all hover:opacity-90 hover:shadow-md active:scale-95"
            style={{ background: '#2D2D2D' }}
          >
            Bắt đầu
          </Link>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 1 — HERO: THE HOOK
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="w-full max-w-[1100px] mx-auto px-5 pt-14 pb-20 flex flex-col md:flex-row items-center gap-12 md:gap-6">

        {/* Left: text */}
        <motion.div
          className="flex-1 flex flex-col items-start"
          variants={fadeLeft}
          initial="hidden"
          animate="visible"
        >
          {/* Social proof badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ background: '#D4F5D4', border: '1.5px solid #3DBE7A' }}
            variants={popIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.08 }}
          >
            <span className="text-base">🔥</span>
            <span className="text-xs font-black tracking-wide" style={{ color: '#1A6E3E' }}>
              47.293 sinh viên đã chuyển đổi
            </span>
          </motion.div>

          {/* Headline — FOMO trigger */}
          <h1 className="text-4xl md:text-[52px] font-black leading-[1.15] mb-5">
            <span style={{ color: '#2D2D2D' }}>
              Bạn bè bạn đang<br />dùng AI để học.
            </span>
            <br />
            <span style={{ color: '#E8887A' }}>Còn bạn?</span>
          </h1>

          {/* Subtitle — loss aversion */}
          <p className="text-base md:text-lg leading-relaxed mb-8 max-w-[480px]" style={{ color: '#5A5C58' }}>
            Trong khi bạn đọc 200 trang trong 2 ngày, người khác đã để AI tóm tắt trong 5 phút, tạo flashcard tự động, và ôn thi xong từ hôm qua.
          </p>

          {/* Primary CTA — friction removal */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-black text-white transition-all hover:opacity-90 hover:-translate-y-0.5 hover:shadow-xl active:scale-95 mb-6"
            style={{ background: '#2D2D2D', willChange: 'transform' }}
          >
            Bắt đầu miễn phí —{' '}
            <span style={{ color: '#F5C542' }}>30 giây</span>
          </Link>

          {/* Social proof avatars */}
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              {FAKE_AVATARS.map((emoji, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-base"
                  style={{
                    borderColor: '#F5F0EB',
                    background: '#F0EBE3',
                    marginLeft: i > 0 ? '-10px' : 0,
                    zIndex: FAKE_AVATARS.length - i,
                    position: 'relative',
                  }}
                >
                  {emoji}
                </div>
              ))}
            </div>
            <p className="text-xs md:text-sm leading-snug" style={{ color: '#5A5C58' }}>
              47.293 sinh viên từ{' '}
              <strong style={{ color: '#2D2D2D' }}>Bách Khoa, Kinh Tế,<br className="hidden md:block" /> Y Dược, FPT...</strong>
            </p>
          </div>
        </motion.div>

        {/* Right: robot mascot */}
        <motion.div
          className="flex-shrink-0 flex justify-center w-full md:w-auto"
          variants={fadeRight}
          initial="hidden"
          animate="visible"
        >
          <RobotMascot />
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 2 — COMPARISON: TRƯỚC vs SAU
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        ref={comparisonRef}
        className="w-full max-w-[1100px] mx-auto px-5 pb-24"
      >
        <motion.div
          className="text-center mb-10"
          variants={fadeUp}
          initial="hidden"
          animate={comparisonInView ? 'visible' : 'hidden'}
        >
          <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ color: '#2D2D2D' }}>
            Bạn đang ở cột nào?
          </h2>
          <p className="text-base" style={{ color: '#5A5C58' }}>
            Hai cách học. Hai kết quả hoàn toàn khác nhau.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 items-start">

          {/* Left — học kiểu cũ */}
          <motion.div
            variants={fadeLeft}
            initial="hidden"
            animate={comparisonInView ? 'visible' : 'hidden'}
            className="rounded-2xl border p-6 md:p-8"
            style={{ background: '#F0EBE3', borderColor: '#DDD5CD' }}
          >
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xl">❌</span>
              <h3 className="text-lg font-black" style={{ color: '#9CA3AF' }}>Học kiểu cũ</h3>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { icon: '⏰', text: 'Đọc 200 trang', sub: '2 ngày' },
                { icon: '😴', text: 'Tự tóm tắt', sub: 'quên 80% sau 1 tuần' },
                { icon: '📝', text: 'Tự làm flashcard', sub: 'mất 3 tiếng' },
                { icon: '🤯', text: 'Ôn thi', sub: 'không biết bắt đầu từ đâu' },
                { icon: '📊', text: 'Kết quả', sub: '"Hy vọng qua môn"' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <span className="text-sm font-semibold" style={{ color: '#9CA3AF' }}>{item.text}</span>
                    <span className="text-sm" style={{ color: '#C4BEB8' }}> → {item.sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — học với Omilearn (slightly elevated) */}
          <motion.div
            variants={fadeRight}
            initial="hidden"
            animate={comparisonInView ? 'visible' : 'hidden'}
            className="rounded-2xl border p-6 md:p-8 shadow-xl md:-mt-4 md:mb-4"
            style={{ background: '#FFFFFF', borderColor: '#3DBE7A', borderWidth: '2px' }}
          >
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xl">✅</span>
              <h3 className="text-lg font-black" style={{ color: '#3DBE7A' }}>Học với Omilearn</h3>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { icon: '⚡', text: 'AI tóm tắt 200 trang', sub: '5 phút', highlight: true },
                { icon: '🧠', text: 'Spaced repetition', sub: 'nhớ 95% sau 1 tháng', highlight: true },
                { icon: '🃏', text: 'Auto flashcard + quiz', sub: 'sẵn sàng ngay', highlight: true },
                { icon: '🗺️', text: 'Lộ trình cá nhân', sub: 'biết chính xác học gì mỗi ngày', highlight: true },
                { icon: '🏆', text: 'Kết quả', sub: '"Top 10% lớp"', highlight: true },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <span className="text-sm font-semibold" style={{ color: '#2D2D2D' }}>{item.text}</span>
                    <span className="text-sm font-bold" style={{ color: '#3DBE7A' }}> → {item.sub}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA inside card */}
            <div className="mt-7 pt-5 border-t" style={{ borderColor: '#E5DDD5' }}>
              <Link
                href="/"
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-black text-white transition-all hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
                style={{ background: '#2D2D2D', willChange: 'transform' }}
              >
                Tôi muốn học đúng cách →
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 3 — FEATURES: VŨ KHÍ BÍ MẬT
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        id="features"
        ref={featuresRef}
        className="w-full max-w-[1100px] mx-auto px-5 pb-24"
      >
        <motion.div
          className="text-center mb-10"
          variants={fadeUp}
          initial="hidden"
          animate={featuresInView ? 'visible' : 'hidden'}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4" style={{ background: 'rgba(232,136,122,0.12)', border: '1.5px solid rgba(232,136,122,0.35)' }}>
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#E8887A' }}>⚔️ Công cụ</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ color: '#2D2D2D' }}>
            Vũ khí bí mật của<br />sinh viên 4.0
          </h2>
          <p className="text-base max-w-md mx-auto" style={{ color: '#5A5C58' }}>
            Không phải may mắn. Không phải học thêm. Chỉ cần dùng đúng công cụ.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={featuresInView ? 'visible' : 'hidden'}
              className="flex flex-col gap-4 p-6 rounded-2xl border transition-all hover:-translate-y-1.5 hover:shadow-xl group cursor-default"
              style={{ background: '#FFFFFF', borderColor: '#E5DDD5', willChange: 'transform' }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 transition-transform group-hover:scale-110"
                style={{ background: f.bg, border: `1.5px solid ${f.accentBorder}` }}
              >
                {f.icon}
              </div>

              <div>
                <h3 className="font-black text-lg mb-2" style={{ color: '#2D2D2D' }}>
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#5A5C58' }}>
                  {f.desc}
                </p>
              </div>

              <div className="mt-auto pt-3 border-t border-dashed" style={{ borderColor: '#E5DDD5' }}>
                <span
                  className="text-xs font-black uppercase tracking-wider flex items-center gap-1 group-hover:gap-2 transition-all"
                  style={{ color: f.accent }}
                >
                  Tìm hiểu thêm
                  <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 4 — HOW IT WORKS: 3 BƯỚC
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        id="how"
        ref={stepsRef}
        className="w-full max-w-[1100px] mx-auto px-5 pb-24"
      >
        <motion.div
          className="text-center mb-12"
          variants={fadeUp}
          initial="hidden"
          animate={stepsInView ? 'visible' : 'hidden'}
        >
          <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ color: '#2D2D2D' }}>
            3 bước.{' '}
            <span style={{ color: '#E8887A' }}>Nghiêm túc, chỉ 3 bước.</span>
          </h2>
          <p className="text-base" style={{ color: '#5A5C58' }}>
            Đơn giản đến mức bạn sẽ tự hỏi sao không làm sớm hơn.
          </p>
        </motion.div>

        <div className="relative flex flex-col md:flex-row gap-8 md:gap-4">
          {/* Dotted connector — desktop only */}
          <div
            className="hidden md:block absolute top-11 left-[17%] right-[17%] h-px z-0"
            style={{
              backgroundImage: 'repeating-linear-gradient(to right, #C8C4BF 0, #C8C4BF 6px, transparent 6px, transparent 14px)',
            }}
          />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={stepsInView ? 'visible' : 'hidden'}
              className="relative z-10 flex-1 flex flex-col items-center text-center gap-4"
            >
              <div
                className="w-[88px] h-[88px] rounded-full flex flex-col items-center justify-center shadow-md border-4"
                style={{ background: '#FFFFFF', borderColor: '#F5F0EB' }}
              >
                <span className="text-2xl leading-none">{step.emoji}</span>
                <span className="text-xs font-black mt-0.5 tracking-wider" style={{ color: '#E8887A' }}>
                  {step.num}
                </span>
              </div>

              <div className="max-w-[220px]">
                <h3 className="font-black text-lg mb-2" style={{ color: '#2D2D2D' }}>
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#5A5C58' }}>
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-12"
          variants={fadeUp}
          initial="hidden"
          animate={stepsInView ? 'visible' : 'hidden'}
          custom={3}
        >
          <Link
            href="/"
            className="inline-flex px-8 py-4 rounded-full text-sm font-black text-white transition-all hover:opacity-90 hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
            style={{ background: '#E8887A', willChange: 'transform' }}
          >
            Bắt đầu ngay — miễn phí →
          </Link>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 5 — STATS BAR
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="w-full py-12 mb-20" style={{ background: '#2D2D2D' }}>
        <div className="max-w-[1100px] mx-auto px-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS_BAR.map((s) => (
              <StatItem key={s.label} value={s.value} label={s.label} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 6 — TESTIMONIALS
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        ref={testimonialsRef}
        className="w-full max-w-[1100px] mx-auto px-5 pb-24"
      >
        <motion.div
          className="text-center mb-10"
          variants={fadeUp}
          initial="hidden"
          animate={testimonialsInView ? 'visible' : 'hidden'}
        >
          <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ color: '#2D2D2D' }}>
            Kết quả thật từ sinh viên thật
          </h2>
          <p className="text-base" style={{ color: '#5A5C58' }}>
            Không phải quảng cáo. Đây là điểm số của bạn học bạn.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={testimonialsInView ? 'visible' : 'hidden'}
              className="flex flex-col gap-4 p-6 rounded-2xl border hover:shadow-lg transition-all"
              style={{ background: '#FFFFFF', borderColor: '#E5DDD5' }}
            >
              {/* Stars */}
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={14} fill="#F5C542" color="#F5C542" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm leading-relaxed flex-1" style={{ color: '#5A5C58' }}>
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-3 border-t" style={{ borderColor: '#F0EBE3' }}>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: '#F5F0EB' }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-black" style={{ color: '#2D2D2D' }}>{t.name}</p>
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>{t.school}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 7 — FAQ / OBJECTION HANDLER
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        ref={faqRef}
        className="w-full max-w-[780px] mx-auto px-5 pb-24"
      >
        <motion.div
          className="text-center mb-10"
          variants={fadeUp}
          initial="hidden"
          animate={faqInView ? 'visible' : 'hidden'}
        >
          <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ color: '#2D2D2D' }}>
            "Nhưng mà..."
          </h2>
          <p className="text-base" style={{ color: '#5A5C58' }}>
            Mình biết bạn đang nghĩ gì. Mình cũng đã nghĩ vậy.
          </p>
        </motion.div>

        <motion.div
          className="flex flex-col gap-3"
          variants={fadeUp}
          initial="hidden"
          animate={faqInView ? 'visible' : 'hidden'}
          custom={1}
        >
          {FAQ_ITEMS.map((item, i) => (
            <FaqItem key={i} question={item.question} answer={item.answer} />
          ))}
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 8 — FINAL CTA: THE CLOSE
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        ref={ctaRef}
        className="w-full max-w-[1100px] mx-auto px-5 pb-24"
      >
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={ctaInView ? 'visible' : 'hidden'}
        >
          <div
            className="relative rounded-3xl px-8 py-16 flex flex-col items-center text-center overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #E8887A 0%, #C85F50 60%, #B84A3D 100%)' }}
          >
            {/* Decorative elements */}
            <span className="absolute top-6 left-10 text-3xl opacity-50 pointer-events-none select-none">✨</span>
            <span className="absolute top-12 right-14 text-2xl opacity-40 pointer-events-none select-none">⭐</span>
            <span className="absolute bottom-10 left-16 text-xl opacity-30 pointer-events-none select-none">✨</span>
            <span className="absolute bottom-7 right-12 text-3xl opacity-40 pointer-events-none select-none">🌟</span>
            <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.05)' }} />

            {/* Headline */}
            <h2 className="text-2xl md:text-4xl font-black text-white mb-3 relative z-10 leading-tight max-w-xl">
              Kỷ nguyên AI đã bắt đầu.
            </h2>
            <p className="text-lg md:text-xl font-bold text-white/90 mb-8 relative z-10 max-w-lg">
              Câu hỏi duy nhất: Bạn bắt đầu hôm nay, hay để bạn bè đi trước?
            </p>

            {/* Pulsing CTA button */}
            <motion.div
              className="relative z-10"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-10 py-4 rounded-full text-base font-black text-[#2D2D2D] bg-white transition-all hover:-translate-y-0.5 hover:shadow-2xl active:scale-95"
                style={{ willChange: 'transform' }}
              >
                Bắt đầu miễn phí — không cần thẻ
              </Link>
            </motion.div>

            <p className="text-white/70 text-sm mt-6 relative z-10">
              🔒 Miễn phí 14 ngày. Hủy bất cứ lúc nào. Không hỏi lý do.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="w-full border-t" style={{ borderColor: '#E5DDD5', background: '#F5F0EB' }}>
        <div className="max-w-[1100px] mx-auto px-5 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="text-lg font-black" style={{ color: '#2D2D2D' }}>omilearn</span>
            <p className="text-xs" style={{ color: '#9CA3AF' }}>
              © 2025 Omilearn. Mọi quyền được bảo lưu.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5">
            {[
              'Chính sách bảo mật',
              'Điều khoản sử dụng',
              'Liên hệ',
              'Twitter',
              'Discord',
            ].map((link) => (
              <a
                key={link}
                href="#"
                className="text-xs font-semibold transition-colors hover:text-[#E8887A]"
                style={{ color: '#5A5C58' }}
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
