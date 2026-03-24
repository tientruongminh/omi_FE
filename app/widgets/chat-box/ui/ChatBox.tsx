'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Users, X } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ChatToggleButton from './ChatToggleButton';
import MemberList from './MemberList';
import InviteModal from './InviteModal';
import { groupChatMessages } from '@/entities/learning-content';
import { projectMembers } from '@/entities/project';

interface Props {
  isB2B?: boolean;
}

const AVATARS = [
  { name: 'M', bg: '#4CD964' },
  { name: 'H', bg: '#818CF8' },
  { name: 'L', bg: '#F08080' },
];

function getAvatarColor(sender: string): string {
  if (sender === 'Minh Anh') return '#4CD964';
  if (sender === 'Hoàng') return '#818CF8';
  if (sender === 'Linh' || sender === 'Lan') return '#F08080';
  return '#6B2D3E';
}

export function ChatBox({ isB2B = false }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(groupChatMessages);
  const [input, setInput] = useState('');
  const [badge, setBadge] = useState(2);
  const [showInvite, setShowInvite] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setBadge(0);
      setTimeout(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, 100);
    }
  }, [open]);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), sender: 'Bạn', text: input.trim(), time: new Date().toLocaleTimeString('vi', { hour: '2-digit', minute: '2-digit' }), isMe: true },
    ]);
    setInput('');
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
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
              <div className="flex items-center gap-2.5 px-4 py-3 border-b-2 border-[#333333]/15 bg-white/50 flex-shrink-0">
                <span className="font-bold text-[#2D2D2D] text-[13px]">Nhóm học tập</span>
                <div className="flex -space-x-1.5">
                  {AVATARS.map((a) => (
                    <div key={a.name} className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white" style={{ backgroundColor: a.bg }}>{a.name}</div>
                  ))}
                </div>
                {isB2B ? (
                  <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#818CF8]/15 border border-[#818CF8]/40">
                    <Users size={10} className="text-[#818CF8]" />
                    <span className="text-[10px] font-bold text-[#818CF8]">Khóa học nhóm</span>
                  </div>
                ) : (
                  <button onClick={() => setShowInvite(true)} className="ml-auto flex items-center gap-1 text-[11px] text-[#6B2D3E] font-semibold hover:opacity-80 transition-opacity cursor-pointer">
                    <UserPlus size={12} />Mời bạn bè
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-[#F1F1EC] border border-[#CCCCCC] flex items-center justify-center hover:bg-[#E5E5DF] transition-colors cursor-pointer">
                  <X size={12} className="text-[#5A5C58]" />
                </button>
              </div>

              <MemberList members={projectMembers} />

              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} msg={msg} avatarColor={getAvatarColor(msg.sender)} />
                ))}
                <div ref={bottomRef} />
              </div>

              <ChatInput value={input} onChange={setInput} onSend={sendMessage} />
            </motion.div>
          )}
        </AnimatePresence>
        <ChatToggleButton isOpen={open} badge={badge} onClick={() => setOpen((o) => !o)} />
      </div>

      <AnimatePresence>
        {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
      </AnimatePresence>
    </>
  );
}

export default ChatBox;
