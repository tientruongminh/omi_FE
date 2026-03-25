'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Pencil, Trash2, X, Users, BookOpen, Eye } from 'lucide-react';
import Link from 'next/link';

interface Course {
  id: string;
  name: string;
  students: number;
  units: number;
  completion: number;
  status: 'active' | 'draft';
}

const MOCK: Course[] = [
  { id: '1', name: 'Hệ Điều Hành và Linux', students: 342, units: 20, completion: 72, status: 'active' },
  { id: '2', name: 'Mạng Máy Tính Nâng Cao', students: 215, units: 18, completion: 64, status: 'active' },
  { id: '3', name: 'Linux Administration', students: 156, units: 15, completion: 45, status: 'active' },
  { id: '4', name: 'Cloud Computing Basics', students: 0, units: 0, completion: 0, status: 'draft' },
];

export default function TeacherCoursesPage() {
  const [courses, setCourses] = useState(MOCK);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '' });

  const filtered = courses.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = () => {
    if (!form.name.trim()) return;
    setCourses(prev => [...prev, {
      id: String(Date.now()),
      name: form.name.trim(),
      students: 0, units: 0, completion: 0, status: 'draft' as const,
    }]);
    setForm({ name: '' });
    setShowModal(false);
  };

  const handleDelete = (id: string) => setCourses(prev => prev.filter(c => c.id !== id));

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

      <div className="space-y-3">
        {filtered.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="bg-white border-2 border-[#E5E7EB] rounded-2xl p-5 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[15px] font-bold text-[#1A1A1A]">{c.name}</h3>
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${c.status === 'active' ? 'bg-[#D1FAE5] text-[#3B644E]' : 'bg-[#FEF3C7] text-[#6A5B0C]'}`}>
                    {c.status === 'active' ? 'Hoạt động' : 'Nháp'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-5 mb-3 text-[12px] text-[#5A5C58]">
              <span className="flex items-center gap-1"><Users size={12} /> {c.students} học viên</span>
              <span className="flex items-center gap-1"><BookOpen size={12} /> {c.units} bài</span>
              {c.units > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 rounded-full bg-[#E5E7EB] overflow-hidden">
                    <div className="h-full rounded-full bg-[#3B644E]" style={{ width: `${c.completion}%` }} />
                  </div>
                  <span className="text-[10px] font-bold text-[#3B644E]">{c.completion}%</span>
                </div>
              )}
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

      {/* Create modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl border-2 border-[#E5E7EB] p-6 w-[420px] shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[18px] font-bold">Tạo khóa học mới</h3>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F5F0EB] cursor-pointer"><X size={18} className="text-[#5A5C58]" /></button>
              </div>
              <div>
                <label className="text-[12px] font-semibold text-[#5A5C58] mb-1 block">Tên khóa học</label>
                <input value={form.name} onChange={(e) => setForm({ name: e.target.value })}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#E5E7EB] text-[13px] focus:outline-none focus:border-[#6B2D3E]" placeholder="VD: Lập trình Python cơ bản" autoFocus />
              </div>
              <p className="text-[11px] text-[#999] mt-3">Sau khi tạo, bạn upload tài nguyên và AI sẽ tự động tạo roadmap.</p>
              <div className="flex justify-end gap-3 mt-5">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-[13px] text-[#5A5C58] hover:bg-[#F5F0EB] cursor-pointer">Hủy</button>
                <button onClick={handleCreate} className="px-5 py-2 rounded-xl bg-[#6B2D3E] text-white text-[13px] font-semibold hover:bg-[#5A2534] cursor-pointer">Tạo khóa học</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
