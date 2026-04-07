'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Trash2, X, Users, BookOpen, Eye, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { teacherApi, type TeacherCourse } from '@/entities/teacher/api';

export default function TeacherCoursesPage() {
  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', subject: '', level: '' });

  useEffect(() => {
    teacherApi.getCourses()
      .then((res) => setCourses(res.courses))
      .catch((e) => setError(e?.error || 'Không thể tải khóa học'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      const res = await teacherApi.createCourse({
        title: form.name.trim(),
        description: form.description.trim(),
        subject: form.subject.trim() || undefined,
        level: form.level.trim() || undefined,
      });
      setCourses(prev => [...prev, res.course]);
      setForm({ name: '', description: '', subject: '', level: '' });
      setShowModal(false);
    } catch (e: unknown) {
      const err = e as { error?: string };
      alert(err?.error || 'Tạo thất bại');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await teacherApi.deleteCourse(id);
      setCourses(prev => prev.filter(c => c.id !== id));
    } catch (e: unknown) {
      const err = e as { error?: string };
      alert(err?.error || 'Xóa thất bại');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-black text-[#1A1A1A]" style={{ fontFamily: 'Georgia, serif' }}>Khóa học</h1>
          <p className="text-[13px] text-[#5A5C58]">{courses.length} khóa học của bạn</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6B2D3E] text-white text-[13px] font-semibold hover:bg-[#5A2534] transition-colors cursor-pointer">
          <Plus size={16} /> Tạo khóa học
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999]" />
        <input type="text" placeholder="Tìm khóa học..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-[#E5E7EB] bg-white text-[13px] focus:outline-none focus:border-[#6B2D3E]" />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-[#6B2D3E]" />
        </div>
      )}

      {error && (
        <div className="bg-[#FEE2E2] border border-[#FCA5A5] rounded-xl px-4 py-3 text-[13px] text-[#991B1B] mb-4">{error}</div>
      )}

      {!loading && (
        <div className="space-y-3">
          {filtered.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-white border-2 border-[#E5E7EB] rounded-2xl p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[15px] font-bold text-[#1A1A1A]">{c.title}</h3>
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      c.status === 'active' ? 'bg-[#D1FAE5] text-[#3B644E]' : 'bg-[#FEF3C7] text-[#6A5B0C]'
                    }`}>
                      {c.status === 'active' ? 'Hoạt động' : 'Nháp'}
                    </span>
                  </div>
                  {c.description && <p className="text-[12px] text-[#5A5C58] mt-0.5">{c.description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-5 mb-3 text-[12px] text-[#5A5C58]">
                <span className="flex items-center gap-1"><Users size={12} /> {c.student_count ?? 0} học viên</span>
                <span className="flex items-center gap-1"><BookOpen size={12} /> {c.unit_count ?? 0} bài</span>
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-[#F0F0F0]">
                <Link href={`/teacher/courses/${c.id}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-[#6B2D3E] hover:bg-[#F5F0EB] transition-colors">
                  <Eye size={12} /> Tài nguyên & Roadmap
                </Link>
                <button onClick={() => handleDelete(c.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-[#DC2626] hover:bg-[#FEE2E2] transition-colors cursor-pointer">
                  <Trash2 size={12} /> Xóa
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl border-2 border-[#E5E7EB] p-6 w-[440px] shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[18px] font-bold">Tạo khóa học mới</h3>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F5F0EB] cursor-pointer"><X size={18} className="text-[#5A5C58]" /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[12px] font-semibold text-[#5A5C58] mb-1 block">Tên khóa học *</label>
                  <input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#E5E7EB] text-[13px] focus:outline-none focus:border-[#6B2D3E]" placeholder="VD: Lập trình Python cơ bản" autoFocus />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-[#5A5C58] mb-1 block">Mô tả</label>
                  <input value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#E5E7EB] text-[13px] focus:outline-none focus:border-[#6B2D3E]" placeholder="Mô tả ngắn về khóa học..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[12px] font-semibold text-[#5A5C58] mb-1 block">Môn học</label>
                    <input value={form.subject} onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#E5E7EB] text-[13px] focus:outline-none focus:border-[#6B2D3E]" placeholder="VD: Toán, Lý..." />
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold text-[#5A5C58] mb-1 block">Cấp độ</label>
                    <input value={form.level} onChange={(e) => setForm(f => ({ ...f, level: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#E5E7EB] text-[13px] focus:outline-none focus:border-[#6B2D3E]" placeholder="Cơ bản / Nâng cao" />
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-[#999] mt-3">Sau khi tạo, bạn upload tài nguyên và AI sẽ tự động tạo roadmap.</p>
              <div className="flex justify-end gap-3 mt-5">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-[13px] text-[#5A5C58] hover:bg-[#F5F0EB] cursor-pointer">Hủy</button>
                <button onClick={handleCreate} disabled={creating || !form.name.trim()} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#6B2D3E] text-white text-[13px] font-semibold hover:bg-[#5A2534] cursor-pointer disabled:opacity-60">
                  {creating && <Loader2 size={13} className="animate-spin" />}
                  Tạo khóa học
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
