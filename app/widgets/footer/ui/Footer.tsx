import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-auto" style={{ background: '#FAF9F7' }}>
      {/* Dashed separator — matches design exactly */}
      <div className="border-t-2 border-dashed border-[#CCCCCC]" />
      
      <div className="max-w-[1280px] mx-auto px-6 py-5 flex items-center justify-between gap-4">
        {/* Left: Logo + copyright */}
        <div className="flex items-center gap-3">
          <span
            className="text-[#6B2D3E] text-lg font-medium lowercase"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontStyle: 'italic' }}
          >
            omilearn
          </span>
          <span className="text-[#2D2D2D] text-sm">© 2025 Editorial Learning</span>
        </div>

        {/* Right: links */}
        <div className="flex items-center gap-6">
          <Link href="#" className="text-[#2D2D2D] text-sm hover:text-[#6B2D3E] transition-colors">
            Quyền riêng tư
          </Link>
          <Link href="#" className="text-[#2D2D2D] text-sm hover:text-[#6B2D3E] transition-colors">
            Điều khoản
          </Link>
          <Link href="#" className="text-[#2D2D2D] text-sm hover:text-[#6B2D3E] transition-colors">
            Trợ giúp
          </Link>
        </div>
      </div>
    </footer>
  );
}

