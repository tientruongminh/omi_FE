'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Pencil, Trash2, X, Users, BookOpen, Eye, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { teacherApi, type TeacherCourse } from '@/entities/teacher/api';

const STATUS_MAP = {
  active: { label: 'Hoạt động', bg: 'bg-[#D1FAE5]', text: 'text-[#3B644E]' },
  draft: { label: 'Nháp', bg: 'bg-[#FEF3C7]', text: 'text-[#6A5B0C]' },
  archived: { label: 'Lưu trữ', bg: 'bg-[#E8E6E0]', text: 'text-[#5A5C58]' },
};

type StatusKey = keyof typeof STATUS_MAP;

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editCourse, setEditCourse] = useState<TeacherCourse | null>(null);
  const [form, setForm] = useState({ name: '', teacher: '', status: 'draft' as StatusKey });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    teacherApi.getCourses()
      .then((res) => setCourses(res.courses))
      .catch((e) => setError(e?.error || 'Không thể tải khóa học'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditCourse(null);
    setForm({ name: '', teacher: '', status: 'draft' });
    setShowModal(true);
  };

  const openEdit = (c: TeacherCourse) => {
    setEditCourse(c);
    setForm({ name: c.title, teacher: '', status: (c.status as StatusKey) ?? 'draft' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editCourse) {
        const res = await teacherApi.updateCourse(editCourse.id, { title: form.name });
        setCourses(prev => prev.map(c => c.id === editCourse.id ? res.course : c));
      } else {
        const res = await teacherApi.createCourse({ title: form.name, description: '' });
        setCourses(prev => [...prev, res.course]);
      }
      setShowModal(false);
    } catch (e: unknown) {
      const err = e as { error?: string };
      alert(err?.error || 'Lưu thất bại');
    } finally {
      setSaving(false);
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
          <p className="text-[13px] text-[#5A5C58] mt-0.5">{courses.length} khóa học trong hệ thống</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6B2D3E] text-white text-[13px] font-semibold hover:bg-[#5A2534] transition-colors cursor-pointer"
        >
          <Plus size={16} />
          Tạo khóa học
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999]" />
        <input
          type="text"
          placeholder="Tìm kiếm khóa học..."
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

      {/* Course cards */}
      {!loading && (
        <div className="space-y-3">
          {filtered.map((c, i) => {
            const statusKey = (c.status as StatusKey) ?? 'draft';
            const st = STATUS_MAP[statusKey] ?? STATUS_MAP.draft;
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className="bg-white border-2 border-[#E5E7EB] rounded-2xl p-5 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-[16px] font-bold text-[#1A1A1A]">{c.title}</h3>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}>
                        {st.label}
                      </span>
                    </div>
                    {c.subject && <p className="text-[12px] text-[#5A5C58]">Môn: {c.subject}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-6 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Users size={14} className="text-[#5A5C58]" />
                    <span className="text-[13px] font-semibold text-[#2D2D2D]">{c.student_count ?? 0}</span>
                    <span className="text-[11px] text-[#5A5C58]">học viên</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BookOpen size={14} className="text-[#5A5C58]" />
                    <span className="text-[13px] font-semibold text-[#2D2D2D]">{c.unit_count ?? 0}</span>
                    <span className="text-[11px] text-[#5A5C58]">bài học</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-[#F0F0F0]">
                  <Link
                    href={`/admin/courses/${c.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-[#6B2D3E] hover:bg-[#F5F0EB] transition-colors"
                  >
                    <Eye size={12} /> Chi tiết & Roadmap
                  </Link>
                  <button onClick={() => openEdit(c)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-[#5A5C58] hover:bg-[#F5F0EB] transition-colors cursor-pointer">
                    <Pencil size={12} /> Sửa
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-[#DC2626] hover:bg-[#FEE2E2] transition-colors cursor-pointer">
                    <Trash2 size={12} /> Xóa
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl border-2 border-[#E5E7EB] p-6 w-[480px] shadow-xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[18px] font-bold text-[#1A1A1A]">{editCourse ? 'Sửa khóa học' : 'Tạo khóa học mới'}</h3>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F5F0EB] cursor-pointer">
                  <X size={18} className="text-[#5A5C58]" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[12px] font-semibold text-[#5A5C58] mb-1 block">Tên khóa học</label>
                  <input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#E5E7EB] text-[13px] focus:outline-none focus:border-[#6B2D3E]" placeholder="Nhập tên khóa học..." />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-[#5A5C58] mb-1 block">Trạng thái</label>
                  <select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value as StatusKey }))} className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#E5E7EB] text-[13px] focus:outline-none focus:border-[#6B2D3E] bg-white cursor-pointer">
                    <option value="draft">Nháp</option>
                    <option value="active">Hoạt động</option>
                    <option value="archived">Lưu trữ</option>
                  </select>
                </div>
              </div>

              <p className="text-[11px] text-[#999] mt-4">Sau khi tạo, bạn có thể thêm tài nguyên và chỉnh sửa roadmap trong trang chi tiết.</p>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-[13px] font-medium text-[#5A5C58] hover:bg-[#F5F0EB] transition-colors cursor-pointer">Hủy</button>
                <button onClick={handleSave} disabled={saving} className="px-5 py-2 rounded-xl bg-[#6B2D3E] text-white text-[13px] font-semibold hover:bg-[#5A2534] transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-2">
                  {saving && <Loader2 size={13} className="animate-spin" />}
                  {editCourse ? 'Lưu thay đổi' : 'Tạo khóa học'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
