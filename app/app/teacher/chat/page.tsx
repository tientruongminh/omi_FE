'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Sparkles } from 'lucide-react';

interface Message { id: string; role: 'user' | 'assistant'; content: string }

const RESPONSES: Record<string, string> = {
  'default': 'Xin chào! Tôi là trợ lý AI. Hỏi tôi về học viên, khóa học, tiến độ, hoặc bất cứ điều gì trong workspace của bạn. 🤖',
  'học viên': 'Bạn có **342 học viên** đang hoạt động trong 4 khóa học. Học viên mới nhất: Phạm Minh Dũng (10/01/2026). Top student: Ngô Quốc Phong (91% hoàn thành).',
  'khóa': 'Bạn có **4 khóa học**:\n- Hệ Điều Hành và Linux (342 HV, 72%)\n- Mạng Máy Tính (215 HV, 64%)\n- Linux Administration (156 HV, 45%)\n- Cloud Computing (nháp)\n\nKhuyến nghị: Khóa Cloud Computing cần thêm nội dung.',
  'tiến': 'Tiến độ trung bình: **67%**\n- Top: HĐH Linux (72%) ✅\n- Thấp nhất: Linux Admin (45%) ⚠️\n\n5 học viên chưa hoạt động >2 tuần. Gợi ý: gửi nhắc nhở.',
};

function getResponse(q: string): string {
  const l = q.toLowerCase();
  if (l.includes('học viên') || l.includes('student')) return RESPONSES['học viên'];
  if (l.includes('khóa') || l.includes('course')) return RESPONSES['khóa'];
  if (l.includes('tiến') || l.includes('progress')) return RESPONSES['tiến'];
  return RESPONSES['default'];
}

export default function TeacherChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'assistant', content: RESPONSES['default'] },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const q = input.trim();
    setMessages(prev => [...prev, { id: String(Date.now()), role: 'user', content: q }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { id: String(Date.now() + 1), role: 'assistant', content: getResponse(q) }]);
      setTyping(false);
    }, 800 + Math.random() * 1000);
  };

  const QUICK = ['Bao nhiêu học viên?', 'Tiến độ các khóa?', 'Khóa nào cần cải thiện?'];

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="mb-4">
        <h1 className="text-[28px] font-black text-[#1A1A1A]" style={{ fontFamily: 'Georgia, serif' }}>Chat AI</h1>
        <p className="text-[13px] text-[#5A5C58]">Hỏi về học viên, khóa học, tiến độ của bạn</p>
      </div>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {QUICK.map(q => (
          <button key={q} onClick={() => setInput(q)}
            className="px-3 py-1.5 rounded-full border border-[#E5E7EB] bg-white text-[11px] font-medium text-[#5A5C58] hover:border-[#6B2D3E] hover:text-[#6B2D3E] cursor-pointer">
            <Sparkles size={10} className="inline mr-1" />{q}
          </button>
        ))}
      </div>

      <div className="flex-1 bg-white border-2 border-[#E5E7EB] rounded-2xl overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto px-5 py-4 space-y-4">
          {messages.map(m => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${m.role === 'assistant' ? 'bg-[#6B2D3E]' : 'bg-[#E5E7EB]'}`}>
                {m.role === 'assistant' ? <Bot size={14} className="text-white" /> : <User size={14} className="text-[#5A5C58]" />}
              </div>
              <div className={`max-w-[70%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed whitespace-pre-line ${
                m.role === 'assistant' ? 'bg-[#F5F0EB] text-[#2D2D2D]' : 'bg-[#6B2D3E] text-white'
              }`}>{m.content}</div>
            </motion.div>
          ))}
          {typing && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#6B2D3E] flex items-center justify-center"><Bot size={14} className="text-white" /></div>
              <div className="bg-[#F5F0EB] px-4 py-3 rounded-2xl flex gap-1">
                <div className="w-2 h-2 rounded-full bg-[#999] animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-[#999] animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-[#999] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div className="px-4 py-3 border-t border-[#E5E7EB] flex items-center gap-3">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') send(); }}
            placeholder="Hỏi về dữ liệu workspace..." className="flex-1 px-4 py-2.5 rounded-xl border-2 border-[#E5E7EB] text-[13px] focus:outline-none focus:border-[#6B2D3E]" />
          <button onClick={send} disabled={!input.trim()} className="w-10 h-10 rounded-xl bg-[#6B2D3E] text-white flex items-center justify-center hover:bg-[#5A2534] disabled:opacity-40 cursor-pointer">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
