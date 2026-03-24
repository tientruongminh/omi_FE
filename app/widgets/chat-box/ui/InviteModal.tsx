'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { projectMembers } from '@/entities/project';

interface Props {
  onClose: () => void;
}

export default function InviteModal({ onClose }: Props) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'viewer' | 'editor'>('editor');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!email.trim()) return;
    setSent(true);
    setTimeout(() => { setSent(false); setEmail(''); onClose(); }, 1500);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 10 }}
        transition={{ duration: 0.22 }}
        className="relative bg-white border-2 border-[#333333] rounded-2xl p-6 w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-[#2D2D2D] text-[15px]">Mời bạn bè</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-[#F1F1EC] border border-[#CCCCCC] flex items-center justify-center hover:border-[#333333] transition-colors cursor-pointer">
            <X size={12} />
          </button>
        </div>
        <div className="mb-5">
          <p className="text-[11px] font-bold text-[#5A5C58] uppercase tracking-wider mb-3">Thành viên hiện tại</p>
          <div className="space-y-2">
            {projectMembers.map((m) => (
              <div key={m.id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#F5F0EB]">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0" style={{ backgroundColor: m.color }}>{m.initials}</div>
                <div className="flex-1 min-w-0"><p className="text-[13px] font-semibold text-[#2D2D2D]">{m.name}</p></div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ backgroundColor: m.role === 'editor' ? '#D1FAE5' : '#EEF2FF', color: m.role === 'editor' ? '#065F46' : '#3730A3' }}>
                  {m.role === 'editor' ? 'Chỉnh sửa' : 'Xem'}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-bold text-[#5A5C58] uppercase tracking-wider block mb-1.5">Email hoặc tên người dùng</label>
            <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-[#E5E5DF] bg-[#F5F0EB] text-[13px] text-[#2D2D2D] outline-none focus:border-[#6B2D3E] transition-colors" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-[#5A5C58] uppercase tracking-wider block mb-1.5">Quyền truy cập</label>
            <div className="flex gap-2">
              {(['viewer', 'editor'] as const).map((perm) => (
                <button key={perm} onClick={() => setPermission(perm)} className="flex-1 py-2 rounded-xl text-[12px] font-bold border-2 transition-all cursor-pointer"
                  style={{ borderColor: permission === perm ? '#6B2D3E' : '#E5E5DF', backgroundColor: permission === perm ? '#6B2D3E' : 'white', color: permission === perm ? 'white' : '#5A5C58' }}>
                  {perm === 'viewer' ? '👁 Chỉ xem' : '✏️ Chỉnh sửa'}
                </button>
              ))}
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSend} disabled={!email.trim()}
            className="w-full py-3 rounded-xl font-bold text-[13px] transition-all cursor-pointer disabled:opacity-40"
            style={{ backgroundColor: sent ? '#4CD964' : '#2D2D2D', color: sent ? '#2D2D2D' : 'white' }}>
            {sent ? '✓ Đã gửi lời mời!' : 'Gửi lời mời'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
