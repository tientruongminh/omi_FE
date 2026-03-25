'use client';

import { motion } from 'framer-motion';
import { Users, GraduationCap, BookOpen, TrendingUp, Activity, Clock } from 'lucide-react';

const STATS = [
  { label: 'Tổng học viên', value: '1,247', change: '+12%', icon: Users, bg: '#FECDD3', border: '#F0B8C0', color: '#884856' },
  { label: 'Giảng viên', value: '23', change: '+2', icon: GraduationCap, bg: '#D1FAE5', border: '#6EE7B7', color: '#3B644E' },
  { label: 'Khóa học', value: '18', change: '+3', icon: BookOpen, bg: '#FEF3C7', border: '#FCD34D', color: '#6A5B0C' },
  { label: 'Hoàn thành TB', value: '67%', change: '+5%', icon: TrendingUp, bg: '#E8E6E0', border: '#D8D6D0', color: '#5A5C58' },
];

const RECENT_ACTIVITIES = [
  { user: 'Nguyễn Văn An', action: 'hoàn thành bài quiz "Kiến Trúc Hệ Thống"', time: '5 phút trước' },
  { user: 'Trần Thị Bình', action: 'đăng ký khóa "UI/UX Design Fundamentals"', time: '12 phút trước' },
  { user: 'Lê Hoàng Cường', action: 'nộp bài tự luận "Quản Lý Tiến Trình"', time: '25 phút trước' },
  { user: 'Phạm Minh Dũng', action: 'hoàn thành 80% roadmap "CTDL & Giải Thuật"', time: '1 giờ trước' },
  { user: 'Võ Thị Em', action: 'bắt đầu khóa "Mạng Máy Tính Nâng Cao"', time: '2 giờ trước' },
  { user: 'Ngô Quốc Phong', action: 'đạt 95% quiz "Linux Cơ Bản"', time: '3 giờ trước' },
];

const TOP_COURSES = [
  { name: 'Hệ Điều Hành và Linux', students: 342, completion: 72 },
  { name: 'CTDL & Giải Thuật', students: 289, completion: 58 },
  { name: 'Mạng Máy Tính', students: 215, completion: 64 },
  { name: 'Trí Tuệ Nhân Tạo', students: 187, completion: 41 },
  { name: 'UI/UX Design', students: 156, completion: 35 },
];

export default function AdminDashboard() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[32px] font-black text-[#1A1A1A]" style={{ fontFamily: 'Georgia, serif' }}>
          Tổng quan
        </h1>
        <p className="text-[#5A5C58] text-[14px] mt-1">Quản lý hệ thống học tập OmiLearn</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.35 }}
              className="rounded-2xl p-5 border-2"
              style={{ backgroundColor: stat.bg, borderColor: stat.border }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stat.border}60` }}>
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/60" style={{ color: stat.color }}>
                  {stat.change}
                </span>
              </div>
              <p className="text-[28px] font-black text-[#1A1A1A]">{stat.value}</p>
              <p className="text-[12px] font-medium text-[#5A5C58] mt-0.5">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Two columns: Recent Activity + Top Courses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.35 }}
          className="bg-white border-2 border-[#E5E7EB] rounded-2xl overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center gap-2">
            <Activity size={18} className="text-[#6B2D3E]" />
            <h2 className="font-bold text-[#1A1A1A] text-[15px]">Hoạt động gần đây</h2>
          </div>
          <div className="divide-y divide-[#F0F0F0]">
            {RECENT_ACTIVITIES.map((act, i) => (
              <div key={i} className="px-5 py-3 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#F5F0EB] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[11px] font-bold text-[#6B2D3E]">
                    {act.user.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-[#2D2D2D]">
                    <span className="font-semibold">{act.user}</span>{' '}
                    <span className="text-[#5A5C58]">{act.action}</span>
                  </p>
                  <p className="text-[11px] text-[#999] mt-0.5 flex items-center gap-1">
                    <Clock size={10} />
                    {act.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Courses */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.35 }}
          className="bg-white border-2 border-[#E5E7EB] rounded-2xl overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center gap-2">
            <BookOpen size={18} className="text-[#6B2D3E]" />
            <h2 className="font-bold text-[#1A1A1A] text-[15px]">Khóa học phổ biến</h2>
          </div>
          <div className="divide-y divide-[#F0F0F0]">
            {TOP_COURSES.map((course, i) => (
              <div key={i} className="px-5 py-3.5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[13px] font-semibold text-[#2D2D2D]">{course.name}</p>
                  <span className="text-[11px] text-[#5A5C58]">{course.students} học viên</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-[#E5E7EB] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#3B644E]"
                      style={{ width: `${course.completion}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-[#3B644E]">{course.completion}%</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
