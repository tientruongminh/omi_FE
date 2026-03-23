'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion, Variants, useInView } from 'framer-motion';
import {
  Map,
  FolderOpen,
  MessageCircle,
  Upload,
  Route,
  Rocket,
  Star,
  Menu,
} from 'lucide-react';

// ─── Data ───────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: <Map size={22} />,
    accent: '#E8887A',
    bg: '#FEF1EE',
    title: 'Lộ trình học tập AI',
    desc: 'Tự động hoá lộ trình cá nhân hoá cho mình theo mục tiêu học và bứt phá kết quả.',
  },
  {
    icon: <FolderOpen size={22} />,
    accent: '#3DBE7A',
    bg: '#EDFAF4',
    title: 'Quản lý dự án',
    desc: 'Sắp xếp tài liệu, bài tập và dự án một cách khoa học, thực hiện tự tin.',
  },
  {
    icon: <MessageCircle size={22} />,
    accent: '#7C6FCD',
    bg: '#F0EEFF',
    title: 'Trợ lý học tập',
    desc: 'Hỗ trợ 24/7 về bất kỳ chuyên hoá gì. Tối ưu hoá thực tiễn phù hợp từng người.',
  },
];

const STEPS = [
  {
    num: '01',
    emoji: '📤',
    title: 'Tải tài liệu lên',
    desc: 'Upload slide bài giảng, PDF, video — Omi sẽ hiểu nội dung và chuẩn bị cho bạn.',
    Icon: Upload,
  },
  {
    num: '02',
    emoji: '🗺️',
    title: 'AI tạo lộ trình cá nhân',
    desc: 'Dựa trên mục tiêu và thời gian của bạn, Omi lập kế hoạch học tập chi tiết từng tuần.',
    Icon: Route,
  },
  {
    num: '03',
    emoji: '🚀',
    title: 'Học và bứt phá',
    desc: 'Mindmap, quiz, flashcard, AI hỏi đáp — mọi công cụ để bạn nhớ lâu và hiểu sâu.',
    Icon: Rocket,
  },
];

const TESTIMONIALS = [
  {
    avatar: '👩‍🎓',
    name: 'Nguyễn Minh Anh',
    school: 'SV Bách Khoa HN',
    quote:
      'Từ khi dùng OmiLearn, mình tiết kiệm 3-4 tiếng mỗi tuần. AI tóm tắt bài giảng và tạo flashcard tự động, mình chỉ cần ôn và làm quiz.',
  },
  {
    avatar: '👨‍💻',
    name: 'Trần Hoàng Nam',
    school: 'SV Kinh Tế TP.HCM',
    quote:
      'Lộ trình học AI tạo ra khớp với lịch mình hoàn hảo. Điểm GPA tăng từ 2.8 lên 3.5 sau 1 học kỳ.',
  },
  {
    avatar: '👩‍💼',
    name: 'Lê Thu Hà',
    school: 'SV CNTT Đà Nẵng',
    quote:
      "Tính năng 'Dạy lại cho AI' thật sự hiệu quả. Khi mình giải thích lại cho Omi, mình mới biết chỗ nào chưa hiểu.",
  },
];

const STATS = [
  { value: '45,000+', label: 'sinh viên' },
  { value: '500+', label: 'trường đại học' },
  { value: '98%', label: 'hài lòng' },
  { value: '2.5x', label: 'hiệu quả hơn' },
];

const FAKE_AVATARS = ['👩‍🎓', '👨‍💻', '👩‍🏫'];

// ─── Animation variants ──────────────────────────────────────────────────────

const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -28 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const fadeRight: Variants = {
  hidden: { opacity: 0, x: 28 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut', delay: i * 0.13 },
  }),
};

const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.82 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.38, ease: 'backOut' } },
};

// ─── Count-up hook ──────────────────────────────────────────────────────────

