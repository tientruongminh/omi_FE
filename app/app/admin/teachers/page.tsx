'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Pencil, Trash2, X, Star } from 'lucide-react';

interface Teacher {
  id: string;
  name: string;
  email: string;
  specialty: string;
  courses: number;
  students: number;
  rating: number;
  status: 'active' | 'inactive';
}

const MOCK_TEACHERS: Teacher[] = [
  { id: '1', name: 'TS. Nguyễn Minh Tuấn', email: 'tuan.nguyen@uni.edu.vn', specialty: 'Hệ Điều Hành', courses: 4, students: 456, rating: 4.8, status: 'active' },
  { id: '2', name: 'ThS. Trần Thanh Hương', email: 'huong.tran@uni.edu.vn', specialty: 'UI/UX Design', courses: 3, students: 312, rating: 4.6, status: 'active' },
  { id: '3', name: 'TS. Lê Quốc Bảo', email: 'bao.le@uni.edu.vn', specialty: 'Trí Tuệ Nhân Tạo', courses: 2, students: 287, rating: 4.9, status: 'active' },
  { id: '4', name: 'ThS. Phạm Hồng Nhung', email: 'nhung.pham@uni.edu.vn', specialty: 'Mạng Máy Tính', courses: 3, students: 215, rating: 4.5, status: 'active' },
  { id: '5', name: 'TS. Hoàng Văn Đức', email: 'duc.hoang@uni.edu.vn', specialty: 'CTDL & Giải Thuật', courses: 5, students: 523, rating: 4.7, status: 'active' },
  { id: '6', name: 'ThS. Vũ Thị Mai', email: 'mai.vu@uni.edu.vn', specialty: 'Cơ Sở Dữ Liệu', courses: 2, students: 178, rating: 4.3, status: 'inactive' },
];

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState(MOCK_TEACHERS);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null);
  const [form, setForm] = useState({ name: '', email: '', specialty: '', status: 'active' as 'active' | 'inactive' });

  const filtered = teachers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.specialty.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditTeacher(null);
    setForm({ name: '', email: '', specialty: '', status: 'active' });
    setShowModal(true);
  };

  const openEdit = (t: Teacher) => {
    setEditTeacher(t);
    setForm({ name: t.name, email: t.email, specialty: t.specialty, status: t.status });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editTeacher) {
      setTeachers(prev => prev.map(t => t.id === editTeacher.id ? { ...t, ...form } : t));
    } else {
      const newT: Teacher = {
        id: String(Date.now()),
        ...form,
        courses: 0,
        students: 0,
        rating: 0,
      };
      setTeachers(prev => [...prev, newT]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setTeachers(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-black text-[#1A1A1A]" style={{ fontFamily: 'Georgia, serif' }}>Giảng viên</h1>
          <p className="text-[13px] text-[#5A5C58] mt-0.5">{teachers.length} giảng viên trong hệ thống</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6B2D3E] text-white text-[13px] font-semibold hover:bg-[#5A2534] transition-colors cursor-pointer"
        >
          <Plus size={16} />
          Thêm giảng viên
        </button>
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

      {/* Cards grid instead of table for teachers */}
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
                    {t.name.replace(/TS\.|ThS\.\s?/g, '').trim().split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[#1A1A1A]">{t.name}</p>
                  <p className="text-[11px] text-[#5A5C58]">{t.specialty}</p>
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
                <p className="text-[18px] font-black text-[#1A1A1A]">{t.courses}</p>
                <p className="text-[10px] text-[#5A5C58]">Khóa học</p>
              </div>
              <div className="text-center">
                <p className="text-[18px] font-black text-[#1A1A1A]">{t.students}</p>
                <p className="text-[10px] text-[#5A5C58]">Học viên</p>
              </div>
              <div className="flex items-center gap-1">
                <Star size={14} className="text-[#FCD34D] fill-[#FCD34D]" />
                <span className="text-[14px] font-bold text-[#1A1A1A]">{t.rating}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-[#F0F0F0]">
              <button onClick={() => openEdit(t)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-[#5A5C58] hover:bg-[#F5F0EB] transition-colors cursor-pointer">
                <Pencil size={12} /> Sửa
              </button>
              <button onClick={() => handleDelete(t.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-[#DC2626] hover:bg-[#FEE2E2] transition-colors cursor-pointer">
                <Trash2 size={12} /> Xóa
              </button>
            </div>
          </motion.div>
        ))}
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
              className="bg-white rounded-2xl border-2 border-[#E5E7EB] p-6 w-[420px] shadow-xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[18px] font-bold text-[#1A1A1A]">{editTeacher ? 'Sửa giảng viên' : 'Thêm giảng viên'}</h3>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F5F0EB] cursor-pointer">
                  <X size={18} className="text-[#5A5C58]" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[12px] font-semibold text-[#5A5C58] mb-1 block">Họ tên</label>
                  <input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#E5E7EB] text-[13px] focus:outline-none focus:border-[#6B2D3E]" placeholder="TS. Nguyễn Văn A" />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-[#5A5C58] mb-1 block">Email</label>
                  <input value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#E5E7EB] text-[13px] focus:outline-none focus:border-[#6B2D3E]" placeholder="email@uni.edu.vn" />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-[#5A5C58] mb-1 block">Chuyên ngành</label>
                  <input value={form.specialty} onChange={(e) => setForm(f => ({ ...f, specialty: e.target.value }))} className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#E5E7EB] text-[13px] focus:outline-none focus:border-[#6B2D3E]" placeholder="Trí Tuệ Nhân Tạo" />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-[#5A5C58] mb-1 block">Trạng thái</label>
                  <select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value as 'active' | 'inactive' }))} className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#E5E7EB] text-[13px] focus:outline-none focus:border-[#6B2D3E] bg-white cursor-pointer">
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Ngừng hoạt động</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-[13px] font-medium text-[#5A5C58] hover:bg-[#F5F0EB] transition-colors cursor-pointer">Hủy</button>
                <button onClick={handleSave} className="px-5 py-2 rounded-xl bg-[#6B2D3E] text-white text-[13px] font-semibold hover:bg-[#5A2534] transition-colors cursor-pointer">{editTeacher ? 'Lưu thay đổi' : 'Thêm mới'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
