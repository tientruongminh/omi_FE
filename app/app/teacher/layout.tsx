'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, BookOpen, MessageCircle, ChevronLeft, LogOut } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/teacher', label: 'Workspace', icon: LayoutDashboard },
  { href: '/teacher/courses', label: 'Khóa học', icon: BookOpen },
  { href: '/teacher/students', label: 'Học viên', icon: Users },
  { href: '/teacher/chat', label: 'Chat AI', icon: MessageCircle },
];

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#FAF9F7]">
      {/* Sidebar */}
      <aside className="w-[220px] bg-white border-r-2 border-[#E5E7EB] flex flex-col flex-shrink-0">
        {/* Profile */}
        <div className="px-5 py-5 border-b border-[#E5E7EB]">
          <Link href="/teacher" className="text-[18px] font-bold text-[#6B2D3E]" style={{ fontFamily: 'Georgia, serif' }}>
            omilearn
          </Link>
          <div className="flex items-center gap-2.5 mt-3">
            <div className="w-9 h-9 rounded-xl bg-[#F5F0EB] flex items-center justify-center">
              <span className="text-[12px] font-bold text-[#6B2D3E]">NT</span>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#2D2D2D]">TS. Nguyễn Tuấn</p>
              <p className="text-[10px] text-[#999]">Giảng viên</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/teacher'
              ? pathname === '/teacher'
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                  isActive
                    ? 'bg-[#6B2D3E] text-white shadow-sm'
                    : 'text-[#5A5C58] hover:bg-[#F5F0EB] hover:text-[#2D2D2D]'
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-[#E5E7EB] space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] text-[#5A5C58] hover:bg-[#F5F0EB] transition-all"
          >
            <ChevronLeft size={14} />
            Xem như học viên
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-[1100px] mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
