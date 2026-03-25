'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, GraduationCap, BookOpen, MessageCircle, ChevronLeft } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Học viên', icon: Users },
  { href: '/admin/teachers', label: 'Giảng viên', icon: GraduationCap },
  { href: '/admin/courses', label: 'Khóa học', icon: BookOpen },
  { href: '/admin/chat', label: 'Chat AI', icon: MessageCircle },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#F5F0EB]">
      {/* Sidebar */}
      <aside className="w-[240px] bg-white border-r-2 border-[#E5E7EB] flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-[#E5E7EB]">
          <Link href="/admin" className="text-[20px] font-bold text-[#6B2D3E]" style={{ fontFamily: 'Georgia, serif' }}>
            omilearn
          </Link>
          <p className="text-[10px] font-semibold text-[#5A5C58] uppercase tracking-widest mt-0.5">Admin Panel</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/admin' 
              ? pathname === '/admin' 
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all ${
                  isActive
                    ? 'bg-[#6B2D3E] text-white shadow-sm'
                    : 'text-[#5A5C58] hover:bg-[#F5F0EB] hover:text-[#2D2D2D]'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Back to app */}
        <div className="px-3 py-4 border-t border-[#E5E7EB]">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] text-[#5A5C58] hover:bg-[#F5F0EB] transition-all"
          >
            <ChevronLeft size={16} />
            Về trang học viên
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-[1200px] mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
