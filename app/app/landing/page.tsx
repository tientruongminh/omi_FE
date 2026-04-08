'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence, type Variants, type Easing } from 'framer-motion';
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

// ─── Testimonial Carousel ─────────────────────────────────────────────────────

const TESTIMONIALS = [
  { name: 'Minh Anh', school: 'ĐH Bách Khoa HN', avatar: '👩‍💻', avatarBg: '#fde8c0', quote: '"Omilearn giúp mình từ một người luôn nợ môn đến chân mới nhảy trở thành thủ khoa môn Kỹ thuật số. AI partner nhỏ nhẻ rất tâm lý!"' },
  { name: 'Hoàng Nam', school: 'ĐH Kinh tế Quốc dân', avatar: '👨‍🎓', avatarBg: '#d1fae5', quote: '"Thư viện tài liệu cực xịn, mình không còn phải lang thang trên mạng cả tiếng đồng hồ để tìm slide cũ nữa. Cảm ơn Omilearn!"' },
  { name: 'Thu Trang', school: 'ĐH Ngoại Thương', avatar: '👩‍🏫', avatarBg: '#e0e7ff', quote: '"Học Pomodoro cùng bạn bè trên đây vui lắm, cảm giác có động lực hẳn khi thấy mọi người cũng đang cố gắng giống mình."' },
  { name: 'Đức Anh', school: 'ĐH Công nghệ - ĐHQGHN', avatar: '👨‍💻', avatarBg: '#fce7f3', quote: '"Mình dùng Omilearn ôn thi cuối kỳ trong 2 tuần, điểm tăng từ 6.5 lên 9.0. Lộ trình AI thiết kế rất hợp lý, không bị quá tải."' },
  { name: 'Lan Phương', school: 'ĐH Y Hà Nội', avatar: '👩‍⚕️', avatarBg: '#d1fae5', quote: '"Học Y nhiều tài liệu lắm, Omilearn giúp mình tóm tắt và tạo flashcard siêu nhanh. Tiết kiệm được cả chục tiếng mỗi tuần!"' },
];

