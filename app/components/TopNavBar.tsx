'use client';

import Link from 'next/link';
import { Search, Moon, User } from 'lucide-react';

export default function TopNavBar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#F7F7F2]/90 backdrop-blur-sm border-b border-[#2D2D2D]/10">
      <div className="max-w-[1280px] mx-auto px-6 h-[78px] flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-[#6B2D3E] text-2xl font-medium tracking-tight lowercase">
          omilearn
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-[#2D2D2D]/10 bg-[#F1F1EC] min-w-[200px]">
            <Search size={16} className="text-[#6B7280] flex-shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-sm text-[#6B7280] outline-none w-full placeholder:text-[#6B7280]"
            />
          </div>

          {/* Dark mode toggle */}
          <button className="w-[38px] h-[38px] rounded-full border-2 border-[#2D2D2D]/10 bg-[#F1F1EC] flex items-center justify-center hover:border-[#2D2D2D]/30 transition-colors">
            <Moon size={16} className="text-[#5A5C58]" />
          </button>

          {/* Avatar */}
          <button className="w-[38px] h-[38px] rounded-full border-2 border-[#2D2D2D] bg-[#DCDDD7] flex items-center justify-center hover:border-[#2D2D2D]/70 transition-colors overflow-hidden">
            <User size={18} className="text-[#5A5C58]" />
          </button>
        </div>
      </div>
    </header>
  );
}
