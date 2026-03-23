'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X } from 'lucide-react';
import { groupChatMessages } from '@/lib/learning-data';

const AVATARS = [
  { name: 'M', bg: '#4CD964' },
  { name: 'H', bg: '#818CF8' },
  { name: 'L', bg: '#F08080' },
];

export default function ChatBox() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(groupChatMessages);
  const [input, setInput] = useState('');
  const [badge, setBadge] = useState(2);
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
            style={{ width: 320, height: 420 }}
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
              <button className="ml-auto text-[11px] text-blue-500 font-medium hover:underline">
                Mời bạn bè
              </button>
              <button
                onClick={() => setOpen(false)}
                className="w-6 h-6 rounded-full bg-[#F1F1EC] border border-[#CCCCCC] flex items-center justify-center hover:bg-[#E5E5DF] transition-colors"
              >
                <X size={10} className="text-[#5A5C58]" />
              </button>
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
        className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
        style={{ backgroundColor: '#2D2D2D' }}
      >
        <span className="text-xl">💬</span>
        {badge > 0 && !open && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-[10px] font-bold text-white border-2 border-white">
            {badge}
          </div>
        )}
      </button>
    </div>
  );
}
