'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, MoreHorizontal, ChevronLeft, ChevronRight, X, Pencil, Trash2 } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  courses: number;
  progress: number;
  joinDate: string;
  status: 'active' | 'inactive';
}

const MOCK_USERS: User[] = [
  { id: '1', name: 'Nguyễn Văn An', email: 'an.nguyen@email.com', courses: 3, progress: 72, joinDate: '2025-09-15', status: 'active' },
  { id: '2', name: 'Trần Thị Bình', email: 'binh.tran@email.com', courses: 2, progress: 45, joinDate: '2025-10-02', status: 'active' },
  { id: '3', name: 'Lê Hoàng Cường', email: 'cuong.le@email.com', courses: 4, progress: 88, joinDate: '2025-08-20', status: 'active' },
  { id: '4', name: 'Phạm Minh Dũng', email: 'dung.pham@email.com', courses: 1, progress: 15, joinDate: '2026-01-10', status: 'inactive' },
  { id: '5', name: 'Võ Thị Em', email: 'em.vo@email.com', courses: 2, progress: 56, joinDate: '2025-11-05', status: 'active' },
  { id: '6', name: 'Ngô Quốc Phong', email: 'phong.ngo@email.com', courses: 5, progress: 91, joinDate: '2025-07-12', status: 'active' },
  { id: '7', name: 'Hoàng Thu Hà', email: 'ha.hoang@email.com', courses: 3, progress: 63, joinDate: '2025-09-28', status: 'active' },
  { id: '8', name: 'Đỗ Văn Khoa', email: 'khoa.do@email.com', courses: 1, progress: 8, joinDate: '2026-02-14', status: 'inactive' },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: '', email: '', status: 'active' as 'active' | 'inactive' });

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditUser(null);
    setForm({ name: '', email: '', status: 'active' });
    setShowModal(true);
  };

  const openEdit = (u: User) => {
    setEditUser(u);
    setForm({ name: u.name, email: u.email, status: u.status });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editUser) {
      setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, name: form.name, email: form.email, status: form.status } : u));
    } else {
      const newUser: User = {
        id: String(Date.now()),
        name: form.name,
        email: form.email,
        courses: 0,
        progress: 0,
        joinDate: new Date().toISOString().split('T')[0],
        status: form.status,
      };
      setUsers(prev => [...prev, newUser]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-black text-[#1A1A1A]" style={{ fontFamily: 'Georgia, serif' }}>Học viên</h1>
          <p className="text-[13px] text-[#5A5C58] mt-0.5">{users.length} học viên trong hệ thống</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6B2D3E] text-white text-[13px] font-semibold hover:bg-[#5A2534] transition-colors cursor-pointer"
        >
          <Plus size={16} />
          Thêm học viên
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999]" />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-[#E5E7EB] bg-white text-[13px] text-[#2D2D2D] placeholder:text-[#999] focus:outline-none focus:border-[#6B2D3E] transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-white border-2 border-[#E5E7EB] rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-[#E5E7EB] bg-[#FAFAF8]">
              <th className="text-left px-5 py-3 text-[11px] font-bold text-[#5A5C58] uppercase tracking-wider">Họ tên</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold text-[#5A5C58] uppercase tracking-wider">Email</th>
              <th className="text-center px-5 py-3 text-[11px] font-bold text-[#5A5C58] uppercase tracking-wider">Khóa học</th>
              <th className="text-center px-5 py-3 text-[11px] font-bold text-[#5A5C58] uppercase tracking-wider">Tiến độ</th>
              <th className="text-center px-5 py-3 text-[11px] font-bold text-[#5A5C58] uppercase tracking-wider">Trạng thái</th>
              <th className="text-center px-5 py-3 text-[11px] font-bold text-[#5A5C58] uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0F0]">
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-[#FAFAF8] transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#F5F0EB] flex items-center justify-center flex-shrink-0">
                      <span className="text-[11px] font-bold text-[#6B2D3E]">
                        {u.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <span className="text-[13px] font-semibold text-[#2D2D2D]">{u.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-[13px] text-[#5A5C58]">{u.email}</td>
                <td className="px-5 py-3 text-center text-[13px] font-semibold text-[#2D2D2D]">{u.courses}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-[#E5E7EB] overflow-hidden">
                      <div className="h-full rounded-full bg-[#3B644E]" style={{ width: `${u.progress}%` }} />
                    </div>
                    <span className="text-[11px] font-bold text-[#3B644E]">{u.progress}%</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-center">
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                    u.status === 'active' ? 'bg-[#D1FAE5] text-[#3B644E]' : 'bg-[#FEE2E2] text-[#DC2626]'
                  }`}>
                    {u.status === 'active' ? 'Hoạt động' : 'Ngừng'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-center gap-1.5">
                    <button onClick={() => openEdit(u)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#F5F0EB] text-[#5A5C58] transition-colors cursor-pointer">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(u.id)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#FEE2E2] text-[#DC2626] transition-colors cursor-pointer">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
                <h3 className="text-[18px] font-bold text-[#1A1A1A]">{editUser ? 'Sửa học viên' : 'Thêm học viên'}</h3>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F5F0EB] cursor-pointer">
                  <X size={18} className="text-[#5A5C58]" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[12px] font-semibold text-[#5A5C58] mb-1 block">Họ tên</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#E5E7EB] text-[13px] focus:outline-none focus:border-[#6B2D3E]"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-[#5A5C58] mb-1 block">Email</label>
                  <input
                    value={form.email}
                    onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#E5E7EB] text-[13px] focus:outline-none focus:border-[#6B2D3E]"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-[#5A5C58] mb-1 block">Trạng thái</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm(f => ({ ...f, status: e.target.value as 'active' | 'inactive' }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#E5E7EB] text-[13px] focus:outline-none focus:border-[#6B2D3E] bg-white cursor-pointer"
                  >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Ngừng hoạt động</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-[13px] font-medium text-[#5A5C58] hover:bg-[#F5F0EB] transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  className="px-5 py-2 rounded-xl bg-[#6B2D3E] text-white text-[13px] font-semibold hover:bg-[#5A2534] transition-colors cursor-pointer"
                >
                  {editUser ? 'Lưu thay đổi' : 'Thêm mới'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