function useCountUp(target: string, duration = 1400, trigger: boolean) {
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
        ? Math.floor(current).toLocaleString('en')
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
  const display = useCountUp(value, 1400, inView);
  return (
    <div ref={ref} className="flex flex-col items-center gap-1">
      <span className="text-white text-2xl md:text-3xl font-black tracking-tight">{display}</span>
      <span className="text-white/70 text-xs md:text-sm uppercase tracking-widest font-semibold">
        {label}
      </span>
    </div>
  );
}

// ─── Floating robot mascot ───────────────────────────────────────────────────

function RobotMascot() {
  return (
    <div className="relative flex justify-center">
      {/* Tilted card */}
      <motion.div
        className="relative w-[260px] h-[280px] md:w-[300px] md:h-[320px] rounded-3xl flex flex-col items-center justify-center gap-3 shadow-xl"
        style={{
          background: 'linear-gradient(145deg, #FFFFFF 0%, #F0EBE3 100%)',
          border: '2px solid #E5DDD5',
          rotate: 3,
        }}
        initial={{ opacity: 0, x: 40, rotate: 6 }}
        animate={{ opacity: 1, x: 0, rotate: 3 }}
        transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
      >
        {/* Floating robot emoji */}
        <motion.div
          className="text-7xl select-none"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ willChange: 'transform' }}
        >
          🤖
        </motion.div>

        {/* Sparkles */}
        <motion.span
          className="absolute top-6 right-8 text-2xl"
          animate={{ opacity: [0.4, 1, 0.4], rotate: [0, 15, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >✨</motion.span>
        <motion.span
          className="absolute bottom-10 left-7 text-xl"
          animate={{ opacity: [0.3, 1, 0.3], rotate: [0, -12, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        >⭐</motion.span>

        {/* Name tag */}
        <div className="px-4 py-1.5 rounded-full bg-[#F5C542]/30 border border-[#F5C542]/50">
          <span className="text-xs font-bold text-[#2D2D2D] tracking-wide">Omi AI Partner</span>
        </div>
      </motion.div>

      {/* Chat bubble */}
      <motion.div
        className="absolute -bottom-5 -left-4 px-4 py-2.5 rounded-2xl rounded-bl-sm shadow-lg text-sm font-semibold text-[#2D2D2D] whitespace-nowrap"
        style={{ background: '#E8887A' }}
        initial={{ opacity: 0, scale: 0.7, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.38, ease: 'backOut' }}
      >
        <span className="text-white">Chào bạn! Mình là Omi 👋</span>
        {/* Tail */}
        <div
          className="absolute -bottom-2 left-4 w-0 h-0"
          style={{
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid #E8887A',
          }}
        />
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const featuresRef = useRef(null);
  const stepsRef = useRef(null);
  const testimonialsRef = useRef(null);

  const featuresInView = useInView(featuresRef, { once: true, margin: '-80px' });
  const stepsInView = useInView(stepsRef, { once: true, margin: '-80px' });
  const testimonialsInView = useInView(testimonialsRef, { once: true, margin: '-80px' });

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F5F0EB' }}>

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 w-full border-b border-black/10"
        style={{ background: 'rgba(245,240,235,0.92)', backdropFilter: 'blur(12px)' }}
      >
        <div className="max-w-[1100px] mx-auto px-5 h-[64px] flex items-center">
          {/* Left: hamburger */}
          <button
            className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-black/6 transition-colors"
            aria-label="Menu"
          >
            <Menu size={22} color="#2D2D2D" />
          </button>

          {/* Center: brand name */}
          <div className="flex-1 flex justify-center">
            <span
              className="text-[#2D2D2D] text-xl font-bold tracking-tight"
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            >
              Omilearn
            </span>
          </div>

          {/* Right: CTA */}
          <Link
            href="/"
            className="px-5 py-2 rounded-full text-sm font-bold text-white transition-all hover:opacity-90 hover:shadow-md active:scale-95"
            style={{ background: '#2D2D2D' }}
          >
            Bắt đầu
          </Link>
        </div>
      </nav>

      {/* ── Hero Section ───────────────────────────────────────────────────── */}
      <section className="w-full max-w-[1100px] mx-auto px-5 pt-16 pb-20 flex flex-col md:flex-row items-center gap-12 md:gap-8">

        {/* Left: text */}
        <motion.div
          className="flex-1 flex flex-col items-start"
          variants={fadeLeft}
          initial="hidden"
          animate="visible"
        >
          {/* AI era badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
            style={{ background: '#D4F5D4', border: '1.5px solid #3DBE7A' }}
            variants={popIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.05 }}
          >
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#3DBE7A' }} />
            <span className="text-xs font-black uppercase tracking-[0.15em]" style={{ color: '#1A7A44' }}>
              Thời đại AI mới
            </span>
          </motion.div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-5" style={{ color: '#2D2D2D' }}>
            Học tập thông minh
            <br />
            cùng{' '}
            <span style={{ color: '#E8887A' }}>AI Partner</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base md:text-lg leading-relaxed mb-8 max-w-md" style={{ color: '#5A5C58' }}>
            Omilearn giúp bạn lập kế hoạch, quản lý tài liệu và bứt phá kết quả học tập với trí tuệ AI cá nhân.
          </p>

          {/* Primary CTA */}
          <Link
            href="/"
            className="px-8 py-3.5 rounded-full text-base font-black text-white transition-all hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 mb-6"
            style={{ background: '#2D2D2D', willChange: 'transform' }}
          >
            Khám phá ngay →
          </Link>

          {/* Social proof */}
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
            <p className="text-sm" style={{ color: '#5A5C58' }}>
              Cùng hơn{' '}
              <strong style={{ color: '#2D2D2D' }}>45 nghìn người</strong>{' '}
              tín nhiệm lựa chọn
            </p>
          </div>
        </motion.div>

        {/* Right: Robot mascot */}
        <motion.div
          className="flex-shrink-0 flex justify-center w-full md:w-auto"
          variants={fadeRight}
          initial="hidden"
          animate="visible"
        >
          <RobotMascot />
        </motion.div>
      </section>

      {/* ── Features Section ───────────────────────────────────────────────── */}
      <section
        id="features"
        ref={featuresRef}
        className="w-full max-w-[1100px] mx-auto px-5 pb-20"
      >
        <motion.div
          className="text-center mb-10"
          variants={fadeUp}
          initial="hidden"
          animate={featuresInView ? 'visible' : 'hidden'}
        >
          <h2 className="text-3xl font-black mb-3" style={{ color: '#2D2D2D' }}>
            Mọi công cụ bạn cần
          </h2>
          <p className="text-base" style={{ color: '#5A5C58' }}>
            Được thiết kế riêng cho sinh viên Việt Nam trong thời đại AI
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
              className="flex flex-col gap-4 p-6 rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-lg group"
              style={{
                background: '#FFFFFF',
                borderColor: '#E5DDD5',
                willChange: 'transform',
              }}
            >
              {/* Icon circle */}
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                style={{ background: f.bg, color: f.accent }}
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
                  className="text-xs font-bold uppercase tracking-wider flex items-center gap-1 group-hover:gap-2 transition-all cursor-pointer"
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

      {/* ── Stats Bar ──────────────────────────────────────────────────────── */}
      <section className="w-full py-10 mb-16" style={{ background: '#2D2D2D' }}>
        <div className="max-w-[1100px] mx-auto px-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s) => (
              <StatItem key={s.label} value={s.value} label={s.label} />
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────────────── */}
      <section
        id="how"
        ref={stepsRef}
        className="w-full max-w-[1100px] mx-auto px-5 pb-20"
      >
        <motion.div
          className="text-center mb-12"
          variants={fadeUp}
          initial="hidden"
          animate={stepsInView ? 'visible' : 'hidden'}
        >
          <h2 className="text-3xl font-black mb-3" style={{ color: '#2D2D2D' }}>
            Cách hoạt động
          </h2>
          <p className="text-base" style={{ color: '#5A5C58' }}>
            Chỉ 3 bước đơn giản để bứt phá kết quả học tập
          </p>
        </motion.div>

        <div className="relative flex flex-col md:flex-row gap-8 md:gap-4">
          {/* Dotted connector — desktop only */}
          <div
            className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px z-0"
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
              {/* Number bubble */}
              <div
                className="w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-md border-4 border-[#F5F0EB]"
                style={{ background: '#FFFFFF' }}
              >
                <span className="text-2xl leading-none">{step.emoji}</span>
                <span
                  className="text-xs font-black mt-0.5 tracking-wider"
                  style={{ color: '#E8887A' }}
                >
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

        {/* CTA after steps */}
        <motion.div
          className="text-center mt-12"
          variants={fadeUp}
          initial="hidden"
          animate={stepsInView ? 'visible' : 'hidden'}
          custom={3}
        >
          <Link
            href="/"
            className="inline-flex px-8 py-3.5 rounded-full text-sm font-black text-white transition-all hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
            style={{ background: '#E8887A', willChange: 'transform' }}
          >
            Thử ngay miễn phí →
          </Link>
        </motion.div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────────────────── */}
      <section
        ref={testimonialsRef}
        className="w-full max-w-[1100px] mx-auto px-5 pb-20"
      >
        <motion.div
          className="text-center mb-10"
          variants={fadeUp}
          initial="hidden"
          animate={testimonialsInView ? 'visible' : 'hidden'}
        >
          <h2 className="text-3xl font-black mb-3" style={{ color: '#2D2D2D' }}>
            Sinh viên nói gì về Omilearn?
          </h2>
          <p className="text-base" style={{ color: '#5A5C58' }}>
            Kết quả thực tế từ những người đã dùng
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
              className="flex flex-col gap-4 p-6 rounded-2xl border"
              style={{ background: '#FFFFFF', borderColor: '#E5DDD5' }}
            >
              {/* Stars */}
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={14} fill="#F5C542" color="#F5C542" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm leading-relaxed italic flex-1" style={{ color: '#5A5C58' }}>
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

      {/* ── CTA Banner ─────────────────────────────────────────────────────── */}
      <section className="w-full max-w-[1100px] mx-auto px-5 pb-20">
        <div
          className="relative rounded-3xl px-8 py-14 flex flex-col items-center text-center overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #E8887A 0%, #D4706A 100%)' }}
        >
          {/* Decorative sparkles */}
          <span className="absolute top-6 left-10 text-3xl opacity-60 pointer-events-none">✨</span>
          <span className="absolute top-10 right-16 text-2xl opacity-50 pointer-events-none">⭐</span>
          <span className="absolute bottom-8 left-20 text-xl opacity-40 pointer-events-none">✨</span>
          <span className="absolute bottom-6 right-10 text-3xl opacity-50 pointer-events-none">🌟</span>

          {/* Decorative circle */}
          <div
            className="absolute -top-12 -right-12 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          />
          <div
            className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full pointer-events-none"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          />

          <h2 className="text-2xl md:text-3xl font-black text-white mb-6 relative z-10">
            Sẵn sàng bứt phá cùng Omilearn?
          </h2>

          <motion.div
            className="relative z-10"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Link
              href="/"
              className="inline-flex px-10 py-4 rounded-full text-base font-black text-[#2D2D2D] transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-95 bg-white"
              style={{ willChange: 'transform' }}
            >
              Bắt đầu hành trình →
            </Link>
          </motion.div>

          <p className="text-white/75 text-sm mt-5 relative z-10">
            Miễn phí 14 ngày dùng thử. Không cần thẻ tín dụng.
          </p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="w-full border-t" style={{ borderColor: '#E5DDD5', background: '#F5F0EB' }}>
        <div className="max-w-[1100px] mx-auto px-5 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left */}
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="text-lg font-black" style={{ color: '#2D2D2D' }}>omilearn</span>
            <p className="text-xs" style={{ color: '#9CA3AF' }}>
              © 2025 omilearn. Mọi quyền thuộc về Omilearn.
            </p>
          </div>

          {/* Right: links */}
          <div className="flex flex-wrap items-center justify-center gap-5">
            {['Privacy Policy', 'Terms of Service', 'Contact Us', 'Twitter', 'Discord'].map((link) => (
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
