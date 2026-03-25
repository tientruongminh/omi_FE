'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Pencil, Trash2, X, Users, BookOpen, Eye } from 'lucide-react';
import Link from 'next/link';

interface Course {
  id: string;
  name: string;
  teacher: string;
  students: number;
  units: number;
  completion: number;
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
}

const MOCK_COURSES: Course[] = [
  { id: '1', name: 'Hệ Điều Hành và Linux', teacher: 'TS. Nguyễn Minh Tuấn', students: 342, units: 20, completion: 72, status: 'active', createdAt: '2025-06-15' },
  { id: '2', name: 'CTDL & Giải Thuật', teacher: 'TS. Hoàng Văn Đức', students: 289, units: 25, completion: 58, status: 'active', createdAt: '2025-07-01' },
  { id: '3', name: 'Mạng Máy Tính', teacher: 'ThS. Phạm Hồng Nhung', students: 215, units: 18, completion: 64, status: 'active', createdAt: '2025-08-10' },
  { id: '4', name: 'Trí Tuệ Nhân Tạo', teacher: 'TS. Lê Quốc Bảo', students: 187, units: 22, completion: 41, status: 'active', createdAt: '2025-09-01' },
  { id: '5', name: 'UI/UX Design Fundamentals', teacher: 'ThS. Trần Thanh Hương', students: 156, units: 15, completion: 35, status: 'active', createdAt: '2025-10-05' },
  { id: '6', name: 'Cơ Sở Dữ Liệu Nâng Cao', teacher: 'ThS. Vũ Thị Mai', students: 0, units: 12, completion: 0, status: 'draft', createdAt: '2026-02-20' },
];

const STATUS_MAP = {
  active: { label: 'Hoạt động', bg: 'bg-[#D1FAE5]', text: 'text-[#3B644E]' },
  draft: { label: 'Nháp', bg: 'bg-[#FEF3C7]', text: 'text-[#6A5B0C]' },
  archived: { label: 'Lưu trữ', bg: 'bg-[#E8E6E0]', text: 'text-[#5A5C58]' },
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState(MOCK_COURSES);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [form, setForm] = useState({ name: '', teacher: '', status: 'draft' as Course['status'] });

  const filtered = courses.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.teacher.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditCourse(null);
    setForm({ name: '', teacher: '', status: 'draft' });
    setShowModal(true);
  };

  const openEdit = (c: Course) => {
    setEditCourse(c);
    setForm({ name: c.name, teacher: c.teacher, status: c.status });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editCourse) {
      setCourses(prev => prev.map(c => c.id === editCourse.id ? { ...c, ...form } : c));
    } else {
      const newC: Course = {
        id: String(Date.now()),
        name: form.name,
        teacher: form.teacher,
        students: 0,
        units: 0,
        completion: 0,
        status: form.status,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setCourses(prev => [...prev, newC]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
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

      {/* Course cards */}
      <div className="space-y-3">
        {filtered.map((c, i) => {
          const st = STATUS_MAP[c.status];
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
                    <h3 className="text-[16px] font-bold text-[#1A1A1A]">{c.name}</h3>
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}>
                      {st.label}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#5A5C58]">Giảng viên: {c.teacher}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 mb-3">
                <div className="flex items-center gap-1.5">
                  <Users size={14} className="text-[#5A5C58]" />
                  <span className="text-[13px] font-semibold text-[#2D2D2D]">{c.students}</span>
                  <span className="text-[11px] text-[#5A5C58]">học viên</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BookOpen size={14} className="text-[#5A5C58]" />
                  <span className="text-[13px] font-semibold text-[#2D2D2D]">{c.units}</span>
                  <span className="text-[11px] text-[#5A5C58]">bài học</span>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <div className="flex-1 h-2 rounded-full bg-[#E5E7EB] overflow-hidden max-w-[120px]">
                    <div className="h-full rounded-full bg-[#3B644E]" style={{ width: `${c.completion}%` }} />
                  </div>
                  <span className="text-[11px] font-bold text-[#3B644E]">{c.completion}%</span>
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
                  <label className="text-[12px] font-semibold text-[#5A5C58] mb-1 block">Giảng viên</label>
                  <input value={form.teacher} onChange={(e) => setForm(f => ({ ...f, teacher: e.target.value }))} className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#E5E7EB] text-[13px] focus:outline-none focus:border-[#6B2D3E]" placeholder="Chọn giảng viên..." />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-[#5A5C58] mb-1 block">Trạng thái</label>
                  <select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value as Course['status'] }))} className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#E5E7EB] text-[13px] focus:outline-none focus:border-[#6B2D3E] bg-white cursor-pointer">
                    <option value="draft">Nháp</option>
                    <option value="active">Hoạt động</option>
                    <option value="archived">Lưu trữ</option>
                  </select>
                </div>
              </div>

              <p className="text-[11px] text-[#999] mt-4">Sau khi tạo, bạn có thể thêm tài nguyên và chỉnh sửa roadmap trong trang chi tiết.</p>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-[13px] font-medium text-[#5A5C58] hover:bg-[#F5F0EB] transition-colors cursor-pointer">Hủy</button>
                <button onClick={handleSave} className="px-5 py-2 rounded-xl bg-[#6B2D3E] text-white text-[13px] font-semibold hover:bg-[#5A2534] transition-colors cursor-pointer">{editCourse ? 'Lưu thay đổi' : 'Tạo khóa học'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