function TestimonialCard({ t }: { t: typeof TESTIMONIALS[number] }) {
  return (
    <div
      className="flex flex-col gap-4 p-6 h-full"
      style={{
        background: '#ffffff',
        border: '2px solid #6B2D3E',
        borderRadius: '20px',
        boxShadow: '4px 4px 0px #6B2D3E',
        minHeight: 220,
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl shrink-0" style={{ background: t.avatarBg }}>
          {t.avatar}
        </div>
        <div>
          <p className="font-bold text-sm" style={{ color: '#1a1a1a' }}>{t.name}</p>
          <p className="text-xs" style={{ color: '#9ca3af' }}>{t.school}</p>
        </div>
      </div>
      <p className="text-sm leading-relaxed flex-1" style={{ color: '#4b5563' }}>{t.quote}</p>
      <div className="flex gap-1">
        {[...Array(5)].map((_, si) => <span key={si} style={{ color: '#f59e0b', fontSize: '18px' }}>★</span>)}
      </div>
    </div>
  );
}

function TestimonialCarousel() {
  const [index, setIndex] = useState(0);
  const perPage = 3;
  const total = TESTIMONIALS.length;
  const maxIndex = total - perPage;

  const prev = () => setIndex(i => Math.max(0, i - 1));
  const next = () => setIndex(i => Math.min(maxIndex, i + 1));

  return (
    <div className="relative">
      {/* Cards */}
      <div className="overflow-hidden">
        <motion.div
          className="flex gap-6"
          animate={{ x: `calc(-${index * (100 / perPage)}% - ${index * 24 / perPage}px)` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="shrink-0" style={{ width: `calc((100% - ${(perPage - 1) * 24}px) / ${perPage})` }}>
              <TestimonialCard t={t} />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Arrow buttons */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={prev}
          disabled={index === 0}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95"
          style={{
            background: index === 0 ? '#f3f4f6' : '#ffffff',
            border: '2px solid #6B2D3E',
            boxShadow: index === 0 ? 'none' : '3px 3px 0px #6B2D3E',
            color: index === 0 ? '#d1d5db' : '#6B2D3E',
            cursor: index === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          ←
        </button>

        {/* Dots */}
        <div className="flex gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, di) => (
            <button
              key={di}
              onClick={() => setIndex(di)}
              className="rounded-full transition-all"
              style={{
                width: di === index ? 20 : 8,
                height: 8,
                background: di === index ? '#6B2D3E' : '#d1d5db',
              }}
            />
          ))}
        </div>

        <button
          onClick={next}
          disabled={index === maxIndex}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95"
          style={{
            background: index === maxIndex ? '#f3f4f6' : '#ffffff',
            border: '2px solid #6B2D3E',
            boxShadow: index === maxIndex ? 'none' : '3px 3px 0px #6B2D3E',
            color: index === maxIndex ? '#d1d5db' : '#6B2D3E',
            cursor: index === maxIndex ? 'not-allowed' : 'pointer',
          }}
        >
          →
        </button>
      </div>
    </div>
  );
}

// ─── FAQ Accordion ────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  { q: 'AI của Omilearn có giống Minh Tiền cd không?', a: 'Không hoàn toàn. AI của chúng mình được huấn luyện chuyên sâu để hiểu các giáo trình đại học tại Việt Nam, trả lời bám sát đề cương và phong cách ra đề của giảng viên.' },
  { q: 'Dùng thử có tốn phí không?', a: 'Hoàn toàn miễn phí trong 14 ngày đầu. Không cần nhập thẻ tín dụng. Sau đó bạn có thể chọn gói phù hợp hoặc tiếp tục dùng gói Free với tính năng cơ bản.' },
  { q: 'Tài liệu trên đây có tin cậy không?', a: 'Tất cả tài liệu đều được kiểm duyệt bởi đội ngũ học thuật của Omilearn và được đóng góp từ sinh viên xuất sắc của các trường đại học hàng đầu Việt Nam.' },
  { q: 'Omilearn có hỗ trợ môn học nào?', a: 'Hiện tại Omilearn hỗ trợ hơn 200 môn học phổ biến tại 12+ trường đại học, bao gồm Giải tích, Vật lý, Lập trình, Kinh tế, Luật và nhiều hơn nữa.' },
  { q: 'Dữ liệu cá nhân của mình có an toàn không?', a: 'Tuyệt đối an toàn. Chúng mình tuân thủ các tiêu chuẩn bảo mật quốc tế, mã hóa toàn bộ dữ liệu và không bao giờ chia sẻ thông tin cá nhân cho bên thứ ba.' },
];

function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="flex flex-col gap-3">
      {FAQ_ITEMS.map((item, i) => (
        <div
          key={i}
          className="overflow-hidden transition-all"
          style={{
            background: '#ffffff',
            border: '1.5px solid #c9a0a8',
            borderRadius: '14px',
          }}
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-4 text-left"
          >
            <span className="font-semibold text-sm" style={{ color: '#1a1a1a' }}>{item.q}</span>
            <span className="text-lg shrink-0 ml-4 transition-transform" style={{ color: '#6B2D3E', transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              ⌄
            </span>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                key="content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                style={{ overflow: 'hidden' }}
              >
                <div className="border-t border-dashed px-6 pb-4 pt-3" style={{ borderColor: '#e5e0d8' }}>
                  <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>{item.a}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
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
            omilearnnnnnnnnnnnnnnnnn
          </span>

          {/* Auth buttons */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium transition-colors hover:text-[#1a1a1a]"
              style={{ color: '#6b7280' }}
            >
              Sign In
            </Link>
            <Link
              href="/register"
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
            href="/register"
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
          SECTION 2 — PAIN POINTS
      ══════════════════════════════════════════════════════════════════ */}
      <section className="w-full py-16 px-5" style={{ background: '#FFF9EC' }}>
        <div className="max-w-[1100px] mx-auto">
        <motion.div
          className="text-center mb-12"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <h2
            className="font-extrabold"
            style={{ fontSize: 'clamp(22px, 3vw, 34px)', color: '#6B2D3E', letterSpacing: '-0.01em' }}
          >
            Bạn có đang rơi vào vòng lặp này không?
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="17" rx="3" fill="#c2185b" opacity="0.15" />
                  <rect x="7" y="2" width="2" height="4" rx="1" fill="#c2185b" />
                  <rect x="15" y="2" width="2" height="4" rx="1" fill="#c2185b" />
                  <path d="M7 11h10M7 15h6" stroke="#c2185b" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              ),
              iconBg: '#fce4ec',
              title: 'Lcp kế hoạch xong… rồi thôi',
              desc: 'Viết hàng dài To-do list nhưng cuối ngày nhìn lại vẫn chưa làm được gì vì quá ngợp.',
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" fill="#f59e0b" opacity="0.15" />
                  <circle cx="12" cy="12" r="9" stroke="#f59e0b" strokeWidth="1.8" />
                  <path d="M12 8v4l3 2" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              ),
              iconBg: '#fff8e1',
              title: 'Dùng AI không hiệu quả',
              desc: 'Hỏi ChatGPT nhưng câu trả lời quá chung chung, không sát với nội dung ôn tập thực tế.',
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" fill="#0891b2" opacity="0.12" />
                  <path d="M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0z" fill="#0891b2" opacity="0.5" />
                  <path d="M12 3v2M12 19v2M3 12h2M19 12h2" stroke="#0891b2" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              ),
              iconBg: '#e0f7fa',
              title: 'Mất buổi tìm tài liệu',
              desc: 'Tài liệu nằm rải rác ở khắp nơi: Drive, Facebook, Group lớp… không thể quản lý tập trung.',
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              className="flex flex-col gap-4 p-6 transition-all hover:-translate-y-1"
              style={{
                background: '#fdfaf6',
                border: '1.5px solid #c9a0a8',
                borderRadius: '20px',
                boxShadow: '4px 4px 0px #6B2D3E',
              }}
            >
              <div
                className="w-12 h-12 flex items-center justify-center rounded-full"
                style={{ background: feature.iconBg }}
              >
                {feature.icon}
              </div>
              <div>
                <p className="text-base font-bold mb-2" style={{ color: '#1a1a1a' }}>
                  {feature.title}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>
                  {feature.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 3 — HOW IT WORKS
      ══════════════════════════════════════════════════════════════════ */}
      <section className="w-full py-20 px-5" style={{ background: '#FAF3E1' }}>
        <div className="max-w-[1100px] mx-auto">
          <motion.div
            className="text-center mb-12"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <h2
              className="font-black uppercase"
              style={{ fontSize: 'clamp(26px, 4vw, 48px)', color: '#6C313F', letterSpacing: '-0.01em' }}
            >
              OMILEARN hoạt động như thế nào?
            </h2>
            <p className="text-sm leading-relaxed mt-3" style={{ color: '#6b7280', maxWidth: 480, margin: '12px auto 0' }}>
              Chúng mình biến những kiến thức khô khan thành hành trình chinh phục đầy cảm hứng.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { img: '/image1.png', title: 'AI lên lịch', titleColor: '#1a1a1a', desc: 'Chỉ cần nhập deadline, AI tự động chia nhỏ task và nhắc nhở bạn học mỗi ngày.' },
              { img: '/image2.png', title: 'Học cùng AI', titleColor: '#6B2D3E', desc: 'Giải đáp mọi thắc mắc 24/7 theo đúng giáo trình và slide bài giảng của bạn.' },
              { img: '/image3.png', title: 'Thư viện curated', titleColor: '#6B2D3E', desc: 'Tổng hợp tài liệu chất lượng nhất từ các anh chị khóa trên và giảng viên.' },
              { img: '/image4.png', title: 'Pomodoro cùng bạn', titleColor: '#6B2D3E', desc: 'Phòng học co giúp bạn tập trung cao độ cùng cộng đồng sinh viên toàn quốc.' },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                className="flex flex-col overflow-hidden transition-all hover:-translate-y-1"
                style={{
                  background: '#ffffff',
                  border: '2px solid #6B2D3E',
                  borderRadius: '20px',
                  boxShadow: '4px 4px 0px #6B2D3E',
                }}
              >
                <div style={{ aspectRatio: '4/3', overflow: 'hidden', borderRadius: '18px 18px 0 0' }}>
                  <img src={card.img} alt={card.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-5 flex flex-col gap-2">
                  <p className="font-black text-base" style={{ color: card.titleColor }}>{card.title}</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>{card.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 4 — COMPARISON
      ══════════════════════════════════════════════════════════════════ */}
      <section className="w-full py-20 px-5" style={{ background: '#FAF9F7' }}>
        <div className="max-w-250 mx-auto">
          {/* Title */}
          <motion.h2
            className="text-center font-black mb-12"
            style={{ fontSize: 'clamp(22px, 3.5vw, 38px)', color: '#1a1a1a' }}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            Hai cách học. Hai kết quả khác nhau.
          </motion.h2>

          {/* Two columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">

            {/* Left — Học kiểu cũ */}
            <motion.div
              variants={fadeUp}
              custom={0}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              className="flex flex-col gap-5 p-7 h-full"
              style={{
                background: 'transparent',
                border: '2px dashed #6B2D3E',
                borderRadius: '20px',
              }}
            >
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#6B2D3E' }}>
                Học kiểu cũ
              </p>
              <ul className="flex flex-col gap-3">
                {[
                  'Đọc 200 trang → 2 ngày',
                  'Tự tóm tắt → quên 80% sau 1 tuần',
                  'Tự làm flashcard → mất 3 tiếng',
                  'Ôn thi → không biết bắt đầu từ đâu',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm" style={{ color: '#6b7280' }}>
                    <span className="mt-1.5 w-5 h-0.5 shrink-0 rounded-full" style={{ background: '#9ca3af' }} />
                    {item}
                  </li>
                ))}
              </ul>
              <div
                className="mt-auto px-4 py-3 rounded-xl text-sm"
                style={{ border: '1.5px dashed #d1d5db', color: '#9ca3af' }}
              >
                Kết quả: &quot;Hy vọng qua môn&quot;
              </div>
            </motion.div>

            {/* Right — Học với Omilearn */}
            <motion.div
              variants={fadeUp}
              custom={1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              className="flex flex-col gap-5 p-7 h-full"
              style={{
                background: '#ffffff',
                border: '2.5px solid #2d5a3d',
                borderRadius: '20px',
                boxShadow: '5px 5px 0px #2d5a3d',
              }}
            >
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#2d5a3d' }}>
                Học với Omilearn
              </p>
              <ul className="flex flex-col gap-3">
                {[
                  'AI tóm tắt 200 trang → 5 phút',
                  'Spaced repetition → nhớ 95% sau 1 tháng',
                  'Auto flashcard + quiz → sẵn sàng ngay',
                  'Lộ trình cá nhân → biết chính xác học gì',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm font-medium" style={{ color: '#1a1a1a' }}>
                    <span className="mt-0.5 text-base shrink-0" style={{ color: '#2d5a3d' }}>→</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div
                className="mt-auto px-4 py-3 rounded-xl text-sm font-bold"
                style={{ background: '#dcfce7', color: '#166534', border: '1.5px solid #86efac' }}
              >
                Kết quả: &quot;Top 10% lớp&quot;
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 5 — 3 STEPS + STATS
      ══════════════════════════════════════════════════════════════════ */}
      <section className="w-full overflow-hidden">
        {/* Top — maroon bg + 3 steps */}
        <div className="w-full px-5 pt-16 pb-24 relative" style={{ background: '#7d3f55' }}>
          <div className="max-w-250 mx-auto">
            <motion.h2
              className="text-center font-black uppercase text-white mb-16"
              style={{ fontSize: 'clamp(22px, 4vw, 42px)', letterSpacing: '0.02em' }}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
            >
              Bắt đầu chỉ trong 3 bước
            </motion.h2>

            {/* Steps + wavy line */}
            <div className="relative">
              {/* SVG wavy connector */}
              <svg
                className="absolute top-8 left-0 w-full"
                height="40"
                viewBox="0 0 1000 40"
                preserveAspectRatio="none"
                fill="none"
              >
                <path
                  d="M0 30 Q250 0 500 20 Q750 40 1000 10"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>

              <div className="grid grid-cols-3 gap-6 relative z-10">
                {[
                  {
                    num: '1',
                    bg: '#b8e8c8',
                    color: '#2d5a3d',
                    title: 'Nhập deadline',
                    desc: 'Tải file giáo trình hoặc nhập ngày thi của bạn vào hệ thống.',
                  },
                  {
                    num: '2',
                    bg: '#fde8c0',
                    color: '#92400e',
                    title: 'Học theo lộ trình',
                    desc: 'Nhận bài học và bài tập hàng ngày được AI cá nhân hóa.',
                  },
                  {
                    num: '3',
                    bg: '#ffd6d6',
                    color: '#9b1c1c',
                    title: 'Weekly Review',
                    desc: 'Đánh giá tiến độ hàng tuần để đảm bảo bạn luôn đi đúng hướng.',
                  },
                ].map((step, i) => (
                  <motion.div
                    key={step.num}
                    custom={i}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-60px' }}
                    className="flex flex-col items-center text-center gap-4"
                  >
                    {/* Number badge */}
                    <div
                      className="w-16 h-16 flex items-center justify-center text-2xl font-black"
                      style={{
                        background: step.bg,
                        color: step.color,
                        borderRadius: '14px',
                        border: '2px solid rgba(255,255,255,0.3)',
                      }}
                    >
                      {step.num}
                    </div>
                    <div>
                      <p className="font-bold text-white text-base mb-1">{step.title}</p>
                      <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom — dark stats bar */}
        <div className="w-full px-5 py-14" style={{ background: '#1a1a1a' }}>
          <div className="max-w-250 mx-auto grid grid-cols-2 md:grid-cols-4 gap-0">
            {[
              { value: '12+', label: 'TRƯỜNG ĐẠI HỌC' },
              { value: '4 giờ', label: 'TIẾT KIỆM/TUẦN' },
              { value: '98%', label: 'MUỐN GIỚI THIỆU' },
              { value: '10%', label: 'TOP LỚP TRUNG BÌNH' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                className="flex flex-col items-center text-center px-6 py-2"
                style={{
                  borderRight: i < 3 ? '1.5px dashed rgba(255,255,255,0.15)' : 'none',
                }}
              >
                <span
                  className="font-black text-white mb-2"
                  style={{ fontSize: 'clamp(32px, 5vw, 56px)', lineHeight: 1 }}
                >
                  {stat.value}
                </span>
                <span
                  className="text-[11px] font-bold uppercase tracking-widest"
                  style={{ color: 'rgba(255,255,255,0.45)' }}
                >
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 6 — TESTIMONIALS
      ══════════════════════════════════════════════════════════════════ */}
      <section className="w-full py-20 px-5" style={{ background: '#FAF3E1' }}>
        <div className="max-w-250 mx-auto">
          <motion.h2
            className="text-center font-black uppercase mb-14"
            style={{ fontSize: 'clamp(22px, 4vw, 42px)', color: '#1a1a1a', letterSpacing: '0.02em' }}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            Sinh viên thật kết quả thật
          </motion.h2>

          <TestimonialCarousel />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 7 — FAQ
      ══════════════════════════════════════════════════════════════════ */}
      <section className="w-full py-20 px-5" style={{ background: '#F5EFE6' }}>
        <div className="max-w-180 mx-auto">
          <motion.h2
            className="text-center font-bold mb-12"
            style={{ fontSize: 'clamp(22px, 3vw, 36px)', color: '#6B2D3E' }}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            Giải đáp thắc mắc
          </motion.h2>
          <FAQAccordion />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 8 — FINAL CTA
      ══════════════════════════════════════════════════════════════════ */}
      <section className="w-full py-24 px-5 flex flex-col items-center" style={{ background: '#FAF9F7' }}>
        {/* Stacked banner */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="relative mb-10"
          style={{ width: 'min(600px, 90vw)' }}
        >
          <img
            src="/image5.png"
            alt="Sẵn sàng bứt phá cùng Omilearn?"
            className="w-full h-auto"
            style={{ borderRadius: '12px' }}
          />
        </motion.div>

        {/* Sub text */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="text-center font-bold uppercase tracking-widest mb-8 text-xs"
          style={{ color: '#6B2D3E' }}
        >
          Tham gia cùng 10,000+ sinh viên đang học<br />tập hiệu quả mỗi ngày.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          <Link
            href="/register"
            className="inline-flex items-center px-12 py-4 font-black uppercase tracking-widest text-sm transition-all hover:opacity-90 active:scale-95"
            style={{
              background: '#2d5a3d',
              color: '#ffffff',
              border: '2.5px solid #632D3A',
              borderRadius: '14px',
              boxShadow: '5px 5px 0px #632D3A',
              letterSpacing: '0.08em',
            }}
          >
            Đăng ký ngay – Miễn phí
          </Link>
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
