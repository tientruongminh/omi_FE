'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, GraduationCap, BookOpen, TrendingUp, Activity, Clock, Loader2 } from 'lucide-react';
import { adminApi, AdminDashboardData, AdminActivity } from '@/entities/admin/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardData | null>(null);
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const [dashData, actData] = await Promise.all([
          adminApi.getDashboard(),
          adminApi.getActivities(),
        ]);
        setStats(dashData);
        setActivities(actData.activities ?? []);
      } catch {
        setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const STAT_CARDS = stats
    ? [
        { label: 'Tổng học viên', value: stats.total_students.toLocaleString(), icon: Users, bg: '#FECDD3', border: '#F0B8C0', color: '#884856' },
        { label: 'Giảng viên', value: String(stats.total_teachers), icon: GraduationCap, bg: '#D1FAE5', border: '#6EE7B7', color: '#3B644E' },
        { label: 'Khóa học', value: String(stats.total_courses), icon: BookOpen, bg: '#FEF3C7', border: '#FCD34D', color: '#6A5B0C' },
        { label: 'Hoàn thành TB', value: `${Math.round(stats.avg_completion)}%`, icon: TrendingUp, bg: '#E8E6E0', border: '#D8D6D0', color: '#5A5C58' },
      ]
    : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-[#6B2D3E]" size={28} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
    );
  }

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
        {STAT_CARDS.map((stat, i) => {
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
              </div>
              <p className="text-[28px] font-black text-[#1A1A1A]">{stat.value}</p>
              <p className="text-[12px] font-medium text-[#5A5C58] mt-0.5">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Two columns: Recent Activity */}
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
            {activities.length === 0 ? (
              <div className="px-5 py-6 text-center text-[#999] text-[13px]">Chưa có hoạt động nào</div>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="px-5 py-3 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F5F0EB] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[11px] font-bold text-[#6B2D3E]">
                      {act.user_name.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-[#2D2D2D]">
                      <span className="font-semibold">{act.user_name}</span>{' '}
                      <span className="text-[#5A5C58]">{act.action}</span>
                    </p>
                    <p className="text-[11px] text-[#999] mt-0.5 flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(act.created_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Placeholder for top courses (no backend endpoint available) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.35 }}
          className="bg-white border-2 border-[#E5E7EB] rounded-2xl overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center gap-2">
            <BookOpen size={18} className="text-[#6B2D3E]" />
            <h2 className="font-bold text-[#1A1A1A] text-[15px]">Thống kê hệ thống</h2>
          </div>
          <div className="px-5 py-5 space-y-4">
            {stats && [
              { label: 'Khóa học đang hoạt động', value: stats.total_courses, max: stats.total_courses },
              { label: 'Tỷ lệ hoàn thành trung bình', value: Math.round(stats.avg_completion), max: 100 },
              { label: 'Tổng giảng viên', value: stats.total_teachers, max: Math.max(stats.total_teachers, 50) },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13px] font-medium text-[#2D2D2D]">{item.label}</span>
                  <span className="text-[12px] font-bold text-[#3B644E]">{item.value}{item.label.includes('Tỷ lệ') ? '%' : ''}</span>
                </div>
                <div className="h-2 rounded-full bg-[#E5E7EB] overflow-hidden">
                  <div className="h-full rounded-full bg-[#3B644E]" style={{ width: `${Math.min(100, (item.value / item.max) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
