'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Moon, User } from 'lucide-react';

const NAV_LINKS = [
  { href: '/',           label: 'Dự án'    },
  { href: '/roadmap',    label: 'Roadmap'  },
  { href: '/learn',      label: 'Học tập'  },
  { href: '/schedule',   label: 'Lịch học' },
  { href: '/workspace',  label: 'Tài liệu' },
];

export default function TopNavBar() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#F7F7F2]/90 backdrop-blur-sm border-b border-[#2D2D2D]/10">
      <div className="max-w-[1280px] mx-auto px-6 h-[78px] flex items-center gap-6">
        {/* Logo */}
        <Link
          href="/"
          className="text-[#6B2D3E] text-2xl font-medium tracking-tight lowercase flex-shrink-0"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontStyle: 'italic' }}
        >
          omilearn
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#2D2D2D] text-white'
                    : 'text-[#5A5C58] hover:text-[#2D2D2D] hover:bg-[#2D2D2D]/5'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Search bar */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-[#2D2D2D]/10 bg-[#F1F1EC] min-w-[200px]">
            <Search size={16} className="text-[#6B7280] flex-shrink-0" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
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
