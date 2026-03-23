'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';

const FEATURES = [
  {
    emoji: '🧠',
    title: 'Mindmap tương tác',
    desc: 'Tổ chức kiến thức theo cấu trúc cây, dễ hiểu, dễ nhớ',
  },
  {
    emoji: '🤖',
    title: 'Trợ lý AI',
    desc: 'Hỏi đáp, tóm tắt tài liệu, tìm kiếm thông minh',
  },
  {
    emoji: '📅',
    title: 'Lịch học thông minh',
    desc: 'Quản lý thời khóa biểu, nhắc nhở, theo dõi tiến độ',
  },
];

const FAKE_AVATARS = ['👩‍🎓', '👨‍💻', '👩‍🏫'];

const featureVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.45, ease: 'easeOut' as const },
  }),
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F5F0EB] flex flex-col relative overflow-hidden">
      {/* Animated background dots grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle, #C8C4BF 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        {/* Floating accent circles */}
        <motion.div
          className="absolute top-20 right-20 w-64 h-64 rounded-full bg-[#6B2D3E]/5 border border-[#6B2D3E]/8"
          animate={{ y: [0, -16, 0], x: [0, 8, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ willChange: 'transform' }}
        />
        <motion.div
          className="absolute bottom-40 left-10 w-48 h-48 rounded-full bg-[#818CF8]/8 border border-[#818CF8]/10"
          animate={{ y: [0, 12, 0], x: [0, -6, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          style={{ willChange: 'transform' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-[#4CD964]/8 border border-[#4CD964]/10"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          style={{ willChange: 'transform' }}
        />
      </div>

      {/* ── Public NavBar ── */}
      <nav className="relative z-10 w-full border-b-2 border-[#2D2D2D]/10 bg-[#F5F0EB]/90 backdrop-blur-sm">
        <div className="max-w-[1100px] mx-auto px-6 h-[72px] flex items-center justify-between">
          {/* Logo */}
          <span
            className="text-[#6B2D3E] text-2xl font-medium tracking-tight"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontStyle: 'italic' }}
          >
            omilearn
          </span>

          {/* Center links */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-[#2D2D2D] text-sm font-semibold border-b-2 border-[#2D2D2D] pb-0.5 hover:text-[#6B2D3E] hover:border-[#6B2D3E] transition-colors"
            >
              Tính năng
            </a>
            <a
              href="#how"
              className="text-[#5A5C58] text-sm font-medium hover:text-[#2D2D2D] transition-colors"
            >
              Cách hoạt động
            </a>
            <a
              href="#pricing"
              className="text-[#5A5C58] text-sm font-medium hover:text-[#2D2D2D] transition-colors"
            >
              Bảng giá
            </a>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm font-black text-[#2D2D2D] hover:text-[#6B2D3E] transition-colors"
            >
              Đăng nhập
            </Link>
            <Link
              href="/"
              className="px-5 py-2 rounded-full border-2 border-[#2D2D2D] text-sm font-bold text-[#2D2D2D] hover:bg-[#2D2D2D] hover:text-white transition-all hover:scale-105 active:scale-95"
            >
              Bắt đầu
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative z-10 max-w-[1100px] mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-12">
        {/* Text */}
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ willChange: 'transform, opacity' }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border-2 border-[#2D2D2D] bg-[#F5C542] mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <span className="text-xs font-black uppercase tracking-widest text-[#2D2D2D]">
              🚀 Ra mắt phiên bản 2.0
            </span>
          </motion.div>

          <h1 className="text-5xl font-black leading-tight mb-6">
            <span className="text-[#2D2D2D]">Học thông minh</span>
            <br />
            <span
              className="bg-clip-text"
              style={{
                backgroundImage: 'linear-gradient(135deg, #6B2D3E 0%, #A84560 50%, #6B2D3E 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              hơn với AI
            </span>
          </h1>

          <p className="text-[#5A5C58] text-lg leading-relaxed mb-8 max-w-md">
            Nền tảng học tập tương tác với mindmap, trợ lý AI, và cộng đồng người học
          </p>

          <div className="flex items-center gap-4 flex-wrap">
            <Link
              href="/"
              className="px-7 py-3.5 rounded-full bg-[#2D2D2D] text-white font-bold text-sm hover:bg-[#1a1a1a] hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95"
              style={{ willChange: 'transform' }}
            >
              Bắt đầu miễn phí
            </Link>
            <Link
              href="/"
              className="px-7 py-3.5 rounded-full border-2 border-[#2D2D2D] text-[#2D2D2D] font-bold text-sm hover:bg-[#2D2D2D]/5 hover:border-[#6B2D3E] hover:text-[#6B2D3E] transition-all"
            >
              Xem demo →
            </Link>
          </div>

          {/* Social proof */}
          <motion.div
            className="mt-8 flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            {/* Overlapping avatars */}
            <div className="flex items-center">
              {FAKE_AVATARS.map((emoji, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full border-2 border-[#F5F0EB] bg-[#F1F1EC] flex items-center justify-center text-base hover:z-10 hover:scale-110 transition-transform"
                  style={{ marginLeft: i > 0 ? '-8px' : 0, zIndex: FAKE_AVATARS.length - i, willChange: 'transform' }}
                >
                  {emoji}
                </div>
              ))}
              <div
                className="w-9 h-9 rounded-full border-2 border-[#F5F0EB] bg-[#2D2D2D] flex items-center justify-center text-white text-xs font-bold"
                style={{ marginLeft: '-8px', zIndex: 0 }}
              >
                +9k
              </div>
            </div>
            <p className="text-[#5A5C58] text-sm font-medium">
              Được tin dùng bởi{' '}
              <strong className="text-[#2D2D2D]">10,000+</strong> sinh viên Việt Nam
            </p>
          </motion.div>
        </motion.div>

        {/* Illustration */}
        <motion.div
          className="flex-shrink-0 w-full md:w-[420px]"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
          style={{ willChange: 'transform, opacity' }}
        >
          <div className="bg-[#F1F1EC] border-2 border-[#333333] rounded-2xl p-8 flex flex-col items-center justify-center gap-4 aspect-square max-w-[380px] mx-auto relative overflow-hidden">
            {/* Subtle inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#6B2D3E]/5 to-transparent rounded-2xl" />
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="text-7xl"
              style={{ willChange: 'transform' }}
            >📚</motion.div>
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="text-5xl"
              style={{ willChange: 'transform' }}
            >🧠</motion.div>
            <motion.div
              animate={{ y: [0, -5, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="text-4xl"
              style={{ willChange: 'transform' }}
            >✨</motion.div>
            <p
              className="text-[#6B2D3E] text-lg font-medium mt-2 relative z-10"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontStyle: 'italic' }}
            >
              học. phát triển. tỏa sáng.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="relative z-10 max-w-[1100px] mx-auto px-6 pb-20">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h2 className="text-3xl font-black text-[#2D2D2D] mb-3">
            Tại sao chọn omilearn?
          </h2>
          <p className="text-[#5A5C58] text-base">
            Tất cả những gì bạn cần để học hiệu quả hơn
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              custom={i}
              variants={featureVariants}
              initial="hidden"
              animate="visible"
              className="bg-[#F1F1EC] border-2 border-[#333333] rounded-2xl p-6 flex flex-col gap-4 hover:border-[#6B2D3E] hover:shadow-lg hover:-translate-y-1 transition-all group"
              style={{ willChange: 'transform, opacity' }}
            >
              <div className="w-14 h-14 rounded-2xl bg-[#2D2D2D] flex items-center justify-center text-2xl flex-shrink-0">
                {feature.emoji}
              </div>
              <div>
                <h3 className="font-black text-[#2D2D2D] text-lg mb-2 group-hover:text-[#6B2D3E] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-[#5A5C58] text-sm leading-relaxed">{feature.desc}</p>
              </div>
              <div className="mt-auto pt-3 border-t-2 border-dashed border-[#CCCCCC]">
                <span className="text-[#6B2D3E] text-xs font-bold uppercase tracking-wider hover:underline cursor-pointer group-hover:gap-2 flex items-center gap-1 transition-all">
                  Tìm hiểu thêm
                  <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="relative z-10 max-w-[1100px] mx-auto px-6 pb-20">
        <motion.div
          className="bg-gradient-to-br from-[#2D2D2D] to-[#1a1a1a] rounded-2xl px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Decorative circles */}
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/[0.03] border border-white/[0.06]" />
          <div className="absolute right-20 bottom-0 w-24 h-24 rounded-full bg-[#6B2D3E]/15 border border-[#6B2D3E]/10" />

          <div className="relative z-10">
            <h3 className="text-white text-2xl font-black mb-2">
              Sẵn sàng bắt đầu học? 🚀
            </h3>
            <p className="text-[#9CA3AF] text-sm">
              Miễn phí. Không cần thẻ tín dụng. Bắt đầu ngay hôm nay.
            </p>
          </div>
          <Link
            href="/"
            className="relative z-10 px-8 py-3.5 rounded-full bg-[#F5C542] text-[#2D2D2D] font-black text-sm hover:bg-[#E6B830] hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 flex-shrink-0"
            style={{ willChange: 'transform' }}
          >
            Bắt đầu miễn phí →
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
