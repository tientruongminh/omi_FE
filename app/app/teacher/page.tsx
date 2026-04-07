'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, TrendingUp, Activity, Clock, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { teacherApi, type TeacherCourse } from '@/entities/teacher/api';

export default function TeacherDashboard() {
  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    teacherApi.getCourses()
      .then((res) => setCourses(res.courses))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Derive stats from courses
  const totalStudents = courses.reduce((sum, c) => sum + (c.student_count ?? 0), 0);
  const totalCourses = courses.length;

  const STATS = [
    { label: 'Học viên', value: loading ? '...' : String(totalStudents), icon: Users, bg: '#FECDD3', color: '#884856' },
    { label: 'Khóa học', value: loading ? '...' : String(totalCourses), icon: BookOpen, bg: '#D1FAE5', color: '#3B644E' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-black text-[#1A1A1A]" style={{ fontFamily: 'Georgia, serif' }}>
            Xin chào! 👋
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
      <div className="grid grid-cols-2 gap-4 mb-8">
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
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-[#6B2D3E]" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {courses.map((c) => (
              <Link
                key={c.id}
                href={`/teacher/courses/${c.id}`}
                className="bg-white border-2 border-[#E5E7EB] rounded-2xl p-4 hover:border-[#6B2D3E] hover:shadow-md transition-all"
              >
                <h3 className="text-[14px] font-bold text-[#2D2D2D] mb-2">{c.title}</h3>
                <div className="flex items-center gap-4 text-[11px] text-[#5A5C58]">
                  <span>{c.student_count ?? 0} học viên</span>
                  <span>{c.unit_count ?? 0} bài</span>
                </div>
                {(c.unit_count ?? 0) === 0 && (
                  <p className="text-[11px] text-[#999] mt-3 italic">Chưa có nội dung — bắt đầu tạo →</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
