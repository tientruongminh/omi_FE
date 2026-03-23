'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Sun, User, Menu } from 'lucide-react';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const NAV_LINKS = [
  { href: '/',           label: 'Dự án'    },
  { href: '/roadmap',    label: 'Roadmap'  },
  { href: '/learn',      label: 'Học tập'  },
  { href: '/schedule',   label: 'Lịch học' },
  { href: '/workspace',  label: 'Tài liệu' },
];

export default function TopNavBar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#F5F0EB]/95 backdrop-blur-sm border-b-2 border-[#2D2D2D]">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 h-[62px] md:h-[72px] flex items-center gap-4 md:gap-6">
        {/* Logo */}
        <Link
          href="/"
          className="text-[#6B2D3E] text-xl md:text-2xl font-medium tracking-tight lowercase flex-shrink-0 hover:opacity-80 transition-opacity"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontStyle: 'italic' }}
        >
          omilearn
        </Link>

        {/* Nav links — hidden on mobile */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all relative group ${
                  isActive
                    ? 'bg-[#2D2D2D] text-white'
                    : 'text-[#5A5C58] hover:text-[#2D2D2D] hover:bg-[#2D2D2D]/8 active:scale-95'
                }`}
              >
                {label}
                {/* Underline indicator for inactive */}
                {!isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#6B2D3E] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 md:gap-3 ml-auto">
          {/* Search bar — hidden on small mobile */}
          <div
            className={`hidden sm:flex items-center gap-2 px-3 md:px-4 py-2 rounded-full border-2 bg-transparent min-w-[140px] md:min-w-[220px] transition-all duration-200 ${
              searchFocused ? 'border-[#6B2D3E]' : 'border-[#2D2D2D]'
            }`}
          >
            <Search size={14} className="text-[#6B7280] flex-shrink-0" />
            <input
              type="text"
              placeholder={searchFocused ? 'Tìm kiếm môn học, tài liệu...' : 'Tìm kiếm...'}
              className="bg-transparent text-sm text-[#6B7280] outline-none w-full placeholder:text-[#6B7280] transition-all"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>

          {/* Dark mode toggle with tooltip */}
          <div className="tooltip-wrapper">
            <button className="w-[34px] md:w-[38px] h-[34px] md:h-[38px] rounded-full border border-[#2D2D2D]/20 bg-transparent flex items-center justify-center hover:border-[#6B2D3E] hover:text-[#6B2D3E] active:scale-90 transition-all">
              <Sun size={16} className="text-[#6B2D3E]" />
            </button>
            <span className="tooltip-label">Chế độ tối</span>
          </div>

          {/* Avatar with tooltip */}
          <div className="tooltip-wrapper">
            <button className="w-[34px] md:w-[38px] h-[34px] md:h-[38px] rounded-full border-2 border-[#2D2D2D] bg-transparent flex items-center justify-center hover:border-[#6B2D3E] active:scale-90 transition-all overflow-hidden">
              <User size={16} className="text-[#2D2D2D]" />
            </button>
            <span className="tooltip-label">Tài khoản</span>
          </div>

          {/* Hamburger — mobile only */}
          <button
            className="md:hidden w-[34px] h-[34px] rounded-full border-2 border-[#2D2D2D]/10 bg-[#F1F1EC] flex items-center justify-center hover:border-[#2D2D2D]/30 transition-colors cursor-pointer"
            onClick={() => setMobileOpen((o) => !o)}
          >
            <Menu size={14} className="text-[#5A5C58]" />
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="md:hidden border-t border-[#2D2D2D]/10 bg-[#F7F7F2]/95 backdrop-blur-sm px-4 py-3 flex flex-col gap-1"
          >
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#2D2D2D] text-white'
                      : 'text-[#5A5C58] hover:text-[#2D2D2D] hover:bg-[#2D2D2D]/8'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
