'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, type Variants, type Easing } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

// ─── Animation variants ──────────────────────────────────────────────────────

const EASE: Easing = 'easeOut';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE, delay: i * 0.1 },
  }),
};

// ─── FAQ Accordion ────────────────────────────────────────────────────────────

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#e5e7eb]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="text-sm font-semibold text-[#1a1a1a]">{question}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.22 }}>
          <ChevronDown size={16} className="text-[#9ca3af]" />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        style={{ overflow: 'hidden' }}
      >
        <p className="pb-4 text-sm text-[#6b7280] leading-relaxed">{answer}</p>
      </motion.div>
    </div>
  );
}

// ─── Robot illustration ───────────────────────────────────────────────────────

function RobotIllustration() {
  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        minHeight: 480,
      }}
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Robot image */}
      <img
        src="/robot.png"
        alt="Omi AI Robot"
        className="w-full h-full object-contain relative z-10"
        style={{ minHeight: 480 }}
      />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#faf9f7' }}>

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 w-full border-b"
        style={{ background: 'rgba(250,249,247,0.97)', backdropFilter: 'blur(14px)', borderColor: '#e5e7eb' }}
      >
        <div className="max-w-[1100px] mx-auto px-5 h-[60px] flex items-center justify-between">
          {/* Logo */}
          <span
            className="text-xl font-black italic"
            style={{ color: '#6B2D3E', fontFamily: 'Georgia, serif', letterSpacing: '-0.01em' }}
          >
            omilearn
          </span>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: 'Features', active: true },
              { label: 'How it Works', active: false },
              { label: 'Pricing', active: false },
            ].map((item) => (
              <a
                key={item.label}
                href="#"
                className="text-sm font-medium transition-colors hover:text-[#1a1a1a] flex flex-col items-center"
                style={{ color: item.active ? '#6B2D3E' : '#6b7280' }}
              >
                {item.label}
                {item.active && (
                  <div className="mt-0.5 h-0.5 w-full rounded-full" style={{ background: '#6B2D3E' }} />
                )}
              </a>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm font-medium transition-colors hover:text-[#1a1a1a]"
              style={{ color: '#6b7280' }}
            >
              Sign In
            </Link>
            <Link
              href="/"
              className="px-5 py-2 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
              style={{
                background: '#6B2D3E',
                border: '2px solid #1a1a1a',
                borderRadius: '10px',
                boxShadow: '3px 3px 0px #1a1a1a',
              }}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════════════════════════════════ */}
      <section className="w-full max-w-[1100px] mx-auto px-5 pt-14 pb-20 flex flex-col md:flex-row items-center gap-10 md:gap-14">

        {/* Left: text */}
        <motion.div
          className="flex-1 flex flex-col items-start"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase mb-6"
            style={{
              background: '#fef08a',
              color: '#1a1a1a',
              border: '2px solid #1a1a1a',
              transform: 'rotate(-2deg)',
              boxShadow: '2px 2px 0px #1a1a1a',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#f59e0b' }} />
            Trợ lý AI thế hệ mới
          </div>

          {/* Headline */}
          <h1
            className="font-extrabold leading-[1.18] mb-5"
            style={{ fontSize: 'clamp(36px, 5vw, 54px)', color: '#1a1a1a', letterSpacing: '-0.02em' }}
          >
            Học tập thông<br />
            minh<br />
            cùng{' '}
            <span style={{ color: '#6B2D3E', fontStyle: 'italic' }}>AI<br />Partner</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm mb-8 leading-relaxed" style={{ color: '#6b7280', maxWidth: 360 }}>
            Omilearn giúp bạn lập kế hoạch, quản lý tài liệu và bứt phá kết
            quả học tập với trợ lý AI cá nhân.
          </p>

          {/* CTA */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-7 py-3 text-sm font-bold text-white transition-all hover:opacity-90 hover:-translate-y-0.5 active:scale-95 mb-6"
            style={{
              background: '#2d5a3d',
              border: '2.5px solid #1a1a1a',
              borderRadius: '12px',
              boxShadow: '3px 3px 0px #1a1a1a',
            }}
          >
            Khám phá ngay
          </Link>

          {/* Social proof */}
          <div className="flex items-center gap-3">
            {/* Avatar stack */}
            <div className="flex -space-x-2">
              {['#6B2D3E', '#7C6FCD', '#3DBE7A'].map((color, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ background: color }}
                >
                  {['M', 'H', 'T'][i]}
                </div>
              ))}
            </div>
            <p className="text-xs" style={{ color: '#9ca3af' }}>
              Gia nhập cùng{' '}
              <span className="font-semibold" style={{ color: '#6b7280' }}>10k+</span>{' '}
              học viên
            </p>
          </div>
        </motion.div>

        {/* Right: robot illustration */}
        <motion.div
          className="flex-shrink-0 w-full md:w-[420px]"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut', delay: 0.1 }}
        >
          <RobotIllustration />
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 2 — FEATURES
      ══════════════════════════════════════════════════════════════════ */}
      <section className="w-full max-w-[1100px] mx-auto px-5 pb-20">
        <motion.div
          className="text-center mb-12"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <h2
            className="font-extrabold mb-3"
            style={{ fontSize: 'clamp(24px, 3vw, 36px)', color: '#1a1a1a', letterSpacing: '-0.01em' }}
          >
            Mọi công cụ bạn cần
          </h2>
          <div className="w-10 h-1 rounded-full mx-auto" style={{ background: '#6B2D3E' }} />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              icon: (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="7" height="7" rx="1.5" fill="#c2185b" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" fill="#c2185b" opacity="0.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" fill="#c2185b" opacity="0.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" fill="#c2185b" opacity="0.3" />
                </svg>
              ),
              iconBg: '#fce4ec',
              title: 'Lộ trình học tập AI',
              desc: 'Tự động hóa lộ trình cá nhân hóa dựa trên mục tiêu và trình độ của bạn.',
            },
            {
              icon: (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="5" width="20" height="15" rx="2.5" fill="#f59e0b" opacity="0.25" />
                  <rect x="2" y="5" width="20" height="6" rx="2.5" fill="#f59e0b" opacity="0.7" />
                  <circle cx="6.5" cy="15.5" r="2" fill="#f59e0b" />
                  <rect x="10" y="14.5" width="9" height="2" rx="1" fill="#f59e0b" opacity="0.6" />
                </svg>
              ),
              iconBg: '#fff8e1',
              title: 'Quản lý dự án',
              desc: 'Sắp xếp tài liệu, bài tập và dự án học tập một cách khoa học, trực quan.',
            },
            {
              icon: (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="3" fill="#43a047" opacity="0.18" />
                  <path d="M8 12h8M8 8.5h5M8 15.5h6" stroke="#43a047" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="17" cy="17" r="3.5" fill="#43a047" />
                  <path d="M15.7 17l1 1 1.8-1.8" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ),
              iconBg: '#e8f5e9',
              title: 'Trợ lý học tập',
              desc: 'Hỏi đáp 24/7 về bất kỳ chủ đề nào, giải thích kiến thức phức tạp một cách dễ hiểu.',
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              className="flex flex-col gap-5 p-6 transition-all hover:-translate-y-1"
              style={{
                background: '#ffffff',
                border: '2px solid #1a1a1a',
                borderRadius: '20px',
                boxShadow: '4px 4px 0px #1a1a1a',
              }}
            >
              <div
                className="w-14 h-14 flex items-center justify-center"
                style={{ background: feature.iconBg, borderRadius: '14px' }}
              >
                {feature.icon}
              </div>
              <div>
                <p className="text-lg font-black mb-2" style={{ color: '#1a1a1a' }}>
                  {feature.title}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>
                  {feature.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 3 — FINAL CTA
      ══════════════════════════════════════════════════════════════════ */}
      <section className="w-full px-5 pb-20">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="max-w-[700px] mx-auto relative px-12 py-14 flex flex-col items-center text-center gap-6"
          style={{
            background: '#7d3f55',
            border: '3px solid #1a1a1a',
            borderRadius: '24px',
            boxShadow: '6px 6px 0px #1a1a1a',
          }}
        >
          {/* Decorative stars top-right */}
          <div className="absolute top-6 right-8 flex items-start gap-1 pointer-events-none select-none">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="rgba(255,255,255,0.25)">
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
            </svg>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(255,255,255,0.18)" className="mt-3">
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
            </svg>
          </div>

          <h2
            className="font-black text-white"
            style={{ fontSize: 'clamp(26px, 4vw, 36px)', lineHeight: 1.2 }}
          >
            Sẵn sàng bứt phá cùng<br />Omilearn?
          </h2>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-10 py-3.5 text-sm font-bold transition-all hover:opacity-90 active:scale-95"
            style={{
              background: '#f5f0e8',
              color: '#1a1a1a',
              border: '2.5px solid #1a1a1a',
              borderRadius: '14px',
              boxShadow: '4px 4px 0px #1a1a1a',
            }}
          >
            Bắt đầu hành trình
          </Link>

          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Miễn phí 14 ngày dùng thử. Không cần thẻ tín dụng.
          </p>
        </motion.div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer
        className="w-full border-t"
        style={{ borderColor: '#e5e7eb', background: '#faf9f7' }}
      >
        <div className="max-w-[1100px] mx-auto px-5 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-base font-bold" style={{ color: '#1a1a1a' }}>omilearn</span>
          <p className="text-xs" style={{ color: '#9ca3af' }}>© 2025 Omilearn. Mọi quyền được bảo lưu.</p>
          <div className="flex items-center gap-5">
            {['Chính sách bảo mật', 'Điều khoản', 'Liên hệ'].map((link) => (
              <a key={link} href="#" className="text-xs transition-colors hover:text-[#1a1a1a]" style={{ color: '#9ca3af' }}>
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
