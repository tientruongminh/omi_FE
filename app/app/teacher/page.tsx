'use client';

import { motion } from 'framer-motion';
import { Users, BookOpen, TrendingUp, Activity, Clock, Plus } from 'lucide-react';
import Link from 'next/link';

const STATS = [
  { label: 'Học viên', value: '342', icon: Users, bg: '#FECDD3', color: '#884856' },
  { label: 'Khóa học', value: '4', icon: BookOpen, bg: '#D1FAE5', color: '#3B644E' },
  { label: 'Hoàn thành TB', value: '67%', icon: TrendingUp, bg: '#FEF3C7', color: '#6A5B0C' },
];

const MY_COURSES = [
  { id: '1', name: 'Hệ Điều Hành và Linux', students: 342, completion: 72, units: 20 },
  { id: '2', name: 'Mạng Máy Tính Nâng Cao', students: 215, completion: 64, units: 18 },
  { id: '3', name: 'Linux Administration', students: 156, completion: 45, units: 15 },
  { id: '4', name: 'Cloud Computing Basics', students: 0, completion: 0, units: 0 },
];

const RECENT = [
  { user: 'Nguyễn Văn An', action: 'hoàn thành quiz "Kiến Trúc Hệ Thống"', time: '5 phút trước' },
  { user: 'Trần Thị Bình', action: 'nộp bài "Quản Lý Tiến Trình"', time: '25 phút trước' },
  { user: 'Lê Hoàng Cường', action: 'đạt 95% quiz "Linux Cơ Bản"', time: '1 giờ trước' },
  { user: 'Phạm Minh Dũng', action: 'bắt đầu chương "File System"', time: '2 giờ trước' },
];

export default function TeacherDashboard() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-black text-[#1A1A1A]" style={{ fontFamily: 'Georgia, serif' }}>
            Xin chào, TS. Nguyễn Tuấn 👋
          </h1>
          <p className="text-[13px] text-[#5A5C58] mt-1">Workspace giảng viên của bạn</p>
        </div>
        <Link
          href="/teacher/courses"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6B2D3E] text-white text-[13px] font-semibold hover:bg-[#5A2534] transition-colors"
        >
          <Plus size={16} />
          Tạo khóa học
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl p-5 border border-[#E5E7EB]"
              style={{ backgroundColor: stat.bg }}
            >
              <Icon size={20} style={{ color: stat.color }} className="mb-2" />
              <p className="text-[28px] font-black text-[#1A1A1A]">{stat.value}</p>
              <p className="text-[12px] text-[#5A5C58]">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* My Courses */}
      <div className="mb-8">
        <h2 className="text-[16px] font-bold text-[#1A1A1A] mb-4">Khóa học của tôi</h2>
        <div className="grid grid-cols-2 gap-3">
          {MY_COURSES.map((c) => (
            <Link
              key={c.id}
              href={`/teacher/courses/${c.id}`}
              className="bg-white border-2 border-[#E5E7EB] rounded-2xl p-4 hover:border-[#6B2D3E] hover:shadow-md transition-all"
            >
              <h3 className="text-[14px] font-bold text-[#2D2D2D] mb-2">{c.name}</h3>
              <div className="flex items-center gap-4 text-[11px] text-[#5A5C58]">
                <span>{c.students} học viên</span>
                <span>{c.units} bài</span>
              </div>
              {c.units > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex-1 h-1.5 rounded-full bg-[#E5E7EB] overflow-hidden">
                    <div className="h-full rounded-full bg-[#3B644E]" style={{ width: `${c.completion}%` }} />
                  </div>
                  <span className="text-[10px] font-bold text-[#3B644E]">{c.completion}%</span>
                </div>
              )}
              {c.units === 0 && (
                <p className="text-[11px] text-[#999] mt-3 italic">Chưa có nội dung — bắt đầu tạo →</p>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border-2 border-[#E5E7EB] rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-[#E5E7EB] flex items-center gap-2">
          <Activity size={16} className="text-[#6B2D3E]" />
          <h2 className="font-bold text-[#1A1A1A] text-[14px]">Hoạt động học viên</h2>
        </div>
        <div className="divide-y divide-[#F0F0F0]">
          {RECENT.map((act, i) => (
            <div key={i} className="px-5 py-3 flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-[#F5F0EB] flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-[#6B2D3E]">
                  {act.user.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </span>
              </div>
              <div>
                <p className="text-[12px]">
                  <span className="font-semibold text-[#2D2D2D]">{act.user}</span>{' '}
                  <span className="text-[#5A5C58]">{act.action}</span>
                </p>
                <p className="text-[10px] text-[#999] flex items-center gap-1 mt-0.5"><Clock size={9} />{act.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
