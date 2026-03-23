'use client';

import Link from 'next/link';

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

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F5F0EB] flex flex-col">
      {/* ── Public NavBar ── */}
      <nav className="w-full border-b-2 border-[#2D2D2D]/10 bg-[#F5F0EB]">
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
              className="px-5 py-2 rounded-full border-2 border-[#2D2D2D] text-sm font-bold text-[#2D2D2D] hover:bg-[#2D2D2D] hover:text-white transition-colors"
            >
              Bắt đầu
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="max-w-[1100px] mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-12">
        {/* Text */}
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border-2 border-[#2D2D2D] bg-[#F5C542] mb-6">
            <span className="text-xs font-black uppercase tracking-widest text-[#2D2D2D]">
              🚀 Ra mắt phiên bản 2.0
            </span>
          </div>

          <h1 className="text-5xl font-black text-[#2D2D2D] leading-tight mb-6">
            Học thông minh<br />
            <span className="text-[#6B2D3E]">hơn với AI</span>
          </h1>

          <p className="text-[#5A5C58] text-lg leading-relaxed mb-8 max-w-md">
            Nền tảng học tập tương tác với mindmap, trợ lý AI, và cộng đồng người học
          </p>

          <div className="flex items-center gap-4 flex-wrap">
            <Link
              href="/"
              className="px-7 py-3.5 rounded-full bg-[#2D2D2D] text-white font-bold text-sm hover:bg-[#1a1a1a] transition-colors"
            >
              Bắt đầu miễn phí
            </Link>
            <Link
              href="/"
              className="px-7 py-3.5 rounded-full border-2 border-[#2D2D2D] text-[#2D2D2D] font-bold text-sm hover:bg-[#2D2D2D]/5 transition-colors"
            >
              Xem demo →
            </Link>
          </div>

          {/* Social proof */}
          <div className="mt-8 flex items-center gap-3">
            <div className="flex -space-x-2">
              {FAKE_AVATARS.map((emoji, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full border-2 border-[#F5F0EB] bg-[#F1F1EC] flex items-center justify-center text-base"
                >
                  {emoji}
                </div>
              ))}
              <div className="w-9 h-9 rounded-full border-2 border-[#F5F0EB] bg-[#2D2D2D] flex items-center justify-center text-white text-xs font-bold">
                +9k
              </div>
            </div>
            <p className="text-[#5A5C58] text-sm font-medium">
              Được tin dùng bởi{' '}
              <strong className="text-[#2D2D2D]">10,000+</strong> sinh viên Việt Nam
            </p>
          </div>
        </div>

        {/* Illustration */}
        <div className="flex-shrink-0 w-full md:w-[420px]">
          <div className="bg-[#F1F1EC] border-2 border-[#333333] rounded-2xl p-8 flex flex-col items-center justify-center gap-4 aspect-square max-w-[380px] mx-auto">
            <div className="text-7xl">📚</div>
            <div className="text-5xl">🧠</div>
            <div className="text-4xl">✨</div>
            <p
              className="text-[#6B2D3E] text-lg font-medium mt-2"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontStyle: 'italic' }}
            >
              học. phát triển. tỏa sáng.
            </p>
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="max-w-[1100px] mx-auto px-6 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-[#2D2D2D] mb-3">
            Tại sao chọn omilearn?
          </h2>
          <p className="text-[#5A5C58] text-base">
            Tất cả những gì bạn cần để học hiệu quả hơn
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="bg-[#F1F1EC] border-2 border-[#333333] rounded-2xl p-6 flex flex-col gap-4 hover:border-[#6B2D3E] transition-colors group"
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
                <span className="text-[#6B2D3E] text-xs font-bold uppercase tracking-wider hover:underline cursor-pointer">
                  Tìm hiểu thêm →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="max-w-[1100px] mx-auto px-6 pb-20">
        <div className="bg-[#2D2D2D] rounded-2xl px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-white text-2xl font-black mb-2">
              Sẵn sàng bắt đầu học? 🚀
            </h3>
            <p className="text-[#9CA3AF] text-sm">
              Miễn phí. Không cần thẻ tín dụng. Bắt đầu ngay hôm nay.
            </p>
          </div>
          <Link
            href="/"
            className="px-8 py-3.5 rounded-full bg-[#F5C542] text-[#2D2D2D] font-black text-sm hover:bg-[#E6B830] transition-colors flex-shrink-0"
          >
            Bắt đầu miễn phí →
          </Link>
        </div>
      </section>
    </div>
  );
}
