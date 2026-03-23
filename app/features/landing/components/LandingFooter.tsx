'use client';

export default function LandingFooter() {
  return (
    <footer className="w-full border-t" style={{ borderColor: '#E5DDD5', borderStyle: 'dashed', background: '#F5F0EB' }}>
      <div className="max-w-[1100px] mx-auto px-5 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="text-lg italic" style={{ fontFamily: 'Georgia, serif', color: '#6B2D3E' }}>omilearn</span>
          <p className="text-xs" style={{ color: '#9CA3AF' }}>© 2025 Omilearn. Mọi quyền được bảo lưu.</p>
        </div>
        <div className="flex items-center gap-5 flex-wrap justify-center">
          {['Chính sách bảo mật', 'Điều khoản', 'Liên hệ'].map((link) => (
            <a key={link} href="#" className="text-xs transition-colors hover:text-[#2D2D2D]" style={{ color: '#9CA3AF' }}>{link}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}
