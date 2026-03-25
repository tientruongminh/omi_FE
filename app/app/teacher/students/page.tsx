'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Mail, Trash2, X, Users } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email: string;
  course: string;
  progress: number;
  status: 'active' | 'pending';
  joinDate: string;
}

const MOCK: Student[] = [
  { id: '1', name: 'Nguyễn Văn An', email: 'an.nguyen@email.com', course: 'Hệ Điều Hành và Linux', progress: 72, status: 'active', joinDate: '2025-09-15' },
  { id: '2', name: 'Trần Thị Bình', email: 'binh.tran@email.com', course: 'Hệ Điều Hành và Linux', progress: 45, status: 'active', joinDate: '2025-10-02' },
  { id: '3', name: 'Lê Hoàng Cường', email: 'cuong.le@email.com', course: 'Mạng Máy Tính', progress: 88, status: 'active', joinDate: '2025-08-20' },
  { id: '4', name: 'Phạm Minh Dũng', email: 'dung.pham@email.com', course: 'Linux Administration', progress: 15, status: 'pending', joinDate: '2026-01-10' },
  { id: '5', name: 'Võ Thị Em', email: 'em.vo@email.com', course: 'Hệ Điều Hành và Linux', progress: 56, status: 'active', joinDate: '2025-11-05' },
  { id: '6', name: 'Ngô Quốc Phong', email: 'phong.ngo@email.com', course: 'Mạng Máy Tính', progress: 91, status: 'active', joinDate: '2025-07-12' },
];

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState(MOCK);
  const [search, setSearch] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteCourse, setInviteCourse] = useState('');

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.course.toLowerCase().includes(search.toLowerCase())
  );

  const handleInvite = () => {
    if (!inviteEmail.includes('@')) return;
    setStudents(prev => [...prev, {
      id: String(Date.now()),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      course: inviteCourse || 'Chưa gắn',
      progress: 0,
      status: 'pending' as const,
      joinDate: new Date().toISOString().split('T')[0],
    }]);
    setInviteEmail('');
    setShowInvite(false);
  };

  const handleRemove = (id: string) => setStudents(prev => prev.filter(s => s.id !== id));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-black text-[#1A1A1A]" style={{ fontFamily: 'Georgia, serif' }}>Học viên</h1>
          <p className="text-[13px] text-[#5A5C58]">{students.length} học viên trong các khóa của bạn</p>
        </div>
        <button onClick={() => setShowInvite(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6B2D3E] text-white text-[13px] font-semibold hover:bg-[#5A2534] cursor-pointer">
          <Mail size={16} /> Mời học viên
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999]" />
        <input type="text" placeholder="Tìm tên, email, khóa học..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-[#E5E7EB] bg-white text-[13px] focus:outline-none focus:border-[#6B2D3E]" />
      </div>

      <div className="bg-white border-2 border-[#E5E7EB] rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-[#E5E7EB] bg-[#FAFAF8]">
              <th className="text-left px-5 py-3 text-[11px] font-bold text-[#5A5C58] uppercase">Học viên</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold text-[#5A5C58] uppercase">Khóa học</th>
              <th className="text-center px-5 py-3 text-[11px] font-bold text-[#5A5C58] uppercase">Tiến độ</th>
              <th className="text-center px-5 py-3 text-[11px] font-bold text-[#5A5C58] uppercase">Trạng thái</th>
              <th className="text-center px-5 py-3 text-[11px] font-bold text-[#5A5C58] uppercase"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0F0]">
            {filtered.map(s => (
              <tr key={s.id} className="hover:bg-[#FAFAF8] transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#F5F0EB] flex items-center justify-center">
                      <span className="text-[10px] font-bold text-[#6B2D3E]">{s.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</span>
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-[#2D2D2D]">{s.name}</p>
                      <p className="text-[10px] text-[#999]">{s.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-[12px] text-[#5A5C58]">{s.course}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-[#E5E7EB] overflow-hidden">
                      <div className="h-full rounded-full bg-[#3B644E]" style={{ width: `${s.progress}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-[#3B644E]">{s.progress}%</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-center">
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${s.status === 'active' ? 'bg-[#D1FAE5] text-[#3B644E]' : 'bg-[#FEF3C7] text-[#6A5B0C]'}`}>
                    {s.status === 'active' ? 'Hoạt động' : 'Chờ'}
                  </span>
                </td>
                <td className="px-5 py-3 text-center">
                  <button onClick={() => handleRemove(s.id)} className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-[#FEE2E2] text-[#DC2626] cursor-pointer mx-auto">
                    <Trash2 size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite modal */}
      <AnimatePresence>
        {showInvite && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowInvite(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()} className="bg-white rounded-2xl border-2 border-[#E5E7EB] p-6 w-[420px] shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[18px] font-bold">Mời học viên</h3>
                <button onClick={() => setShowInvite(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F5F0EB] cursor-pointer"><X size={18} className="text-[#5A5C58]" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[12px] font-semibold text-[#5A5C58] mb-1 block">Email</label>
                  <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleInvite(); }}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#E5E7EB] text-[13px] focus:outline-none focus:border-[#6B2D3E]" placeholder="email@example.com" autoFocus />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-[#5A5C58] mb-1 block">Khóa học</label>
                  <select value={inviteCourse} onChange={e => setInviteCourse(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#E5E7EB] text-[13px] focus:outline-none focus:border-[#6B2D3E] bg-white cursor-pointer">
                    <option value="">Chọn khóa học</option>
                    <option>Hệ Điều Hành và Linux</option>
                    <option>Mạng Máy Tính Nâng Cao</option>
                    <option>Linux Administration</option>
                  </select>
                </div>
              </div>
              <p className="text-[11px] text-[#999] mt-3">Học viên sẽ nhận email mời tham gia khóa học.</p>
              <div className="flex justify-end gap-3 mt-5">
                <button onClick={() => setShowInvite(false)} className="px-4 py-2 rounded-xl text-[13px] text-[#5A5C58] hover:bg-[#F5F0EB] cursor-pointer">Hủy</button>
                <button onClick={handleInvite} className="px-5 py-2 rounded-xl bg-[#6B2D3E] text-white text-[13px] font-semibold hover:bg-[#5A2534] cursor-pointer">Gửi lời mời</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
