'use client';

import Link from 'next/link';
import { Search, Moon, User, Menu, LogOut } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/entities/auth';

const NAV_LINKS = [
  { href: '/project',    label: 'Dự án'    },
  { href: '/dashboard',  label: 'Dashboard' },
  { href: '/roadmap',    label: 'Roadmap'  },
  { href: '/learn',      label: 'Học tập'  },
  { href: '/workspace',  label: 'Tài liệu' },
];

export default function TopNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = useCallback(async () => {
    setAvatarOpen(false);
    await logout();
    router.push('/landing');
  }, [logout, router]);

  // Build user initials from name or email
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? '';

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{ background: 'rgba(250,249,247,0.97)', backdropFilter: 'blur(12px)', borderColor: '#e5e7eb' }}
    >
      <div className="max-w-[1280px] mx-auto px-5 h-[58px] flex items-center justify-between gap-4">

        {/* Logo */}
        <Link
          href="/project"
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

          {/* Avatar + dropdown */}
          <div className="relative" ref={avatarRef}>
            <button
              onClick={() => setAvatarOpen((o) => !o)}
              className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden border-2 transition-colors hover:border-[#6B2D3E]"
              style={{ background: isAuthenticated && (user?.avatar_url || initials) ? '#6B2D3E' : '#d6cfc8', borderColor: avatarOpen ? '#6B2D3E' : '#c9c2bb' }}
            >
              {isAuthenticated && user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name || 'Avatar'}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback to initials if image fails
                    const el = e.currentTarget;
                    el.style.display = 'none';
                    const span = document.createElement('span');
                    span.className = 'text-xs font-bold text-white leading-none';
                    span.textContent = initials || 'U';
                    el.parentElement?.appendChild(span);
                  }}
                />
              ) : isAuthenticated && initials ? (
                <span className="text-xs font-bold text-white leading-none">{initials}</span>
              ) : (
                <User size={16} style={{ color: '#7a736c' }} />
              )}
            </button>

            <AnimatePresence>
              {avatarOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 rounded-xl border shadow-lg overflow-hidden"
                  style={{ background: '#fff', borderColor: '#e5e7eb' }}
                >
                  {isAuthenticated && user ? (
                    <>
                      {/* User info */}
                      <div className="px-4 py-3 border-b flex items-center gap-3" style={{ borderColor: '#f3f4f6' }}>
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.name || 'Avatar'}
                            className="w-8 h-8 rounded-full object-cover shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#6B2D3E] flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-white">{initials || 'U'}</span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#1a1a1a] truncate">
                            {user.name || 'Người dùng'}
                          </p>
                          <p className="text-xs truncate" style={{ color: '#9ca3af' }}>
                            {user.email}
                          </p>
                        </div>
                      </div>

                      {/* Logout */}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors hover:bg-red-50"
                        style={{ color: '#ef4444' }}
                      >
                        <LogOut size={15} />
                        Đăng xuất
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setAvatarOpen(false)}
                        className="block px-4 py-3 text-sm font-medium text-[#1a1a1a] transition-colors hover:bg-black/5"
                      >
                        Đăng nhập
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setAvatarOpen(false)}
                        className="block px-4 py-3 text-sm font-medium text-[#1a1a1a] transition-colors hover:bg-black/5 border-t"
                        style={{ borderColor: '#f3f4f6' }}
                      >
                        Đăng ký
                      </Link>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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
