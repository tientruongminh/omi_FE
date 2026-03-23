'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, UserPlus, Users } from 'lucide-react';
import { groupChatMessages } from '@/lib/learning-data';
import { projectMembers } from '@/lib/data';

interface Props {
  isB2B?: boolean;
}

const AVATARS = [
  { name: 'M', bg: '#4CD964' },
  { name: 'H', bg: '#818CF8' },
  { name: 'L', bg: '#F08080' },
];

// Invite modal component
function InviteModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'viewer' | 'editor'>('editor');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!email.trim()) return;
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setEmail('');
      onClose();
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 10 }}
        transition={{ duration: 0.22 }}
        className="relative bg-white border-2 border-[#333333] rounded-2xl p-6 w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-[#2D2D2D] text-[15px]">Mời bạn bè</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-[#F1F1EC] border border-[#CCCCCC] flex items-center justify-center hover:border-[#333333] transition-colors cursor-pointer">
            <X size={12} />
          </button>
        </div>

        {/* Current members */}
        <div className="mb-5">
          <p className="text-[11px] font-bold text-[#5A5C58] uppercase tracking-wider mb-3">Thành viên hiện tại</p>
          <div className="space-y-2">
            {projectMembers.map((member) => (
              <div key={member.id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#F5F0EB]">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: member.color }}
                >
                  {member.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#2D2D2D]">{member.name}</p>
                </div>
                <span
                  className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: member.role === 'editor' ? '#D1FAE5' : '#EEF2FF',
                    color: member.role === 'editor' ? '#065F46' : '#3730A3',
                  }}
                >
                  {member.role === 'editor' ? 'Chỉnh sửa' : 'Xem'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Invite form */}
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-bold text-[#5A5C58] uppercase tracking-wider block mb-1.5">
              Email hoặc tên người dùng
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-[#E5E5DF] bg-[#F5F0EB] text-[13px] text-[#2D2D2D] outline-none focus:border-[#6B2D3E] transition-colors"
            />
          </div>

          {/* Permission selector */}
          <div>
            <label className="text-[11px] font-bold text-[#5A5C58] uppercase tracking-wider block mb-1.5">
              Quyền truy cập
            </label>
            <div className="flex gap-2">
              {(['viewer', 'editor'] as const).map((perm) => (
                <button
                  key={perm}
                  onClick={() => setPermission(perm)}
                  className="flex-1 py-2 rounded-xl text-[12px] font-bold border-2 transition-all cursor-pointer"
                  style={{
                    borderColor: permission === perm ? '#6B2D3E' : '#E5E5DF',
                    backgroundColor: permission === perm ? '#6B2D3E' : 'white',
                    color: permission === perm ? 'white' : '#5A5C58',
                  }}
                >
                  {perm === 'viewer' ? '👁 Chỉ xem' : '✏️ Chỉnh sửa'}
                </button>
              ))}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSend}
            disabled={!email.trim()}
            className="w-full py-3 rounded-xl font-bold text-[13px] transition-all cursor-pointer disabled:opacity-40"
            style={{
              backgroundColor: sent ? '#4CD964' : '#2D2D2D',
              color: sent ? '#2D2D2D' : 'white',
            }}
          >
            {sent ? '✓ Đã gửi lời mời!' : 'Gửi lời mời'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ChatBox({ isB2B = false }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(groupChatMessages);
  const [input, setInput] = useState('');
  const [badge, setBadge] = useState(2);
  const [showInvite, setShowInvite] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setBadge(0);
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'Bạn',
        text: input.trim(),
        time: new Date().toLocaleTimeString('vi', { hour: '2-digit', minute: '2-digit' }),
        isMe: true,
      },
    ]);
    setInput('');
  };

  const getAvatarColor = (sender: string) => {
    if (sender === 'Minh Anh') return '#4CD964';
    if (sender === 'Hoàng') return '#818CF8';
    if (sender === 'Linh' || sender === 'Lan') return '#F08080';
    return '#6B2D3E';
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
        {/* Panel */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.95 }}
              transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="bg-[#F5F0EB] border-2 border-[#333333] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              style={{ width: 320, height: 440 }}
            >
              {/* Header */}
              <div className="flex items-center gap-2.5 px-4 py-3 border-b-2 border-[#333333]/15 bg-white/50 flex-shrink-0">
                <span className="font-bold text-[#2D2D2D] text-[13px]">Nhóm học tập</span>
                <div className="flex -space-x-1.5">
                  {AVATARS.map((a) => (
                    <div
                      key={a.name}
                      className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white"
                      style={{ backgroundColor: a.bg }}
                    >
                      {a.name}
                    </div>
                  ))}
                </div>

                {/* B2B badge OR invite button */}
                {isB2B ? (
                  <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#818CF8]/15 border border-[#818CF8]/40">
                    <Users size={10} className="text-[#818CF8]" />
                    <span className="text-[10px] font-bold text-[#818CF8]">Khóa học nhóm</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowInvite(true)}
                    className="ml-auto flex items-center gap-1 text-[11px] text-[#6B2D3E] font-semibold hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <UserPlus size={12} />
                    Mời bạn bè
                  </button>
                )}

                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#F1F1EC] border border-[#CCCCCC] flex items-center justify-center hover:bg-[#E5E5DF] transition-colors cursor-pointer"
                >
                  <X size={12} className="text-[#5A5C58]" />
                </button>
              </div>

              {/* Member row */}
              <div className="flex items-center gap-2 px-4 py-2 border-b border-[#333333]/10 bg-white/30">
                <span className="text-[10px] text-[#5A5C58] font-medium">Thành viên:</span>
                {projectMembers.map((m) => (
                  <div key={m.id} className="flex items-center gap-1">
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                      style={{ backgroundColor: m.color }}
                    >
                      {m.initials[0]}
                    </div>
                    <span className="text-[10px] text-[#5A5C58]">{m.name.split(' ')[0]}</span>
                  </div>
                ))}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${msg.isMe ? 'flex-row-reverse' : ''}`}
                  >
                    {!msg.isMe && (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: getAvatarColor(msg.sender) }}
                      >
                        {msg.sender[0]}
                      </div>
                    )}
                    <div className={`max-w-[75%] ${msg.isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                      {!msg.isMe && (
                        <span className="text-[10px] text-[#5A5C58] mb-0.5 font-medium">{msg.sender}</span>
                      )}
                      <div
                        className={`px-3 py-2 rounded-2xl text-[12px] leading-relaxed ${
                          msg.isMe
                            ? 'bg-[#6B2D3E] text-white rounded-tr-sm'
                            : 'bg-white border border-[#E5E5DF] text-[#2D2D2D] rounded-tl-sm'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-[#9CA3AF] mt-0.5">{msg.time}</span>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="px-3 py-3 border-t-2 border-[#333333]/15 bg-white/40 flex-shrink-0">
                <div className="flex gap-2 items-center bg-white border-2 border-[#E5E5DF] rounded-full px-3 py-1.5 focus-within:border-[#6B2D3E] transition-colors">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
                    placeholder="Nhắn tin..."
                    className="flex-1 text-[12px] text-[#2D2D2D] bg-transparent outline-none placeholder-[#9CA3AF]"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim()}
                    className="w-6 h-6 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                    style={{ backgroundColor: input.trim() ? '#6B2D3E' : '#E5E5DF' }}
                  >
                    <Send size={10} className={input.trim() ? 'text-white' : 'text-[#9CA3AF]'} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Button */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          style={{ backgroundColor: '#2D2D2D' }}
        >
          <span className="text-xl">◉</span>
          {badge > 0 && !open && (
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-[10px] font-bold text-white border-2 border-white">
              {badge}
            </div>
          )}
        </button>
      </div>

      {/* Invite modal */}
      <AnimatePresence>
        {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
      </AnimatePresence>
    </>
  );
}
