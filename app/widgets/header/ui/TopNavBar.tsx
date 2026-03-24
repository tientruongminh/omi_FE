'use client';

import Link from 'next/link';
import { Search, Moon, User, Menu } from 'lucide-react';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/',           label: 'Dự án'    },
  { href: '/dashboard',  label: 'Dashboard' },
  { href: '/roadmap',    label: 'Roadmap'  },
  { href: '/learn',      label: 'Học tập'  },
  { href: '/schedule',   label: 'Lịch học' },
  { href: '/workspace',  label: 'Tài liệu' },
];

export default function TopNavBar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{ background: 'rgba(250,249,247,0.97)', backdropFilter: 'blur(12px)', borderColor: '#e5e7eb' }}
    >
      <div className="max-w-[1280px] mx-auto px-5 h-[58px] flex items-center justify-between gap-4">

        {/* Logo */}
        <Link
          href="/landing"
          className="text-[#6B2D3E] text-lg font-bold tracking-tight lowercase shrink-0 hover:opacity-80 transition-opacity"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontStyle: 'italic' }}
        >
          omilearn
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2.5">
          {/* Search bar */}
          <div
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ background: '#eeebe6', minWidth: 200 }}
          >
            <Search size={14} style={{ color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-sm outline-none w-full"
              style={{ color: '#6b7280' }}
            />
          </div>

          {/* Dark mode */}
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-black/5"
            style={{ color: '#6b7280' }}
          >
            <Moon size={16} />
          </button>

          {/* Avatar */}
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden border-2 transition-colors hover:border-[#6B2D3E]"
            style={{ background: '#d6cfc8', borderColor: '#c9c2bb' }}
          >
            <User size={16} style={{ color: '#7a736c' }} />
          </button>

          {/* Hamburger — mobile only */}
          <button
            className="md:hidden w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-black/5"
            style={{ color: '#6b7280' }}
            onClick={() => setMobileOpen((o) => !o)}
          >
            <Menu size={18} />
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
            className="md:hidden border-t px-4 py-3 flex flex-col gap-1"
            style={{ background: 'rgba(245,240,235,0.97)', borderColor: '#e5e7eb' }}
          >
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  style={{
                    background: isActive ? '#2D2D2D' : 'transparent',
                    color: isActive ? '#fff' : '#5A5C58',
                  }}
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
