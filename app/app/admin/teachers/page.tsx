'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, X, Star, CheckCircle, Loader2 } from 'lucide-react';
import { adminApi, type AdminTeacher } from '@/entities/admin/api';

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<AdminTeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [verifying, setVerifying] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    adminApi.getTeachers()
      .then((res) => setTeachers(res.teachers))
      .catch((e) => setError(e?.error || 'Không thể tải danh sách giảng viên'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = teachers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    (t.specialty ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const handleVerify = async (teacherId: string) => {
    setVerifying(teacherId);
    try {
      await adminApi.verifyTeacher(teacherId);
      setTeachers(prev => prev.map(t => t.id === teacherId ? { ...t, verified: true } : t));
    } catch (e: unknown) {
      const err = e as { error?: string };
      alert(err?.error || 'Xác minh thất bại');
    } finally {
      setVerifying(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-black text-[#1A1A1A]" style={{ fontFamily: 'Georgia, serif' }}>Giảng viên</h1>
          <p className="text-[13px] text-[#5A5C58] mt-0.5">{teachers.length} giảng viên trong hệ thống</p>
        </div>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999]" />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc chuyên ngành..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-[#E5E7EB] bg-white text-[13px] text-[#2D2D2D] placeholder:text-[#999] focus:outline-none focus:border-[#6B2D3E] transition-colors"
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-[#6B2D3E]" />
        </div>
      )}

      {error && (
        <div className="bg-[#FEE2E2] border border-[#FCA5A5] rounded-xl px-4 py-3 text-[13px] text-[#991B1B] mb-4">
          {error}
        </div>
      )}

      {/* Cards grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="bg-white border-2 border-[#E5E7EB] rounded-2xl p-5 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#F5F0EB] flex items-center justify-center">
                    <span className="text-[14px] font-bold text-[#6B2D3E]">
                      {t.name.replace(/TS\.|ThS\.\s?/g, '').trim().split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-[#1A1A1A]">{t.name}</p>
                    {t.specialty && <p className="text-[11px] text-[#5A5C58]">{t.specialty}</p>}
                  </div>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                  t.status === 'active' ? 'bg-[#D1FAE5] text-[#3B644E]' : 'bg-[#FEE2E2] text-[#DC2626]'
                }`}>
                  {t.status === 'active' ? 'Hoạt động' : 'Ngừng'}
                </span>
              </div>

              <p className="text-[12px] text-[#5A5C58] mb-3">{t.email}</p>

              <div className="flex items-center gap-4 mb-3">
                <div className="text-center">
                  <p className="text-[18px] font-black text-[#1A1A1A]">{t.course_count}</p>
                  <p className="text-[10px] text-[#5A5C58]">Khóa học</p>
                </div>
                <div className="text-center">
                  <p className="text-[18px] font-black text-[#1A1A1A]">{t.student_count}</p>
                  <p className="text-[10px] text-[#5A5C58]">Học viên</p>
                </div>
                {t.rating != null && (
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-[#FCD34D] fill-[#FCD34D]" />
                    <span className="text-[14px] font-bold text-[#1A1A1A]">{t.rating}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-[#F0F0F0]">
                {!t.verified ? (
                  <button
                    onClick={() => handleVerify(t.id)}
                    disabled={verifying === t.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-[#3B644E] bg-[#D1FAE5] hover:bg-[#A7F3D0] transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {verifying === t.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                    Xác minh
                  </button>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-[#3B644E]">
                    <CheckCircle size={12} className="text-[#3B644E]" /> Đã xác minh
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
