import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-auto">
      {/* Dashed separator */}
      <div className="border-t-2 border-dashed border-[#CCCCCC]" />
      
      <div className="max-w-[1280px] mx-auto px-6 py-6 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-3">
          <span
            className="text-[#6B2D3E] text-lg font-medium lowercase"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontStyle: 'italic' }}
          >
            omilearn
          </span>
          <span className="text-[#5A5C58] text-sm">© 2024 Editorial Learning</span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-6">
          <Link href="#" className="text-[#5A5C58] text-sm hover:text-[#2D2D2D] transition-colors">
            Quyền riêng tư
          </Link>
          <span className="text-[#CCCCCC]">|</span>
          <Link href="#" className="text-[#5A5C58] text-sm hover:text-[#2D2D2D] transition-colors">
            Điều khoản
          </Link>
          <span className="text-[#CCCCCC]">|</span>
          <Link href="#" className="text-[#5A5C58] text-sm hover:text-[#2D2D2D] transition-colors">
            Trợ giúp
          </Link>
        </div>
      </div>
    </footer>
  );
}
